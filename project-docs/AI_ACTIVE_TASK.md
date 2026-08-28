# AI ACTIVE TASK — D1 CREATE-HANDLER FINAL CORRECTIVE

Mode: **SOURCE / BUILD / TEST ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `src/main-mbo-app.js`
4. `tests/create-handler-form-state.test.js`
5. `scripts/kintone/build-mbo-ui.js`

Do not scan repo. Do not touch `employee-part-a-ui.js`.

## Fix only these 4 points

1. **Keep the accepted create-handler lifecycle flag**
   - authenticated `app.record.create.show` autoload uses `event.record` only;
   - during awaited initial autoload: `kintone.app.record.get/set = 0 calls`;
   - after handler finishes, normal interactive sync must still work.

2. **Revert unrelated behavior change**
   - restore `Department_Hoshin` and `Section_Hoshin` in the original `fieldsToClear` list;
   - do not change routing/scoring/snapshot/Fiscal Year/business semantics.

3. **Do not fabricate missing Kintone fields**
   - remove new `record[field] = { value: ... }` behavior introduced by commit `7ec027d...`;
   - mutate only fields already present in `event.record`;
   - if a field required for the authenticated create snapshot is missing, fail closed with a stable error; do not invent the field object.

4. **Make tests non-skippable**
   - remove conditional proof patterns such as `if (activeUi) ...`;
   - success path MUST prove `isEmployeeVerified = true`;
   - failure path MUST prove `isEmployeeVerified = false`;
   - post-handler path MUST prove `kintone.app.record.set()` is reached after lifecycle flag clears;
   - success/failure initial autoload MUST prove record.get = 0 and record.set = 0.
   - use a minimal test hook/boundary only if necessary; no business refactor.

## Required run
```text
npm run ui:build
npm test
```

## Forbidden
- NO Kintone write/upload/deploy
- NO App794 deploy
- NO App801 write
- NO deploy-guard fix
- NO CSS change
- NO business/UI refactor
- NO D2-D7

Expected files only:
```text
src/main-mbo-app.js
tests/create-handler-form-state.test.js
dist/mbo-employee-app.js   # generated only
```

Commit + push one concise corrective commit, then STOP.
Do not Self-PASS.
