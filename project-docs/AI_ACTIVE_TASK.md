# AI ACTIVE TASK — D1-B FINAL PREVIEW LOGOUT FAIL-CLOSED FIX ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `30cc7636df6f7f9cbc4da63f1b64a470178f7137`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> Mode: ONE PREVIEW SERVER LOGOUT BLOCKER ONLY / MINIMUM FIX
> Kintone read/write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The final bilingual UI commit is accepted:
- only `preview/auth-preview.html` changed
- TH/EN logout success + failure feedback exists
- failed logout response does not switch UI to unauthenticated
- Thai fallback wording is corrected
- no D1-A auth core/App801/Kintone change

However independent review found ONE existing D1-B preview-server blocker:

In `scripts/ui-preview-server.js`, `/api/auth/logout` currently catches and ignores `authService.logout(token)` failure, then clears the cookie and returns `{ status: 'LOGGED_OUT' }` anyway.

That violates the D1-B requirement that logout must truly revoke the server session before reporting success. It can make the UI report successful logout even when server-side revocation failed.

Target result:

`D1B_STATUS = READY_FOR_USER_MANUAL_UAT`

Do NOT self-certify D1 overall PASS.

---

## ONLY REQUIRED FIX

Allowed file only:
- `scripts/ui-preview-server.js`

Do NOT modify:
- `preview/auth-preview.html` (already accepted)
- `src/services/*`
- App801
- Kintone
- D2-D7

### Required behavior for `POST /api/auth/logout`

1. If a session token exists, call existing `authService.logout(token)`.
2. If server-side logout/revocation throws or fails:
   - FAIL CLOSED
   - return non-2xx JSON with a sanitized reason/status
   - do NOT clear the `mbo_session_token` cookie
   - do NOT return `LOGGED_OUT`
3. Only after successful revocation may the endpoint:
   - clear the HttpOnly cookie
   - return HTTP 200 with `{ status: 'LOGGED_OUT' }`
4. If there is no session token at all, an idempotent already-logged-out response is acceptable; do not invent a session.
5. Do not expose stack traces, Password_Hash, credential objects, or raw session token.
6. Do not change `MboAuthSessionService`; its revocation behavior is already accepted.
7. Do not redesign/refactor unrelated preview server code.

### Security invariants

- no Password_Hash in browser/API response
- no raw session token in client JSON/localStorage/sessionStorage
- no browser `node:crypto`
- auth decisions remain server-side
- Kintone reads/writes/deploy = 0

---

## MINIMUM VERIFICATION

Run only:

```bash
npm run ui:preview
git diff --check
git status --short
```

If preview starts successfully, leave it running for user UAT.

Report:
- exact commit SHA
- exact file changed
- swallowed logout error removed YES/NO
- cookie cleared only after successful revoke YES/NO
- non-2xx fail-closed logout response implemented YES/NO
- preview URL
- `BROWSER_VERIFIED = YES/NO`
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = CLOSED`
- `D1B_STATUS = READY_FOR_USER_MANUAL_UAT`
- `D1_OVERALL_STATUS = IN_PROGRESS`

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B FINAL PREVIEW LOGOUT FAIL-CLOSED FIX
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
