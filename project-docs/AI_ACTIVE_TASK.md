# AI ACTIVE TASK — D2-WP003-R3-R13 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / BODY + SUMMARY AUTHORITATIVE EVIDENCE PARITY ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R12 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R13
ACTIVE_WORK_PACKAGE_NAME = BODY + SUMMARY AUTHORITATIVE EVIDENCE PARITY
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R13-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = EVIDENCE_PARITY_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE REMAINING BODY/SUMMARY PARITY GAP ONLY

Resolve only the remaining R3-R12 blocker:

**complete authoritative-vs-observed evidence parity for Part B body + summary role validation.**

Preserve accepted R3-R11/R3-R12 architecture. Do NOT attempt typed metadata, header parity, workbook parity, image inventory, insertion matrix, formula matrix, production renderer/sanitizer, PDF/UI, Kintone or deploy.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No dependency/package change. No XLSX/image/media/output publication.

## 3. Source identity

Use only exact Part B owner template:

```text
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Accepted R3-R12 architecture — PRESERVE

Preserve without redesign unless a minimal correction is strictly required:
- authoritative SHA-verified source inventory loaded before any observed override;
- authoritative expected evidence and observed override evidence remain separate;
- existing `styleId` + `mergeRef` parity checks;
- existing inventory-first architecture;
- existing header validation;
- existing real fail-closed path;
- `SENSITIVE_RANGES_B` remains post-resolution compatibility only;
- independent dynamic/protected sets and disjointness;
- existing real-address style-conflict tests.

Do not spend credit rebuilding accepted work.

## 5. Frozen R3-R12 rejection

The following is NOT sufficient:

```text
styleId matches
mergeRef matches
=> role accepted
```

Critical rule:

```text
STYLE + MERGE PARITY IS NECESSARY BUT NOT SUFFICIENT.
ROLE-RELEVANT TYPE / BLANKNESS / STATIC-ID EVIDENCE MUST ALSO MATCH AUTHORITATIVE SOURCE.
```

## 6. Mandatory authoritative evidence parity

For Part B body/summary candidate roles, compare authoritative source evidence against observed evidence using the smallest role-relevant safe contract.

### 6.1 All body/summary candidates
Where role-relevant, validate:
- `styleId` parity — preserve existing;
- `mergeRef` parity — preserve existing;
- `normalizedType` parity;
- `nonblank` parity.

A mismatch in any required field must fail closed.

### 6.2 Proven protected-static competency/template text
For addresses proven to be protected-static template text:
- retain structural parity checks;
- require safe `valHash` parity when the authoritative source record is nonblank string/static text and hash identity is needed to prevent same-style/same-merge content substitution.

Do not log/store raw text.

### 6.3 Dynamic employee/sample values
Do NOT require source-sample `valHash` equality for legitimate dynamic fields.
Dynamic values are expected to change at runtime.
Validate their role structure/type/blankness contract only.

If role-relevant parity cannot be resolved safely, STOP:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

## 7. Real resolver behavior

The REAL resolver must throw exactly:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

when required authoritative evidence parity fails, including:
- body dynamic `normalizedType` conflict;
- body/summary `nonblank` conflict where role-relevant;
- protected-static safe hash identity conflict where required;
- missing/ambiguous evidence.

Do not silently accept from geometry, style, or merge alone.

## 8. Mandatory tests — NON-STYLE evidence mutations

Tests must use the real resolver and actual source-backed evidence.

Preserve R3-R12 style-conflict tests and ADD at minimum:

1. **Protected-static body**
   - choose a proven real protected-static competency/body text address;
   - mutate `valHash` OR role-relevant `nonblank` while keeping style/merge unchanged;
   - prove real resolver throws `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

2. **Dynamic body**
   - choose a real `K:X / rows 7:29` address;
   - mutate `normalizedType` OR role-relevant `nonblank` while keeping style/merge unchanged;
   - prove real resolver throws the same blocker.

3. **Summary/signature**
   - choose a real `B:X / rows 31:34` address;
   - mutate `normalizedType` OR role-relevant `nonblank` while keeping style/merge unchanged;
   - prove real resolver throws the same blocker.

Also preserve:

```text
SORT(dynamicAddresses) == SORT(SENSITIVE_RANGES_B)
DYNAMIC ∩ PROTECTED_STATIC = empty
```

Only compare `SENSITIVE_RANGES_B` after independent role resolution.

## 9. No circular proof

Authoritative expected evidence must continue to come from the exact SHA source BEFORE override/mutation.
Never recompute expected parity from mutated observed evidence.

Do not add hard-coded pass tables that simply mirror test mutations.

## 10. Out of scope — DO NOT TOUCH

Do NOT use R3-R13 to close or redesign:
- source inventory architecture;
- header role validation;
- typed metadata proof;
- header/export parity;
- workbook roundtrip parity;
- reference-image inventory;
- insertion structural matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- next Work Package.

## 11. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized feasibility files may differ. After commit/push working tree must be clean.

## 12. Completion contract

Push only the two authorized feasibility files.

Final executor status must be exactly one of:
```text
EVIDENCE_PARITY_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 13. Authorization ledger

```text
D2-WP003-R3-R11-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R12-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R13-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R13-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
```

Authorization is consumed when the R3-R13 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
