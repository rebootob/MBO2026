# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — APP794 FAILED ROLLBACK / EMERGENCY RECOVERY AUTHORIZATION PENDING

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🔴 App794 Live rev53 is BROKEN after failed rollback; custom UI is not rendering and user sees native Kintone fields only. Previously accepted attachment behavior is not being reopened as source logic, but Live customization must first be recovered to the exact known-good rev51 bundle identities. Combined Employee UI remains SOURCE+VERIFICATION PASS but is NOT authorized for forward deployment. HR/admin reset and remaining security UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — blocked behind App794 recovery/UI corrective |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Known-Good App794 Rev51 — Recovery Source of Truth

The accepted App794 attachment Preview/Download deployment evidence for rev51 records:

```text
KNOWN_GOOD_SOURCE_CANDIDATE = ec6278524a2d5eb53050d0580c340d1b4e866b97
KNOWN_GOOD_LIVE_REVISION    = 51
KNOWN_GOOD_SCOPE            = ALL
KNOWN_GOOD_TOPOLOGY         = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
KNOWN_GOOD_JS_BLOB_SHA      = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
KNOWN_GOOD_CSS_BLOB_SHA     = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Repository readback confirms at candidate `ec627852...`:
- `dist/mbo-employee-app.js` blob = `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`
- `dist/mbo-employee.css` blob = `1710d770ae87fb5f910d669dd5a88ea0950e6991`

This is now the only accepted recovery target.

## 3. Combined Employee UI Candidate — Still Source/Verification PASS, Not Live

Reviewed candidate:
`ea5254370360321d18bd768f379986609c241850`

Reviewed identities:
```text
COMBINED_UI_JS_BLOB_SHA  = a4975fc219269268bf2a0caffd084d233fa3e29a
COMBINED_UI_CSS_BLOB_SHA = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Features remain:
1. Back to My MBO on existing Detail/Edit.
2. Responsive My MBO card/list UI.
3. Native Kintone Comment read-only mirror + Refresh.

This candidate is NOT currently authorized for any forward deployment.

## 4. Failed Partial Deploy and Failed Rollback

Consumed one-shot forward authorization:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`

Partial rev52 evidence:
```text
REV52_JS  = a4975fc219269268bf2a0caffd084d233fa3e29a
REV52_CSS = 1710d770ae87fb5f910d669dd5a88ea0950e6991
EXACT_COMBINED_UI_MATCH = NO
```

Rollback commit/evidence:
`daaab7f596067124007bb35dd945eeec7b262d49`

Rollback restored:
```text
REV53_JS  = dbd9899ade84318921e374ce687ac435da7cc40c
REV53_CSS = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

This is NOT the known-good rev51 bundle pair above. Therefore the rollback evidence claim `PRE_DEPLOY_SNAPSHOT_MATCH = YES` is rejected by independent review.

User Live observation after rev53:
- custom MBO UI disappeared;
- only native Kintone fields remain visible.

Independent verdict:
`CORRECTIVE — FAILED ROLLBACK / BROKEN LIVE CUSTOMIZATION`.

## 5. Emergency Recovery Gate

A NEW explicit user authorization is required before any further Live customization write.

Recovery scope, if authorized, must be exactly:
- App794 Desktop customization only;
- restore repository-known-good rev51 bundle contents from commit `ec6278524a2d5eb53050d0580c340d1b4e866b97`;
- exact JS identity `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`;
- exact CSS identity `1710d770ae87fb5f910d669dd5a88ea0950e6991`;
- Scope ALL;
- Desktop JS 1 / Desktop CSS 1 / Mobile 0;
- no source edits;
- no business record/schema/layout/ACL/process/comment writes;
- no App801/App795/App796 writes;
- no Combined Employee UI forward deployment in the same recovery action.

After recovery, Control Plane must independently verify Live readback before any new UI corrective/deploy work.

## 6. Current Gate

```text
CURRENT_GATE                  = APP794 EMERGENCY RECOVERY AUTHORIZATION
CURRENT_MODE                  = CONTROL PLANE HOLD — NO ANTIGRAVITY EXECUTION
NEXT_ACTION_OWNER             = USER / EXPLICIT RECOVERY AUTHORIZATION
LIVE_APP794_CUSTOMIZATION     = REV53 BROKEN
ROLLBACK_REVIEW               = CORRECTIVE / FAILED
KNOWN_GOOD_RECOVERY_COMMIT    = ec6278524a2d5eb53050d0580c340d1b4e866b97
KNOWN_GOOD_JS                 = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
KNOWN_GOOD_CSS                = 1710d770ae87fb5f910d669dd5a88ea0950e6991
RECOVERY_AUTHORIZATION        = NONE
FORWARD_COMBINED_UI_DEPLOY    = NO
SOURCE CHANGE                 = NO
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
```
