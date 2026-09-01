# AI ACTIVE TASK — D2-WP003-R3-R11 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / SOURCE-DERIVED ROLE RESOLUTION + REAL FAIL-CLOSED VALIDATION ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R10 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R11
ACTIVE_WORK_PACKAGE_NAME = SOURCE-DERIVED ROLE RESOLUTION / FAIL-CLOSED VALIDATION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R11-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = ROLE_RESOLUTION_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE ROOT BLOCKER ONLY

Resolve only the remaining Part B privacy-classification root blocker after R3-R10:

**make role resolution independently source-derived/source-validated and wire fail-closed behavior into the REAL classifier/validator.**

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

## 4. Accepted R3-R10 progress — PRESERVE

R3-R10 already added useful source-backed evidence extraction. Preserve it unless a minimal correction is necessary:
- exact SHA-verified Part B source load;
- merge membership;
- style id;
- normalized type;
- blank/nonblank state;
- safe hash for nonblank string values.

Do not spend credit rebuilding accepted evidence extraction from scratch.

## 5. Frozen rejection from R3-R10

The following is NOT acceptance:
- iterating `SENSITIVE_RANGES_B` first and then attaching source evidence;
- using a hard-coded header address list to choose dynamic roles;
- using only broad row rules such as `7:29` or `31:34` to choose roles;
- manually pre-expanding protected-static addresses and calling that independent proof;
- validating fail-closed behavior only with a helper created inside the test.

Critical rule:

```text
DO NOT SELECT AN ADDRESS BECAUSE IT IS IN SENSITIVE_RANGES_B
AND THEN CALL ITS SOURCE DATA "VALIDATION".

RESOLVE / VALIDATE ROLE FROM FROZEN STRUCTURE + ACTUAL SOURCE EVIDENCE FIRST.
ONLY THEN COMPARE THE RESULT TO THE SANITIZER MAP.
```

## 6. Complete source evidence inventory FIRST

Before assigning any privacy role, build a safe evidence inventory for the actual Part B main sheet rows `2:34`.

Evidence records must contain at minimum:
- `address`;
- `mergeRef` / merge membership;
- `styleId`;
- normalized source type exactly one of `string|number|date|boolean|blank`;
- `nonblank` boolean;
- safe SHA-256 hash only where needed;
- any safe structural attributes needed by the role validator.

No raw source value may be logged, committed, or embedded in error messages.

## 7. Role resolution authority

Role resolution may use:
1. exact frozen template-role geometry already documented for Part B;
2. actual SHA-verified source evidence from the inventory;
3. merge/style/type/blankness/hash evidence where needed to validate that the source still matches the frozen role geometry.

Role resolution MUST NOT use `SENSITIVE_RANGES_B` as an input.

`SENSITIVE_RANGES_B` is permitted only AFTER independent role resolution as a sanitizer compatibility cross-check.

Broad row-number rules alone are insufficient. A role specification must be explicit enough that actual source evidence can confirm or reject the role.

## 8. Real fail-closed validator

The REAL feasibility classifier/validator must throw exactly:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

when any required evidence is:
- missing;
- structurally inconsistent with the frozen role spec;
- conflicting between expected role and source evidence;
- ambiguous between dynamic/sample and protected-static;
- impossible to resolve safely.

Do not silently fall back to `SENSITIVE_RANGES_B`, a row rule, or a default dynamic/static role.

## 9. Mandatory independent outputs

The real resolution path must produce independently resolved sets, at minimum:
- `dynamicAddresses`;
- `protectedStaticAddresses`;
- per-address evidence + resolved role / justification.

Then, and only then:

```text
SORT(dynamicAddresses) == SORT(SENSITIVE_RANGES_B)
```

is allowed as the final sanitizer compatibility check.

Also prove:

```text
DYNAMIC ∩ PROTECTED_STATIC = empty
```

Any mismatch => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 10. Mandatory tests — REAL path only

Tests must use the real classifier/validator and actual source-backed evidence.

Required:
1. verify exact Part B SHA before proof;
2. build complete evidence inventory before role resolution;
3. resolve roles without `SENSITIVE_RANGES_B` as classification input;
4. assert every independently resolved address has source evidence and role justification;
5. assert every evidence `normalizedType` belongs to `string|number|date|boolean|blank`;
6. assert dynamic/protected sets are disjoint;
7. only after resolution, assert dynamic set equals `SENSITIVE_RANGES_B` as compatibility cross-check;
8. mutate/remove evidence for at least one REAL dynamic Part B address and prove the REAL validator throws `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`;
9. mutate/remove evidence for at least one REAL protected-static Part B address and prove the REAL validator throws the same blocker;
10. include at least one conflict case where evidence structurally contradicts the frozen role spec and prove fail-closed;
11. no local synthetic `validateClassificationMap()` or equivalent test-only validator may stand in for the real path.

## 11. Out of scope — DO NOT TOUCH

Do NOT use R3-R11 to close or redesign:
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

## 12. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized feasibility files may differ. After commit/push working tree must be clean.

## 13. Completion contract

Push only the two authorized feasibility files.

Final executor status must be exactly one of:
```text
ROLE_RESOLUTION_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 14. Authorization ledger

```text
D2-WP003-R3-R9-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R10-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R11-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R11-SOURCE-20260901-01
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

Authorization is consumed when the R3-R11 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
