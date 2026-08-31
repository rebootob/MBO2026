# MBO2026 — TEST & UAT STATUS

> Updated: 2026-08-31 ICT.  
> Records accepted checkpoints only; do not invent unpersisted executor counts.

## 1. Latest accepted broad source checkpoint

Hybrid Employee-Self Runtime Entry milestone:

```text
npm run ui:build = PASS
npm test = PASS (1024/1024)
git diff --check = PASS
FINAL_WORKTREE_CLEAN = YES
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

This remains the latest accepted full-regression count for that source milestone. It does not mean all later Live configuration/UAT/privacy gates are closed.

## 2. Approval authority foundation — PASS

Accepted Approval Authority Service R1 commit:
`5ac5ede6e40a1462f0398ba8740330742041e3bf`.

Accepted contract includes:
- Dedicated-only public approval authority;
- exact/case-sensitive current `STATUS_ASSIGNEE` code check;
- list query `Assignee in (LOGINUSER())`;
- fresh `getRecord(appId,id)` revalidation for record/action authority;
- no App795/static snapshot fallback;
- SHARED approver denial.

## 3. App53 identity UAT — PASS

```text
APP53_TOTAL_RECORDS = 281
DEDICATED_TARGET_RECORDS_VERIFIED = 24
MBO_Kintone_User_NONEMPTY_RECORDS = 24
UNEXPECTED_NONEMPTY_RECORDS = 0
papatchaya -> App53 #426 -> Employee Code 0113
```

## 4. App794 workflow/config UAT — PASS for corrected points

```text
TWO_BUTTON_FIX_01 = PASS
TWO_BUTTON_FIX_06 = PASS
TWO_BUTTON_FIX_11 = PASS
GM_User_REQUIRED_FALSE = PASS
MBO_DEDICATED_ACCESS_APP_PERMISSION = PASS
APP794_PROCESS = 16 states / 31 actions
APP794_LIVE_REVISION = 67
```

## 5. Dedicated Employee-Self / native workflow — PASS

Canonical Record #12:

```text
RECORD_ID = 12
EMPLOYEE_CODE = 0113
REQUESTER_USER = papatchaya
MANAGER_USER = pattama
GM_USER = BLANK
ROUTING_TOPOLOGY = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Interactive Pattama-login remains credential-limited and non-blocking; do not reset another person's native Kintone password solely for UAT.

## 6. App794 ACL / privacy / HR — PASS for accepted evidence

```text
papatchaya status01 = view=true edit=true delete=false
papatchaya status03 = view=true edit=false delete=false
hr status03 = view=true edit=false delete=false
HR_NON_EMPLOYEE_RUNTIME_MODE = PASS
```

Foreign-record negative UAT used temporary Record #13:

```text
Direct GET as papatchaya = DENIED / 403 / CB_NO02
Record_Key query = 0
ACL = view=false edit=false delete=false
Direct URL = DENIED / CB_NO02
Cleanup delete = PASS
Post-delete match count = 0
FOREIGN_RECORD_NEGATIVE_RUNTIME = PASS
```

Live structural review:

```text
STALE_PRIOR_APPROVER_STRUCTURAL = PASS
HR_STATUS15_STRUCTURAL = PASS
```

## 7. Shared Employee-Self / App801 Session Runtime — PASS

Controlled UAT:

```text
Shared Kintone principal = tmh
Employee_Code = 0130
App53 #414 = Active / no dedicated MBO_Kintone_User mapping
App801 #107
```

Explicit one-shot password reset:

```text
Credential_Version 4 -> 5
Force_Password_Change = YES
Failed_Attempts = 0
Session_* cleared
RESET_PASS = true
```

Explicit one-shot first-login UAT:

```text
Login = PASS
Force Password Change = PASS
Credential_Version 5 -> 6
Force_Password_Change = NO
Session_Token_Hash present = true
Session_Credential_Version = 6
Session_Kintone_User = tmh
Local sessionStorage token present = true
Employee-Self = 0130
Same-tab reload restore = PASS
Independent new tab without token -> MBO Login = PASS
Logout = PASS
```

Final logout readback:

```text
Session_Token_Hash = blank
Session_Issued_At = blank
Session_Expires_At = blank
Session_Credential_Version = blank
Session_Kintone_User = blank
LOCAL_SESSION_TOKEN_PRESENT = false
LOGIN_OVERLAY_VISIBLE = true
Credential_Version = 6
Force_Password_Change = NO
Failed_Attempts = 0
D1_SHARED_SESSION_RUNTIME = PASS
```

All 0130 password-reset / Shared First-Login authorizations are consumed.

Accepted platform limitation remains:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE PRINCIPAL
```

## 8. Existing source/integration evidence reusable for final closure

### Dual-role source/integration — PASS

`employee-main-mbo-app-integration.test.js` proves:
- Dedicated Index preserves `My MBO` while separately showing authoritative `My Approval Tasks`;
- approval task query uses current `Assignee in (LOGINUSER())`;
- mismatched current assignee task is excluded;
- approval-home authority path performs zero App795 queries;
- SHARED mode renders no approval task section and performs zero approval queries.

`d1-hybrid-identity-core-source.test.js` proves own-MBO self-appraiser elision and preserves subordinate routing for the same dual-role actor.

### Comments/history/attachments source/integration — PASS

`timeline-truthfulness-and-attachment.test.js` proves:
- Live mode with no authoritative timeline events renders zero events and no fabricated actors/actions/comments;
- Live mode renders only supplied authoritative events;
- Live attachment display uses exact real saved filenames and ignores preview fixtures;
- retained saved files are preserved while explicit removal produces exact desired-state plans.

`employee-comment-mirror.test.js` proves:
- Create screen has no comment mirror and performs zero comment GET;
- Detail/Edit mirror reads native Kintone record comments;
- refresh re-fetches the native comment thread;
- normal UI does not fabricate comments.

## 9. Remaining D1 final test gates

Not yet closed:

```text
COMMENTS_HISTORY_ATTACHMENTS_RUNTIME = PENDING / GET-ONLY preferred
DEDICATED_SHARED_DUAL_ROLE_INTEGRATED_UAT = PARTIAL / SOURCE PASS, LIVE DISPOSITION PENDING
FINAL_D1_SECURITY_REVIEW = PENDING
```

Exact next test gate:

```text
Use existing App794 Record #12 where possible.
Verify comments/history/attachments truthfulness with GET-only Live evidence.
Do not add comments, upload attachments, edit records, or transition workflow without a new exact authorization.
```

D2–D5 completion-specific tests remain separate. D6 integrated security/regression remains pending.

Always use `AI_CONTROL_CENTER.md` for the current operational gate and never claim project-wide PASS from a subsystem UAT.
