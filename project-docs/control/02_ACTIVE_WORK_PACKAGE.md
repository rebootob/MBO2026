# MBO2026 Active Work Package Contract

Updated: 2026-09-09 ICT

> **Role:** exact active authorization/scope authority.
> Governance: `project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`.

## Current contract state

```text
ACTIVE_WORK_PACKAGE = D3-IMP-01
ACTIVE_WORK_PACKAGE_STATUS = ACTIVE / OWNER AUTHORIZED
OWNER_AUTHORIZATION = APPROVED
OWNER_AUTHORIZATION_TEXT = อนุมัติ D3-IMP-01 Local Core Routing / Scorer / Snapshot Contracts + Tests Only ตาม readiness plan
STARTING_HEAD = ea9e780942df18698567f4a2ae06c3a30f2f2671

PREVIOUS_CLOSED_WORK_PACKAGE = D3-IMPLEMENTATION-READINESS-PLAN
PREVIOUS_CLOSED_RESULT = PASS / CLOSED / EVIDENCE-GROUNDED
AUTO_START_NEXT_WORK_PACKAGE = NO
```

## D3-IMP-01 objective

Implement pure deterministic D3 V1 domain contracts and focused automated tests for:

- Model A effective-dated route-version selection;
- canonical ordinal route-pattern normalization for all five supported topologies;
- exact one-user-per-active-slot and ALL-only D3 V1 validation;
- own-MBO self-elision preserving canonical business order;
- explicit HR scorer-plan resolution for frozen `K_expected` 1 or 2;
- deterministic canonical snapshot JSON serialization and SHA-256 hashing.

This package is local-core only. It does not activate D3 runtime behavior in App794/App795/App798.

## Exact source allow-list

```text
src/services/routing-service.js                         [only if required; legacy runtime behavior must remain backward-compatible]
src/evaluation/appraiser-normalizer.js                 [only if adapter extraction is demonstrably required]
src/services/d3-route-version-resolver.js              [new]
src/services/d3-route-viability-service.js             [new]
src/services/d3-snapshot-serializer.js                 [new]
src/config/d3-route-contract.js                        [new, if needed]
```

## Exact test allow-list

```text
tests/routing-service.test.js                          [only focused D3 extension if required]
tests/d3-route-version-resolver.test.js                [new]
tests/d3-route-viability-service.test.js               [new]
tests/d3-snapshot-serializer.test.js                   [new]
tests/core-794-795-796-integration.test.js             [targeted extension only if required]
```

## Acceptance contract

```text
ALL_FIVE_TOPOLOGY_PATTERNS = REQUIRED
BOTH_THREE_APPRAISER_PATTERNS_DISTINCT = REQUIRED
USERS_PER_ACTIVE_SLOT = EXACTLY_1
D3_V1_APPROVAL_RULE = ALL_ONLY
SELF_ELISION_MATRIX = REQUIRED
ZERO_SURVIVORS = SELF_APPROVAL_ROUTE_CONFLICT
K_EXPECTED_SUPPORTED = 1 OR 2
SCORER_PLAN = EXPLICIT_HR_CONFIGURATION_ONLY
SCORER_DEFAULT = NONE
MISSING_SCORER_PLAN = SCORER_PLAN_NOT_CONFIGURED
K2_SCORERS = DISTINCT
NO_EFFECTIVE_ROUTE = FAIL_CLOSED
AMBIGUOUS_EFFECTIVE_ROUTE = FAIL_CLOSED
FUTURE_ACTIVE_VERSION_BEFORE_EFFECTIVE_FROM = ZERO_EFFECT
SNAPSHOT_SERIALIZATION = DETERMINISTIC_CANONICAL_JSON
SNAPSHOT_HASH = SHA-256
```

## Prohibited operations in this package

```text
CONFIG_SCHEMA_SPEC_CHANGES = NO
APP794_FIELD_CREATION = NO
APP795_SCHEMA_MIGRATION = NO
APP798_RUNTIME_ARCHIVE_IMPLEMENTATION = NO
MAIN_MBO_RUNTIME_INTEGRATION = NO
PROCESS_MANAGEMENT_CHANGES = NO
KINTONE_READS = 0
KINTONE_WRITES = 0
PROCESS_TRANSITIONS = 0
DATA_BACKFILL = 0
DEPLOYMENT = 0
PRODUCTION_CUTOVER = 0
```

## Review / stop rule

Substantive changes require fresh-fetch independent Control Plane review before `PASS / CLOSED`.

Stop and do not widen scope if:

- required behavior needs `config/schema-spec.js`, `src/main-mbo-app.js`, Kintone scripts, live/sandbox data, Process Management, deployment, or another file outside the allow-list;
- architecture truth conflicts with a locked D3 decision;
- test evidence shows regression outside the package.

No subsequent D3 package is authorized by this contract.