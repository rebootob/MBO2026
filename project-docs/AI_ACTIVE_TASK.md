# AI ACTIVE TASK — D2-WP003-R3-R10 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / SOURCE-BACKED PART B CLASSIFICATION RESOLUTION ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R9 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R10
ACTIVE_WORK_PACKAGE_NAME = SOURCE-BACKED PART B CLASSIFICATION RESOLUTION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R10-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = CLASSIFICATION_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE ROOT BLOCKER ONLY

Resolve only the Part B privacy-classification blocker from R3-R9.

Do NOT attempt typed metadata closure, header proof, workbook parity, reference-image proof, structural matrix closure, formula-matrix closure, production renderer/sanitizer, PDF/UI, Kintone or deploy in this Work Package.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No other repository path may change. No dependency/package change is authorized.

## 3. Source identity

Use only the exact Part B owner template matching:

```text
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Frozen rule

The current classification based only on `SENSITIVE_RANGES_B`, broad ranges, row numbers, or a manually declared protected list is NOT acceptance proof.

Critical rule:

```text
ACTUAL SHA-VERIFIED SOURCE EVIDENCE MUST DRIVE OR VALIDATE EVERY ADDRESS.
IF ANY ADDRESS CANNOT BE JUSTIFIED, STOP BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED.
```

Do not manufacture a pass with hard-coded tables, row rules, comments, helper booleans, or self-consistency checks.

## 5. Required source evidence

Load the exact SHA-verified Part B template and inspect rows 2:34 from the actual source.

For every candidate address used in classification, produce safe evidence containing at minimum:
- `address`;
- `mergeRef` / merge membership;
- `styleId`;
- normalized source type exactly one of `string|number|date|boolean|blank`;
- `nonblank` boolean;
- safe SHA-256 hash when needed to prove identity without exposing value;
- source-role evidence/justification used by classification.

No raw value may be logged, committed, or embedded in error messages.

## 6. Protected-static set

Build and validate the COMPLETE protected-static set for rows 2:34 from actual source structure plus frozen template roles, including at least:
- title cells;
- header labels;
- competency names;
- competency descriptions;
- rating / scale guidance;
- other static instructional/template text.

Every protected-static address must have source evidence.

The implementation must not call a cell static merely because it is outside a sensitive range; it must be backed by actual source structure/role evidence.

## 7. Sensitive set

Every sensitive Part B address must:
- exist in the SHA-verified source evidence map;
- carry merge/style/type/blankness evidence;
- carry an explicit dynamic/sample role justification;
- NOT be classified solely because it falls in a broad range or row number.

If an address remains ambiguous between dynamic/sample and static template content, STOP exactly:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

## 8. Mandatory tests

Tests must directly use actual source-backed evidence and must:
1. verify template SHA before classification proof;
2. assert evidence exists for EVERY sensitive address;
3. assert evidence exists for EVERY protected-static address;
4. assert every evidence `normalizedType` belongs to `string|number|date|boolean|blank`;
5. assert style/merge/blankness evidence fields are present as applicable;
6. iterate ALL sensitive addresses;
7. iterate ALL protected-static addresses;
8. prove exact set disjointness:

```text
SENSITIVE ∩ PROTECTED_STATIC = empty
```

9. prove no classified address lacks a source-backed role justification;
10. include negative/fail-closed coverage showing unresolved classification raises `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` rather than silently passing.

Tests that only partition the helper's own output or compare a self-declared table against itself do NOT satisfy this contract.

## 9. Out of scope — DO NOT TOUCH

Do NOT use R3-R10 to close or redesign:
- typed metadata proof;
- header fingerprint proof;
- workbook source-vs-roundtrip parity;
- reference-image inventory proof;
- Part A/B structural assertion matrix;
- formula coverage matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- any next Work Package.

Existing unrelated proof code may remain unchanged.

## 10. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized feasibility files may differ. After commit/push working tree must be clean.

## 11. Completion contract

Push only the two authorized feasibility files.

Final executor status must be exactly one of:
```text
CLASSIFICATION_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 12. Authorization ledger

```text
D2-WP003-R3-R8-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R9-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R10-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R10-SOURCE-20260901-01
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

Authorization is consumed when the R3-R10 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
