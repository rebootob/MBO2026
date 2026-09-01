# AI ACTIVE TASK — D2-WP003-R3-R12 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / BODY + SUMMARY ROLE-SPECIFIC SOURCE VALIDATION ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R11 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R12
ACTIVE_WORK_PACKAGE_NAME = BODY + SUMMARY ROLE-SPECIFIC SOURCE VALIDATION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R12-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = BODY_SUMMARY_ROLE_VALIDATION_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE REMAINING CLASSIFICATION BLOCKER ONLY

Resolve only the R3-R11 remaining blocker:

**validate Part B competency/body and summary/signature roles against role-specific authoritative source evidence.**

Do NOT reopen accepted R3-R11 architecture and do NOT attempt typed metadata, header parity, workbook parity, image inventory, structural insertion matrix, formula matrix, production renderer/sanitizer, PDF/UI, Kintone or deploy.

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

## 4. Accepted R3-R11 architecture — PRESERVE

Preserve without redesign unless a minimal correction is strictly required:
- `buildPartBSourceEvidenceInventory()` inventory-first architecture;
- exact SHA verification;
- source evidence fields already collected;
- header role-specific structural validation;
- `SENSITIVE_RANGES_B` used only AFTER independent role resolution;
- real resolver dynamic/protected disjointness;
- real fail-closed path using `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`;
- real-address fail-closed tests.

Do not spend credit rebuilding accepted header/inventory/fail-closed work.

## 5. Frozen R3-R11 rejection

The following is NOT sufficient acceptance for body/summary:

```text
Rows 7:29  + column rectangle => role accepted
Rows 31:34 + column rectangle => role accepted
```

Geometry may nominate a candidate role, but generic evidence existence + valid normalized type is not enough.

Critical rule:

```text
BODY/SUMMARY GEOMETRY MAY NOMINATE A ROLE.
ACTUAL SHA-VERIFIED SOURCE EVIDENCE MUST CONFIRM THAT ROLE.
A BROAD RECTANGLE BY ITSELF IS NOT ACCEPTANCE PROOF.
```

## 6. Authoritative source role-validation baseline

Before applying any test override, derive the authoritative safe body/summary role-validation baseline from the exact SHA-verified source inventory.

For each role family, use the smallest reliable safe fingerprint necessary to distinguish expected source structure from conflicting/ambiguous structure. Allowed evidence includes:
- exact merge membership / merge-pattern identity where applicable;
- style id or style-pattern identity;
- normalized type;
- blank/nonblank state;
- safe SHA-256 hash ONLY for proven static template text where required;
- other already-available safe structural attributes if necessary.

Do not store/log raw source values.

Role validation must cover at minimum:
1. protected-static competency/body region (`B:J`, rows `7:29`);
2. dynamic competency/body region (`K:X`, rows `7:29`);
3. summary/signature region (`B:X`, rows `31:34`).

Do not assume one fingerprint fits all cells if the source contains multiple legitimate style/merge patterns. Derive/validate the actual legitimate pattern set from source.

## 7. Real resolver behavior

For every body/summary candidate role:
1. geometry nominates the candidate role;
2. authoritative source-role evidence confirms the actual evidence record;
3. only then may the role be accepted.

The REAL resolver must throw exactly:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

when body/summary role evidence is:
- missing;
- structurally changed;
- inconsistent with authoritative source-role evidence;
- conflicting with candidate role;
- ambiguous.

Do not silently accept the role from row/column geometry.

## 8. Mandatory tests — REAL role-relevant mutations

Tests must use the real resolver and actual source-backed evidence.

Preserve prior accepted header fail-closed tests and ADD at minimum:

1. **Protected competency/body**
   - choose a real address in `B:J`, rows `7:29`;
   - mutate a ROLE-RELEVANT evidence field such as actual style/merge/static-hash evidence;
   - prove real resolver throws `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

2. **Dynamic competency/body**
   - choose a real address in `K:X`, rows `7:29`;
   - mutate a ROLE-RELEVANT source evidence field;
   - prove real resolver throws the same blocker.

3. **Summary/signature**
   - choose a real address in `B:X`, rows `31:34`;
   - mutate a ROLE-RELEVANT source evidence field;
   - prove real resolver throws the same blocker.

Deleting a generic record alone does NOT satisfy these three new tests. Each must demonstrate role-specific source conflict detection.

Tests must also preserve proof that:

```text
SORT(dynamicAddresses) == SORT(SENSITIVE_RANGES_B)
DYNAMIC ∩ PROTECTED_STATIC = empty
```

Only compare to `SENSITIVE_RANGES_B` after role resolution.

## 9. No circular/self-fulfilling proof

Do not derive a role fingerprint from the mutated override itself.

Authoritative expected body/summary evidence MUST come from the exact SHA source before override/mutation is applied.

Test overrides may mutate the observed evidence supplied to the resolver, but must not mutate/recompute the authoritative expected baseline used to validate the role.

If the architecture cannot separate authoritative expected evidence from observed override evidence safely, STOP:

```text
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

## 10. Out of scope — DO NOT TOUCH

Do NOT use R3-R12 to close or redesign:
- header role validation already accepted;
- source inventory architecture already accepted;
- typed metadata proof;
- header fingerprint/export parity;
- workbook source-vs-roundtrip parity;
- reference-image inventory;
- Part A/B insertion structural matrix;
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
BODY_SUMMARY_ROLE_VALIDATION_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 13. Authorization ledger

```text
D2-WP003-R3-R10-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R11-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R12-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R12-SOURCE-20260901-01
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

Authorization is consumed when the R3-R12 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
