# D3-SBX-MIGRATION-01-BD1 — Scorer Mapping + App794 Historical Provenance Policy Decision

Status: PASS / CLOSED / BUSINESS DECISIONS COMPLETE  
Mode: DECISION/DOCS-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT  
Base HEAD: `2d28fbe0ff6ecdfeec507c331470ca937e09b1ca`

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-BD1 ตามขอบเขตและ decision ที่เสนอ`

## Decision A — Scorer mapping

Exact approved mapping:

```text
M1_G1   -> [1,2]
M1_ONLY -> [1]
AUTO_INFER_SCORER_PLAN = FORBIDDEN
```

Authority is complete for this exact mapping:

```text
SCORER_MAPPING_OWNER_APPROVAL = YES
SCORER_MAPPING_HR_CONCURRENCE = YES
SCORER_MAPPING_BUSINESS_AUTHORITY_COMPLETE = YES
```

HR concurrence is recorded in `project-docs/D3_SBX_MIGRATION_01_BD1_HR1.md` and was independently reviewed PASS at `f468b357208589946e0c87c3096c62179a943696`.

## Decision B — App794 historical provenance policy

```text
APP794_HISTORICAL_PROVENANCE_POLICY = DEFER_REQUIREDNESS_NO_BACKFILL
POLICY_RESOLVED = YES
INVENT_HISTORICAL_PROVENANCE = FORBIDDEN
```

Operational meaning for any future separately authorized migration:

1. Add the five D3 App794 provenance fields only through the reviewed guarded executor.
2. Stage those fields as optional where needed for compatibility with existing historical records.
3. Perform zero historical provenance backfill under this policy.
4. Do not finalize requiredness on existing historical records where that would require invented values.
5. Any later historical backfill requires a separate evidence-backed business decision and exact record/revision/value packet.

## Closure

`D3-SBX-MIGRATION-01-BD1-HR1-CLOSE` records the independent PASS verdict and closes this business-authority chain. It does not authorize `D3-SBX-MIGRATION-01` or any Kintone/live operation.

## Remaining live prerequisites

```text
FRESH_PREWRITE_BACKUP_AND_DRIFT_CHECK = REQUIRED
APP795_HR_ACL = PREPARED / DEFERRED / NOT AUTHORIZED
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
D3-SBX-MIGRATION-01 = NOT AUTHORIZED
```

## Safety evidence

```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
DEPLOYMENTS = 0
SOURCE_CHANGES = 0
TEST_CHANGES = 0
BUILD_CHANGES = 0
```
