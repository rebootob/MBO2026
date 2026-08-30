# AI ACTIVE TASK — D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN CORRECTIVE

Mode: **ANTIGRAVITY LEAN SOURCE + FOCUSED TEST ONLY**  
Branch: `ai/antigravity-wp002c`

## 0. Purpose

Fix only the proven defects in candidate:

```text
6eccb3987372d9d50c06cc4249e264c86f11bb3d
```

This is intentionally a **small corrective** to reduce Antigravity usage.

Do not broad-scan the repository. Do not redesign. Do not write Control Plane docs. Do not produce a new evidence document. Do not run the full repository test suite or UI build in this corrective.

## 1. Mandatory fixes only

### A. Exact SHARED principal set

File:
`src/services/mbo-identity-service.js`

`resolveKintonePrincipalMode()` must return `SHARED` only for exact members of:

```text
t1
t2
s1
f1
f2
f3
e1
tmh
g_request
```

Remove all unauthorized heuristics/wildcards:
- numeric-only user codes;
- `req*`;
- `test*`;
- `user*`;
- any other inferred membership.

Normal non-shared principal -> `DEDICATED` candidate.
Technical admin remains denied Employee-Self.

### B. DEDICATED failure must fail closed

File:
`src/main-mbo-app.js`

After a native principal is classified `DEDICATED`:

```text
App53 mapping success -> DEDICATED context
App53 mapping missing/ambiguous/invalid/read-error -> BLOCK
```

Delete the current fallback that calls `mboLoginGate.requireLogin()` after DEDICATED mapping failure.

For every DEDICATED mapping failure:

```text
mboLoginGate.requireLogin() call count = 0
```

A valid DEDICATED principal must also work when `mboLoginGate` is null/unavailable.

### C. Wire Hybrid context into real Delete Guard

File:
`src/main-mbo-app.js`

The registered delete handler must give `DeleteGuardPolicy` access to the current common Employee-Self context, while preserving existing shared-gate compatibility.

Required behavior:
- valid DEDICATED Employee-Self -> delete blocked;
- valid SHARED Employee-Self -> delete blocked;
- no Employee-Self context -> policy abstains.

Do not add REST DELETE logic.

`src/security/delete-guard-policy.js` should remain unchanged unless this exact wiring cannot work with its current candidate implementation.

### D. Use resolved local context in Create

File:
`src/main-mbo-app.js`

Inside `setupRecordUiWithAuth(...)`, use the already resolved local:

```text
context.mode
context.kintoneUserCode
```

for requester/self-elision composition.

Do not authorize from:

```text
currentEmployeeSelfContext?.mode || 'SHARED'
```

Do not silently default missing/invalid mode to SHARED. Missing/malformed context must fail closed.

### E. Restore out-of-scope App800 test exactly

Restore:

`tests/hr-control-center-reset-ui.test.js`

exactly to base commit:

```text
7989b950247d269440f588da580cb9b56726b406
```

Expected blob after restoration:

```text
eb2a3cdfb6bee6a6d67f15cc3210f139a1635756
```

Do not modify this test further.

## 2. Focused tests only

Modify only if needed:
- `tests/d1-hybrid-identity-core-source.test.js`
- `tests/employee-main-mbo-app-integration.test.js`

Minimum proof:
1. the approved 9 principals -> SHARED;
2. `0118`, `12345`, `req_demo`, `testuser`, `user123`, `F1` -> not SHARED / DEDICATED candidate;
3. valid DEDICATED mapping succeeds with gate null;
4. DEDICATED missing mapping -> blocked, shared gate call count 0;
5. DEDICATED ambiguous mapping -> blocked, shared gate call count 0;
6. DEDICATED invalid `emp_text` -> blocked, shared gate call count 0;
7. Create uses local DEDICATED context and snapshots dedicated requester;
8. registered delete handler blocks DEDICATED and SHARED, but abstains when no Employee-Self context.

Run only these focused tests plus `git diff --check`.

**Do not run `npm test` full suite.**  
**Do not run `npm run ui:build`.**  
Those will be run once at the next source-acceptance milestone if this corrective passes review.

## 3. Files not to touch

Do not modify:
- `src/services/employee-service.js`
- `src/services/routing-service.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/ui/mbo-session-manager.js`
- `src/ui/mbo-kintone-auth-adapter.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `tests/employee-lookup-service.test.js`
- `tests/classic-bundle.test.js`
- any App800 source/test except the exact restoration above
- `dist/**`
- `config/**`
- Baselines / Control Center / Joblist / skills
- My Approval Tasks code

Do not create new source files.
Do not create a new evidence markdown file.

## 4. App53 Production hard stop

```text
APP53 = PRODUCTION
LIVE_GET = 0
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
APP53_SCHEMA_WRITE = 0
APP53_RECORD_WRITE = 0
APP53_BULK_WRITE = 0
DEPLOY = 0
ACL_WRITE = 0
GROUP_WRITE = 0
```

Use mocks/fixtures only.
Do not open or probe live App53.
Do not create `MBO_Kintone_User`.
Do not modify Natta `emp_text`.

## 5. Stop rule

If any fix requires a file outside this exact scope, a live Kintone operation, shared-auth redesign, routing-core change, or My Approval Tasks implementation:

**STOP and report. Do not expand scope.**

## 6. Finish

After focused tests pass:
1. run `git diff --check`;
2. verify final diff contains only the authorized files above;
3. commit one focused corrective commit;
4. push;
5. STOP.

Do not write long reports. In the final response report only:
- commit SHA;
- changed files;
- focused test result;
- `git diff --check` result;
- `LIVE_KINTONE_OPERATIONS = 0`;
- `APP53_PRODUCTION_TOUCHED = NO`.

Next owner = ChatGPT independent review.