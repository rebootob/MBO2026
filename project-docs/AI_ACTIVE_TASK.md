# AI ACTIVE TASK — FINAL LOCAL REGRESSION EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `28b18bec7a17dc2ddb30fbfbba113b650b30a16f`
> Mode: **FINAL LOCAL REGRESSION / SOURCE FREEZE / LOCAL PREVIEW ONLY / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / LOCAL PREVIEW ONLY**

## CONFIRMED STATUS BEFORE THIS TASK

Independent review confirmed:

```text
R1_SOURCE_IMPLEMENTATION = PASS
R1_ARCHITECTURE = PASS
R1_DOCUMENTATION_CLOSURE = PASS
SOURCE_MAINTAINABILITY_R1 = PASS
EMPLOYEE_STEP4_VISUAL_PRIVACY = PASS
EMPLOYEE_STEP5_VISUAL_PRIVACY = PASS
VISUAL_UAT_PRIVACY_GATE = PASS
R2_ROUTE_TIMELINE_REFACTOR = SKIPPED / NOT NEEDED NOW
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

The runtime source is now frozen for this regression round.

## OBJECTIVE

Execute the prepared Final Local Regression against the existing local Preview Lab and existing source/bundle without making implementation changes.

This round is for regression evidence only.

Do NOT refactor.
Do NOT improve UI.
Do NOT patch defects automatically.
If any defect is found, STOP and report it exactly so ChatGPT can issue a separate fix task.

## HARD SOURCE FREEZE

```text
SOURCE_CHANGE = 0
DIST_CHANGE = 0
TEST_CHANGE = 0
BUILD_RUN = 0
NPM_TEST_RUN = 0
R2_REFACTOR = 0
ROUTE_UI_REFACTOR = 0
TIMELINE_UI_REFACTOR = 0
```

Do not modify:

```text
src/**
dist/**
preview/**
tests/**
project-docs/CONFIRMED_BASELINE/**
```

No build is needed because this task is testing the already-reviewed frozen candidate.

## LOCAL PREVIEW REGRESSION MATRIX

Use the existing local Preview Lab only.

Verify each item visually/functionally without editing source.

### A. Five Macro Stages / Bilingual

Verify all five stages render and remain Thai + English:

```text
1 Objectives
2 Mid-Year
3 Self Evaluation
4 Appraiser Evaluation
5 HR Final / Completed
```

Check that historical navigation respects reached/unreached stage behavior.

### B. Employee Privacy & History

Viewer Role = Employee / Requester.

Verify:
- reached Steps 1–3 can be reviewed read-only;
- Step 4 confidential detail is hidden;
- Step 5 confidential detail is hidden;
- Step 4/5 high-level progress may remain visible;
- Step 4/5 confidential Workflow Timeline rows are absent;
- Evaluation & Approval Route remains high-level and privacy-safe.

Previously user-confirmed Scenario A/B privacy evidence remains PASS; this round is a regression recheck, not a redesign.

### C. Appraiser Authorized Preview

Viewer Role = Appraiser.

At Step 4 verify:
- Appraiser Evaluation detail is visible;
- configured Appraiser columns are visible according to current confirmed model;
- current active Appraiser column is the editable one;
- other Appraiser columns are read-only;
- Employee Step 1–3 context remains read-only;
- no role/privacy regression.

### D. HR Preview Authorized Simulation

Viewer Role = HR Admin (Preview simulation only).

At Step 5 verify:
- HR Final detail/summary is visible;
- Appraiser Part A + Part B context is read-only as designed;
- no Employee privacy limitation incorrectly applies to HR Preview;
- do NOT claim this proves Production HR authorization.

### E. Appraiser Route Counts 1 / 2 / 3 / 4

Check these Preview route scenarios:

```text
Executive Direct — 1 Appraiser
Current Standard — 2 Appraisers
Extended Route — 3 Appraisers
Future Capacity — 4 Appraisers
```

Verify:
- correct number of ordinal Appraiser columns/route slots;
- no business headings based on Manager/GM titles;
- 3/4 Appraiser matrix uses contained scrolling when needed;
- no body/page-level horizontal overflow;
- first context/objective column remains usable.

### F. Evaluation Profiles Independent From Route

Check at least one route while switching:

```text
70/30
60/40
50/50
```

Verify profile ratio changes do not alter Appraiser route count/topology.

### G. Objective_Count Guards

Verify Preview controls/fixtures for:

```text
Objective_Count = 1
Objective_Count = 10
```

Both must render only the configured number of rows.

Retain source/test evidence that invalid Objective_Count fails closed; do not fabricate invalid UI behavior if the Preview does not expose an invalid-count selector.

### H. Difficulty Blank

Verify blank Difficulty:
- stays blank;
- does not visually default to Level 3;
- shows the approved blank/not-selected state.

### I. Attachments

Verify presentation remains available for:

```text
Objectives
Mid-Year
Self Evaluation
```

Attachments are optional.
Do not claim Objective attachment production persistence if physical schema is still pending review.

### J. Deadline States

Use existing deterministic Preview dates to verify representative states:

```text
upcoming
open / remaining
7 days remaining
3 days remaining
1 day remaining
due today
overdue
completed where available
```

Verify green/on-time, amber/orange urgency, red overdue, and completed success semantics remain visually distinct.

### K. Route Context

Verify `Evaluation & Approval Route`:
- remains visible through stages;
- uses ordinal Appraiser labels;
- current/waiting/reviewed/completed states are understandable;
- Employee view does not leak scores/comments/results.

### L. Workflow Action Timeline

Verify:
- Employee/RESTRICTED does not see Step 4/5 confidential rows;
- Appraiser/HR Preview retains permitted rows;
- Preview timestamps remain deterministic fixture evidence only;
- no production audit persistence claim is made.

### M. Native Comments / Comment Placeholder

Verify existing native-comment representation or reserved Kintone comment context remains present according to current Preview design.
Do not create fake persistence.

### N. Layout / Overflow

At minimum inspect:
- dense 3-Appraiser Step 4;
- dense 4-Appraiser Step 4;
- HR Final summary.

Expected:

```text
BODY_HORIZONTAL_OVERFLOW = NO
MATRIX_CONTAINED_SCROLL = PASS when needed
TEXTAREA_SELECT_USABILITY = PASS
```

## DEFECT RULE

If any item fails:

```text
STOP_IMMEDIATELY = YES
AUTO_FIX = NO
SOURCE_CHANGE = 0
```

Report:
- exact Preview configuration;
- expected behavior;
- actual behavior;
- screenshot/evidence location if available;
- severity: BLOCKER / MAJOR / MINOR.

Do not patch during this task.

## USER VISUAL EVIDENCE

Antigravity may inspect the Preview locally, but must not self-certify user-facing visual acceptance where human visual confirmation is required.

For high-value scenarios, leave Preview ready for user screenshot/inspection if practical.

Recommended screenshot checkpoints:

```text
1. Appraiser Step 4 — 4 Appraisers
2. HR Preview Step 5
3. Deadline overdue/due state
4. Any discovered visual defect
```

If the user already visually confirmed Employee Status13/15 privacy, do not demand those same screenshots again unless a regression is observed.

## DOCUMENTATION

Do not update project documentation merely for PASS execution in this round unless explicitly necessary to record evidence after completion.

Preferred: return the regression report first; ChatGPT will decide whether a closure-doc commit is needed.

## KINTONE HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
APP53_WRITE = 0
APP794_WRITE = 0
APP795_GET = 0
APP796_GET = 0
APP797_GET = 0
APP800_GET = 0
APP801_GET = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
```

## REQUIRED FINAL REPORT

Return exactly:

```text
FINAL_LOCAL_REGRESSION_RUN = YES|NO
SOURCE_CHANGES = 0
DIST_CHANGES = 0
TEST_CHANGES = 0
NPM_TEST_RUN = 0
BUILD_RUN = 0
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0

FIVE_MACRO_STAGES = PASS|FAIL
BILINGUAL_UI = PASS|FAIL
EMPLOYEE_HISTORY_STEP1_3 = PASS|FAIL
EMPLOYEE_STEP4_PRIVACY_REGRESSION = PASS|FAIL
EMPLOYEE_STEP5_PRIVACY_REGRESSION = PASS|FAIL
APPRAISER_STEP4_AUTHORIZED_VIEW = PASS|FAIL
HR_PREVIEW_STEP5_AUTHORIZED_VIEW = PASS|FAIL
APPRAISER_1_COUNT = PASS|FAIL
APPRAISER_2_COUNT = PASS|FAIL
APPRAISER_3_COUNT = PASS|FAIL
APPRAISER_4_COUNT = PASS|FAIL
PROFILE_ROUTE_INDEPENDENCE = PASS|FAIL
OBJECTIVE_COUNT_1 = PASS|FAIL
OBJECTIVE_COUNT_10 = PASS|FAIL
DIFFICULTY_BLANK = PASS|FAIL
ATTACHMENT_PRESENTATION = PASS|FAIL
DEADLINE_STATES = PASS|FAIL
ROUTE_CONTEXT = PASS|FAIL
TIMELINE_PRIVACY_FILTER = PASS|FAIL
NATIVE_COMMENT_CONTEXT = PASS|FAIL
BODY_HORIZONTAL_OVERFLOW = PASS|FAIL

DEFECTS_FOUND = <exact list or NONE>
FINAL_LOCAL_REGRESSION_GATE = PASS|BLOCKED|AWAITING_USER_VISUAL_CONFIRMATION
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

Do not commit runtime changes. STOP after the regression report or when a defect is found.