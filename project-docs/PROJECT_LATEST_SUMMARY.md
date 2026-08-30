# MBO2026 — PROJECT LATEST SUMMARY

> Prepared: 2026-08-30 after App794 Rev60 user UAT PASS, HR native reset authority verification, and user confirmation of Hybrid Identity / dual-role Employee + Approver architecture.  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`  
> IMPORTANT: this is a handoff summary, not a replacement for current Git/Live evidence. Always re-fetch HEAD and `AI_CONTROL_CENTER.md` before acting.

---

## 1. Operating Model

```text
ChatGPT     = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = Low-Credit Execution Plane only when real source/local-runtime/Kintone execution is required
Git + accepted Live evidence = operational truth
CONFIRMED_BASELINE/          = durable confirmed truth
00_MASTER_JOBLIST.md         = D1-D7 no-drop authority
AI_CONTROL_CENTER.md         = current accepted status/gate/authorization
AI_ACTIVE_TASK.md            = exact current execution packet only
```

Rules that must never be lost:
- no false PASS;
- executor cannot self-certify independent review;
- no Live Kintone write/deploy without exact explicit authorization;
- never widen or reuse a consumed one-shot authorization;
- protected legacy/source apps remain read-only unless exactly authorized;
- security/privacy/data-truthfulness are release blockers;
- completed/accepted work must not be reimplemented without a proven regression.

---

## 2. Current Accepted Live App794 Baseline

App794 Rev60 is accepted known-good.

```text
LIVE_REVISION          = 60
PREVIEW_REVISION       = 60
DEPLOYED_SOURCE_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
LIVE_SCOPE             = ALL
LIVE_TOPOLOGY          = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY       = 115a08ace32bdf850cb5eebf25b953d1803114d0
LIVE_CSS_IDENTITY      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_READBACK     = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT       = PASS
LIVE_RUNTIME_STATUS    = ACCEPTED KNOWN-GOOD
```

The Rev60 fatal-Create clean-exit corrective is closed. The prior leave-site/unsaved-change popup no longer appears when using the canonical Back recovery action.

Rev57 remains historical prior known-good evidence but is no longer the primary rollback baseline after Rev60 acceptance.

Reusable runtime knowledge is stored in:
`skills/mbo-kintone-ui-runtime-debugging/SKILL.md`

---

## 3. D1-D7 Current Project Status

| ID | Deliverable | Latest Status | Notes |
|---|---|---|---|
| D1 | Hybrid Identity + Password + Employee-Self + Approver access | 🟠 OVERALL IN PROGRESS | Rev60 accepted. Password Reset core exists. HR/admin native reset authority is READY. Hybrid dedicated-vs-shared identity and dual-role behavior are now canonical but still require identity-source audit + implementation/UAT. |
| D2 | Excel + PDF Legacy Format Export | 🟠 IN PROGRESS | Must prove Part A, Part B, combined/N/A justification, PDF format parity and export security. |
| D3 | 8 Legacy PMS Apps -> App794 Migration | 🟠 IN PROGRESS / LIVE WRITE NOT AUTHORIZED | Legacy sources are read-only. Mapping/dry run/reconciliation/backup/exact manifest required before any target write. |
| D4 | App800 HR Control Center End-to-End | 🟠 IN PROGRESS | HR native authority for Reset MBO Password is READY. Production Reset UI source/test/build candidate is the current executor task. |
| D5 | Copy Own Previous MBO | 🟠 IN PROGRESS / future focused task | Carry only approved planning whitelist; fresh target-year routing/identity required. |
| D6 | Integrated E2E / Security / Regression | 🔴 PENDING | Must cover both identity modes and dual-role access before final closure. |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only on a new proven defect. `admin-form` remains technical admin only. |

Project close condition remains:

```text
D1 = PASS
D2 = PASS
D3 = PASS
D4 = PASS
D5 = PASS
D6 = PASS
D7 = PASS
P0_DEFECTS_OPEN = 0
```

---

## 4. D1 Durable Architecture — Hybrid Identity

D1 remains permanently Kintone-only:

```text
External server/service = FORBIDDEN
External auth service   = FORBIDDEN
External database       = FORBIDDEN
Reverse proxy           = FORBIDDEN
Auth Bridge             = CANCELLED / SUPERSEDED
```

Canonical identity model confirmed by the user on 2026-08-30:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone users

Examples confirmed by the user as dual-role people: Natta and Vassana.

Target flow:

```text
native Kintone login
-> exact authoritative Kintone User Code <-> active Employee_Code mapping
-> Employee-Self auto-bind
-> My MBO without secondary MBO password
```

The same user may also have:

```text
My Approval Tasks
-> current Kintone User
-> authoritative current native Workflow assignment
```

One person remains one employee and one own-MBO record per FY. The Employee and Approver roles are contexts, not duplicate identities.

Exact Natta/Vassana Employee_Code mappings and the physical App53 mapping field/source are **not yet proven** and must be established by READ-ONLY App53 audit before implementation. Missing/ambiguous mapping fails closed.

### Shared Kintone users

Existing model remains:

```text
approved shared Kintone principal
-> Employee_Code + App801 MBO password
-> 8-hour same-tab MBO session
-> Employee-Self scope
```

Shared-principal limitation remains explicit:

`DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT`.

### Self-approval

A dual-role user's own record must not become approvable by that same user. Canonical failure:

`SELF_APPROVAL_ROUTE_CONFLICT`.

Do not silently skip an appraiser or auto-approve.

---

## 5. App795 / Dual-Role Interpretation

App795 remains the route master; it is not one row per employee.

Example:

```text
TMG2|Marketing -> natta -> uchida
```

If 20 TMG2 Marketing employees are currently at Natta's review step:
- App795 still has one route row;
- App794 has 20 distinct employee MBO records;
- Natta's `My Approval Tasks` may show 20 pending records while they are actually assigned to Natta;
- records not yet at Natta or already advanced are not pending for Natta.

For a dedicated employee's own MBO, the effective requester actor is that person's dedicated Kintone user after exact mapping. For shared employees, App795 `Requester_User` remains the shared-requester fallback.

---

## 6. HR Password Reset Authority

User created the dedicated static Kintone group:

```text
DISPLAY_NAME = MBO HR Administrators
GROUP_CODE   = HR_ADMIN_GROUP
```

User runtime console readback confirmed:

```text
App800 HR_ADMIN_GROUP:
View = YES
Add/Edit/Delete/Manage/Import/Export = NO

App801 HR_ADMIN_GROUP:
View = YES
Edit = YES
Add/Delete/Manage/Import/Export = NO

PASSWORD_RESET_NATIVE_AUTHORITY_READY = true
```

`admin-form` is also ready as Technical Admin/recovery.

Reset MBO Password is an App801 MBO credential function. It must **not** be presented as a Kintone/cybozu account password reset.

---

## 7. Protected Data / Authorization State

Protected/read-only by default:
- App53 Employee Master/source data;
- legacy PMS Apps `283, 310, 305, 643, 307, 640, 715, 716`.

No Hybrid Identity baseline update authorizes an App53 schema/record write, App794 deploy, routing write, or ACL change.

Current authorization is always taken from `AI_CONTROL_CENTER.md`; do not reuse historical one-shot authorizations.

---

## 8. Accepted Work That Must Not Be Reopened Without Regression Evidence

- App794 Rev60 fatal-Create clean-exit known-good baseline.
- My MBO accepted own-record presentation/history/no-delete behavior, subject to Hybrid Identity adaptation before D1 closure.
- Native Comment Mirror truthfulness / Comment GET pagination contract.
- CSS parser/scope corrective + runtime skill.
- Atomic JS+CSS release governance.
- D7 Admin Support Center accepted source functionality.
- D1 KINTONE-ONLY architecture / Auth Bridge cancellation.
- HR/admin native Reset MBO Password authority readiness.
- Confirmed Hybrid Identity / dual-role architecture promoted to Baseline.

---

## 9. Canonical Documents for Continuation

Start with:
1. `project-docs/AI_START_HERE.md`
2. `project-docs/AI_CONTROL_CENTER.md`
3. `project-docs/AI_DOCUMENT_INDEX.md`
4. `project-docs/CONFIRMED_BASELINE/README.md`
5. `project-docs/AI_ACTIVE_TASK.md`
6. `project-docs/00_MASTER_JOBLIST.md` when D1-D7 completeness detail is needed
7. `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` for a new ChatGPT conversation
8. this file for a human-readable checkpoint

For Hybrid Identity work, mandatory relevant Baselines are:
- `D1_AUTH_SECURITY.md`
- `D1_SESSION_CONTINUITY.md`
- `D1_EMPLOYEE_SELF_MY_MBO.md`
- `EMPLOYEE_MASTER_ROUTING.md`
- `ROUTING_WORKFLOW.md`
- `UI_UX.md`

---

## 10. Current Gate / Planned Sequence

At this summary checkpoint:

```text
CURRENT_EXECUTOR_TASK = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1
MODE                  = SOURCE / TEST / LOCAL BUILD ONLY
LIVE_WRITE            = NONE AUTHORIZED
DEPLOY                 = NONE AUTHORIZED
```

The confirmed Hybrid Identity architecture is **not** permission for Antigravity to widen the current Password Reset UI task.

After the current Reset UI source task is independently reviewed/closed, the next Hybrid Identity Control Plane gate should begin with:

```text
READ-ONLY APP53 IDENTITY MAPPING AUDIT
Examples: Natta + Vassana
Goal: prove exact Kintone User Code <-> active Employee_Code source and own routing context
```

Only after that evidence is reviewed should source implementation of Hybrid Identity / My Approval Tasks begin.

---

## 11. User Shorthand

- `review` -> re-fetch HEAD, independently review exact latest evidence against current Active Task + relevant Baseline; decide PASS/CORRECTIVE/BLOCKED.
- `ต่อ` / `ต่อไป` -> re-fetch HEAD + Control Center, check duplicate/pending work, choose smallest safe next action; use Antigravity only for necessary execution.
- `อนุมัติ ...` -> record exact authorization boundary; never silently widen or reuse a consumed authorization.
