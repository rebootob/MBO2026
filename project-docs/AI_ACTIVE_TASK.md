# AI ACTIVE TASK — POST-CORE V1 UI/UX SPRINT — AUTHORIZATION PENDING

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Primary target: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE
> Kintone write/deploy authorization: **NONE — DO NOT DEPLOY OR WRITE KINTONE YET**

## Reviewed checkpoint

R12E-B7 Functional Workflow UAT is independently reviewed and the current M1_G1 Core V1 is frozen as:

`CORE_V1_FUNCTIONAL_FREEZE = FROZEN`

`FUNCTIONAL_WORKFLOW_UAT = PASS_WITH_DOCUMENTED_EXECUTION_EVIDENCE_EXCEPTION`

The retained evidence exception is limited to the R12E-B7 pre-normalization checkpoint: B6 verified Record #10 at status03, while the B7 evidence package records status04 immediately before normalization even though the manifest required exact status03 or STOP. The functional matrix itself is accepted because all 22 reviewed transitions, 3 First-Manager denials, final status16, zero real-user impact and cleanup passed, and the matrix independently covers both `03 -> 01` and `03 -> 04` paths.

Do not rerun Core UAT solely to remove this documented evidence exception.

## North Star / milestone order

`Core Function ✅ -> Functional UAT ✅ -> CORE V1 FROZEN ✅ -> UI/UX Polish -> Dashboard -> Final UAT -> Go-Live`

## Next objective — UI/UX Polish only

Prepare one compact UI/UX V1 sprint for App794 without changing frozen business logic.

Priority outcomes:
- current workflow status is immediately understandable;
- available next action(s) are visually clear;
- validation/fail-closed messages are understandable to employees/managers;
- Objective / Mid-Year / Final sections are easy to scan;
- Requester / Manager / GM / HR context is readable without exposing unnecessary system detail;
- desktop usability first, mobile only where already supported/necessary;
- no pixel-perfect redesign and no advanced visual effects;
- do not change routing, scoring, Process transitions, profile rules, authorization semantics, or Record_Key behavior.

## Control Plane review scope before any implementation

ChatGPT should inspect existing `src/**` / `dist/**` UI implementation and identify the smallest V1 polish set. Antigravity should only be used for execution that requires the local build/browser/Kintone environment.

## Hard boundaries

Until a fresh user authorization is recorded:
- NO Kintone customization PUT/deploy;
- NO Process/schema/ACL/notification changes;
- NO record workflow action;
- NO App795/App53/App796/other-app write;
- NO changes to frozen workflow/routing/scoring/security behavior;
- NO dashboard work yet;
- NO unnecessary new files or framework rewrites.

## Required implementation governance for the future authorized UI/UX sprint

Before execution state:
- What will change;
- Where (exact files/components/App794 assets);
- How;
- Why;
- Expected impact;
- Risks;
- Test plan;
- Rollback plan.

Any App794 customization write/deploy requires a new explicit single-use user authorization and fresh pre-write backup/readback gate.

# STOP CONDITION

Current state: **CORE V1 FROZEN / UIUX SPRINT PREPARATION ONLY / NO KINTONE WRITE AUTHORIZATION**.
