# MBO2026 Active Work Package Contract

Updated: 2026-09-10 ICT

> **Role:** exact active authorization/scope authority.

## Current contract

```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-EXE1-R2
OWNER_AUTHORIZED = YES
MODE = LOCAL-ONLY / TEST-ONLY
BASE_HEAD = b2787d6339b255829c4bd92b9cc4a1a68b40fb7c
EXECUTION_COMPLETE = YES
INDEPENDENT_CONTROL_PLANE_REVIEW = PENDING

PARENT_EXE1 = PARTIAL PASS / CORRECTIVE CHAIN OPEN / NOT CLOSED
PARENT_R1 = PARTIAL PASS / R2 REQUIRED / NOT CLOSED
D3-SBX-MIGRATION-01_AUTHORIZED = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
```

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-EXE1-R2 ตามขอบเขตที่เสนอ`

This authorizes only the exact bounded Control Plane proposal immediately before the approval:

1. Require App794 provenance scorer slots to be actual JSON number values.
2. Require `Number.isInteger(slot) === true` and `slot >= 1` before R1 semantic validation.
3. Add negative regression cases for numeric strings, booleans, null and decimals plus a positive integer-number case.
4. Preserve the R1 exact-record-set and route/version semantics unchanged.
5. Run local verification where available and record evidence without overstating repository test execution.
6. Sync R2 control/evidence documents only.

Implementation paths are limited to:

- `scripts/kintone/d3-sbx-migration-local-executor.js`
- `scripts/kintone/d3-sbx-migration-local-executor-r1.js` (preserved R1 public implementation bytes/internal substrate)
- `tests/d3-sbx-migration-local-executor-r2.test.js`
- R2/current-control documentation.

## Explicitly forbidden

- any Kintone GET/POST/PUT/DELETE performed by R2;
- any real schema/process/record mutation;
- deployment/build upload/cutover;
- changing or unlocking existing `D3_SCHEMA_WRITE_LOCKED`;
- changing R1 record-set semantics outside what is needed for the strict slot-type guard;
- treating scorer test values or PRE1 proposal as Owner/HR business approval;
- choosing/inventing App794 historical provenance business values;
- granting App795 HR ACL;
- starting `D3-SBX-MIGRATION-01`.

## Execution evidence

```text
R2_WRAPPER_SYNTAX_CHECK = PASS
R2_STRICT_TYPE_MICRO_REGRESSION = PASS
NUMERIC_STRING_CASE = REJECT
BOOLEAN_CASE = REJECT
NULL_CASE = REJECT
DECIMAL_CASE = REJECT
INTEGER_NUMBER_CASE = PASS
EXACT_REPOSITORY_EXE1_R1_R2_TEST_RUN = NOT CLAIMED / PENDING INDEPENDENT REVIEW EVIDENCE
FULL_SUITE_PASS_CLAIM = NO
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
DEPLOYMENTS = 0
```

Current business truth remains unchanged: scorer mapping is pending Owner/HR approval and App794 existing-record provenance backfill policy is unresolved / DO NOT GUESS.

Next action: independent fresh-fetch `review` of R2. No next gate is authorized.
