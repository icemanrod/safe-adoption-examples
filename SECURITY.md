# Security

## This repository contains no live vulnerabilities

Every example here is **synthetic**. `risky-payments-sdk` is deliberately
imperfect so a finding has something real to point at; it is not a fork of any
actual project, the processor is fictional, and no credential in this tree is
live. Nothing here should be reported as a vulnerability in a third party.

## Reporting a problem with the examples

If a packet claims something that is wrong — a finding that misreads its own
source, a verdict that does not follow from the evidence, a citation that
resolves to the wrong line — that is a defect worth reporting, and the most
useful kind of contribution this repository can receive.

Open an issue, or email **hello@icemanrod.com** if you would rather not do it in
public.

## Reporting a problem in the review service

If you believe a delivered decision packet contains an error, email
**hello@icemanrod.com** with the packet's `manifest_sha`. Packets are bound to
an exact revision and ruleset, so that hash identifies precisely which review is
in question.
