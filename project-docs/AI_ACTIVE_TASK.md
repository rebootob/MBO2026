# AI ACTIVE TASK — D7 ADMIN PREVIEW RUNTIME FIX ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `d6bf4173219dfa8bc655f1eb302bd8e2e45845c0`
> Mode: ONE ADMIN UI RUNTIME BLOCKER / MINIMUM FIX ONLY
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The previous `node:crypto` browser blocker is FIXED: normal Input Preview now renders.

Manual smoke test by user shows Technical Admin preview still crashes with:

```text
Uncaught TypeError: this._getActiveAppraiserSlot is not a function
at EmployeePartAUI._renderSupportCenterIfAdmin (employee-part-a-ui.js:2730:33)
```

Repository confirms `_renderSupportCenterIfAdmin()` calls:

```js
activeAppraiserSlot: this._getActiveAppraiserSlot(status),
```

but `EmployeePartAUI` does not currently expose that method in the class source.

Do NOT work on D1-D6. Do NOT refactor unrelated UI. Do NOT change routing architecture. Do NOT touch Kintone.

Target after implementation:

`D7_ADMIN_PREVIEW = READY_FOR_MANUAL_SMOKE_TEST`

Do not self-certify D7 final PASS.

## 1. ONLY REQUIRED FIX

Primary file:
- `src/ui/employee-part-a-ui.js`

Tests only if needed:
- existing relevant UI/admin tests; do not create a new E2E framework.

Required:
1. Fix the missing `_getActiveAppraiserSlot(status)` runtime dependency using the EXISTING canonical workflow/topology rules. Prefer reusing an existing helper/data source if one already exists; otherwise add the smallest private helper in `EmployeePartAUI`.
2. For statuses that are not an appraiser stage, return `null` / no active appraiser rather than inventing a slot.
3. Preserve topology behavior:
   - M1_ONLY = one direct appraiser
   - M1_G1 = Manager then GM
   - M1_M2_G1 = First Manager, Manager, GM
   - do not production-certify unsupported future topology.
4. Inspect ONLY the other helper calls inside `_renderSupportCenterIfAdmin()` (especially `_getStageCurrentActor(status)`) and ensure they actually exist/can execute. Fix another missing helper only if it is proven to be the immediate next runtime error in this same Admin render path.
5. Do not change AdminDiagnosticModel/App796 logic already accepted unless strictly required for compilation.
6. Keep Controlled Repair disabled.
7. No Kintone read/write/deploy.

## 2. ACCEPTANCE CRITERIA

All must be true:
1. `npm run ui:preview` starts.
2. Normal Input Preview still renders.
3. Viewer Role = Technical Admin (`admin-form`) renders Admin Support Center instead of throwing.
4. Browser Console has no app-caused `TypeError` from `_renderSupportCenterIfAdmin()`.
5. No `node:crypto` browser request regression.
6. Existing D7 App796 evidence behavior remains unchanged.
7. Controlled Repair remains disabled.

## 3. MINIMUM VERIFICATION

Run only necessary verification plus regression:

```bash
npm test -- tests/admin-support-center.test.js
npm test
npm run ui:build
npm run ui:preview
git diff --check
git status --short
```

If browser inspection is unavailable, report honestly. Do not claim manual browser PASS.

## 4. DELIVERY

Commit only the minimum runtime fix and report:
- exact commit SHA
- exact files changed
- root cause
- exact helper fix/reuse
- whether any second missing helper in the same Admin path was proven and fixed
- targeted/full tests
- ui:build
- ui:preview startup
- browser actually verified: YES/NO
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D7_ADMIN_PREVIEW = READY_FOR_MANUAL_SMOKE_TEST`

Do NOT mark D7 final PASS.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = BLOCKED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = SOURCE ACCEPTED / MANUAL UI SMOKE BLOCKED BY ADMIN RUNTIME ERROR — THIS TASK
