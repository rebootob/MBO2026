# AI ACTIVE TASK — APP794 REV59 USER RUNTIME UAT / FATAL CREATE CLEAN-EXIT

Mode: **USER RUNTIME UAT ONLY — NO ANTIGRAVITY EXECUTION / NO LIVE WRITE / NO DEPLOY / NO ROLLBACK**  
Branch: `ai/antigravity-wp002c`

## 1. Current Status

App794 corrective deployment is technically Live at Revision 59.

```text
LIVE_REVISION                 = 59
LIVE_JS                       = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
LIVE_CSS                      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_DEPLOYMENT_REVIEW   = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT              = PENDING
ACCEPTED_KNOWN_GOOD_REVISION  = 57
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
```

Do not run Antigravity or perform any Kintone write from this task.

## 2. Mandatory UAT — Fatal Duplicate Create Clean Exit

Use an authenticated employee whose current Fiscal Year MBO already exists, so Create reaches the duplicate/fatal terminal state.

Expected terminal state:
- duplicate/fatal message is visible;
- duplicate creation remains blocked;
- exactly one canonical control is visible:
  `← กลับหน้า My MBO / Back to My MBO`;
- native Save is not visible;
- native Cancel is not visible;
- no duplicate/new record is created.

Then click the canonical Back control.

Required PASS result:

```text
BACK_TARGET                    = /k/794/
BACK_TAB                       = SAME TAB
LEAVE_SITE_CONFIRMATION        = MUST NOT APPEAR
UNSAVED_CHANGE_CONFIRMATION    = MUST NOT APPEAR
RECORD_SAVE                    = 0
RECORD_CREATE                  = 0
WORKFLOW_MUTATION              = 0
AUTH_SESSION_MUTATION          = 0
```

The old Rev58 behavior — browser/Kintone message equivalent to `ออกจากเว็บไซต์ไหม / ระบบอาจไม่ได้บันทึกการเปลี่ยนแปลงของคุณ` — is a UAT FAIL if it appears at all.

## 3. Preservation Smoke Check

After the fatal-path check passes, perform a brief preservation check only if convenient:
- normal successful Create should not show the record-level Back control;
- normal Detail/Edit should still show the canonical Back control as before;
- normal Create/Edit unsaved-change protection must remain normal and must not have been globally disabled.

Do not intentionally save test data merely to prove this smoke check.

## 4. Evidence To Return To ChatGPT

Preferred evidence:
- screenshot of the authenticated fatal duplicate Create terminal state before clicking Back;
- screenshot after clicking Back showing `/k/794/` loaded with **no confirmation popup**;
- report whether native Save/Cancel were absent on the terminal fatal screen.

If a popup appears, capture it and report UAT FAIL; do not attempt another deployment or rollback.

## 5. Technical Audit Caveat

The Rev59 technical end-state is exact candidate match, but the historical deployment log did not capture two explicit pre-write procedural facts:
- deployment-time candidate worktree HEAD + clean status;
- deployment-time Rev57 rollback blob verification.

These remain recorded as `NOT_CAPTURED`; current compensating immutable verification passed. Do not rewrite them as historical proof.

## 6. Safety State

```text
LATEST_DEPLOY_AUTH            = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
ANTIGRAVITY                   = DO NOTHING
NEXT_OWNER                    = USER
```

If User Runtime UAT PASS is confirmed, ChatGPT may promote Rev59 to accepted known-good and close this corrective. If UAT fails, return to Control Plane for a new corrective; no automatic rollback or retry is authorized.
