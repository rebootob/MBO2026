# AI ACTIVE TASK — D1 MY MBO HISTORY + EMPLOYEE-SELF NO-DELETE

Mode: **SOURCE / BUILD / TEST / LOCAL PREVIEW ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. `src/ui/employee-self-index-ui.js`
6. relevant App794 event registration in `src/main-mbo-app.js`
7. focused tests only

Do not scan repo.

## Fix only this requirement

### A. My MBO history list
- Keep exact ownership query from authenticated MBO Employee Code only.
- Keep newest Fiscal Year first.
- Show all returned MBO records for that employee.
- Change row action from blanket `ดู / แก้ไข (View / Edit)` to a view/history label such as:
  `ดูย้อนหลัง / View History`
  or `ดูรายละเอียด / View Details`.
- Action opens the owned App794 record detail page.
- No Delete action anywhere in Employee-Self list UI.
- Preserve approved one-shell bilingual visual design.

### B. Employee-Self delete guard
- Employee-Self MBO users must not delete App794 records.
- Add a small dedicated delete-policy/guard module; keep `main-mbo-app.js` orchestration-only.
- Register the supported App794 detail delete-submit event through main orchestration.
- Resolve authenticated MBO principal through the existing login gate/session path; do not duplicate auth logic.
- If the request is Employee-Self, cancel deletion fail-closed with a bilingual user message.
- Missing/invalid MBO principal must also fail closed.
- Do not add any REST/API delete implementation.
- Do not alter technical-admin/HR deletion policy outside this Employee-Self scope.

### C. Tests
Must prove:
- query contains exact authenticated Employee Code and `Fiscal_Year desc`;
- representative multiple-year records render in descending returned order;
- each history action links to the matching owned detail record;
- no Delete control is rendered by Employee-Self list;
- Employee-Self detail delete event is cancelled;
- missing/invalid MBO principal delete is cancelled fail-closed;
- no cross-employee/access/session semantics changed;
- main remains orchestration-only.

Run:
```text
npm run ui:build
npm test
```

Local Preview:
- show representative records for one employee, e.g. FY2026/FY2025/FY2024;
- show the view/history action;
- no Delete action.

## Forbidden
- NO Kintone write/upload/deploy
- NO App794 ACL write
- NO App801 write
- NO deploy-guard fix
- NO Create-handler rework
- NO auth/session/routing/scoring semantics change
- NO broad refactor
- NO D2-D7

Commit + push one concise implementation commit, then STOP.
Do not Self-PASS.
