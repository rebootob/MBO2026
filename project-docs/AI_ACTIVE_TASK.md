# AI ACTIVE TASK — D1 MY MBO DELETE GUARD + COMPLETED DISPLAY CORRECTIVE

Mode: **SOURCE / BUILD / TEST / LOCAL PREVIEW ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
4. `src/ui/employee-self-index-ui.js`
5. `src/security/delete-guard-policy.js`
6. `src/ui/mbo-kintone-login-gate.js` public API only
7. relevant delete registration in `src/main-mbo-app.js`
8. focused tests only

Do not scan repo.

## Fix only these two points

### A. Delete Guard integration
Current defect: `MboKintoneLoginGate` public method is `getEmployeeCode()`, but the new policy looks for `getAuthenticatedEmployeeCode()`.

Required:
- use the real existing gate API `mboLoginGate.getEmployeeCode()`;
- do not add/rename/duplicate auth APIs;
- Employee-Self authenticated principal -> delete submit blocked fail-closed;
- missing/invalid Employee-Self principal -> blocked fail-closed;
- do not make a new Admin/HR authorization policy in this corrective;
- keep policy in `src/security/delete-guard-policy.js` and main orchestration-only;
- no REST delete implementation.

Focused test must use a production-compatible gate object exposing `getEmployeeCode()` and must fail if the code again calls a nonexistent auth method.

### B. My MBO Completed display
Canonical statuses include:
- `15 HR Final Check`
- `16 Completed`

Required display:
- raw `16 Completed` -> display exactly `Completed`;
- raw `Completed` -> display exactly `Completed`;
- raw `15 HR Final Check` -> must NOT display `Completed`;
- no completion inference from year/date/scores;
- display normalization only; do not alter workflow/routing/status storage.

Keep already accepted history behavior unchanged:
- exact Employee_Code query;
- Fiscal_Year desc;
- `ดูย้อนหลัง / View History` links;
- no Delete UI.

## Tests
Add/fix focused tests proving:
- production-compatible `getEmployeeCode()` integration;
- authenticated Employee-Self delete blocked;
- missing principal delete blocked;
- no invented `getAuthenticatedEmployeeCode()` dependency;
- `16 Completed` renders `Completed`;
- `Completed` renders `Completed`;
- `15 HR Final Check` does not render `Completed`;
- accepted history query/links remain unchanged.

Run:
```text
npm run ui:build
npm test
```

Local Preview:
- FY2026 status `15 HR Final Check`;
- FY2025 status `16 Completed` but display `Completed`;
- FY2024 status `Completed` display `Completed`;
- keep View History and no Delete action.

## Forbidden
- NO Kintone write/upload/deploy
- NO App794 ACL write
- NO App801 write
- NO deploy-guard fix
- NO auth/session redesign
- NO workflow/routing/scoring change
- NO broad refactor
- NO D2-D7

Commit + push one concise corrective commit, then STOP.
Do not Self-PASS.
