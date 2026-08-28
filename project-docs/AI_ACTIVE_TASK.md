# AI ACTIVE TASK — D1 EMPLOYEE-SELF INDEX UX FINAL CORRECTIVE

Mode: **SOURCE / TEST / LOCAL PREVIEW ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. current index/auth UI source + focused tests

Do not scan repo.

## Fix only these points

1. Keep the accepted HeaderSpace one-shell design and existing Logout session revoke/clear/reload semantics.

2. Extract the Employee-Self index DOM renderer from `main-mbo-app.js` into one cohesive module:
```text
src/ui/employee-self-index-ui.js
```
`main-mbo-app.js` must only resolve host/data and orchestrate rendering. No business/routing/scoring/session duplication.

3. Exact user-facing index wording:
```text
MBO ของฉัน / My MBO
+ สร้าง MBO ใหม่ / Create New MBO
รหัสพนักงาน / Employee Code: <code>
เปลี่ยนรหัสผ่าน / Change Password
ออกจากระบบ / Logout
```
Empty state/table remain bilingual.

4. Revert the unrelated `build-mbo-ui.js` write-pipeline change from commit `1cc3f9c...` to the previously accepted esbuild `outfile` behavior. Do not redesign bundling.

5. Add focused non-live UI tests that MUST execute and prove:
- HeaderSpace shell is preferred;
- auth bar + My MBO share one shell;
- exactly one auth bar;
- Employee Code / Change Password / Logout visible;
- Logout calls existing gate logout path;
- exact My MBO title + Create + empty state bilingual.

6. Local visual proof: show/capture the Employee-Self index candidate before any deploy. It must look like one coherent card/shell and must not cover Kintone global header/breadcrumb. If native index-only controls still make the page visibly fragmented, hide only those duplicate index controls in the narrowest safe way; do not hide global navigation.

Run:
```text
npm run ui:build
npm test
```

Forbidden:
- NO Kintone write/upload/deploy
- NO App801 write
- NO deploy-guard fix
- NO Create-handler change
- NO auth/session semantics change
- NO routing/scoring/business change
- NO broad refactor
- NO D2-D7

Commit + push one concise commit, then STOP.
Do not Self-PASS.
