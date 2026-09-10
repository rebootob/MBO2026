# MBO2026 Active Work Package Contract

Updated: 2026-09-10 ICT

> **Role:** exact active authorization/scope authority.

## Current contract

```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-BD1
OWNER_AUTHORIZED = YES
MODE = DECISION/DOCS-ONLY
BASE_HEAD = 2d28fbe0ff6ecdfeec507c331470ca937e09b1ca
EXECUTION_COMPLETE = YES
STATUS = OWNER DECISION RECORDED / HR CONCURRENCE PENDING / NOT CLOSED

D3-SBX-MIGRATION-01_AUTHORIZED = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
NEXT_GATE_AUTHORIZED = NO
```

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-BD1 ตามขอบเขตและ decision ที่เสนอ`

This authorization records only the bounded business decisions proposed immediately before approval.

## Decision A — exact scorer mapping

```text
M1_G1   -> [1,2]
M1_ONLY -> [1]
OWNER_APPROVED = YES
HR_CONCURRENCE = PENDING
EFFECTIVE_FOR_LIVE_MIGRATION = NO
AUTO_INFER_SCORER_PLAN = FORBIDDEN
```

The locked scorer contract requires Owner/HR approval before migration may use the mapping. Owner authorization must not be rewritten as HR concurrence.

## Decision B — App794 historical provenance

```text
POLICY = DEFER_REQUIREDNESS_NO_BACKFILL
OWNER_APPROVED = YES
POLICY_RESOLVED = YES
INVENT_HISTORICAL_PROVENANCE = FORBIDDEN
```

Under a future separately authorized migration, the five D3 provenance fields may be staged optional as needed. No historical provenance values are backfilled by this policy, and requiredness must remain deferred where enforcement would require invented values.

## Explicitly forbidden

- any Kintone GET/POST/PUT/DELETE;
- any schema/process/record mutation;
- deployment/build upload/cutover;
- treating Owner scorer approval as HR concurrence;
- setting the scorer executor's Owner/HR approval gate true without genuine HR concurrence;
- inventing App794 historical provenance;
- granting App795 HR ACL;
- starting `D3-SBX-MIGRATION-01`.

## Current next action

Genuine HR concurrence on the exact scorer mapping is required before BD1 can close. Fresh pre-write backup/drift verification remains a later separate gate after business authority is complete.
