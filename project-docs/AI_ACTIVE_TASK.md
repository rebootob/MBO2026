# AI ACTIVE TASK — D1-B BILINGUAL RUNTIME MESSAGE CORRECTIVE ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `0f0ff087a9fcbb4611d5269548f704ea388114d2`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> Mode: ONE UI LOCALIZATION BLOCKER ONLY / MINIMUM FIX
> Kintone read/write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The D1-B visual polish is substantially accepted:
- only `preview/auth-preview.html` changed
- top header/menu/tabs added
- TH/EN switch added
- static translations use a centralized `translations.th` / `translations.en` dictionary
- tab availability follows auth state
- D1-A auth/security core and preview server were NOT changed

One user-visible bilingual blocker remains before visual UAT can be accepted:

Runtime feedback/error messages are still hardcoded in English in several paths, including examples such as:
- `Login Failed ... Authentication denied.`
- `Network/Server Error ...`
- `Password Change Failed ...`
- `Server Error ...`

This means Thai mode is not fully Thai/English-capable for user feedback.

Target implementer result:

`D1B_UI_POLISH_STATUS = READY_FOR_USER_VISUAL_UAT`

Do NOT self-certify D1 PASS.

---

## ONLY REQUIRED FIX — BILINGUAL RUNTIME FEEDBACK

Allowed file only:
- `preview/auth-preview.html`

Do NOT modify:
- `scripts/ui-preview-server.js`
- any `src/services/*` auth/password/identity core
- App801
- Kintone
- D2-D7

### Required minimum behavior

1. Move user-visible runtime feedback strings into the existing translation dictionary or a tiny centralized helper using that dictionary.
2. Thai mode must show Thai-friendly feedback for:
   - login failure
   - network/server failure
   - force password-change failure
   - normal password-change failure
   - logout success/failure
   - access-check allow/block/unauthenticated/error
   - password confirmation mismatch
3. English mode must show equivalent English messages.
4. Internal status/code may remain visible, e.g. `INVALID_CREDENTIALS`, but user-facing explanation/prefix must follow selected language.
5. Unknown backend `reason` values must not force the whole UI message to English in Thai mode. Use a localized safe fallback; technical code/reason can be shown separately if useful.
6. Fix obvious Thai wording/typos in the same UI file only if encountered; do not redesign the page again.
7. Language switching must not reload the page and must not disturb auth/session state.

### Security invariants — MUST remain unchanged

- no `Password_Hash` in browser UI/source/API client rendering
- no raw session token in client JSON/localStorage/sessionStorage
- no browser import of `node:crypto`
- auth decisions remain server-side
- no Kintone read/write/deploy

---

## MINIMUM VERIFICATION

Run only:

```bash
npm run ui:preview
git diff --check
git status --short
```

If the preview server is already running and serves the edited file dynamically, do not kill/restart it unnecessarily. Otherwise start it and leave it running for user UAT.

Manual source-level checks:
- TH button changes static labels and runtime feedback to Thai
- EN button changes static labels and runtime feedback to English
- Login / Force Change / Session / Access Check / UAT Guide tabs still work by state
- existing `/` Status Preview Lab still remains available

Report:
- exact commit SHA
- files changed
- runtime strings centralized YES/NO
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

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B BILINGUAL UI CORRECTIVE THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
