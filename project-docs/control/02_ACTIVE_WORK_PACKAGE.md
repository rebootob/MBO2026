# MBO2026 Active Work Package Contract

Updated: 2026-09-10 ICT

> **Role:** exact active authorization/scope authority.

## Current contract

```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-PRE1-R1
OWNER_AUTHORIZED = YES
MODE = DOCS/EVIDENCE-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT
R1_EXECUTION_COMPLETE = YES
INDEPENDENT_CONTROL_PLANE_REVIEW = PENDING
PRE1_CLOSED = NO
R1_BASE_HEAD = 576938c2994ebfb4893780a2699c47139634fd42
ROUTE_MANIFEST_SHA256 = 0e2cfdebe9e25d443f1b20139b018dffe9468c4819aedd071f4aa9940277a72e
ROUTE_MANIFEST_CANONICALIZATION = ECMASCRIPT_JSON_STRINGIFY_MANIFEST_ROWS_UTF8_NO_TRAILING_NEWLINE

ALLOWED = correct PRE1 planning/control/evidence documents only
ALLOWED = establish deterministic manifest-hash provenance
ALLOWED = add explicit App795 schema-executor and record-seed-executor blockers
ALLOWED = align machine executionBlockedUntil with human plan
ALLOWED = update document index routing for PRE1/R1 evidence
ALLOWED = synchronize current control docs

KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
SOURCE_IMPLEMENTATION_AUTHORIZED = NO
TEST_IMPLEMENTATION_AUTHORIZED = NO
BUILD_AUTHORIZED = NO
D3-SBX-MIGRATION-01_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
```

## Owner authorization

Exact Owner authorization:

`อนุมัติ D3-SBX-MIGRATION-01-PRE1-R1 Manifest Integrity + Complete Migration-Tooling Blocker Corrective แบบ DOCS/EVIDENCE-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT`

## R1 corrective requirements

1. Define exact canonical bytes for the 20-route array and record a reproducible SHA-256.
2. Preserve the former `b51fb7...` value only as non-authoritative legacy provenance.
3. Record that `d3-migrate-routing-schema.js` is a DRY-RUN planner, not a live App795 schema executor.
4. Record that App795 record seed tooling is planning-only and not a reviewed live executor.
5. Add both App795 executor prerequisites to the migration blocker contract.
6. Retain the App794 provenance executor prerequisite and make the unresolved existing-record provenance/backfill policy machine-blocking.
7. Keep scorer proposal non-authoritative until explicit Owner/HR approval.
8. Keep ACL change deferred and preserve `admin-form` non-HR boundary.
9. Route PRE1/R1/manifest artifacts from `AI_DOCUMENT_INDEX.md`.
10. Do not implement any executor or perform any live operation.

## Current boundary

`D3-SBX-MIGRATION-01` remains NOT AUTHORIZED. R1 must receive an independent Control Plane review before PRE1 can close or any next implementation package can be proposed.
