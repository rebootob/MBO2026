# AI ACTIVE TASK — D1 EMPLOYEE-SELF DELETE GUARD SCOPE CORRECTIVE

Mode: **SOURCE / BUILD / TEST ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
4. `src/security/delete-guard-policy.js`
5. relevant delete registration in `src/main-mbo-app.js`
6. focused tests only

Do not scan repo.

## Fix only one issue

Current policy is globally deny-all because it returns `false` even when there is no authenticated MBO Employee-Self principal.

Required:
- use existing `mboLoginGate.getEmployeeCode()` only;
- if it returns a non-empty authenticated Employee_Code: set bilingual Employee-Self delete-prohibited error and return `false`;
- if there is no authenticated MBO Employee-Self principal: return the original `event` unchanged;
- do not create Admin/HR authorization logic;
- do not add/rename auth APIs;
- keep both supported PC pre-delete events registered:
  - `app.record.detail.delete.submit`
  - `app.record.index.delete.submit`
- preserve My MBO History and Completed display exactly as accepted;
- no REST delete implementation.

## Tests
Must prove:
- production-compatible gate `getEmployeeCode() -> '0113'` blocks delete;
- `getEmployeeCode() -> null` returns original event unchanged, not `false`;
- no dependency on `getAuthenticatedEmployeeCode()`;
- both delete-submit event names remain registered;
- `16 Completed -> Completed`, `Completed -> Completed`, `15 HR Final Check` unchanged;
- history query / links / zero Delete UI unchanged.

Run:
```text
npm run ui:build
npm test
```

## Forbidden
- NO Kintone write/upload/deploy
- NO App794 ACL write
- NO App801 write
- NO deploy-guard fix
- NO auth/session redesign
- NO workflow/routing/scoring change
- NO UI redesign
- NO broad refactor
- NO D2-D7

Commit + push one concise corrective commit, then STOP.
Do not Self-PASS.
