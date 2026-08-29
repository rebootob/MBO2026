# AI ACTIVE TASK — COMBINED EMPLOYEE UI CONTROLLED RE-PLAN

Mode: **CONTROL PLANE READ-ONLY ANALYSIS — ANTIGRAVITY DO NOTHING / NO LIVE WRITE**
Branch: `ai/antigravity-wp002c`

## Accepted Current Live Baseline

App794 current accepted Live runtime:
```text
LIVE_REVISION          = 54
LIVE_SOURCE_COMMIT     = ec6278524a2d5eb53050d0580c340d1b4e866b97
LIVE_SCOPE             = ALL
LIVE_TOPOLOGY          = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY       = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
LIVE_CSS_IDENTITY      = 1710d770ae87fb5f910d669dd5a88ea0950e6991
TECHNICAL_READBACK     = PASS
USER_RUNTIME_SMOKE     = PASS
LIVE_RUNTIME_STATUS    = ACCEPTED KNOWN-GOOD
```

Emergency recovery authorization `APP794-D1-EMERGENCY-RECOVERY-REV51-20260829-01` is `CONSUMED / CLOSED`.

Recovery process pre-gate violation remains recorded as an incident only. No further recovery write is required or authorized.

## User-Required UI Scope — Exactly Three Features

1. Detail/Edit must show a reliable **← Back to My MBO / กลับหน้า My MBO** action.
2. My MBO index must use a readable responsive card/list presentation while preserving Employee_Code ownership filtering, Fiscal_Year descending order, existing record URLs, status semantics and zero Delete UI.
3. Existing Detail/Edit must show a **read-only mirror of Native Kintone Comments + Refresh**, with safe pagination/read-only behavior and zero Comment write.

Do NOT include Copy Previous MBO yet.

## Previous Candidate — Evidence Only, Not Deploy-Ready

Previous source candidate:
`ea5254370360321d18bd768f379986609c241850`

Previous reviewed identities:
```text
JS  = a4975fc219269268bf2a0caffd084d233fa3e29a
CSS = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

This candidate is NOT authorized for Live deployment and must not be blindly redeployed.

The previous Live incident showed:
- partial JS-new/CSS-old deployment;
- visual styling mismatch;
- Back to My MBO not visible during Live observation;
- invalid rollback process afterward.

Therefore Control Plane must re-establish source ownership, runtime binding and deployment packaging before any new executor task.

## Mandatory Control Plane Analysis Before Antigravity

ChatGPT must inspect only the relevant source/build files and produce an exact map:

```text
FEATURE
CANONICAL_SOURCE_OWNER
SUPPORTING_MODULES
CSS_OWNER
FOCUSED_TESTS
GENERATED_DIST_OUTPUT
RUNTIME_EVENT/BINDING
```

At minimum map:
- My MBO card/list;
- Back/navigation shell;
- Native Comment mirror/Refresh.

The analysis must also determine why the Back button did not appear in the failed Live attempt even though source logic had been reviewed.

## Mandatory Release / Rollback Manifest For Next Candidate

Before any later deploy authorization, Control Plane must establish both manifests.

### Current known-good rollback manifest
```text
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

### New candidate manifest
Must later contain:
```text
CANDIDATE_SOURCE_COMMIT
CANDIDATE_JS_IDENTITY
CANDIDATE_CSS_IDENTITY
CANDIDATE_SCOPE
CANDIDATE_TOPOLOGY
FEATURE_OWNER_MAP
FOCUSED_TEST_EVIDENCE
FULL_REQUIRED_REGRESSION_EVIDENCE
SOURCE_TO_DIST_TRACEABILITY
```

JS + CSS are one atomic release unit. Mixed identities must fail closed before any Live write.

## Strict Hold

```text
NEXT_ACTION_OWNER             = CHATGPT CONTROL PLANE
ANTIGRAVITY EXECUTION         = NO
SOURCE CHANGE                 = NO
TEST CHANGE                   = NO
APP794 CUSTOMIZATION DEPLOY   = NO
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
```

Do not ask the user for a new deploy authorization until source ownership, tests, atomic candidate manifest and rollback manifest are all independently established.

Maximum current status:
`CONTROL_PLANE_UI_REPLAN_IN_PROGRESS`
