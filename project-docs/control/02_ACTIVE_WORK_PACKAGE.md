# MBO2026 Active Work Package Contract

Updated: 2026-09-09 ICT

> **Role:** exact active authorization/scope authority.

## Current contract

```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-PRE1
OWNER_AUTHORIZED = YES
MODE = PLAN-ONLY / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT
EXECUTION_COMPLETE = YES
INDEPENDENT_CONTROL_PLANE_REVIEW = PENDING
PRE1_CLOSED = NO
PRE1_BASE_HEAD = a8c839db3d1160be2fce2880fd6c9cdc6b0e2aee
MANIFEST_SHA256 = b51fb7f4e81953c48858409a1ceb8ea948c0a2e0eb384ad3aabc9b6640d7a04b

ALLOWED = repository plan/evidence documentation derived from accepted preflight evidence
ALLOWED = exact 20-route manifest / scorer proposal / schema diff / rollback-readback plan / ACL plan

KINTONE_READ_AUTHORIZED_BY_PRE1 = NO NEW LIVE READ REQUIRED / NONE EXECUTED
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
SOURCE_TEST_BUILD_CHANGES_AUTHORIZED = NO
D3-SBX-MIGRATION-01_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
```

## Owner authorization

```text
D3-SBX-MIGRATION-01-PRE1 — Exact 20-Route Migration Manifest + Scorer Mapping + ACL Plan แบบ PLAN-ONLY / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT
```

## Produced evidence

```text
PLAN = project-docs/D3_SBX_MIGRATION_01_PRE1.md
MANIFEST = project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json
MANIFEST_SHA256 = b51fb7f4e81953c48858409a1ceb8ea948c0a2e0eb384ad3aabc9b6640d7a04b
EXACT_ROUTE_COUNT = 20
```

## Required independent review questions

1. Exact 20 source record IDs/revisions, routing keys, approvers and effective intervals match accepted preflight evidence.
2. D3 route patterns and M2-first/ALL-only semantics are correct.
3. Proposed scorer mapping is clearly non-authoritative until Owner/HR approval.
4. App795 schema diff and staged-requiredness plan are safe and deterministic.
5. App794 provenance tooling/backfill gap is correctly fail-closed.
6. ACL plan preserves `admin-form` non-HR boundary and forbids historical delete.
7. Rollback/read-back plan never guesses data or auto-starts deployment.

## Current boundary

`D3-SBX-MIGRATION-01` remains NOT AUTHORIZED. PRE1 must receive a fresh independent review before any next authorization decision.
