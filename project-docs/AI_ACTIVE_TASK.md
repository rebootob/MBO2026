# AI ACTIVE TASK — IDENTITY-BASED VIEWER ROLE RESOLUTION / PRIVACY CLOSURE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `8beb16792f3cdbeeb6f76933d0de061f0da6a64d`
> Mode: **VISUAL-UAT PRIVACY CLOSURE / ONE ROUND / FAIL-CLOSED / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## WHY THIS TASK EXISTS

Independent review found a privacy blocker in the current Step 4–5 privacy implementation.

Current UI method `_getResolvedViewerRole()` can infer viewer role from the record Process `Status` when Preview role is `auto` / no explicit role is supplied.

That is unsafe.

Example:

```text
Login user = Employee / Requester
Record Status = 13 Manager Final Evaluation
```

The record status describes **where the workflow is**, not **who is viewing the record**.

Therefore this is prohibited:

```text
Status 12/13/14 -> viewer = APPRAISER
Status 15/16    -> viewer = HR
```

Production `src/main-mbo-app.js` currently does not inject a trusted viewer role, so status-based fallback can expose confidential Step 4/5 content to an Employee.

Confirmed UI privacy baseline remains:

```text
Employee Step 1 Objectives       = allowed
Employee Step 2 Mid-Year         = allowed
Employee Step 3 Self Evaluation  = allowed
Employee Step 4 Appraiser Eval   = detail hidden
Employee Step 5 HR Final         = detail hidden
```

Do not edit `project-docs/CONFIRMED_BASELINE/*` in this round unless implementation discovers a direct contradiction. The existing baseline already records the Employee Step 4–5 privacy rule.

---

# OBJECTIVE

Replace status-based viewer-role inference with **identity-based, fail-closed resolution** and wire the production Kintone login identity into the UI in one coherent round.

Do NOT redesign the UI.
Do NOT reopen MBO secondary-password architecture, App801, migration, routing-master design, scoring-master design, Hoshin, schema, Process Management, or Kintone permissions.

Primary files expected:

```text
src/main-mbo-app.js
src/ui/employee-part-a-ui.js
tests/objective-save-validation.test.js
```

Build output:

```text
dist/mbo-employee-app.js
```

---

# 1. ABSOLUTE RULE — STATUS IS NOT VIEWER IDENTITY

Remove production viewer-role inference from Process Status.

After this task, there must be **zero production code paths** equivalent to:

```text
status -> APPRAISER viewer
status -> HR viewer
```

Status may still determine:

```text
current workflow phase
current business stage
action guidance
current route actor context
```

Status must NOT determine:

```text
who the logged-in viewer is
whether the viewer may see Step 4 confidential scoring
whether the viewer may see Step 5 HR detail
```

Expected:

```text
STATUS_BASED_VIEWER_ROLE_INFERENCE = 0
```

---

# 2. PRODUCTION LOGIN IDENTITY SOURCE

In Kintone runtime, use the existing native identity source:

```js
kintone.getLoginUser().code
```

Read only. No Kintone API call is required.

`src/main-mbo-app.js` must pass trusted identity context into `EmployeePartAUI` instead of leaving production role resolution to status inference.

Recommended minimal option shape:

```text
loginUserCode = <kintone login user code>
resolvedViewerRole = <role resolved from identity/record context, or RESTRICTED>
```

Do not allow a normal production user to set their own role through Preview controls or arbitrary query/UI state.

Preview role simulation may remain available only when the UI is explicitly in Preview mode.

Expected:

```text
PRODUCTION_LOGIN_IDENTITY_WIRED = PASS
PREVIEW_ROLE_SIMULATION_ISOLATED = PASS
```

---

# 3. IDENTITY MATCHING — USE EXISTING RECORD ROUTE IDENTITIES

Use the smallest pure/helper implementation possible.

Existing record identity fields already present in runtime may include:

```text
Requester_User
First_Manager_User
Manager_User
GM_User
Manager_Level1_Approvers
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
```

Support Kintone USER_SELECT shapes safely:

```text
[{ code: 'user01', name: '...' }]
```

and compatible single-value/object/string forms only where existing source already uses them.

Do not infer identity from display name, position title, department, section, scoring profile, route topology, or Process Status.

### Employee / Requester

If the login user code matches the authoritative requester/user identity on the record, resolve:

```text
EMPLOYEE
```

For current architecture, `Requester_User` is the primary record-level identity field for this local privacy gate unless a more authoritative already-existing App794 field is proven in source.

### Appraiser

If the login user code matches one or more configured Appraiser/Approver user fields for the record, resolve:

```text
APPRAISER
```

Matching must be identity-based, not status-based.

An Appraiser may view Step 4 confidential content according to the already-confirmed Appraiser visibility model; editability/current-slot rules remain separately status/route driven.

### HR

Do **not** invent HR authority.

If the repository already contains a reviewed authoritative HR role/user resolver, reuse it.

If no authoritative HR identity source exists locally, production HR role resolution in this task must remain fail-closed:

```text
HR_AUTHORITY_SOURCE = NOT_AVAILABLE_LOCAL
-> do not infer HR from Status 15/16
-> unresolved viewer = RESTRICTED
```

Preview may continue to simulate `HR` only in explicit Preview mode for Visual UAT.

Do not query Kintone groups/users/apps in this task.

---

# 4. AMBIGUOUS / UNKNOWN IDENTITY MUST FAIL CLOSED

If login identity cannot be resolved safely, return:

```text
RESTRICTED
```

Do NOT default unknown identity to:

```text
EMPLOYEE
APPRAISER
HR
```

If the same login user matches conflicting business roles on the same record and no existing canonical precedence is already proven, fail closed as `RESTRICTED` rather than guessing.

For `RESTRICTED` viewer:

- Step 4 confidential detail = hidden
- Step 5 confidential detail = hidden
- sensitive Timeline Step 4/5 rows = hidden
- no sensitive Appraiser/HR history navigation
- show a compact bilingual configuration/access message; do not expose scoring values while unresolved

Safe Step 1–3 visibility may remain only if existing record-level access already permits it and the viewer is not being elevated by this helper. Do not claim this UI gate is the native authorization boundary.

Expected:

```text
UNKNOWN_VIEWER_ROLE = RESTRICTED
AMBIGUOUS_VIEWER_ROLE = RESTRICTED
FAIL_OPEN_VIEWER_ROLE_DEFAULTS = 0
```

---

# 5. PREVIEW SIMULATION RULE

`previewOptions.viewerRole = employee|appraiser|hr` may continue to drive Visual UAT **only when `isPreviewMode === true`**.

Outside explicit Preview mode:

```text
previewOptions.viewerRole
```

must not elevate or override production identity resolution.

Required tests:

```text
production-like UI + previewOptions.viewerRole='hr' + isPreviewMode=false
-> MUST NOT become HR merely from previewOptions
```

Expected:

```text
PREVIEW_ROLE_ESCALATION_IN_PRODUCTION = 0
```

---

# 6. STEP 4/5 PRIVACY BEHAVIOR AFTER IDENTITY RESOLUTION

Preserve the accepted render gates from `8beb167...`, but key them from trusted resolved role.

### EMPLOYEE

```text
Step 4 detail = HIDDEN
Step 5 detail = HIDDEN
Step 4 history navigation = DISABLED
Step 5 history navigation = DISABLED
Timeline Step 4 rows = 0
Timeline Step 5 rows = 0
```

If actual Workflow Status is 12/13/14 while Employee is logged in, Employee must still see only the Step 4 privacy-safe process card.

If actual Workflow Status is 15/16 while Employee is logged in, Employee must still not become HR and must not see HR Final breakdown.

### APPRAISER

Identity-matched Appraiser:

```text
Step 4 permitted detail = PRESERVED
Step 5 HR-only confidential detail = do not elevate automatically
```

Appraiser current-column editability may still depend on status/route slot after identity is already resolved.

### HR

Only a trusted HR authority source may resolve HR in production.
Preview HR simulation remains available for Visual UAT.

---

# 7. REQUIRED TEST MATRIX — ONE ROUND

Use existing test framework. Do not create another framework.

At minimum add/adjust tests for:

```text
A. Employee identity + Status 13 Manager Final Evaluation
   -> resolved role EMPLOYEE
   -> Step 4 matrix absent
   -> rating/comment/result internals absent
   -> privacy card present

B. Employee identity + Status 15 HR Final Check
   -> resolved role EMPLOYEE
   -> HR detail absent
   -> HR role NOT inferred from status

C. Appraiser identity + Status 13
   -> resolved role APPRAISER
   -> Step 4 permitted detail preserved

D. Unknown login identity + Status 13
   -> RESTRICTED
   -> Step 4 detail absent

E. Unknown login identity + Status 15
   -> RESTRICTED
   -> HR detail absent

F. Preview mode + explicit Employee/Appraiser/HR selector
   -> simulation preserved

G. Non-preview mode + previewOptions.viewerRole='hr'
   -> no role escalation

H. Employee Timeline
   -> Step 4/5 rows hidden even when record is currently Step 4/5

I. Identity helper USER_SELECT handling
   -> exact code match works
   -> name-only/nonmatching/blank does not grant role
```

If current tests hardcode auto role from status, replace those expectations rather than layering exceptions.

---

# 8. SOURCE SWEEP BEFORE FINAL TEST

Before final test/build, search the runtime source for all viewer-role decisions.

Inspect at least:

```text
_getResolvedViewerRole
viewerRole
resolvedViewerRole
loginUserCode
kintone.getLoginUser
Status
APPRAISER
HR
EMPLOYEE
RESTRICTED
```

Report:

```text
VIEWER_ROLE_DECISION_PATHS_SCANNED = <count>
STATUS_BASED_VIEWER_ROLE_INFERENCE = 0
PRODUCTION_PREVIEW_ROLE_OVERRIDES = 0
UNKNOWN_FAIL_OPEN_PATHS = 0
```

Do not merely change the most visible call site.

---

# 9. LOCAL-ONLY / SECURITY BOUNDARY

```text
KINTONE_API_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
```

Calling `kintone.getLoginUser()` in production source is allowed because it is the native already-available login identity accessor and does not perform a Kintone REST call/write.

This task is a UI privacy/data-exposure gate only.

Do not claim:

```text
PRODUCTION_AUTHORIZATION_SECURITY = COMPLETE
```

Native Kintone record/field/process permissions remain the real authorization boundary and require their own deployment/UAT verification later.

Do not reopen the separate MBO secondary-password/trusted-backend architecture in this task.

---

# 10. TEST / BUILD / DOCS

1. Implement one coherent identity-resolution patch.
2. Add focused regression tests.
3. Run targeted tests during implementation as needed.
4. Run full `npm test` exactly ONCE near completion.
5. Run `npm run ui:build` exactly ONCE near completion.
6. Verify expected dist update.
7. Update concisely:
   - `project-docs/AI_REVIEW_PACKAGE.md`
   - `project-docs/CURRENT_STATE.md`
   - `project-docs/HANDOFF.md`
8. Do not edit Confirmed Baseline unless a true contradiction is found.
9. Commit once, push, STOP.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_API_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

PRODUCTION_LOGIN_IDENTITY_WIRED = PASS|FAIL
STATUS_BASED_VIEWER_ROLE_INFERENCE = <count>
PREVIEW_ROLE_SIMULATION_ISOLATED = PASS|FAIL
PREVIEW_ROLE_ESCALATION_IN_PRODUCTION = <count>

EMPLOYEE_IDENTITY_STATUS13_ROLE = EMPLOYEE|FAIL
EMPLOYEE_STATUS13_STEP4_DETAIL = HIDDEN|FAIL
EMPLOYEE_IDENTITY_STATUS15_ROLE = EMPLOYEE|FAIL
EMPLOYEE_STATUS15_STEP5_DETAIL = HIDDEN|FAIL
APPRAISER_IDENTITY_RESOLUTION = PASS|FAIL
UNKNOWN_VIEWER_ROLE = RESTRICTED|FAIL
AMBIGUOUS_VIEWER_ROLE = RESTRICTED|FAIL
FAIL_OPEN_VIEWER_ROLE_DEFAULTS = <count>

EMPLOYEE_TIMELINE_STEP4_ROWS = 0|FAIL
EMPLOYEE_TIMELINE_STEP5_ROWS = 0|FAIL
APPRAISER_STEP4_VISIBILITY = PRESERVED|FAIL
HR_PRODUCTION_AUTHORITY_SOURCE = VERIFIED_EXISTING|NOT_AVAILABLE_LOCAL
HR_STATUS_INFERENCE = 0|FAIL

VIEWER_ROLE_DECISION_PATHS_SCANNED = <count>
PRODUCTION_PREVIEW_ROLE_OVERRIDES = <count>
UNKNOWN_FAIL_OPEN_PATHS = <count>

TARGETED_IDENTITY_PRIVACY_TESTS = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_IDENTITY_PRIVACY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push local changes, then STOP.
Do not begin Kintone deployment.