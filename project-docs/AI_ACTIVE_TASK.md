# AI ACTIVE TASK — D7 MINIMAL CORRECTIVE ROUND 2

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `c96eed10cc852ee66d146d18309425bbeaed73f5`
> Mode: MINIMUM SOURCE + TEST FIXES ONLY
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. PURPOSE

Independent review of `c96eed10...` found that D7 is still **NOT PASS**.

Do **NOT** perform broad refactoring, cleanup, redesign, new features, or unrelated improvements.
Fix ONLY the minimum blockers below.

Target implementer status remains:

`D7_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not self-certify PASS.

## 1. CRITICAL BLOCKERS ONLY

### B1 — Production provider must fail closed and must not fabricate authoritative evidence

File: `src/admin/admin-support-center.js`

Current problems:
- App794 zero records currently returns a NOT_FOUND-shaped bundle instead of required `MBO_NOT_FOUND` fail-closed error.
- App795 zero/duplicate is not rejected.
- App796 zero/duplicate is not rejected.
- App796 query can return multiple published profiles and code currently takes `[0]` instead of proving the exact expected profile.
- App795 appraiser fields currently contain hard-coded fallbacks such as `m01` / `g01`.
- authoritative topology/count values must come from evidence; do not invent defaults for production evidence.

Required minimum fix:
- App794 0 => `MBO_NOT_FOUND`; >1 => `MBO_AMBIGUOUS`.
- App795 0 => fail closed; >1 => fail closed.
- App796 0 => `SCORING_CONFIG_NOT_FOUND`; >1 => `SCORING_CONFIG_AMBIGUOUS`.
- Select/query App796 by the expected profile resolved from verified App53 position + requested FY + `PUBLISHED`.
- Remove all fabricated production appraiser/topology/count fallbacks.
- Required App795 slots must be real evidence only.

### B2 — App796 FY and PUBLISHED evidence are mandatory in repair safety

File: `src/admin/admin-diagnostic-model.js`

Current unsafe logic allows missing FY/status:

```js
const fyMatch = !authFy || !context.fiscalYear || authFy === context.fiscalYear;
const statusMatch = !authStatus || authStatus === 'PUBLISHED';
```

Required minimum fix:
- missing FY => NOT PROVEN
- missing status => NOT PROVEN
- FY must exactly equal requested FY
- status must exactly equal `PUBLISHED`
- missing/wrong code/PartA/PartB/FY/status must never produce repair-safe evidence

### B3 — `buildRecordDiagnostic()` must use topology-aware ordinal mapping

File: `src/admin/admin-diagnostic-model.js`

Current code still maps fixed fields:
- appraiser1 from `First_Manager_User`
- appraiser2 from `GM_User`

This is wrong for `M1_G1` and `M1_ONLY`.

Required minimum fix:
- reuse existing `normalizeAppraiserSlots()`
- M1_G1 => 1st Manager, 2nd GM
- M1_M2_G1 => 1st First Manager, 2nd Manager, 3rd GM
- M1_ONLY => 1st executive direct destination

Do not add new routing architecture.

### B4 — Routing_Key repair must require explicit physical-storage evidence

Files: `src/admin/admin-support-center.js`, `src/admin/admin-diagnostic-model.js`

Current provider supplies derived `rKey` as `actualRoutingKey`, and repair logic treats any non-`NOT_AVAILABLE` value as if App794 physically stores Routing_Key.

Required minimum fix:
- keep derived expected routing key separate from stored App794 routing key.
- only include `Routing_Key` in repair diff when an explicit flag/evidence proves the physical App794 field exists and the stored value was actually read.
- otherwise `storedRoutingKey = NOT_AVAILABLE` and Routing_Key must not appear in exact repair diff.

### B5 — Build metadata row must not say PASS when commit is NOT_EVIDENCED

File: `src/admin/admin-diagnostic-model.js`

Current row contains `Commit: NOT_EVIDENCED` but its status is hard-coded `PASS`.

Required minimum fix:
- when commit SHA is `NOT_EVIDENCED`, bundle/build evidence row status must be `NOT_EVIDENCED`, not PASS.

## 2. MINIMUM REQUIRED TESTS

Only add/adjust tests needed to prove the blockers above:

1. App794 missing => `MBO_NOT_FOUND`.
2. App795 missing + duplicate => fail closed.
3. App796 missing + duplicate => fail closed.
4. Production provider never uses `m01/g01` or invented topology/count fallback.
5. App796 missing FY => repair unsafe.
6. App796 missing status => repair unsafe.
7. App796 wrong FY/non-PUBLISHED => repair unsafe.
8. `buildRecordDiagnostic()` M1_G1 mapping is correct.
9. `buildRecordDiagnostic()` M1_ONLY mapping is correct.
10. derived Routing_Key without physical storage evidence is absent from repair diff.
11. `BUILD_VERSION_INFO.commitSha = NOT_EVIDENCED` cannot render build evidence status PASS.

Do not expand test scope beyond what is needed for these blockers unless an existing test must be updated to remain correct.

## 3. VERIFICATION

Run only the necessary verification plus full regression:

```bash
npm test -- tests/admin-support-center.test.js
npm test
npm run build
git diff --check
git status --short
```

If an existing source/dist parity command already exists, run it. Do not invent a new parity framework.

## 4. DELIVERY

Commit only the minimum corrective changes.
Report:
- exact commit SHA
- files changed
- B1..B5 result
- targeted test result
- full npm test result
- build result
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D7_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT edit Confirmed Baseline.
Do NOT change Kintone.
Do NOT deploy.
Do NOT mark D6 PASS.
Do NOT self-certify D7 PASS.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = BLOCKED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = MUST_FIX / THIS TASK
