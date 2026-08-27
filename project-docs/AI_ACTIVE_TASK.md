# AI ACTIVE TASK — D1-B USER MANUAL UAT / RUN PREVIEW ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `2ab45cb2148b8ba102fcbaf14e9dc89867f1db6f`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> D1-B source status: ACCEPTED / READY FOR USER MANUAL UAT
> Mode: RUN PREVIEW + USER UAT ONLY / NO NEW CODE UNLESS A CONCRETE UAT DEFECT IS PROVEN
> Kintone read/write/deploy/schema/process/ACL authorization: NONE

## 0. INDEPENDENT REVIEW RESULT

The final D1-B preview logout blocker is accepted.

Accepted evidence:
- implementation changes only `scripts/ui-preview-server.js`
- `/api/auth/logout` no longer swallows `authService.logout(token)` errors
- revocation failure returns non-2xx `LOGOUT_FAILED` and returns before cookie clearing
- cookie is cleared only after successful server-side revoke
- no D1-A core/UI/App801/Kintone change in this corrective
- existing `MboAuthSessionService.logout()` contract throws on missing revocation capability/failure and returns `LOGGED_OUT` only after deleteSession succeeds

GitHub has no CI/workflow/status evidence for this commit. Therefore browser/manual UAT is still required before D1-B can be closed.

Target now:

`D1B_STATUS = USER_MANUAL_UAT_IN_PROGRESS`

Do NOT self-certify D1 overall PASS.

---

## 1. IMMEDIATE EXECUTION — START PREVIEW FOR USER

Antigravity must run the latest branch from the MBO2026 repository root and LEAVE THE SERVER RUNNING.

Run:

```bash
git branch --show-current
git rev-parse HEAD
npm run ui:preview
```

Required:
- branch = `ai/antigravity-wp002c`
- HEAD includes `2ab45cb2148b8ba102fcbaf14e9dc89867f1db6f`
- do not patch code merely to start the server
- leave terminal/process running
- no Kintone commands
- no deploy

URLs:
- D1-B Login UAT: `http://localhost:3000/auth-preview.html`
- Existing Status Preview: `http://localhost:3000/`

Report only:
- branch
- HEAD
- `UI_PREVIEW_PROCESS = RUNNING` or exact startup error
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`

---

## 2. USER MANUAL UAT — DO NOT AUTOMATE AWAY

The user will manually verify the UI. Do not replace this with self-certification.

Required user-visible checks:

1. Thai UI renders correctly and menu/tabs are understandable.
2. Switch TH -> EN -> TH without page reload or losing auth/session state.
3. Employee 0118 + username `0118` + password `0118` -> FORCE CHANGE PASSWORD.
4. New password = `0118` -> BLOCK.
5. Set new password such as `Pass0118!` -> authenticated Employee 0118.
6. Access Check target `0118` -> ALLOW.
7. Access Check target `0119` -> BLOCK.
8. Logout -> success and return to Login.
9. Old default password `0118` -> FAIL after change.
10. New password -> SUCCESS.
11. `admin-form` attempting employee-self login -> BLOCK.
12. Normal own password change requires current password.
13. Visible runtime feedback follows selected TH/EN language.
14. Existing `/` Status Preview still renders.
15. Browser observation: no `Password_Hash`, no raw session token in client JSON/localStorage/sessionStorage, no browser `node:crypto` error.

If the user reports a concrete defect, create the smallest corrective task for that proven defect only. Otherwise do not modify code.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B USER MANUAL UAT
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
