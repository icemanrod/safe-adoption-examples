#!/usr/bin/env python3
"""Every path a decision packet cites must exist, at the line it claims.

This is the repository holding itself to the standard the product argues for.
A packet that cites `apps/webhooks/handler.ts:320` is making a checkable claim,
and an example repository that cannot pass its own check is an argument against
itself. The first version of these examples cited three files that were not in
the tree at all - the citations read fine and resolved to nothing.

Deliberately dependency-free and read-only: `python3 tools/verify_citations.py`
from the repository root. Exit 0 if every citation resolves, 1 otherwise, and
the failure names the packet, the citation and the reason.

What it checks
    1. every `path` or `Path:` cited in a packet exists in that example
    2. a cited line number is within the file
    3. a fenced snippet that claims a line actually appears at that line
    4. no packet cites a file outside its own example directory

What it does NOT check, on purpose
    Whether the finding is CORRECT. That is a human judgement and this script
    must not appear to make it. It checks that the evidence is REACHABLE, which
    is the part a machine can honestly settle.
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PACKET = "ADOPTION-DECISION.md"

# `apps/webhooks/handler.ts:320` / `lib/env.ts` / `config/submodules`
CITATION = re.compile(
    r"`(?P<path>(?:apps|lib|src|config|test|tests|vendor)/[A-Za-z0-9_./-]+)"
    r"(?::(?P<line>\d+))?(?:[–-]\d+)?`"
)
# "**Path**: `x/y.ts:12`" — the explicit field, which must always resolve
PATH_FIELD = re.compile(r"\*\*Path\*\*:\s*`(?P<path>[^`:]+)(?::(?P<line>\d+))?`")


def examples() -> list[pathlib.Path]:
    return sorted(
        d for d in ROOT.iterdir()
        if d.is_dir() and not d.name.startswith(".") and (d / PACKET).exists()
    )


def check(example: pathlib.Path) -> list[str]:
    packet = example / PACKET
    text = packet.read_text(encoding="utf-8")
    rel = packet.relative_to(ROOT)
    problems: list[str] = []
    seen: set[tuple[str, str | None]] = set()

    for match in list(CITATION.finditer(text)) + list(PATH_FIELD.finditer(text)):
        cited = match.group("path")
        line_no = match.groupdict().get("line")
        if (cited, line_no) in seen:
            continue
        seen.add((cited, line_no))

        target = example / cited
        # An example may not reach outside itself; a citation that escapes is a
        # broken boundary, not just a broken link.
        try:
            target.resolve().relative_to(example.resolve())
        except ValueError:
            problems.append(f"{rel}: `{cited}` points outside {example.name}/")
            continue

        if not target.exists():
            problems.append(
                f"{rel}: cites `{cited}`, which does not exist. A finding whose "
                f"evidence cannot be opened is an assertion."
            )
            continue

        if line_no:
            lines = target.read_text(encoding="utf-8", errors="replace").splitlines()
            n = int(line_no)
            if n < 1 or n > len(lines):
                problems.append(
                    f"{rel}: cites `{cited}:{n}` but the file has {len(lines)} lines"
                )

    return problems


def check_snippets(example: pathlib.Path) -> list[str]:
    """A snippet labelled with a line must match the source at that line."""
    packet = example / PACKET
    text = packet.read_text(encoding="utf-8")
    rel = packet.relative_to(ROOT)
    problems: list[str] = []

    path_match = PATH_FIELD.search(text)
    if not path_match:
        return problems
    cited, line_no = path_match.group("path"), path_match.group("line")
    if not line_no:
        return problems
    target = example / cited
    if not target.exists():
        return problems  # already reported

    source = target.read_text(encoding="utf-8", errors="replace").splitlines()
    for comment_line, code in re.findall(r"//\s*Line (\d+)\s*\n(.+)", text):
        n = int(comment_line)
        if n > len(source):
            continue
        claimed = code.strip().split("//")[0].strip()
        actual = source[n - 1].strip()
        if claimed and claimed not in actual and actual not in claimed:
            problems.append(
                f"{rel}: snippet says line {n} is `{claimed[:48]}` but the source "
                f"reads `{actual[:48]}`"
            )
    return problems


def main() -> int:
    found = examples()
    if not found:
        print("no examples with a decision packet were found", file=sys.stderr)
        return 1

    all_problems: list[str] = []
    for example in found:
        problems = check(example) + check_snippets(example)
        status = "OK" if not problems else f"{len(problems)} problem(s)"
        print(f"  {example.name:<24} {status}")
        all_problems += problems

    if all_problems:
        print("\ncitations that do not resolve:\n", file=sys.stderr)
        for problem in all_problems:
            print(f"  - {problem}", file=sys.stderr)
        return 1

    print(f"\nevery citation in {len(found)} packet(s) resolves to real source.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
