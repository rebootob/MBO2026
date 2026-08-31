# CONFIRMED BASELINE — D1 FINAL CLOSURE

> Status: **CONFIRMED / CLOSED / DURABLE**  
> Confirmed: 2026-08-31 ICT  
> Scope: final acceptance state for D1 Hybrid Identity + Password + Employee-Self + Approver Access

## 1. Final disposition

```text
D1_OVERALL = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
PASS_MODE = PASS WITH DOCUMENTED KINTONE-ONLY CEILINGS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
```

This closure is durable project truth. Reopen D1 only for a proven regression or an explicit Owner architecture/change decision.

## 2. Canonical architecture retained

```text
D1 = KINTONE-ONLY
AUTH_BRIDGE = CANCELLED / SUPERSEDED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Dedicated Employee-Self identity:
`native Kintone principal -> exact active App53 MBO_Kintone_User mapping -> canonical emp_text Employee_Code`.

Shared Employee-Self identity:
`approved shared Kintone principal -> App801 MBO credential/session -> exact authenticated Employee_Code`.

Dedicated Approver authority:
`current dedicated Kintone principal -> authoritative current native App794 Assignee`, with fresh revalidation for record/action authority.

Static App795 route membership or App794 snapshot fields do not independently grant approval authority. SHARED approver authority is denied.

## 3. Accepted Live/config evidence

```text
APP53_TOTAL_RECORDS = 281
MBO_Kintone_User = USER_SELECT / optional / LIVE
DEDICATED_MAPPINGS_VERIFIED = 24
UNEXPECTED_NONEMPTY_MAPPINGS = 0
APP794_PROCESS = 16 states / 31 actions
APP794_LIVE_REVISION = 67
```

Canonical Record #12:

```text
Employee_Code = 0113
Requester = papatchaya
Manager = pattama
Assignee = pattama
Status = 03 Manager Objective Review
Routing_Topology = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
DEDICATED_NATIVE_WORKFLOW = PASS
```

## 4. Dedicated privacy / approval / HR closure

```text
DEDICATED_RECORD_ACL_PRIVACY = PASS
FOREIGN_RECORD_NEGATIVE_RUNTIME = PASS
REQUESTER_APPROVER_STAGE_DOWNGRADE = PASS
CURRENT_ASSIGNEE_APPROVAL_AUTHORITY = PASS
STALE_PRIOR_APPROVER_STRUCTURAL = PASS
HR_NON_EMPLOYEE_RUNTIME_MODE = PASS
HR_STATUS15_STRUCTURAL = PASS
SELF_APPROVAL_GUARD = PASS
```

Temporary foreign Record #13 was denied by direct GET/query/ACL/direct URL to the unauthorized Dedicated employee principal, then deleted. No Record #13 remains.

Pattama-specific interactive login was credential-limited; resetting another person's native Kintone password solely for UAT was not required. Approval authority was independently closed using live current-Assignee dual-role evidence plus source/integration fresh-revalidation coverage.

## 5. Shared App801/session closure

Controlled Shared UAT used `tmh` + Employee 0130 / App801 #107.

Accepted runtime:

```text
MBO Login = PASS
Force Password Change = PASS
Credential_Version rotation = PASS
8-hour absolute session issue = PASS
same-tab restore = PASS
independent new tab without token -> MBO Login = PASS
MBO Logout = PASS
server Session_* cleanup = PASS
local sessionStorage token cleanup = PASS
D1_SHARED_SESSION_RUNTIME = PASS
```

Source/integration additionally proves fail-closed handling for expired/tampered tokens, disabled/locked/forced-change state, Credential_Version mismatch, Kintone-principal mismatch, old-session invalidation and Employee-Code context-switch attempts.

## 6. Dual-role closure

One bounded synthetic App794 Record #14 `FY2026-0007` was used to prove live dual-role separation under `papatchaya`:

```text
My MBO = Record #12 / Employee 0113
My Approval Tasks = Record #14 / Employee 0007
Record #14 current Assignee = papatchaya
native current-Assignee query contains #14
Employee-Self context remains 0113
Approver context remains assigned other employee 0007
D1_LIVE_DUAL_ROLE = PASS
```

No Approve/Return was performed. Record #14 was deleted; post-delete `FY2026-0007` count = 0.

## 7. Comments / history / attachments closure

Existing Record #12 proved:

```text
native comments = 0
UI comments = 0
Live timeline = truthful 0 Events Recorded
no fabricated history fixture leak
Objective_Attachment_1 = real saved 2.jpeg
UI exact real filename = visible
no preview/mock attachment leak
COMMENTS_HISTORY_ATTACHMENTS_TRUTHFULNESS = PASS
```

The detailed permanent truthfulness/file-lifecycle rules remain in `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`.

## 8. Accepted Kintone-only ceilings

These limits are part of the D1 PASS and must remain explicit:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE PRINCIPAL
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Browser customization cannot create a privileged server-side boundary that Kintone itself does not provide. Do not claim stronger hard guarantees and do not embed privileged API tokens/credentials as a workaround.

## 9. Supersession rule for older D1 Baselines

Existing D1 Baselines remain authoritative for their durable behavior/security contracts. However, any older sentence whose only purpose was to describe a pre-closure operational state, such as:

```text
MBO_Kintone_User not yet live
D1 remains open
UAT still pending
mapping/config not yet deployed
```

is superseded by this closure baseline and current repository/live evidence.

Do not reinterpret an obsolete pre-live status sentence as a new blocker. Conversely, do not discard the underlying security/behavior requirement merely because D1 is closed.

## 10. Authorization state after closure

D1 closure creates no standing write authority.

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ROLLBACK_AUTH = NONE
```

All bounded D1 write/deploy/reset/session/UAT authorizations used during closure are consumed and must not be reused.
