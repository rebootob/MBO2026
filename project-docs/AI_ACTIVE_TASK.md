# AI ACTIVE TASK — PRODUCTION / SECURITY READINESS CLOSURE ASSESSMENT

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `5eab161d4f23ed28178584317ec4e498be614d94`
> Mode: **READ-ONLY ASSESSMENT / UI FROZEN / NO KINTONE / NO IMPLEMENTATION**
> Kintone authorization: **NONE**

## CONFIRMED ENTRY STATE

The user has now visually confirmed the high-risk local Preview scenarios after Final Local Regression:

```text
EMPLOYEE_STEP4_VISUAL = PASS
EMPLOYEE_STEP5_VISUAL = PASS
APPRAISER_STEP4_4SLOT_VISUAL = PASS
HR_STEP5_VISUAL = PASS
FINAL_LOCAL_VISUAL_REGRESSION_GATE = PASS
APP794_LOCAL_UI_CLOSURE = PASS
```

UI is now FROZEN. Do not redesign, refactor, or improve App794 UI in this task.

Confirmed routing/workflow baseline must be read first. In particular:
- App794 canonical Process = 16 states / 28 actions.
- Current Sandbox status15 assignee `USER: hr` is only a controlled Sandbox UAT boundary and is NOT certified Production HR authorization.
- `Requester_User` remains the confirmed Kintone shared workflow/requester boundary under the Kintone-only baseline.
- Production authorization is a separate go-live gate.

## OBJECTIVE

Perform a repository/document evidence assessment of all remaining blockers to Production / Security Readiness.

This task does NOT fix blockers.
This task does NOT contact Kintone.
This task does NOT deploy.

The output must tell ChatGPT exactly:
1. which blockers still exist;
2. which are already closed by confirmed evidence;
3. which are baseline conflicts requiring a user/architecture decision;
4. which require implementation;
5. which require later controlled Kintone read/write authorization;
6. the safest execution order to close them.

## REQUIRED FIRST READ

Read before assessment:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/UI_UX.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
```

If a living document conflicts with Confirmed Baseline, classify it as `BASELINE_CONFLICT` and do not silently resolve it.

## ASSESSMENT AREAS

### A. Identity / Authentication / Requester Authority

Trace current source/docs for:
- `Requester_User` authority;
- `kintone.getLoginUser()` usage;
- Employee_Code use in identity decisions;
- any individual-user login mapping design;
- any secondary MBO username/password design;
- App801 credential/auth design if present.

Determine whether the currently documented desired authentication model conflicts with the confirmed Kintone-only `Requester_User` baseline.

Do not change the baseline in this task.

### B. Secondary Password Security Boundary

Search for any implementation/design that verifies an MBO password.

Classify whether password verification occurs:
- trusted server/service boundary;
- browser JavaScript;
- not implemented.

Password hashes/secrets must never be verified/exposed in browser-only code.

If no trusted backend exists, report the exact blocker. Do not invent a backend.

### C. Production HR Authorization

Assess Production readiness of native Kintone Process authorization at `15 HR Final Check`.

Confirmed Sandbox `USER: hr` is not Production certification.

Identify what evidence/configuration is still required before Production can claim HR-only native authorization.

Do not contact Kintone and do not propose real-user workflow transitions merely for certification.

### D. Process / Workflow Consistency

Use Confirmed Baseline as canonical:

```text
PROCESS_STATES = 16
PROCESS_ACTIONS = 28
```

Search repository/docs for stale claims such as 27, 31, or other action counts.

Classify each conflict as stale documentation/evidence versus active runtime/config dependency.

Do not change Process Management.

### E. App800 Phase Calendar / Security Policy Dependencies

Inspect source/docs/schema evidence for App800 responsibilities:
- five phase start/end dates;
- any password/security policy settings expected by runtime;
- fail-closed behavior when required policy/config is missing.

Report exact missing fields/runtime bindings only where repo evidence supports the claim.

### F. App801 Credential Store Contract

Inspect App801 schema/docs/source references.

Determine whether the contract needed by current auth design is complete, partially implemented, or conflicting with baseline.

Never expose or fabricate real credentials.

### G. Production Data / Legacy Safety

Assess known production-readiness safeguards visible in repository evidence, including where applicable:
- legacy attachment discovery/enumeration;
- unknown legacy app handling;
- Hoshin identifier normalization/stringification;
- synthetic/fake fixture leakage into production paths;
- data-loss / row+field preservation proof;
- export/template binary dependencies.

Only report issues supported by repository evidence. If not found, mark `NOT_EVIDENCED`, not PASS.

### H. UI Freeze / Delivery Integrity

Verify:
- Production source structure remains modular;
- Kintone delivery remains built bundle;
- Final Local Visual Regression is user-confirmed PASS;
- no additional R2 Route/Timeline refactor is required before readiness closure.

Do not modify UI/source/dist.

## CLASSIFICATION RULE

For every finding use exactly one:

```text
CLOSED
BLOCKER_IMPLEMENTATION
BLOCKER_ARCHITECTURE_DECISION
BLOCKER_KINTONE_CONFIGURATION
BLOCKER_SECURITY
BASELINE_CONFLICT
NEEDS_READ_ONLY_KINTONE_EVIDENCE
NOT_EVIDENCED
```

For every non-closed item include:
- exact reason;
- source file/doc/function evidence;
- production risk;
- safest next action;
- whether Kintone authorization is required.

## REQUIRED PRIORITY ORDER

Return blockers grouped:

```text
P0 = security / authorization / data-loss risk
P1 = production correctness / workflow/config consistency
P2 = maintainability / documentation / non-blocking evidence
```

Do not inflate cosmetic/local-preview issues into P0/P1 now that UI is frozen and visually accepted.

## HARD BOUNDARY

```text
SOURCE_CHANGE = 0
DIST_CHANGE = 0
PREVIEW_CHANGE = 0
TEST_CHANGE = 0
BUILD_RUN = 0
NPM_TEST_RUN = 0
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
UI_REFACTOR = 0
```

Allowed changes after assessment:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Update them only to record the assessment and user-confirmed Final Local Visual Gate PASS. Do not modify Confirmed Baseline in this task.

## REQUIRED FINAL REPORT

Return:

```text
ASSESSMENT_HEAD = <sha>
APP794_LOCAL_UI_CLOSURE = PASS
FINAL_LOCAL_VISUAL_REGRESSION_GATE = PASS
UI_FROZEN = YES

P0_BLOCKERS = <exact list or NONE>
P1_BLOCKERS = <exact list or NONE>
P2_ITEMS = <exact list or NONE>

IDENTITY_AUTH_MODEL = <classification + summary>
SECONDARY_PASSWORD_SECURITY = <classification + summary>
PRODUCTION_HR_AUTHORIZATION = <classification + summary>
PROCESS_16_28_CONSISTENCY = <classification + summary>
APP800_READINESS = <classification + summary>
APP801_READINESS = <classification + summary>
LEGACY_DATA_SAFETY = <classification + summary>
DELIVERY_INTEGRITY = <classification + summary>

KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
SOURCE_CHANGES = 0
DIST_CHANGES = 0
TEST_CHANGES = 0

FINAL_KINTONE_EXECUTION_READINESS = BLOCKED|READY_FOR_EXPLICIT_AUTHORIZATION
NEXT_RECOMMENDED_WORK_PACKAGE = <one smallest safe next package>
REMAINING_BLOCKERS = <exact ordered list>
```

Commit documentation-only assessment once and push, then STOP.