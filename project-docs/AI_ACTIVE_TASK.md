# AI ACTIVE TASK — D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN CLEANUP R2

Mode: **ANTIGRAVITY MINIMUM SOURCE + FOCUSED TEST ONLY**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

Correct only the remaining issues in candidate:

```text
31d4bf55343f2dddea7a4dc016828083e6c4c699
```

Do not broad-scan. Do not build. Do not run full npm test. Do not create evidence. Do not touch Live Kintone.

Already accepted in this candidate — **do not rework**:
- exact 9-principal SHARED classification;
- DEDICATED mapping failure has no SHARED login fallback;
- registered DeleteGuard hybrid-context wiring;
- restored App800 HR test blob `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`.

## 1. Source correction — ONE source file only

Modify only:

```text
src/main-mbo-app.js
```

### A. Remove silent SHARED context compatibility fallback

`setupRecordUiWithAuth(...)` must require an already-resolved context object.

Do not convert a string/Employee_Code into:
```text
{ mode: 'SHARED', ... }
```

Required context must contain valid nonblank:
```text
mode = exact 'SHARED' or 'DEDICATED'
employeeCode
kintoneUserCode
```

Leading/trailing whitespace in `kintoneUserCode` must fail closed.
Missing/malformed context must throw/block with `INVALID_EMPLOYEE_SELF_CONTEXT` (or existing equivalent fail-closed error).

### B. Create must use local resolved Kintone principal only

Inside `onLookupEmployee`, use:
```text
context.mode
context.kintoneUserCode
```

Remove fallback/re-read such as:
```text
context.kintoneUserCode || kintone.getLoginUser()?.code
```

Do not default to SHARED. Do not use mutable global context as Create authorization fallback.

No redesign/refactor beyond these two corrections.

## 2. Focused test completion — ONE test file only

Modify only:

```text
tests/employee-main-mbo-app-integration.test.js
```

Add the smallest fixtures/assertions needed to prove:

1. valid DEDICATED mapping succeeds when `mboLoginGate = null`;
2. DEDICATED missing mapping -> blocked and shared gate call count = 0;
3. DEDICATED ambiguous mapping -> blocked and shared gate call count = 0;
4. DEDICATED invalid canonical `emp_text` -> blocked and shared gate call count = 0;
5. Create uses the local DEDICATED context and snapshots:
   `Requester_User = [{ code: <exact dedicated Kintone user> }]`;
6. existing registered DeleteGuard focused assertions remain passing.

Do not add broad regression tests.

## 3. Cleanup over-scope files — exact restore only

Restore these files exactly from Control Plane base:

```text
248174b67735a26318bbeadf8e341f8a3db31708
```

Paths:
```text
dist/mbo-employee-app.js
tests/classic-bundle.test.js
tests/create-handler-form-state.test.js
tests/objective-save-validation.test.js
tests/timeline-truthfulness-and-attachment.test.js
```

Use exact git restore/content restoration. Do not edit them manually.

Delete the over-scope file created by candidate:
```text
project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_CORRECTIVE_R1_EVIDENCE.md
```

Keep this file exactly as currently restored; do NOT touch it:
```text
tests/hr-control-center-reset-ui.test.js
expected blob = eb2a3cdfb6bee6a6d67f15cc3210f139a1635756
```

## 4. Everything else is READ-ONLY

Do not modify:
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js`
- `src/security/delete-guard-policy.js`
- `src/services/routing-service.js`
- any shared auth/session source
- any other test
- `config/**`
- Control Plane / Baselines / Joblist / skills
- My Approval Tasks code

## 5. Verification — ONLY TWO focused tests

Run only:

```text
node --test tests/d1-hybrid-identity-core-source.test.js
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run:
```text
npm test
npm run ui:build
classic-bundle test
other regression suites
```

Do not create an evidence markdown file.

## 6. App53 Production hard stop

```text
APP53 = PRODUCTION
LIVE_GET = 0
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
APP53_SCHEMA_WRITE = 0
APP53_RECORD_WRITE = 0
APP53_BULK_WRITE = 0
ACL_WRITE = 0
GROUP_WRITE = 0
DEPLOY = 0
```

Mocks/fixtures only. Do not open/probe App53. Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`.

## 7. Finish

After the two focused tests + diff check pass:
1. verify cumulative implementation diff no longer contains generated dist, corrective evidence, classic-bundle changes, or unrelated test changes;
2. commit one focused cleanup/corrective commit;
3. push;
4. STOP.

Final response must be only:
- commit SHA;
- changed files;
- two focused test results;
- `git diff --check`;
- `LIVE_KINTONE_OPERATIONS = 0`;
- `APP53_PRODUCTION_TOUCHED = NO`.

Next owner = ChatGPT independent review.