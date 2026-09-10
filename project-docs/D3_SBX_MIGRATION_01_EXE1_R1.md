# D3-SBX-MIGRATION-01-EXE1-R1 — Exact Record-Set Coverage + Provenance Semantic Validation Corrective

Status: EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING  
Mode: LOCAL-ONLY / TEST-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT  
Base HEAD: `27bbbfaccadbfb7235547941d659512071c4fd6c`

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-EXE1-R1 — Exact Record-Set Coverage + Provenance Semantic Validation Corrective แบบ LOCAL-ONLY / TEST-ONLY / ZERO KINTONE READ / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT`

## Review findings being corrected

The independent EXE1 review returned `PARTIAL PASS / R1 REQUIRED / NOT CLOSED` for three bounded findings:

1. App794 `EXPLICIT_BACKFILL` checked equal counts but did not prove exact unique historical-record set equality.
2. App794 provenance scorer snapshots did not enforce positive/distinct/in-range slot semantics or bind route-version identity to the accepted route manifest.
3. App795 local seed application did not explicitly reject input arrays longer than the exact 20 records when duplicate IDs collapsed to a 20-ID map.

No other EXE1 behavior is reopened by this corrective.

## R1 implementation

The pre-R1 EXE1 implementation bytes are preserved as internal substrate:

- `scripts/kintone/d3-sbx-migration-local-executor-core.js`

The public EXE1 module remains:

- `scripts/kintone/d3-sbx-migration-local-executor.js`

and is now a hardened R1 entrypoint over the preserved core. Existing imports therefore receive the new guards without introducing any live Kintone path.

### App795 exact record-set guard

Before local seed application/read-back:

- source record array length must be exactly 20;
- operation array length must be exactly 20;
- all record IDs must be positive and unique;
- all operation record IDs must be positive and unique;
- source-record ID set must equal operation ID set exactly.

The original revision, Routing_Key, requester, M2/M1/G1/G2 and effective-interval preconditions remain enforced by the preserved EXE1 core.

### App794 exact historical coverage

For `EXPLICIT_BACKFILL` only:

- existing App794 record IDs must be unique;
- policy record IDs must be unique;
- policy and existing record counts must match;
- the two record-ID sets must be exactly equal;
- every policy expected revision must be a positive integer and equal the current supplied record revision;
- the same exact-set guard is repeated before local apply so a manipulated/incomplete plan cannot bypass coverage.

`DEFER_REQUIREDNESS_NO_BACKFILL` is unchanged. R1 does not choose a business policy.

### App794 provenance semantic validation

Every explicit provenance value set is checked against the accepted PRE1 route manifest:

- all five D3 provenance fields are present;
- `Frozen_Profile_Code`, `Effective_Routing_Key` and `Effective_Route_Version_Key` are nonblank;
- `K_expected_Snapshot` is exactly 1 or 2;
- `Effective_Routing_Key` exists in the accepted PRE1 manifest;
- `Effective_Route_Version_Key` exactly equals that route row's accepted `versionKey`;
- scorer snapshot is JSON and has exactly K slots;
- scorer slots are positive integers;
- scorer slots are distinct;
- no scorer slot exceeds the count of active M2/M1/G1/G2 route slots in the accepted manifest.

R1 intentionally does **not** convert the PRE1 scorer proposal into business approval. Structural/context validation is enforced while scorer authority remains pending Owner/HR approval.

## Targeted regression artifact

- `tests/d3-sbx-migration-local-executor-r1.test.js`

The regression source covers 21-record App795 input rejection, exact 20-row acceptance, App794 duplicate/missing set coverage, invalid scorer semantics, route-version mismatch, unknown route key, valid manifest-bound K2 values and tampered-plan rejection.

Source/test syntax checks were performed for the newly authored R1 wrapper and regression file. Exact repository execution of the test files is reserved for independent review; no full-suite PASS is claimed by this execution package.

## Safety boundary

```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
DEPLOYMENTS = 0
D3_SCHEMA_WRITE_LOCKED = UNCHANGED / NOT UNLOCKED
LIVE_ENTRYPOINT = STILL FAIL-CLOSED
D3-SBX-MIGRATION-01 = NOT AUTHORIZED
SCORER_MAPPING_BUSINESS_APPROVAL = PENDING OWNER/HR
APP794_HISTORICAL_PROVENANCE_POLICY = UNRESOLVED / DO NOT GUESS
```

Next action: independent fresh-fetch `review` of R1. Do not auto-start migration or any live write gate.
