# D3-SBX-MIGRATION-01-PREEXEC-01 — Live Runner Binding + Exact Write Sequence Freeze

Updated: 2026-09-10 ICT
Work Package: `D3-SBX-MIGRATION-01-PREEXEC-01`
Mode: `SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O`
Authorized Base HEAD: `d6dc7ea4e8e7e88776c91be97bd8378ac1fb94d5`
Status: `EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING`

## Purpose
Prepare a narrowly scoped live migration runner and freeze the future write sequence without contacting Kintone. This package does not authorize live migration.

## Locked bindings
- PRE1 route manifest SHA-256: `0e2cfdebe9e25d443f1b20139b018dffe9468c4819aedd071f4aa9940277a72e`
- PREWRITE backup SHA-256: `75ee58bf110529f8809f0b6cf6a946bbe5d77f24c52cb01271913ba2a2229c73`
- App795 sanitized comparison SHA-256: `a502bc0e5cd35eece5578512fb2675fe8516981ea21e7e884514151cee91735a`
- Scorer mapping: `M1_G1->[1,2]`, `M1_ONLY->[1]`
- App794 policy: `DEFER_REQUIREDNESS_NO_BACKFILL`
- Existing EXE1 local/test-only lock remains unchanged.

## Future live write allowlist
- App795: schema changes and exact 20 existing-record updates only; no create/delete.
- App794: add exact five provenance fields only; zero historical backfill.
- App796/797/798/800: zero write.
- Process/ACL/UI deployment: zero change.

## Frozen future sequence
1. Fresh-fetch canonical Git and verify authorized execution HEAD.
2. Perform fresh read-only live guards immediately before first write.
3. Revalidate App795 exact 20 record IDs, revisions, routing keys, identities and effective dates.
4. Revalidate App794 schema revision and Process Management baseline `16 states / 31 actions`.
5. Stage App795 new/changed field constraints safely before record seed.
6. Update exact 20 App795 records with revision guards and locked scorer mapping; normalize active rules to `ALL` and inactive rules to blank.
7. Read back exact 20 records and fail closed on mismatch.
8. Finalize App795 required/unique field properties only after successful seed/readback.
9. Add exact five App794 provenance fields under `DEFER_REQUIREDNESS_NO_BACKFILL`; do not invent or backfill historical values.
10. Final readback/guard verification; confirm protected apps/process/ACL remain untouched; STOP.

## Fail-closed contract
Before first write, any Git HEAD drift, app/schema revision drift, record-set/revision drift, routing identity drift, manifest/hash mismatch, scorer-decision mismatch, backup-evidence mismatch, or App794 process-baseline mismatch must terminate with no write.

After a partial write, no blind retry or rollback is allowed. Any recovery must be a separately authorized revision-guarded package using accepted backup evidence.

## PREEXEC execution evidence
```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
DEPLOYMENTS = 0

NODE_SYNTAX_CHECK_RUNNER = PASS
NODE_SYNTAX_CHECK_TEST = PASS
ISOLATED_MOCK_HARNESS = 10/10 PASS
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

`D3-SBX-MIGRATION-01` remains **NOT AUTHORIZED**. STOP for independent Control Plane review.
