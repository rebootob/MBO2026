# AI ACTIVE TASK — D1-B FINAL BILINGUAL LOGOUT FEEDBACK FIX ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `111533d5e62f618ac88ad035db759026e4f77db8`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> Mode: ONE UI MESSAGE BLOCKER ONLY / MINIMUM FIX
> Kintone read/write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The bilingual runtime corrective is accepted except for ONE remaining user-visible path.

Accepted:
- only `preview/auth-preview.html` changed
- login failure/network failure localized
- force + normal password-change failure localized
- password mismatch localized
- access-check allow/block/unauthenticated/error localized
- language switching re-renders prior access-check feedback without resetting auth state
- no server/auth core/App801/Kintone change

One final blocker remains from the existing acceptance requirement `logout success/failure`:

`handleLogout()` still handles failure only with:

```js
console.error('Logout error', err);
```

The user receives no visible Thai/English logout-failure message.

Also fix the obvious Thai fallback typo currently equivalent to `ปฏิเสธการสิทธิ์` while touching this same UI file.

Target implementer result:

`D1B_UI_POLISH_STATUS = READY_FOR_USER_VISUAL_UAT`

Do NOT self-certify D1 PASS.

---

## ONLY REQUIRED FIX

Allowed file only:
- `preview/auth-preview.html`

1. Add centralized TH/EN logout-failure feedback key(s) in the existing translation dictionary.
2. In `handleLogout()` catch/failure path, show a visible localized message to the user.
3. Do NOT switch UI to unauthenticated state when logout request itself fails; keep the current authenticated state until a successful logout is confirmed.
4. Fix the Thai fallback wording typo in `translateReason()` to a natural safe Thai fallback, e.g. `การยืนยันตัวตนไม่สำเร็จ`.
5. Do not redesign/refactor anything else.

Do NOT modify:
- `scripts/ui-preview-server.js`
- `src/services/*`
- App801
- Kintone
- D2-D7

Security invariants unchanged:
- no Password_Hash in browser
- no raw session token in client JSON/localStorage/sessionStorage
- no browser `node:crypto`
- auth decisions remain server-side

## MINIMUM VERIFICATION

```bash
npm run ui:preview
git diff --check
git status --short
```

Leave preview running for user UAT if started.

Report:
- exact commit SHA
- exact file changed
- localized logout failure visible YES/NO
- Thai fallback typo fixed YES/NO
- preview URL
- `BROWSER_VERIFIED = YES/NO`
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = CLOSED`
- `D1B_UI_POLISH_STATUS = READY_FOR_USER_VISUAL_UAT`
- `D1_OVERALL_STATUS = IN_PROGRESS`

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B FINAL BILINGUAL LOGOUT FEEDBACK FIX
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
