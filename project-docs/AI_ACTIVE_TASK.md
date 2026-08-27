# AI ACTIVE TASK — FINAL IDENTITY PRIVACY MICRO-FIX + PRODUCTION MODULAR CODE STANDARD

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `49ddaab5abcccbea7ba3ef4bf45a22f6c7110fc0`
> Mode: **FINAL PRIVACY MICRO-FIX / ONE ROUND / NO LARGE REFACTOR / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## USER-CONFIRMED PRODUCTION CODE STANDARD — 2026-08-27

The user confirmed that the maintainable modular JavaScript approach must also apply to the real Production App794 implementation, not only to Preview/local development.

Record this decision in the existing canonical `project-docs/CONFIRMED_BASELINE/UI_UX.md` (or the most appropriate existing canonical architecture/code-governance section in that same baseline; do not create a duplicate baseline file):

```text
PRODUCTION_SOURCE_STRUCTURE = MODULAR
PRODUCTION_KINTONE_DELIVERY = BUILT_BUNDLE
PREVIEW_AND_PRODUCTION_BUSINESS_RENDERING = SAME_SOURCE_MODULES_WHERE_PRACTICAL
```

Confirmed intent:

- Source code in `src/` must be split by clear domain responsibility when that materially improves maintainability, debugging, testability, or security review.
- Do NOT create micro-files or split merely because a function is long.
- Prefer modifying existing modules/functions before creating a new file unless there is a clear separation-of-concerns reason.
- Preview and Production must not become two independent business implementations.
- Production may continue to receive a single built JavaScript bundle such as `dist/mbo-employee-app.js` for simple Kintone customization deployment.
- Build output is not the maintainability source of truth; source modules under `src/` are.
- A later post-Visual-UAT controlled refactor may separate responsibilities such as viewer visibility, route presentation, timeline presentation, and scoring normalization, but it must preserve behavior and tests.

**Important for this round:** record the standard only. Do NOT perform the broad modular refactor now. First close the two identity/privacy defects below.

---

# OBJECTIVE

Close the last two independently verified identity-role defects in `resolveIdentityViewerRole()` without redesigning UI and without broad refactoring.

Primary source:

```text
src/ui/employee-part-a-ui.js
```

Production wiring remains:

```text
src/main-mbo-app.js
```

Build output:

```text
dist/mbo-employee-app.js
```

Confirmed privacy baseline remains:

```text
Employee Step 1 = allowed
Employee Step 2 = allowed
Employee Step 3 = allowed
Employee Step 4 detail = hidden
Employee Step 5 detail = hidden
```

---

# BLOCKER 1 — EMPLOYEE_CODE MUST NOT BE A KINTONE LOGIN AUTHORITY

Current implementation incorrectly builds requester identity from both:

```js
Requester_User
Employee_Code
```

Current pattern to remove:

```js
const requesterCodes = [
  ...extractUserCodes(record.Requester_User),
  ...extractUserCodes(record.Employee_Code)
];
```

This is unsafe because `Employee_Code` is business/master data and is not currently a confirmed Kintone login-user identity field in the frozen architecture.

For this local privacy resolver:

```text
REQUESTER_IDENTITY_AUTHORITY = Requester_User
EMPLOYEE_CODE_AS_LOGIN_AUTHORITY = PROHIBITED
```

Required behavior:

```text
Requester_User matches loginUserCode -> requester candidate = true
Employee_Code matches loginUserCode but Requester_User does not -> requester candidate = false
```

Do not add an App53 lookup or new identity mapping in this task.
Do not invent equivalence between Employee_Code and Kintone user code.

Expected:

```text
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = 0
REQUESTER_USER_PRIMARY_IDENTITY_MATCH = PASS
```

---

# BLOCKER 2 — OVERLAPPING ROLES MUST FAIL CLOSED

Current implementation calculates booleans but then applies precedence:

```js
if (isRequester) return 'EMPLOYEE';
if (isHR) return 'HR';
if (isAppraiser) return 'APPRAISER';
```

This violates the locked task rule for ambiguous identity.

When one login identity matches more than one business-role class on the same record and no separately confirmed canonical precedence exists, return:

```text
RESTRICTED
```

Required pure decision model:

```text
matches = [requester?, appraiser?, hr?]
roleMatchCount = number of true classes

0 matches -> RESTRICTED
1 match requester -> EMPLOYEE
1 match appraiser -> APPRAISER
1 match hr -> HR
2+ matches -> RESTRICTED
```

Examples that MUST return `RESTRICTED`:

```text
Requester_User + Manager_User = same login user
Requester_User + HR authority = same login user
Manager_User + HR authority = same login user
Requester + Appraiser + HR = same login user
```

Do not invent priority ordering.

Expected:

```text
AMBIGUOUS_VIEWER_ROLE = RESTRICTED
ROLE_PRECEDENCE_GUESS_PATHS = 0
```

---

# HR RULE — KEEP FAIL CLOSED

Do not expand HR authority in this task.

Current project evidence says Production HR authority is not yet certified by this local UI resolver. If no authoritative production HR resolver is already available in source:

```text
HR_PRODUCTION_AUTHORITY_SOURCE = NOT_AVAILABLE_LOCAL
```

and unknown HR-like identities remain `RESTRICTED`.

Do NOT infer HR from:

```text
Status 15
Status 16
position/title
profile
section/department
```

Preview may still simulate HR only under explicit `isPreviewMode === true`.

---

# PREVIEW OVERRIDE ISOLATION — RETAIN

Reconfirm:

```text
isPreviewMode=true + viewerRole=employee/appraiser/hr -> Preview simulation allowed
isPreviewMode=false + viewerRole=hr -> must NOT elevate production role
```

Do not loosen this guard.

---

# REQUIRED REGRESSION TEST MATRIX

Use the existing test framework only. Keep the suite compact but cover all identity classes directly.

Required tests:

```text
A. Requester_User='emp01', login='emp01'
   -> EMPLOYEE

B. Requester_User='someoneElse', Employee_Code='emp01', login='emp01'
   -> RESTRICTED
   -> proves Employee_Code does not grant Employee role

C. Manager_User='mgr01', login='mgr01'
   -> APPRAISER

D. Requester_User='same01' AND Manager_User='same01', login='same01'
   -> RESTRICTED

E. Requester_User='same01' AND HR authority fixture='same01', login='same01'
   -> RESTRICTED

F. Manager_User='same01' AND HR authority fixture='same01', login='same01'
   -> RESTRICTED

G. requester + appraiser + HR all same
   -> RESTRICTED

H. unknown login
   -> RESTRICTED

I. Employee identity + Status 13
   -> EMPLOYEE
   -> Step 4 sensitive detail hidden

J. Employee identity + Status 15
   -> EMPLOYEE
   -> Step 5 sensitive detail hidden

K. non-preview + previewOptions.viewerRole='hr'
   -> no escalation

L. explicit Preview mode + viewerRole='hr'
   -> HR simulation preserved
```

Also verify Timeline Step 4/5 filtering still follows resolved `EMPLOYEE` / `RESTRICTED` privacy behavior.

---

# SOURCE-CODE STRUCTURE RULE FOR THIS PATCH

This patch is intentionally tiny.

Do NOT create multiple new files just to satisfy the modular standard.

If the identity helper can remain a small coherent pure helper in the current module for this final privacy correction, keep it there.

After Visual UAT is passed, a separate `MAINTAINABILITY / BUG-ISOLATION REFACTOR` work package may move pure responsibilities into modules such as:

```text
src/ui/employee-visibility.js
src/ui/route-context-ui.js
src/ui/workflow-timeline-ui.js
src/evaluation/appraiser-normalizer.js
```

That future refactor must be behavior-preserving and Production-bound through the same build pipeline.

---

# SCAN BEFORE CLOSURE

Before reporting PASS, search the applicable runtime source for all viewer-role decision paths and verify:

```text
STATUS_BASED_VIEWER_ROLE_INFERENCE = 0
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = 0
ROLE_PRECEDENCE_GUESS_PATHS = 0
UNKNOWN_FAIL_OPEN_PATHS = 0
PRODUCTION_PREVIEW_ROLE_OVERRIDES = 0
```

Do not count Preview fixtures as production decision paths.

---

# TEST / BUILD / DOCS — ONE ROUND

1. Update Confirmed Baseline with the user-confirmed Production modular-source / built-bundle standard.
2. Fix only the two identity defects.
3. Add the focused ambiguity/Employee_Code regression tests.
4. Run targeted tests as needed.
5. Run full `npm test` exactly ONCE near completion.
6. Run `npm run ui:build` exactly ONCE near completion.
7. Verify source/dist parity for changed runtime source.
8. Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely.
9. Commit once, push, STOP.

No broad refactor in this round.
No Kintone calls/writes/deploys.
No Process/ACL/schema changes.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

PRODUCTION_MODULAR_SOURCE_STANDARD_RECORDED = PASS|FAIL
PRODUCTION_KINTONE_BUILT_BUNDLE_STANDARD_RECORDED = PASS|FAIL
BROAD_REFACTOR_PERFORMED = NO

REQUESTER_USER_PRIMARY_IDENTITY_MATCH = PASS|FAIL
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = <count>
AMBIGUOUS_VIEWER_ROLE = RESTRICTED|FAIL
ROLE_PRECEDENCE_GUESS_PATHS = <count>
STATUS_BASED_VIEWER_ROLE_INFERENCE = <count>
UNKNOWN_VIEWER_ROLE = RESTRICTED|FAIL
PRODUCTION_PREVIEW_ROLE_OVERRIDES = <count>

EMPLOYEE_STATUS13_STEP4_DETAIL = HIDDEN|FAIL
EMPLOYEE_STATUS15_STEP5_DETAIL = HIDDEN|FAIL
EMPLOYEE_TIMELINE_STEP4_ROWS = <count>
EMPLOYEE_TIMELINE_STEP5_ROWS = <count>

TARGETED_IDENTITY_PRIVACY_TESTS = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_IDENTITY_PRIVACY_READINESS = READY|BLOCKED
VISUAL_UAT_PRIVACY_RECHECK = READY|BLOCKED
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push local changes, then STOP.