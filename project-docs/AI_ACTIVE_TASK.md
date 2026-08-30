# AI ACTIVE TASK — D1 HYBRID IDENTITY CORE SOURCE R1 CORRECTIVE R2

Mode: **ANTIGRAVITY SOURCE / FOCUSED TEST ONLY — APP53 PRODUCTION READ-ONLY / NO LIVE KINTONE ACCESS / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Review Starting Point

ChatGPT independently reviewed executor corrective commit:

```text
EXECUTOR_COMMIT = 5cc5ea609a4a4c5d2d218866feb0867e573973c0
REVIEW_RESULT   = CORRECTIVE R2
```

Corrective R1 successfully fixed the major Production App53 resolver exactness, dedicated requester-mode fail-closed behavior, and slot-preserving self-appraiser logic. Scope remained clean and App53 Production was not touched.

Two narrow items remain before source acceptance:
1. SHARED requester compatibility regression;
2. mandatory generic 3/4-slot regression proof missing.

Mandatory Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

Do not edit Control Plane documents or Baselines.

## 1. Finding D — SHARED Requester Behavior Regressed

Before Corrective R1, `resolveEffectiveRequesterUser()` preserved the accepted shared-principal comparison behavior by normalizing shared Kintone user codes with trim + case-insensitive comparison.

Corrective R1 changed SHARED comparison to trim-only / case-sensitive comparison:

```text
R1 accepted/shared behavior: normalize case for SHARED comparison
Corrective R1 current code: exact case-sensitive SHARED comparison
```

The previous Active Task explicitly required:

```text
SHARED preserves the already accepted App795 Requester_User behavior; do not broaden/change it.
```

### Required correction

In `resolveEffectiveRequesterUser()` only:
- keep `mode` exact: only `DEDICATED` or `SHARED`;
- keep DEDICATED Kintone user identity exact/case-sensitive and reject leading/trailing whitespace;
- restore the previously accepted SHARED principal comparison behavior only;
- SHARED comparison may trim and compare case-insensitively exactly as the pre-corrective implementation did;
- do not change the returned authoritative `routeRequesterUsers` payload;
- do not broaden SHARED to allow a principal absent from App795 `Requester_User`;
- `admin-form` remains denied.

Mandatory regression test:
- a SHARED principal differing only by case from the authoritative App795 requester code must behave exactly as it did before Corrective R1;
- an actually different/unauthorized shared principal remains denied;
- DEDICATED case mismatch remains exact and is not relaxed by this fix.

## 2. Finding E — Mandatory Generic 3/4-Slot Tests Missing

Corrective R1 test file proves Natta, multi-user slot preservation and rule carryover, but the authorizing task also required generic 3/4-slot topology regression coverage. The committed focused suite contains no explicit 3-slot or 4-slot transformation test.

Add explicit fixture-only tests for both:

### 3 surviving slots
Example acceptable shape:
- original four slots where the self user solely occupies one slot;
- after self removal, exactly 3 ordered slots survive;
- expected topology `M1_M2_G1`;
- every surviving slot keeps all users and its own approval rule while shifting left;
- no user dropped; input unchanged.

### 4 surviving slots
Example acceptable shape:
- self shares one slot with another valid approver, so removing self leaves all four slots nonempty;
- expected topology `M1_M2_G1_G2`;
- all surviving users remain in the correct slots;
- every approval rule remains attached to its surviving slot;
- no truncation; input unchanged.

Do not change topology architecture merely to satisfy tests. If either test reveals a real source defect outside the narrow allowed source seam below, STOP and report.

## 3. Allowed Files

Allowed source:
- `src/services/routing-service.js`

Allowed test:
- `tests/d1-hybrid-identity-core-source.test.js`

Allowed evidence:
- create `project-docs/D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_R2_EVIDENCE.md`

Read-only:
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js`
- `src/main-mbo-app.js`
- UI/build/deploy/config/dist files
- all Baselines / Control Plane docs
- prior R1 and Corrective R1 evidence

Expected source change is very small and limited to SHARED comparison compatibility in `routing-service.js`. If more source scope is required, STOP and report.

## 4. App53 Production Hard Stop

```text
APP53_ENVIRONMENT            = PRODUCTION
APP53_DEFAULT_MODE           = READ_ONLY
LIVE_GET                     = 0
LIVE_POST                    = 0
LIVE_PUT                     = 0
LIVE_DELETE                  = 0
APP53_SCHEMA_WRITE           = 0
APP53_RECORD_WRITE           = 0
APP53_IMPORT_OR_BULK_WRITE   = 0
APP794_ACL_WRITE             = 0
GROUP_WRITE                  = 0
APP795_WRITE                 = 0
APP801_WRITE                 = 0
PROCESS_WRITE                = 0
CUSTOMIZATION_UPLOAD         = 0
DEPLOY                       = 0
ROLLBACK                     = 0
```

Use fixtures only. Do not open App53 for testing. Do not create/populate `MBO_Kintone_User`. Do not correct Natta `emp_text`.

## 5. Verification Minimum

Run:
- focused Hybrid Identity suite;
- directly affected existing requester/routing tests;
- full `npm test` if practical;
- `git diff --check`.

Evidence must record exact changed files and exact results, plus:

```text
APP53_PRODUCTION_TOUCHED = NO
LIVE_NETWORK_OPERATIONS  = 0
NATTA_EMPLOYEE_CODE_GUESSED = NO
```

## 6. Acceptance Ceiling / Stop

Maximum executor status:

```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_R2_READY_PENDING_CHATGPT_REVIEW
```

Commit focused changes, push, then STOP. Next owner = ChatGPT independent review.
