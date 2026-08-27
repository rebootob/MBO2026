# AI ACTIVE TASK — EMPLOYEE STEP 4–5 PRIVACY GATE / VISUAL UAT FIX

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `6fa2a39b0b39187041881ae2eb608c2bf3c44984`
> Mode: **VISUAL-UAT PRIVACY FIX / ONE ROUND / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## USER-CONFIRMED DECISION — 2026-08-27

During Visual UAT the user explicitly confirmed:

> **Employee / Requester must not see Step 4 Appraiser Evaluation detail or Step 5 HR Final detail.**

This is a business visibility/privacy rule, not merely a cosmetic preference.

Before implementation, update `project-docs/CONFIRMED_BASELINE/UI_UX.md` **in place** to record this exact confirmed decision under the existing viewer-role / historical-stage visibility section. Do not create a duplicate baseline file.

The new rule narrows the earlier unresolved employee-visibility statement. Preserve the existing security note that UI hiding is not authorization.

---

# OBJECTIVE

Close the Visual UAT privacy defect in one coherent local round.

Do NOT redesign the application. Do NOT reopen migration, App795 routing, App796 scoring configuration, Hoshin, authentication, Kintone schema, Process Management, or production security architecture.

Locked references:

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
PRIMARY_RUNTIME_SOURCE = src/ui/employee-part-a-ui.js
DIST_OUTPUT = dist/mbo-employee-app.js
```

---

# 1. EMPLOYEE / REQUESTER VISIBILITY CONTRACT

For resolved viewer role `EMPLOYEE` / `REQUESTER`:

```text
Step 1 Objectives       = ALLOWED
Step 2 Mid-Year         = ALLOWED
Step 3 Self Evaluation  = ALLOWED
Step 4 Appraiser Eval   = DETAIL HIDDEN
Step 5 HR Final         = DETAIL HIDDEN
```

## Top five-stage progress navigator

The five stage tiles may remain visible as a **high-level process progress indicator** so the employee understands where the record is in the annual workflow.

However:

- Employee must NOT be able to open/navigate into Step 4 or Step 5 detailed screens.
- Step 4/5 tiles must be disabled/non-clickable for Employee history navigation.
- Do not label Step 4/5 as `[Viewing]` for Employee.
- Do not expose scoring/result details in the tile itself.
- High-level safe states such as `กำลังประเมิน / Evaluation in progress`, `HR กำลังตรวจสอบ / HR review in progress`, or `เสร็จสิ้น / Completed` are acceptable.

## If the real current workflow is Step 4 or Step 5

When an Employee opens the record while the actual Process is in Appraiser Evaluation or HR Final:

- DO NOT render the Appraiser Evaluation matrix.
- DO NOT render Appraiser ratings/comments.
- DO NOT render Part A combined score/point context.
- DO NOT render Part B Appraiser scoring/comments/results.
- DO NOT render HR Final evaluation breakdown.
- DO NOT render internal completion/calibration/scoring detail.
- DO NOT expose hidden data merely because it is already present in the record object/Preview fixture.

Instead show a compact bilingual privacy-safe process card, for example:

```text
Step 4:
อยู่ระหว่างการประเมินโดยผู้ประเมิน
Appraiser Evaluation in progress

Step 5:
HR กำลังตรวจสอบผลขั้นสุดท้าย
HR Final Review in progress
```

The employee may still navigate back to allowed reached Steps 1–3 in read-only mode.

---

# 2. APPRAISER / HR VISIBILITY MUST REMAIN INTACT

Do not break the already approved visibility model:

### Appraiser 1..N
- Step 1–3 read-only context remains available.
- Step 4 Appraiser Evaluation remains visible according to the current ordinal-appraiser model.
- Current Appraiser's own column editable when authorized/current; other configured Appraiser columns visible read-only.
- Step 5 HR-specific internal surface must not be exposed as editable Appraiser content.

### Authorized HR
- May review all reached Steps 1–5 according to existing HR Final/read-only history rules.
- HR Final detail remains available to HR.

Expected:

```text
EMPLOYEE_STEP4_DETAIL_VISIBILITY = HIDDEN
EMPLOYEE_STEP5_DETAIL_VISIBILITY = HIDDEN
APPRAISER_STEP4_VISIBILITY = PRESERVED
HR_STEP4_VISIBILITY = PRESERVED
HR_STEP5_VISIBILITY = PRESERVED
```

---

# 3. WORKFLOW ACTION TIMELINE PRIVACY

The Timeline currently carries action/date-time information.

For Employee / Requester:

- Preserve safe workflow history from Steps 1–3, including submit/return/resubmit/approve timestamps where available.
- Do NOT expose Step 4 scoring details, scoring-completed internals, Appraiser rating values/comments, HR Final internal action details, calibration notes, or confidential Step 4/5 result context.
- Simplest safe V1 behavior: filter/hide Step 4 and Step 5 Timeline rows from Employee entirely.
- Native Kintone Comments remain governed by Kintone permissions; do not fabricate or duplicate comment content.

For Appraiser/HR, preserve the existing timeline behavior permitted for those viewers.

Expected:

```text
EMPLOYEE_TIMELINE_STEP4_ROWS = 0
EMPLOYEE_TIMELINE_STEP5_ROWS = 0
EMPLOYEE_TIMELINE_STEP1_TO_3_SAFE_HISTORY = PRESERVED
```

---

# 4. ROUTE CARD PRIVACY

`Evaluation & Approval Route` may remain visible to Employee as high-level process context.

Allowed for Employee:
- route member/slot names already approved for display;
- safe route state such as Waiting / Current / Reviewed / Completed;
- safe approval/review timestamp for employee-visible phases (Objectives/Mid-Year) when a real audit source exists.

Do NOT place confidential Step 4 ratings/comments/result values into the Route Card.

This task does not create production audit timestamp persistence. Preview fixtures remain synthetic and clearly Preview-only.

---

# 5. IMPLEMENTATION RULE — GATE BEFORE RENDERING SENSITIVE CONTENT

Do not solve this only with CSS `display:none` after confidential HTML has already been assembled.

Use the existing resolved viewer-role mechanism and gate the Step 4/5 content path **before sensitive detail rendering** where practical.

Required properties:

```text
EMPLOYEE_CANNOT_NAVIGATE_STEP4 = true
EMPLOYEE_CANNOT_NAVIGATE_STEP5 = true
EMPLOYEE_STEP4_SENSITIVE_RENDER_PATH = 0
EMPLOYEE_STEP5_SENSITIVE_RENDER_PATH = 0
```

Preview viewer-role selector is simulation only. Production users must never choose/elevate their own role.

UI hiding is still not the authorization boundary. Do not claim production security closure from this local UI fix.

---

# 6. REQUIRED REGRESSION TESTS

Use the existing UI/test framework. Do not create a parallel framework.

At minimum cover:

```text
A. Employee + current Step 4
   -> no throw
   -> privacy-safe process card shown
   -> Appraiser Part A matrix absent
   -> Part B Appraiser matrix absent
   -> rating/comment/result internals absent

B. Employee + current Step 5
   -> no throw
   -> privacy-safe HR process card shown
   -> HR Final detail breakdown absent
   -> Appraiser score/result detail absent

C. Employee history navigation
   -> Steps 1,2,3 available when reached
   -> Steps 4,5 disabled/non-clickable

D. Employee Timeline
   -> Step 1–3 safe history preserved
   -> Step 4 rows absent
   -> Step 5 rows absent

E. Appraiser viewer
   -> Step 4 detail still visible
   -> current actor editability rules preserved

F. HR viewer
   -> Step 4 read-only/full permitted view preserved
   -> Step 5 HR Final detail preserved
```

Also verify the five-stage navigator still communicates overall process progress without leaking sensitive scoring detail.

---

# 7. VISUAL UAT CHECKLIST FOR THIS ROUND

After source/test completion, update Preview so the user can visually inspect these exact scenarios:

```text
1. Employee viewer + current Step 4
2. Employee viewer + current Step 5
3. Employee viewer attempting historical Step 4/5
4. Appraiser viewer + Step 4
5. HR viewer + Step 5
```

Expected Employee visual result:

```text
STEP 4/5 progress awareness = visible at high level
STEP 4/5 detailed evaluation data = not visible
STEP 4/5 history navigation = disabled
Steps 1–3 own history = visible read-only
```

Do not claim Visual UAT PASS until the user visually confirms the resulting Preview.

---

# 8. LOCAL-ONLY HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_GET = 0
APP796_LIVE_GET = 0
APP797_LIVE_GET = 0
APP800_LIVE_GET = 0
```

No production permission changes in this task.
No new Kintone fields.
No audit persistence schema changes.
No new authentication architecture.

---

# 9. TEST / BUILD / DOCS

- Make one coherent role-visibility patch.
- Add targeted tests first/as needed.
- Run full `npm test` exactly ONCE near completion.
- Run `npm run ui:build` exactly ONCE near completion.
- Verify expected dist update only.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely.
- Commit and push once, then STOP.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

BASELINE_EMPLOYEE_STEP4_5_PRIVACY_RECORDED = PASS|FAIL
EMPLOYEE_STEP4_DETAIL_VISIBILITY = HIDDEN|FAIL
EMPLOYEE_STEP5_DETAIL_VISIBILITY = HIDDEN|FAIL
EMPLOYEE_CANNOT_NAVIGATE_STEP4 = PASS|FAIL
EMPLOYEE_CANNOT_NAVIGATE_STEP5 = PASS|FAIL
EMPLOYEE_STEP4_SENSITIVE_RENDER_PATH = <count>
EMPLOYEE_STEP5_SENSITIVE_RENDER_PATH = <count>
EMPLOYEE_TIMELINE_STEP4_ROWS = <count>
EMPLOYEE_TIMELINE_STEP5_ROWS = <count>
EMPLOYEE_TIMELINE_STEP1_TO_3_SAFE_HISTORY = PRESERVED|FAIL
APPRAISER_STEP4_VISIBILITY = PRESERVED|FAIL
HR_STEP4_VISIBILITY = PRESERVED|FAIL
HR_STEP5_VISIBILITY = PRESERVED|FAIL
ROUTE_CARD_PRIVACY = PASS|FAIL

TARGETED_ROLE_VISIBILITY_TESTS = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_ROLE_VISIBILITY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Kintone deployment.