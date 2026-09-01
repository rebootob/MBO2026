# AI ACTIVE TASK — D2-WP003-R3-R17 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / HEADER FINGERPRINT + SANITIZED EXPORT PARITY ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R17
ACTIVE_WORK_PACKAGE_NAME = HEADER FINGERPRINT / SANITIZED EXPORT PARITY
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE DEFERRED FEASIBILITY BLOCKER ONLY

Close only **header fingerprint / sanitized export parity** for the exact SHA-verified Part A and Part B owner templates.

Do not reopen accepted privacy-role classification or typed-metadata work. Do not expand into workbook-wide parity, image inventory, insertion/formula work, production renderer, PDF/UI, Kintone or deploy.

## 2. Execution baseline and exact write scope

Control-plane pre-authorization checkpoint was:

```text
528e1ed31985296c99ab8c40ce5f05f4146d549d
```

This is NOT the executor baseline. Antigravity MUST fresh-fetch the canonical branch after authorization sync and record the then-current remote HEAD as `EXECUTION_BASELINE` before editing. Do not reset behind the current authorized governance HEAD.

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No dependency/package change. No XLSX/image/media/output publication.

## 3. Exact source identity

Use ONLY exact owner templates:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If exact templates are unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Reuse existing accepted helpers

Prefer minimal extension of existing feasibility code:
- `getHeaderCellFingerprints()`
- `getSanitizedDisposableBuffers()`
- `findLocalSourceTemplates()`
- existing exact SHA constants

Do NOT redesign header architecture if these helpers are sufficient.

Any new validator/helper must be bounded to header parity only and must use authoritative exact-source fingerprints independently from observed sanitized fingerprints.

## 5. Frozen header authority

### Part A — header rows 6–7

Protected static title/labels:
- `B6:M7` title
- `Z6:AF6` Department label
- `AG6:AL6` Section label
- `AM6:AP6` Start Date label
- `AQ6:AS6` Employee ID label
- `AT6:BC6` Name label
- `BD6:BI6` Position label

Dynamic header/value regions:
- `N6:Q7` Fiscal Year merged exception
- `Z7:AF7`
- `AG7:AL7`
- `AM7:AP7`
- `AQ7:AS7`
- `AT7:BC7`
- `BD7:BI7`

Other cells in the bounded Part A header rows that are neither static-label nor dynamic-value cells are unrelated/template structure and must remain structurally source-consistent.

### Part B — header rows 2–3

Protected static title/labels:
- `B2:F3` title
- `J2:L2` Department label
- `M2:O2` Section label
- `P2:Q2` Position label
- `R2` Employee ID label — NON-MERGED exception
- `S2:W2` Name label

Dynamic header/value regions:
- `G2:H3` Fiscal Year merged exception
- `J3:L3`
- `M3:O3`
- `P3:Q3`
- `R3` Employee ID value — NON-MERGED exception
- `S3:W3`

`X2`/`X3` and other unrelated bounded header cells remain template structure and must not be repurposed as dynamic values.

## 6. Mandatory parity contract

Critical rule:

```text
HEADER PARITY = STRUCTURE + ROLE-SAFE FINGERPRINT PARITY.
DYNAMIC SAMPLE VALUES MUST BE SANITIZED, NOT PRESERVED.
```

For authoritative source fingerprints:
- derive them from exact SHA-verified owner-template buffers BEFORE any sanitization or test override;
- expected evidence must never be recomputed from mutated/observed data.

For EVERY protected-static header/title address:
- exact address membership must match authority;
- `styleId` must match exact source;
- `mergeRef` must match exact source, including non-merged exceptions;
- normalized type/blankness must remain source-consistent where role-relevant;
- proven static text identity must use safe SHA-256 `valHash` parity only;
- no raw source value may be emitted.

For EVERY dynamic header/value address after sanitization:
- exact address membership must match authority;
- `styleId` must match exact source;
- `mergeRef` must match exact source, including `R3` non-merged exception;
- cell value must be blank/null/undefined after sanitization;
- no source sample-value hash equality is allowed or required;
- observed dynamic `valHash`, if the helper emits one, must resolve to null/absent after sanitization.

For unrelated bounded header cells:
- preserve source structural identity (`styleId`, `mergeRef`, and safe static fingerprint where applicable);
- they must not silently become dynamic/sensitive fields.

The authoritative and observed address sets must be exact: no missing, extra, duplicate, ambiguous or reclassified header addresses.

## 7. Fail-closed requirement

A real bounded header-parity validator/resolver path must deterministically throw exactly:

```text
BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED
```

for any required header evidence that is:
- missing;
- extra where exact role/address set is required;
- duplicate/ambiguous;
- structurally changed (`styleId` or `mergeRef` mismatch);
- static-label safe hash/type/blankness mismatch where applicable;
- dynamic header still nonblank after sanitization;
- dynamic header incorrectly required to preserve sample-value identity;
- role/address assignment conflict.

Do not rely on incidental TypeError/assertion failure as the validator contract.

## 8. Mandatory real/source-backed tests

Preserve all existing accepted tests.

Add bounded proof at minimum for BOTH Part A and Part B:
1. Positive source-vs-sanitized header parity using exact SHA source as authority.
2. Every dynamic header/value address is blank after sanitization while source `styleId`/`mergeRef` remains unchanged.
3. Protected static title/label fingerprint parity remains unchanged, including safe static hash where present.
4. Unrelated bounded header structure remains unchanged.

Mandatory negative cases using the real validator/resolver path and an authoritative baseline derived BEFORE mutation:
- mutate one real dynamic header `styleId` OR `mergeRef` while keeping address present => exact blocker;
- make one real sanitized dynamic header appear nonblank => exact blocker;
- mutate one real protected-static label safe hash/role-relevant fingerprint => exact blocker;
- remove one required header address OR add an unexpected role address => exact blocker.

Tests may use a bounded observed-fingerprint override only if authoritative expected fingerprints are independently rebuilt from the exact SHA source first. Do not create a synthetic test-only validator.

## 9. Preserve accepted work

Do not regress:
- Part B source-derived privacy role resolution;
- typed metadata completeness and validator-shape proof;
- range-driven privacy clearing / zero sensitive-token proof;
- existing header geometry test;
- exact template SHA proof;
- Difficulty Level blank decision.

## 10. Out of scope — DO NOT TOUCH

Do NOT work on:
- workbook-wide source-vs-roundtrip parity closure;
- reference-image full inventory closure;
- Part A objective insertion structural matrix;
- Part B competency insertion structural matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- another Work Package.

## 11. Mandatory commands

Run exactly:

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the authorized feasibility file(s) may differ. After commit/push working tree must be clean.

## 12. Completion contract

Commit/push only authorized feasibility file(s), maximum these two:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Before editing, record the fresh-fetched current remote canonical HEAD as `EXECUTION_BASELINE`. After push, verify remote HEAD differs from `EXECUTION_BASELINE` and is a fast-forward descendant of it.

Report:
- EXECUTION_BASELINE SHA
- NEW COMMIT SHA
- PUSH SUCCESS
- REMOTE HEAD SHA
- exact changed files
- test result
- npm audit result
- final status

Final executor status must be exactly one of:

```text
HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 13. Authorization ledger

```text
D2-WP003-R3-R15-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R16-TEST-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R17-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
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

Authorization is consumed when the R3-R17 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
