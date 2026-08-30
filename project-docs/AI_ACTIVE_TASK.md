# AI ACTIVE TASK — D1 HYBRID IDENTITY RUNTIME INTEGRATION SOURCE INVENTORY R1

Mode: **CHATGPT CONTROL PLANE / GIT READ-ONLY DESIGN INVENTORY — APP53 PRODUCTION READ-ONLY / NO LIVE KINTONE ACCESS / NO SOURCE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

Hybrid Identity Core Source R1 is accepted at executor commit:

```text
c20e406b9b289984e57ebf2c52c9223094bc5f5a
```

Accepted core contracts:
- strict dedicated mapping resolver = `App53.MBO_Kintone_User + Number_0=1 + canonical emp_text` only;
- DEDICATED effective requester = exact dedicated Kintone user;
- SHARED requester behavior preserved;
- own-MBO self-appraiser elision preserves slots/rules/topology;
- Natta blank `emp_text` remains fail closed;
- legacy `resolveEmployeeIdentity()` fallback is not the future dedicated runtime binding API.

Mandatory Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

## 1. Ownership

```text
OWNER = CHATGPT CONTROL PLANE
EXECUTOR = NONE
```

This is an inventory/design step only. Do not ask Antigravity to broad-scan the repository. ChatGPT must inspect the relevant source seams first and then issue one smallest safe implementation WP.

## 2. Required Inventory Questions

Identify exact current source owner/caller for each:

1. **Identity Mode Selection**
   - where current Kintone principal is classified as dedicated vs approved shared;
   - how a dedicated missing/ambiguous mapping will fail closed without falling back to shared login;
   - ensure mode is not user-selectable.

2. **Dedicated Mapping Runtime Consumer**
   - which runtime function will call `resolveDedicatedKintoneUserMapping()`;
   - identify any current runtime use of legacy `resolveEmployeeIdentity()`;
   - future dedicated runtime must not use legacy pseudo-field fallback.

3. **Create / Effective Requester Seam**
   - where App794 create payload snapshots `Requester_User`;
   - where `resolveEffectiveRequesterUser()` must be called;
   - where own-MBO route transformation must occur before workflow snapshot.

4. **My MBO Seam**
   - exact source owner for own Employee_Code query/list/detail/edit/create;
   - dedicated and shared modes must converge on bound Employee_Code without employee selector.

5. **My Approval Tasks Seam**
   - exact source/service owner for current native Workflow assignment query or revalidation;
   - actionable approval must require current native assignee == current dedicated Kintone user;
   - App795 route membership alone must not grant authority.

6. **Home/Menu Separation**
   - identify current Home/menu renderer/controller;
   - determine smallest seam to show `My MBO` and `My Approval Tasks` without merging security contexts.

7. **Session Compatibility**
   - dedicated mode must not require App801 bearer session;
   - shared mode App801 session continuity must remain unchanged;
   - independent dedicated tab can auto-bind from native Kintone session.

8. **Build / Dist Dependency**
   - identify build source order/manifest or bundling path that must include any changed module exactly once;
   - no manual dist edits.

9. **Existing Tests**
   - identify focused tests for shared login/session, My MBO, create handler, routing/workflow and current-assignee authorization;
   - identify the smallest new/modified test files required for the next WP.

## 3. Output Required From Inventory

Produce one exact implementation work package containing:
- FEATURE;
- CANONICAL_SOURCE_OWNER;
- SUPPORTING_MODULES;
- exact files allowed to change;
- exact files read-only/forbidden;
- exact behavior changes;
- exact focused tests;
- build/dist verification requirement;
- STOP conditions for scope expansion.

Do not implement source in this inventory step.

## 4. App53 Production Hard Stop

```text
APP53_ENVIRONMENT            = PRODUCTION
APP53_DEFAULT_MODE           = READ_ONLY
LIVE_GET                     = 0
LIVE_POST                    = 0
LIVE_PUT                     = 0
LIVE_DELETE                  = 0
APP53_SCHEMA_WRITE           = 0
APP53_RECORD_WRITE           = 0
APP53_IMPORT_OR_BULK_WRITE   = 0
APP794_ACL_WRITE             = 0
GROUP_WRITE                  = 0
APP795_WRITE                 = 0
APP801_WRITE                 = 0
PROCESS_WRITE                = 0
CUSTOMIZATION_UPLOAD         = 0
DEPLOY                       = 0
ROLLBACK                     = 0
```

Do not open App53 for testing. Do not create/populate `MBO_Kintone_User`. Do not correct Natta `emp_text`.

## 5. Acceptance / Next Owner

Inventory is complete only when ChatGPT can name the smallest safe source implementation WP without guessing or broad scope expansion.

After inventory:
- ChatGPT updates `AI_CONTROL_CENTER.md` + `AI_ACTIVE_TASK.md`;
- only then assign Antigravity exact source/test work;
- protected Kintone configuration remains a separate future authorization gate.
