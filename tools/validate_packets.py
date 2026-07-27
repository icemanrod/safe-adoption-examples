#!/usr/bin/env python3
"""Validate every `adoption-decision.json` against the v1 schema.

Dependency-free on purpose. `jsonschema` would be the obvious choice, but this
repository is meant to be checkable by anyone with a Python install and no
network, so the subset of Draft 2020-12 the schema actually uses is implemented
here — required, type, enum, const, pattern, minimum, minItems, minLength,
additionalProperties, items, properties.

It also enforces three rules the schema cannot express, which are the ones that
carry the format's meaning:

    1. `owner_only_signals` non-empty requires `adopter_can_verify: false`.
       A finding cannot simultaneously need the maintainer and be settled by
       the reader.
    2. REMEDIATE findings need a `named_fix`. REMEDIATE means "fixable by a
       named change"; without the name it is just HOLD with a friendlier word.
    3. `authorization.authorized_by` must be null in a published packet.
       Authorization is a human act. A reviewer who fills it in has forged it.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "schema" / "adoption-decision.v1.json"
TYPES = {
    "object": dict, "array": list, "string": str,
    "integer": int, "number": (int, float), "boolean": bool, "null": type(None),
}


def type_ok(value, spec) -> bool:
    names = spec if isinstance(spec, list) else [spec]
    for name in names:
        expected = TYPES.get(name)
        if expected is None:
            continue
        if name == "integer" and isinstance(value, bool):
            continue
        if isinstance(value, expected):
            return True
    return False


def validate(node, schema: dict, where: str, out: list[str]) -> None:
    if "const" in schema and node != schema["const"]:
        out.append(f"{where}: must be {schema['const']!r}, got {node!r}")
    if "enum" in schema and node not in schema["enum"]:
        out.append(f"{where}: {node!r} is not one of {schema['enum']}")
    if "type" in schema and not type_ok(node, schema["type"]):
        out.append(f"{where}: expected {schema['type']}, got {type(node).__name__}")
        return
    if isinstance(node, str):
        if "pattern" in schema and not re.search(schema["pattern"], node):
            out.append(f"{where}: {node!r} does not match {schema['pattern']}")
        if "minLength" in schema and len(node) < schema["minLength"]:
            out.append(f"{where}: shorter than {schema['minLength']}")
    if isinstance(node, int) and not isinstance(node, bool):
        if "minimum" in schema and node < schema["minimum"]:
            out.append(f"{where}: below minimum {schema['minimum']}")
    if isinstance(node, list):
        if "minItems" in schema and len(node) < schema["minItems"]:
            out.append(f"{where}: needs at least {schema['minItems']} item(s)")
        if "items" in schema:
            for i, item in enumerate(node):
                validate(item, schema["items"], f"{where}[{i}]", out)
    if isinstance(node, dict):
        for key in schema.get("required", []):
            if key not in node:
                out.append(f"{where}: missing required field {key!r}")
        props = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for key in node:
                if key not in props:
                    out.append(f"{where}: unexpected field {key!r}")
        for key, sub in props.items():
            if key in node:
                validate(node[key], sub, f"{where}.{key}", out)


def semantic_rules(packet: dict, where: str) -> list[str]:
    out: list[str] = []
    for i, finding in enumerate(packet.get("findings") or []):
        at = f"{where}.findings[{i}]"
        signals = finding.get("owner_only_signals") or []
        if signals and finding.get("adopter_can_verify") is not False:
            out.append(
                f"{at}: has owner_only_signals {signals} but adopter_can_verify is "
                f"{finding.get('adopter_can_verify')!r}. A finding that needs the "
                f"maintainer cannot also be settled by the reader."
            )
        if finding.get("severity") == "REMEDIATE" and not finding.get("named_fix"):
            out.append(
                f"{at}: severity REMEDIATE with no named_fix. REMEDIATE means the "
                f"fix is named; without one this is HOLD wearing a friendlier word."
            )
    auth = packet.get("authorization") or {}
    if auth.get("authorized_by") is not None:
        out.append(
            f"{where}.authorization.authorized_by is filled in. A reviewer cannot "
            f"perform the authorization; leaving it null is the point."
        )
    return out


def main() -> int:
    if not SCHEMA.exists():
        print(f"schema not found at {SCHEMA}", file=sys.stderr)
        return 1
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))

    packets = sorted(ROOT.glob("*/adoption-decision.json"))
    if not packets:
        print("no packets found", file=sys.stderr)
        return 1

    all_problems: list[str] = []
    for path in packets:
        rel = path.relative_to(ROOT)
        try:
            packet = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            all_problems.append(f"{rel}: not valid JSON - {exc}")
            print(f"  {path.parent.name:<24} invalid JSON")
            continue
        problems: list[str] = []
        validate(packet, schema, str(rel), problems)
        problems += semantic_rules(packet, str(rel))
        print(f"  {path.parent.name:<24} {'OK' if not problems else f'{len(problems)} problem(s)'}")
        all_problems += problems

    if all_problems:
        print("\nschema problems:\n", file=sys.stderr)
        for problem in all_problems:
            print(f"  - {problem}", file=sys.stderr)
        return 1

    print(f"\n{len(packets)} packet(s) conform to adoption-decision/v1.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
