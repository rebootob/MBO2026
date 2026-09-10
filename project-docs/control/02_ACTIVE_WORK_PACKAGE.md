# MBO2026 Active Work Package Contract

Updated: 2026-09-10 ICT

> **Role:** exact active authorization/scope authority.

## Current contract
```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-PREEXEC-01
STATUS = EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING
AUTHORIZED_BASE_HEAD = d6dc7ea4e8e7e88776c91be97bd8378ac1fb94d5
MODE = SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO

KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
RECORD_WRITE_AUTHORIZED = NO
ACL_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
D3-SBX-MIGRATION-01_AUTHORIZED = NO
```

## Owner authorization
`อนุมัติ D3-SBX-MIGRATION-01-PREEXEC-01 แบบ SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O ตามขอบเขตที่เสนอ`

## PREEXEC scope
- Prepare a thin future live migration runner while preserving the existing EXE1 local/test-only live-I/O lock.
- Bind PRE1 manifest SHA-256 `0e2cfdebe9e25d443f1b20139b018dffe9468c4819aedd071f4aa9940277a72e`.
- Bind PREWRITE backup SHA-256 `75ee58bf110529f8809f0b6cf6a946bbe5d77f24c52cb01271913ba2a2229c73`.
- Bind App795 sanitized comparison SHA-256 `a502bc0e5cd35eece5578512fb2675fe8516981ea21e7e884514151cee91735a`.
- Bind scorer mapping `M1_G1->[1,2]`, `M1_ONLY->[1]` and App794 `DEFER_REQUIREDNESS_NO_BACKFILL`.
- Freeze future live-write scope to App795 schema + exact 20 existing records and App794 exact five provenance-field additions only.
- Forbid writes to Apps 796/797/798/800, Process Management, ACL and generic deployment.

## Execution evidence
```text
NODE_SYNTAX_CHECKS = PASS
ISOLATED_ASSEMBLED_MOCK_HARNESS = 10/10 PASS
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
DEPLOYMENTS = 0
LIVE_MIGRATION_EXECUTIONS = 0
```

A transient out-of-scope `__DO_NOT_CREATE__` root file was created in commit `0c39c6c021cb00fc6f5f71c32a6590fcd5195a61`. Final publication must remove it forward-only; no force/reset/rebase/history rewrite.

PREEXEC is not PASS/CLOSED until independent review. Do not start `D3-SBX-MIGRATION-01` automatically.
