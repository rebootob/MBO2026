# AI ACTIVE TASK — D2-WP003-R3-R15 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / TYPED METADATA VALIDATOR FAIL-CLOSED SHAPE COMPLETENESS ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
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
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R15
ACTIVE_WORK_PACKAGE_NAME = TYPED METADATA VALIDATOR FAIL-CLOSED SHAPE COMPLETENESS
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R15-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = VALIDATOR_SHAPE_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE CORRECTIVE BLOCKER ONLY

Close only the remaining R3-R14 blocker:

**typed metadata validator top-level/count-shape fail-closed completeness.**

Preserve all accepted R3-R14 source-backed per-record/address/hash/type proof. Do NOT reopen Part B privacy classification/evidence parity. Do NOT attempt header/workbook/image/insertion/formula closure, production renderer/sanitizer, PDF/UI, Kintone or deploy.

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

Use only exact owner templates:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Accepted R3-R14 proof — PRESERVE

Preserve without redesign:
- exact Part A/B metadata address-set equality;
- no duplicate addresses;
- exact normalized type enum per record;
- `nonblank` boolean/type consistency;
- string SHA-256 hash shape and blank/non-string no-hash contract;
- source-backed derived count checks;
- source-zero date/boolean assertions without fabrication;
- malformed normalized-type fail-closed test;
- all accepted R3-R13 Part B classification/evidence-parity behavior.

Do not spend credit rebuilding accepted work.

## 5. Frozen R3-R14 rejection

Current validator can ignore unexpected `typeCounts` keys because it compares only the five recognized keys.

Concrete malformed input that MUST be rejected:

```text
valid metaResult
+ typeCounts.unexpected = 1
```

Critical rule:

```text
VALIDATOR MUST REJECT MALFORMED COUNT SHAPE.
KNOWN-KEY MATCHES ARE NOT EXACT OBJECT EQUALITY WHEN EXTRA/MISSING KEYS EXIST.
```

## 6. Mandatory R3-R15 validator contract

`validateTypedPrivacyMetadata()` must fail closed unless `typeCounts` is a plain valid count object with EXACTLY these five keys and no extras/missing keys:

```text
string
number
date
boolean
blank
```

Mandatory checks:
1. `typeCounts` must exist and be a non-null object, not an array.
2. Exact key set equality — no extra keys and no missing keys.
3. Every reported count must be a non-negative integer.
4. Derived counts from metadata must exactly equal reported `typeCounts`, including exact key set.
5. Missing/malformed top-level validator input must deterministically throw exactly:

```text
BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED
```

Do not rely on incidental JavaScript TypeError/undefined property behavior.

## 7. Mandatory negative tests

Use the real validator and source-backed valid metadata as the starting point.

Add at minimum:
1. Extra unexpected `typeCounts` key => exact blocker.
2. Missing `typeCounts` => exact blocker.
3. Malformed `typeCounts` (for example `null`, array, or other invalid shape) => exact blocker.
4. Invalid count value (negative, fractional, NaN-equivalent if representable in direct object input, or non-number) => exact blocker.

Preserve existing malformed normalized-type test and source-backed positive proof.

Do NOT fabricate owner-template source types merely for branch coverage.

## 8. Out of scope — DO NOT TOUCH

Do NOT work on:
- accepted Part B privacy role classification/evidence parity;
- accepted R3-R14 per-record metadata proof except minimal validator integration;
- header fingerprint/export parity;
- workbook source-vs-roundtrip parity;
- reference-image full inventory proof;
- Part A/B insertion structural matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- next Work Package.

## 9. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the authorized feasibility file(s) may differ. After commit/push working tree must be clean.

## 10. Completion contract

Push only authorized feasibility file(s), maximum these two:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Final executor status must be exactly one of:
```text
VALIDATOR_SHAPE_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 11. Authorization ledger

```text
D2-WP003-R3-R13-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R14-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R15-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R15-SOURCE-20260901-01
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

Authorization is consumed when the R3-R15 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
