# MBO2026 Active Work Package Contract

Updated: 2026-09-10 ICT

> **Role:** exact active authorization/scope authority.

## Current contract

```text
PROJECT = MBO2026
CANONICAL_BRANCH = ai/antigravity-wp002c
ACTIVE_WORK_PACKAGE = D3-SBX-MIGRATION-01-PREWRITE-01-R1
OWNER_AUTHORIZED = YES
MODE = EVIDENCE/DOCS-ONLY
BASE_HEAD = 76eab32f10fb35ce45e308c12ced10996ab009a2
STATUS = AUTHORIZED / EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING
R1_VERDICT = PASS_R1_EVIDENCE_COMPLETE
R1_EVIDENCE_FILE = project-docs/evidence/D3_SBX_MIGRATION_01_PREWRITE_01_R1_EVIDENCE.md

PARENT_PREWRITE_01_STATUS = EXECUTION COMPLETE / INDEPENDENT REVIEW CORRECTIVE REQUIRED / NOT CLOSED
PARENT_EXECUTION_HEAD = 958c347d439ae62b8c2bb53dd322ff1c1e06d55a
PARENT_RAW_BACKUP_LOCATION = backups/prewrite-01/2026-09-10T11-11-23-228Z / LOCAL ONLY
PARENT_BACKUP_CHECKSUM = 75ee58bf110529f8809f0b6cf6a946bbe5d77f24c52cb01271913ba2a2229c73
PARENT_KINTONE_READS = 50

NEW_KINTONE_READ_AUTHORIZED = NO
EXISTING_LOCAL_RAW_BACKUP_READ = AUTHORIZED
KINTONE_WRITE_AUTHORIZED = NO
SCHEMA_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
RECORD_WRITE_AUTHORIZED = NO
ACL_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
D3-SBX-MIGRATION-01_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
NEXT_GATE_AUTHORIZED = NO
```

## Owner authorization

`อนุมัติ D3-SBX-MIGRATION-01-PREWRITE-01-R1 EVIDENCE/DOCS-ONLY corrective ตามขอบเขตที่เสนอ`

## Exact corrective scope

R1 may use only the existing local raw PREWRITE-01 backup and repository planning/evidence documents. No new Kintone request is authorized.

R1 must produce sanitized evidence sufficient for independent review of:

1. all 20 App795 rows against the canonical PRE1 manifest, including boolean equality for `requesterUsers`, `M2`, `M1`, `G1`, `G2`, `M2Rule`, `M1Rule`, `G1Rule`, `G2Rule`, source record id/revision, Routing_Key and effective dates;
2. App795 app ACL, record ACL and field ACL against the accepted baseline, without publishing unnecessary personal/member payloads;
3. App794 Process Management baseline, including 16 states and 31 actions, plus any other migration-sensitive process/config proof already present in the raw backup;
4. timestamp provenance tying local backup creation/execution metadata to the evidence/commit sequence. If this cannot be established from existing local artifacts, report `FRESH_READ_REAUTH_REQUIRED`.

A deterministic hash of sanitized comparison rows/config summaries should be recorded where practical so the evidence packet can be checked without exposing raw business records.

## Explicitly forbidden

- any new Kintone GET/POST/PUT/DELETE/PATCH;
- App797 read or any other live app read;
- any Kintone/schema/process/record/ACL write;
- deployment, migration execution, UAT or cutover;
- modifying source/test/build files;
- committing raw Kintone backup, `.env.local`, tokens, credentials, cookies or unnecessary personal data;
- fabricating missing proof;
- auto-closing PREWRITE-01 or auto-starting migration.

## Git output allowed

Only sanitized R1 evidence and minimal control-document synchronization may be committed/pushed to `ai/antigravity-wp002c`. Raw backup remains local-only.

Before push, Antigravity must confirm the branch still descends from this package base and stop on drift rather than merge/rebase/reset/force.

## Exit

```text
R1_SUCCESS_OUTPUT = EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING
R1_INSUFFICIENT_LOCAL_EVIDENCE = STOP / FRESH_READ_REAUTH_REQUIRED
D3-SBX-MIGRATION-01 = NOT AUTHORIZED
```

After push, STOP for independent Control Plane review.
