# AI ACTIVE TASK — D1 EMPLOYEE-SELF INDEX SHELL / LOGOUT UX CORRECTIVE

Mode: **SOURCE / BUILD / TEST / LOCAL PREVIEW ONLY — ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Read only
1. `project-docs/AI_CONTROL_CENTER.md`
2. this file
3. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. relevant index/auth-host sections of:
   - `src/main-mbo-app.js`
   - `src/ui/mbo-kintone-login-gate.js`
   - `src/ui/host-resolver.js`
6. focused UI/auth tests only

Do not scan repo.

## Fix only this UX defect

User live evidence: My MBO index shows no visible Logout and looks fragmented/raw.

Required result:

1. **Stable one-shell index host**
   - resolve `kintone.app.getHeaderSpaceElement()` first for index Employee-Self UI;
   - auth controls + My MBO content must render into the same stable custom shell;
   - do not mount persistent auth controls directly into `.gaia-app-wrapper`.

2. **Visible bilingual auth toolbar**
   - `รหัสพนักงาน / Employee Code: <code>`
   - `เปลี่ยนรหัสผ่าน / Change Password`
   - `ออกจากระบบ / Logout`
   - Logout must call the existing session revoke/clear/reload path; do not change auth semantics.

3. **Clean bilingual My MBO index**
   - title: `MBO ของฉัน / My MBO`
   - primary action: `+ สร้าง MBO ใหม่ / Create New MBO`
   - empty state bilingual; do not show debug-style `My MBO Records (0113)` as the main heading;
   - coherent card/shell spacing, readable desktop width, no giant raw white block feeling;
   - preserve Kintone global header/breadcrumb/comment functionality.

4. **Architecture**
   - keep `main-mbo-app.js` orchestration-only;
   - if UI rendering grows, create/use one cohesive `employee-self-index-ui.js` module rather than adding a large renderer to main;
   - no business/routing/scoring/session logic duplication.

## Tests
Must prove without live Kintone:
- index auth bar mounts in stable header-space shell;
- exactly one auth bar;
- Employee Code + Change Password + Logout visible;
- Logout button uses existing gate logout path;
- My MBO title/create/empty state bilingual;
- no login/session/routing/scoring behavior change.

Run:
```text
npm run ui:build
npm test
```

## Forbidden
- NO Kintone write/upload/deploy
- NO App794 deploy
- NO App801 write
- NO deploy-guard fix
- NO Create-handler rework
- NO employee/routing/scoring semantics change
- NO broad refactor
- NO D2-D7

Commit + push one concise commit, then STOP.
Do not Self-PASS.
