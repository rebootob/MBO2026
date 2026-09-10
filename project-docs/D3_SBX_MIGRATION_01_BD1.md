# D3-SBX-MIGRATION-01-BD1 — Scorer Mapping + App794 Historical Provenance Policy Decision

Status: OWNER + HR BUSINESS DECISIONS COMPLETE / CONTROL REVIEW PENDING  
Mode: DECISION/DOCS-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT  
Base HEAD: `2d28fbe0ff6ecdfeec507c331470ca937e09b1ca`

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-BD1 ตามขอบเขตและ decision ที่เสนอ`

This records the Owner's bounded business decisions only. It does not authorize live migration, Kintone access, schema/process mutation, deployment, UAT, cutover, or App795 ACL change.

## Decision A — Scorer mapping

Exact approved mapping:

```text
M1_G1   -> [1,2]
M1_ONLY -> [1]
AUTO_INFER_SCORER_PLAN = FORBIDDEN
```

Owner approval and genuine HR concurrence are now both recorded:

```text
SCORER_MAPPING_OWNER_APPROVAL = YES
SCORER_MAPPING_HR_CONCURRENCE = YES
SCORER_MAPPING_BUSINESS_AUTHORITY_COMPLETE = YES
```

HR concurrence is recorded in `project-docs/D3_SBX_MIGRATION_01_BD1_HR1.md`. This satisfies the locked Owner/HR business-authority requirement for the exact mapping only. It does not authorize any live migration action.

## Decision B — App794 historical provenance policy

Owner-approved policy:

```text
APP794_HISTORICAL_PROVENANCE_POLICY = DEFER_REQUIREDNESS_NO_BACKFILL
POLICY_RESOLVED = YES
INVENT_HISTORICAL_PROVENANCE = FORBIDDEN
```

Operational meaning for a future separately authorized migration:

1. Add the five D3 App794 provenance fields only through the reviewed guarded executor.
2. Stage those fields as optional where needed for compatibility with existing historical records.
3. Perform zero historical provenance backfill under this policy.
4. Do not finalize requiredness on existing historical records where that would require invented values.
5. Any later explicit historical backfill requires a separate evidence-backed business decision and exact record/revision/value packet.

## Remaining control/live prerequisites

Business decisions in BD1 are complete. Control closure awaits independent review of HR1 synchronization.

```text
INDEPENDENT_REVIEW_OF_HR1 = REQUIRED
D3-SBX-MIGRATION-01 = NOT AUTHORIZED
FRESH_PREWRITE_BACKUP_AND_DRIFT_CHECK = STILL REQUIRED
APP795_HR_ACL = PREPARED / DEFERRED / NOT AUTHORIZED
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
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
