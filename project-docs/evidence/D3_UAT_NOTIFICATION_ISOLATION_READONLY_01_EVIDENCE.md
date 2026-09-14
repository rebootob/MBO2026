# D3 UAT Notification Isolation Read-Only 01 — Evidence

**Package:** D3-UAT-NOTIFICATION-ISOLATION-READONLY-01
**Authorization ID:** MBO2026-D3-UAT-NOTIFICATION-ISOLATION-RO01-20260914-OWNER-01
**Date:** 2026-09-14 ICT
**Mode:** EXACT APP 794 LIVE CONFIG READ-ONLY + COMBINED UAT PROPOSAL
**Executed by:** Antigravity (bounded execution plane)

---

## 1. Execution accounting

```text
AUTHORIZATION_ID = MBO2026-D3-UAT-NOTIFICATION-ISOLATION-RO01-20260914-OWNER-01
AUTHORIZED_BASE_HEAD = a383aa3c0a188dabebf91f773e63f03568062674 (MATCH)
BASE_PARENT = b98084cec68fa64130b55784c5c77304a1df7cc3
BASE_TREE = e560126e72af8a4d346f71ea445a0df157962c95
HOST = ttmet.cybozu.com
APP = 794

EXPLICIT_REST_GET_ATTEMPTS = 4 (CEILING: 4 max; ENFORCED)
  Attempt 1: GET /k/v1/app/status.json?app=794           → HTTP 200
  Attempt 2: GET /k/v1/app/notifications/general.json?app=794   → HTTP 200
  Attempt 3: GET /k/v1/app/notifications/perRecord.json?app=794 → HTTP 200
  Attempt 4: GET /k/v1/app/notifications/reminder.json?app=794  → HTTP 200

READ_RETRIES = 0 (CEILING: 0 max; ENFORCED)
AUXILIARY_LIVE_READS = 0

RECORD_READS = 0 (FORBIDDEN / ENFORCED)
KINTONE_WRITES = 0
PROCESS_TRANSITIONS = 0
SCHEMA_CHANGES = 0
ACL_CHANGES = 0
BROWSER_UAT = 0
WORKFLOW_TESTING = 0 (FORBIDDEN)
TOTAL_MUTATIONS = 0
ZERO_WRITE_FAIL_CLOSED = ENFORCED

GITIGNORE_MODIFICATION = 1 (added scratch_*_RAW_LOCAL_ONLY.json exclusion to prevent raw secret-bearing JSON from ever being committed)

RAW_JSON_LOCAL_ONLY = scratch_d3_uat_notif_iso_ro01_RAW_LOCAL_ONLY.json
  Location: project-docs/evidence/ (LOCAL, GITIGNORED, NOT COMMITTED)
  Contains: full API responses with field codes; no API keys/tokens/passwords
```

---

## 2. Live configuration evidence — App 794 (revision 74)

All four endpoints returned revision 74, consistent with the deployed live revision recorded in D3-SBX-DEPLOY-01-EXE2-R5.

### 2.1 Process Management — states and assignees

**Source:** `GET /k/v1/app/status.json?app=794` → HTTP 200, revision 74
**Total states:** 19 | **Total actions:** 40

| Index | State name | Assignee type | Assignee entities (FIELD_ENTITY codes) |
|---|---|---|---|
| 0 | 01 Draft Objective | ONE | *(none — open/initiator)* |
| 1 | 02 First Manager Objective Review | ALL | `Manager_Level2_Approvers` |
| 2 | 03 Manager Objective Review | ALL | `Manager_Level1_Approvers` |
| 3 | 04 GM Objective Review | ALL | `GM_Level1_Approvers` |
| 4 | 04B GM Level 2 Objective Review | ALL | `GM_Level2_Approvers` |
| 5 | 05 Objective Approved | ONE | `Requester_User` |
| 6 | 06 Employee Mid-Year | ONE | `Requester_User` |
| 7 | 07 First Manager Mid-Year Review | ALL | `Manager_Level2_Approvers` |
| 8 | 08 Manager Mid-Year Review | ALL | `Manager_Level1_Approvers` |
| 9 | 09 GM Mid-Year Review | ALL | `GM_Level1_Approvers` |
| 10 | 09B GM Level 2 Mid-Year Review | ALL | `GM_Level2_Approvers` |
| 11 | 10 Mid-Year Completed | ONE | `Requester_User` |
| 12 | 11 Employee Self Evaluation | ONE | `Requester_User` |
| 13 | 12 First Manager Final Evaluation | ALL | `Manager_Level2_Approvers` |
| 14 | 13 Manager Final Evaluation | ALL | `Manager_Level1_Approvers` |
| 15 | 14 GM Final Evaluation | ALL | `GM_Level1_Approvers` |
| 16 | 14B GM Level 2 Final Evaluation | ALL | `GM_Level2_Approvers` |
| 17 | 15 HR Final Check | ONE | `USER: hr` (literal user code) |
| 18 | 16 Completed | ONE | *(none — terminal)* |

**Process baseline cross-check:** Prior control documents recorded `APP794_PROCESS_BASELINE = PASS / 16 STATES / 31 ACTIONS` for the pre-D3-deploy baseline (revision pre-74). The current live process has 19 states and 40 actions at revision 74, consistent with the 19/40 deployment confirmed in D3-SBX-DEPLOY-01-EXE1-R2.

**Key observation — Assignee selector mechanism:** All non-terminal approver states use `FIELD_ENTITY` references (dynamic fields on the record itself: `Manager_Level1_Approvers`, `Manager_Level2_Approvers`, `GM_Level1_Approvers`, `GM_Level2_Approvers`, `Requester_User`). The single exception is state **15 HR Final Check**, which uses a literal `USER` entity with a specific user code.

This means that when a workflow transition occurs:
- All states except 15 and 18 resolve approvers at runtime from the record's field values.
- State 17 (HR Final Check) resolves to a specific fixed user code, not a field reference.

### 2.2 General Notifications

**Source:** `GET /k/v1/app/notifications/general.json?app=794` → HTTP 200, revision 74

| Entity type | Entity code | Record added | Record edited | Comment added | Status changed | File imported |
|---|---|---|---|---|---|---|
| FIELD_ENTITY | `Updated_by` | `false` | `false` | **`true`** | `false` | `false` |
| FIELD_ENTITY | `Created_by` | `false` | `false` | **`true`** | `false` | `false` |
| FIELD_ENTITY | `Assignee` | `false` | `false` | `false` | **`true`** | `false` |

Additional setting: `notifyToCommenter: true`

**Notification trigger summary:**
- **Comment added** → `Updated_by` field user + `Created_by` field user + all commenters (via `notifyToCommenter`) receive Kintone in-app notifications.
- **Status changed** (= workflow transition) → `Assignee` field user(s) receive Kintone in-app notifications.
- Record creation, editing, and file import do NOT trigger any general notifications.

### 2.3 Per-Record Notifications

**Source:** `GET /k/v1/app/notifications/perRecord.json?app=794` → HTTP 200, revision 74

```
notifications: [] (EMPTY — no per-record notification conditions configured)
```

**Finding:** No per-record notifications are configured. This endpoint is not a source of notification risk.

### 2.4 Reminder Notifications

**Source:** `GET /k/v1/app/notifications/reminder.json?app=794` → HTTP 200, revision 74

```
notifications: [] (EMPTY — no reminder notifications configured)
timezone: null
```

**Finding:** No reminder notifications are configured. This endpoint is not a source of notification risk.

### 2.5 Custom JavaScript notification analysis

Source inspection was limited to the single necessary file to understand notification-trigger behavior. The deployed custom JS (`main-mbo-app.js`) uses `kintone.showNotification()` in **one location only** (around line 1234), used exclusively for in-page UI toast/error messages on form validation failure. This is a **client-side UI display function only**; it does not send email or Kintone system notifications to approvers. There are **zero references** to email dispatch, webhook calls, or server-side notification APIs in the source.

---

## 3. Notification trigger analysis

### 3.1 Conditions that trigger notifications to real persons

Based on the live configuration, the following actions will produce Kintone in-app notifications:

| Trigger | Affected entity | Recipient resolution | UAT risk |
|---|---|---|---|
| **Workflow status change** | `Assignee` (FIELD_ENTITY) | Whoever is in the `Assignee` field on the record at the time of transition | **HIGH** — any workflow transition notifies the next-state assignee |
| **Comment posted** | `Updated_by`, `Created_by` | Whoever last updated and created the record + all commenters | **MEDIUM** — comment on a real record notifies real users |
| `notifyToCommenter` | All prior commenters | All who have previously commented on the record | **MEDIUM** — cumulative per comment history |

### 3.2 What does NOT trigger notifications

- Record read (GET) — zero notification risk.
- No per-record notifications → no condition-based alerts.
- No reminder notifications → no scheduled alerts.
- File imports → not configured.
- Record edits (save without status change) → not configured.
- In-page JS toast alerts (`kintone.showNotification`) → UI only, no server notification.

### 3.3 Critical finding — process transition is the primary risk

**The `Assignee` field is FIELD_ENTITY-resolved.** When a workflow transition occurs, the platform:
1. Advances the status;
2. Resolves the new state's assignee from the corresponding field(s) on the record;
3. Sends a `statusChanged` notification to whoever is in that field.

This means notification isolation cannot be achieved by renaming the record or using a fictitious test name alone. The notification goes to whoever is in the actual user fields (e.g., `Manager_Level1_Approvers`, `Manager_Level2_Approvers`). **Changing those field values to a safe test user is required AND any workflow transition must be authorized.**

**However, per the package authorization: WORKFLOW TESTING IS NOT AUTHORIZED. DO NOT EXECUTE WORKFLOW TRANSITIONS.**

Therefore: any test that performs a workflow transition will notify real users unless the record's approver fields are replaced with a single safe test account AND transitions are separately authorized.

---

## 4. Combined Objective UAT proposal — notification isolation analysis

### 4.1 UAT objectives (carried from D3-SBX-UAT-04 context)

Based on the current UAT scope from D3-SBX-UAT-04 series:
- **Case 01:** Verify record field persistence and baseline identity at the current stage.
- **Case 02:** Verify process topology rendering, route card display, and assignee UI.
- **Case 03:** Verify provenance field persistence and runtime query suppression (Decision 008 compliance).
- **Case 04:** Verify date simulation banner, zero JS errors.

### 4.2 Notification risk by UAT case

| UAT Case | Requires workflow transition? | Notification risk from live config | Mitigation needed |
|---|---|---|---|
| Case 01 (field baseline) | NO — read/view only | LOW — no transition, no comment | None for read-only. Comment added to record creates notification risk. |
| Case 02 (topology UI) | NO — view only | LOW — viewing assignee card does not trigger notification | None for view-only. |
| Case 03 (provenance / Decision 008) | NO — read/view only | LOW | None for read-only. |
| Case 04 (date simulation, JS errors) | NO — view only | LOW | None for read-only. |

### 4.3 Current isolation status for read-only UAT

For the **already-executed read-only UAT cases (01–04 as scoped in D3-SBX-UAT-04-R1)**:
- All four cases were executed as read-only browser navigation with no workflow transitions.
- Per the live config: no notification is triggered by reading, viewing a record, or inspecting the UI without transitioning status.
- **Conclusion for read-only UAT: notification risk is effectively ZERO for Cases 01–04 as executed in D3-SBX-UAT-04-R1 (view/read-only, no workflow transitions, no comment posting).**

The prior UAT limitation was not a notification isolation failure; it was an unverified business-scenario coverage gap (workflow transitions were not tested, which is correct behavior per the package authorization).

### 4.4 Smallest isolation method for a combined Objective UAT including workflow transitions (FUTURE GATE ONLY)

> **This section describes a proposal only. Workflow transition UAT is NOT authorized by this package.**

If the Owner authorizes a future UAT package that includes workflow transitions, the smallest isolation method using the existing system is:

**Method: Single dedicated test record with safe-user-only approver fields**

1. **Create a new UAT test record** (requires separate `RECORD_WRITE_AUTHORIZED` authorization) with:
   - `Requester_User` = safe test account (e.g., a dedicated UAT user or `hr` account)
   - `Manager_Level1_Approvers` = safe test account only
   - `Manager_Level2_Approvers` = safe test account only
   - `GM_Level1_Approvers` = safe test account only
   - `GM_Level2_Approvers` = safe test account only
   - All approver slots populated with the same single safe test account (must be an account the Owner controls)

2. **The `hr` user code** (state 15 — HR Final Check) is already a fixed literal. If the Owner controls the `hr` account, full cycle testing is possible. If `hr` maps to a real staff member, the UAT must stop at state 14 or the `hr` literal must be temporarily changed (requires ACL/process write authorization).

3. **No global notification suppression** is needed or appropriate; isolation is achieved entirely at the record level by ensuring all FIELD_ENTITY slots resolve to the safe test account.

4. **Posting comments** during UAT should be avoided unless the `Created_by` / `Updated_by` / commenter fields also resolve to the safe test account only. This is achievable if all UAT actions are performed from the same safe test account session.

### 4.5 Isolation verification gaps (unknowns)

| Unknown | Impact |
|---|---|
| Identity of the user code behind `hr` (state 15) | If `hr` is a real staff member, transitions to/past state 15 will notify that person. Cannot be proven safe without knowing `hr` identity — which is out of scope for this package (no record or user reads authorized). |
| Whether the safe test account to be used for UAT is under Owner exclusive control | Must be confirmed by Owner before authorizing workflow transition UAT. |
| Whether the record to be tested (to be Owner-selected, not auto-selected) is currently at state 01 (Draft) | The test record must start from a state the Owner controls. No record selected by this package. |
| Whether `notifyToCommenter` history on any selected record includes real users as prior commenters | Prior comments on an existing record may notify real users if a new comment is posted during UAT. A newly created UAT record has zero comment history, eliminating this risk. |

---

## 5. Isolation verdict

```text
READ-ONLY UAT (Cases 01–04 as executed in D3-SBX-UAT-04-R1, no transitions, no comments):
  NOTIFICATION_ISOLATION = VERIFIED SAFE / NO WORKFLOW TRANSITIONS / NO COMMENTS POSTED
  LIVE_UAT_BLOCKED = NO (for read-only scope)

WORKFLOW TRANSITION UAT (any case requiring status change):
  NOTIFICATION_ISOLATION = NOT VERIFIED
  REQUIRED_PRECONDITIONS = Owner-selected test record; all FIELD_ENTITY approver fields
    set to Owner-controlled safe test account; hr literal identity confirmed; transition
    UAT separately authorized
  LIVE_UAT_BLOCKED = YES (for workflow transition scope) — WORKFLOW TESTING NOT AUTHORIZED
    BY THIS PACKAGE; separate authorization required

GLOBAL_NOTIFICATION_SUPPRESSION = NOT PROPOSED / NOT NEEDED
  (isolation at record level is the minimum sufficient approach)
```

---

## 6. Scope of authorization still required from Owner

Before any workflow-transition UAT can proceed, Owner must explicitly authorize:

1. **Test record selection or creation:** Owner must select or authorize creation of a specific test record with all approver field slots populated exclusively with a single Owner-controlled safe test account (no real employee names or approver codes in any of the five FIELD_ENTITY fields).
2. **`hr` user account identity confirmation:** Owner must confirm whether the `hr` user code (literal assignee for state 15 HR Final Check) is a real staff member or a safe test/admin account. If a real staff member, transitions to state 15 must be excluded from workflow transition UAT scope.
3. **Explicit workflow transition authorization:** A new work package authorization specifically permitting `PROCESS_WRITE_AUTHORIZED = YES` for a bounded set of transitions on the selected test record.
4. **Comment discipline:** Confirmation that no comments will be posted to any record containing real approver users in its FIELD_ENTITY fields.

---

## 7. Terminal state

```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
LIVE_UAT_AUTHORIZED = NO
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
REVIEW_REQUIRED = YES
```

---

## 8. Privacy statement

This document contains:
- Kintone field codes (not personal names).
- Kintone process state names and action names (system-defined labels).
- One user code (`hr`) which is the literal fixed assignee for state 15 as returned by the live API. This is a system/role account code, not a personal name. It is included only as a structural fact about the process configuration.

This document does NOT contain:
- API keys, tokens, or passwords.
- Real employee names or personal identifiers.
- Account-to-person mapping tables.
- Personal file paths.
- Raw API response JSON (raw JSON is local-only, gitignored, not committed).
