# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — APP794 EMERGENCY RECOVERY TO KNOWN-GOOD REV51 AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🔴 App794 Live rev53 is BROKEN after failed rollback; user sees native Kintone fields only. **Emergency recovery to exact known-good rev51 bundle is now one-shot AUTHORIZED.** Combined Employee UI remains source+verification PASS but is NOT authorized for deployment in this recovery. HR/admin reset and remaining security UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — blocked behind App794 recovery/UI corrective |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Known-Good App794 Rev51 — Recovery Source of Truth

Accepted rev51 deployment evidence and direct repository readback establish exactly:

```text
KNOWN_GOOD_SOURCE_CANDIDATE = ec6278524a2d5eb53050d0580c340d1b4e866b97
KNOWN_GOOD_LIVE_REVISION    = 51 (historical content identity; recovery will create a newer Kintone revision)
KNOWN_GOOD_SCOPE            = ALL
KNOWN_GOOD_TOPOLOGY         = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
KNOWN_GOOD_JS_BLOB_SHA      = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
KNOWN_GOOD_CSS_BLOB_SHA     = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Recovery material MUST be taken directly from repository commit `ec6278524a2d5eb53050d0580c340d1b4e866b97`:
- `dist/mbo-employee-app.js` blob = `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`
- `dist/mbo-employee.css` blob = `1710d770ae87fb5f910d669dd5a88ea0950e6991`

Do NOT use either failed scratch rollback snapshot as recovery material.

## 3. Failed Partial Deploy / Failed Rollback — Accepted Incident State

Consumed Combined UI deploy authorization:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01` = CONSUMED / CLOSED.

Observed states:
```text
REV52_PARTIAL_JS  = a4975fc219269268bf2a0caffd084d233fa3e29a
REV52_PARTIAL_CSS = 1710d770ae87fb5f910d669dd5a88ea0950e6991
REV53_BROKEN_JS   = dbd9899ade84318921e374ce687ac435da7cc40c
REV53_BROKEN_CSS  = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Independent verdict:
`CORRECTIVE — FAILED ROLLBACK / BROKEN LIVE CUSTOMIZATION`.

## 4. New User Emergency Recovery Authorization

Authorization ID:
`APP794-D1-EMERGENCY-RECOVERY-REV51-20260829-01`

```text
AUTHORIZATION_TYPE       = ONE-SHOT EMERGENCY RECOVERY
AUTHORIZATION_STATUS     = AUTHORIZED / UNCONSUMED
AUTHORIZED_BY            = USER
AUTHORIZED_DATE          = 2026-08-29
TARGET_APP               = App794
TARGET_SCOPE             = DESKTOP CUSTOMIZATION JS/CSS ONLY
RECOVERY_SOURCE_COMMIT   = ec6278524a2d5eb53050d0580c340d1b4e866b97
RECOVERY_JS_BLOB_SHA     = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
RECOVERY_CSS_BLOB_SHA    = 1710d770ae87fb5f910d669dd5a88ea0950e6991
RECOVERY_SCOPE           = ALL
RECOVERY_TOPOLOGY        = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
RECOVERY_ATTEMPTS        = MAXIMUM 1
```

Authorization is consumed immediately when the first Live recovery customization write is attempted, regardless of success/failure. It cannot be reused.

### Authorized write
- Exactly one App794 Desktop customization recovery attempt to restore the repository-known-good rev51 JS/CSS content identities above.

### Strictly forbidden
- no Combined Employee UI candidate deployment;
- no Back-button/card/comment corrective in the same action;
- no source/test edits;
- no rebuilding latest source as recovery material;
- no use of failed scratch rollback snapshots as recovery material;
- no App794 business-record write;
- no App794 form/schema/layout write;
- no ACL/process write;
- no Kintone Comment POST/DELETE/reply;
- no mobile customization change;
- no App801/App795/App796 write;
- no D2-D7 execution;
- no external service/storage.

## 5. Mandatory Recovery Safety Gates

Before first Live write Antigravity must:
1. fetch latest canonical branch and read `AI_CONTROL_CENTER.md` + `AI_ACTIVE_TASK.md`;
2. verify this exact authorization is `AUTHORIZED / UNCONSUMED`;
3. read actual current App794 Live customization revision, Scope, Desktop/Mobile topology, JS/CSS identities;
4. confirm Live is still the currently known broken state or fail closed if unrelated drift is detected;
5. materialize `dist/mbo-employee-app.js` and `dist/mbo-employee.css` directly from commit `ec6278524a2d5eb53050d0580c340d1b4e866b97`;
6. independently verify exact Git blob identities `e04aa...` and `1710d...` BEFORE upload;
7. preserve Scope ALL / Desktop JS1 / Desktop CSS1 / Mobile0;
8. capture current broken rev53 customization reference for forensic/rollback evidence only; do not use it as target material.

Any identity/topology mismatch before write => STOP / no recovery attempt.

## 6. Mandatory Post-Recovery Readback

After the single recovery attempt, record:
- Kintone deployment result;
- post-recovery revision;
- Scope/topology;
- Live JS identity;
- Live CSS identity;
- exact known-good pair match;
- Mobile unchanged;
- zero forbidden writes.

Recovery PASS requires BOTH:
```text
POST_RECOVERY_JS  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
POST_RECOVERY_CSS = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Antigravity must commit/push recovery evidence only and STOP. It must not perform User Live UAT or any subsequent UI deployment.

## 7. Current Gate

```text
CURRENT_GATE                  = APP794 EMERGENCY RECOVERY EXECUTION
CURRENT_MODE                  = ANTIGRAVITY ONE-SHOT EMERGENCY RECOVERY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
LIVE_APP794_CUSTOMIZATION     = REV53 BROKEN
RECOVERY_AUTHORIZATION_ID     = APP794-D1-EMERGENCY-RECOVERY-REV51-20260829-01
RECOVERY_AUTHORIZATION        = AUTHORIZED / UNCONSUMED
KNOWN_GOOD_RECOVERY_COMMIT    = ec6278524a2d5eb53050d0580c340d1b4e866b97
KNOWN_GOOD_JS                 = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
KNOWN_GOOD_CSS                = 1710d770ae87fb5f910d669dd5a88ea0950e6991
COMBINED_UI_DEPLOY            = NO / NOT AUTHORIZED
SOURCE CHANGE                 = NO
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
```

Maximum executor status:
`RECOVERED_PENDING_INDEPENDENT_REVIEW`.
