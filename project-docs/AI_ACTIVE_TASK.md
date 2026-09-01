# AI ACTIVE TASK — D2-WP003-R3-R16 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / TEST-ONLY REGRESSION RESTORE / NO SOURCE CHANGE / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
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
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
D2-WP003-R3-R14 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R15 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R16
ACTIVE_WORK_PACKAGE_NAME = RESTORE MALFORMED NORMALIZED-TYPE NEGATIVE PROOF
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED / TEST-ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R16-TEST-20260901-01
MAX_EXECUTOR_STATUS = NORMALIZED_TYPE_NEGATIVE_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE TEST REGRESSION ONLY

Restore the malformed `normalizedType` fail-closed negative proof that R3-R15 accidentally removed.

The R3-R15 validator implementation is accepted. This Work Package is proof restoration only.

## 2. Exact write scope

Authorized modification ONLY:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification if needed

No dependency/package change. No XLSX/image/media/output publication.

## 3. Accepted work — PRESERVE

Preserve without modification:
- R3-R15 validator source implementation;
- exact five-key `typeCounts` shape validation;
- extra/missing key rejection;
- non-negative integer count validation;
- deterministic `BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED` for malformed count shape;
- all R3-R15 count-shape negative tests;
- all R3-R14 source-backed positive per-record/address/hash/type proof;
- all accepted R3-R13 Part B classification/evidence-parity behavior.

## 4. Mandatory R3-R16 proof

Use the real source-backed valid Part B typed metadata and the real `validateTypedPrivacyMetadata()`.

Mandatory test:
1. `const validMetaB = await getTypedPrivacyMetadata('B')` or reuse the equivalent real source-backed object already in the test.
2. Deep-copy the valid metadata object.
3. Mutate one real metadata record:
   `normalizedType = 'invalid_type'`
   or another value outside `string|number|date|boolean|blank`.
4. Call `validateTypedPrivacyMetadata(mutated, SENSITIVE_RANGES_B)`.
5. Assert it throws exactly/documentedly:
   `BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED`.
6. Preserve all existing R3-R15 tests and positive proof.

Critical rule:

```text
R3-R16 IS TEST-ONLY.
RESTORE ACCEPTED NEGATIVE PROOF; DO NOT REDESIGN VALIDATOR SOURCE.
```

## 5. Out of scope — DO NOT TOUCH

Do NOT modify:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- Part B role classification/evidence parity;
- typed metadata positive proof except minimal test placement;
- header fingerprint/export parity;
- workbook source-vs-roundtrip parity;
- image inventory;
- insertion structural matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- another Work Package.

## 6. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit ONLY `tests/mbo-xlsx-ooxml-feasibility.test.js` may differ. After commit/push working tree must be clean.

## 7. Completion contract

Push only:
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Final executor status exactly one of:
```text
NORMALIZED_TYPE_NEGATIVE_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 8. Authorization ledger

```text
D2-WP003-R3-R14-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R15-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R16-TEST-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY / TEST-ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R16-TEST-20260901-01
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

Authorization is consumed when the R3-R16 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
