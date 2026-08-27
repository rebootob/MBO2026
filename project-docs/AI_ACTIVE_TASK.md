# AI ACTIVE TASK — VISUAL UAT PRIVACY RECHECK ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `0f1aaf042211b4cd62d0c8cc6d70b0385d9518b7`
> Mode: **VISUAL UAT ONLY / NO SOURCE CHANGE UNLESS DEFECT FOUND / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / LOCAL PREVIEW ONLY**

## PURPOSE

Perform the user-facing Visual UAT recheck for the confirmed Employee Step 4–5 privacy rule after the identity resolver source gate passed independent review.

Confirmed rule:

```text
Employee Step 1 Objectives       = visible
Employee Step 2 Mid-Year         = visible
Employee Step 3 Self Evaluation  = visible
Employee Step 4 Appraiser Eval   = detailed content hidden
Employee Step 5 HR Final         = detailed content hidden
```

The five top-stage tiles may remain visible as high-level workflow progress, but Employee must not open Step 4/5 confidential detail.

## HARD BOUNDARY

This round is NOT an implementation sprint.

Do NOT:
- refactor source;
- move modules;
- change role logic;
- change routing/scoring/calendar/schema/process/ACL;
- contact Kintone;
- deploy anything;
- modify `dist/` or run build unless a genuine Visual UAT defect is found and ChatGPT later authorizes a separate fix task.

The Production modular-source standard is already recorded and remains deferred to a post-Visual-UAT maintainability refactor.

## REQUIRED VISUAL SCENARIOS

Open the existing local Preview Lab and present these scenarios clearly to the user.

### Scenario A — Employee + Step 4 current

```text
Viewer Role = Employee
Current Status = 13 Manager Final Evaluation
Expected resolved viewer = EMPLOYEE
```

Expected visual result:
- five-stage progress remains visible;
- Step 4 tile may show high-level process state but is non-clickable for Employee history detail;
- Step 5 tile remains high-level only/non-clickable;
- main content shows privacy-safe bilingual message similar to:
  `อยู่ระหว่างการประเมินโดยผู้ประเมิน / Appraiser Evaluation in progress`;
- NO Part A Appraiser matrix;
- NO Part B Appraiser matrix;
- NO Appraiser ratings;
- NO Appraiser comments;
- NO combined score/result context;
- Workflow Timeline contains no Step 4/5 confidential events for Employee;
- Steps 1–3 historical review remain available read-only when reached.

### Scenario B — Employee + Step 5 current

```text
Viewer Role = Employee
Current Status = 15 HR Final Check
Expected resolved viewer = EMPLOYEE
```

Expected visual result:
- five-stage progress remains visible;
- Step 4/5 detailed history remains unavailable to Employee;
- main content shows privacy-safe bilingual message similar to:
  `HR กำลังตรวจสอบผลขั้นสุดท้าย / HR Final Review in progress`;
- NO HR final breakdown;
- NO Appraiser ratings/comments/results;
- NO Part A/Part B internal result context;
- Workflow Timeline contains no Step 4/5 confidential events for Employee;
- Steps 1–3 history remains available read-only.

## QUICK CONTROL SCENARIOS

Verify without redesign:

```text
Appraiser viewer + Step 4 -> Appraiser detail remains visible
HR Preview viewer + Step 5 -> HR detail remains visible
Employee viewer -> Step 4/5 navigation disabled
```

These are Preview simulations only. Do not claim production HR authorization from Preview.

## USER EVIDENCE

Antigravity must stop with the Preview showing Scenario A first so the user can inspect it.

The user may provide screenshots back to ChatGPT. Do not self-certify Visual UAT PASS.

After Scenario A is visually inspected, switch to Scenario B when requested.

## STATUS RULE

Until the user visually confirms both Employee scenarios:

```text
SOURCE_IDENTITY_PRIVACY_READINESS = READY
VISUAL_UAT_PRIVACY_RECHECK = IN_PROGRESS
VISUAL_UAT_PRIVACY_GATE = NOT_YET_PASS
KINTONE_DEPLOY_AUTHORIZATION = NONE
```

If Preview behavior differs from the expected result, STOP and report the exact defect. Do not patch it automatically.

## DOCUMENTATION

No source/docs commit is required merely for opening Preview.
Do not alter Confirmed Baseline in this UAT-only round.

## FINAL REPORT

Return exactly:

```text
PREVIEW_OPENED = YES|NO
SCENARIO_A_EMPLOYEE_STATUS13 = READY_FOR_USER_INSPECTION|BLOCKED
SCENARIO_B_EMPLOYEE_STATUS15 = READY_FOR_USER_INSPECTION|NOT_YET_SHOWN|BLOCKED
APPRAISER_CONTROL = PASS|NOT_RUN|FAIL
HR_PREVIEW_CONTROL = PASS|NOT_RUN|FAIL
SOURCE_CHANGES = 0
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
VISUAL_UAT_PRIVACY_GATE = AWAITING_USER_CONFIRMATION|BLOCKED
DEFECTS_FOUND = <exact list or NONE>
```

STOP and wait for user visual confirmation.