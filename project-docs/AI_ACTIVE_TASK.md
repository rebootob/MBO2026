# AI ACTIVE TASK — D1 HYBRID IDENTITY CORE SOURCE R1

Mode: **ANTIGRAVITY SOURCE / FOCUSED TEST ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

User approved the recommended Hybrid Identity blocker-resolution design on 2026-08-30.

Mandatory Baseline:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` only for existing route/topology semantics
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

Audit evidence already accepted:
- `project-docs/D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE.md`

Current live/config facts:
```text
App53 MBO_Kintone_User field      = NOT YET CREATED
App53 schema write auth           = NONE
App53 record write auth           = NONE
App794 ACL/group write auth       = NONE
Deploy auth                       = NONE
Natta App53 #578 emp_text         = BLANK
Vassana App53 #456 emp_text       = 0044
```

This task implements **pure/core source behavior only** so it can be independently reviewed before any protected Kintone configuration write.

## 1. Ownership / Low-Credit Rule

```text
OWNER = ANTIGRAVITY
SCOPE = CORE SOURCE + FOCUSED TESTS ONLY
```

Do not broad-scan the repository. Read the files listed below and only directly required existing tests/importers.

Do not edit Control Plane documents:
- `AI_CONTROL_CENTER.md`
- `AI_ACTIVE_TASK.md`
- `CONFIRMED_BASELINE/*`

## 2. Required Core Behavior A — Dedicated App53 Mapping Resolver

Canonical future App53 field:

```text
MBO_Kintone_User : USER_SELECT
Number_0         : active status, require 1
emp_text          : canonical Employee_Code
```

Implement/reconcile one canonical service owner for dedicated mapping.

Required behavior:
1. input current Kintone User Code must be exact nonblank string;
2. `admin-form` must never bind Employee-Self;
3. candidate source is App53 records only;
4. matching candidate must have `Number_0 = 1`;
5. `MBO_Kintone_User.value` must be an array containing exactly one selected Kintone user;
6. selected user's `.code` must exactly equal current Kintone User Code;
7. exactly one matching active row is required;
8. matching row must contain valid nonblank canonical `emp_text` Employee_Code;
9. zero match -> `IDENTITY_MAPPING_MISSING`;
10. >1 match -> `IDENTITY_MAPPING_AMBIGUOUS`;
11. matching row with blank/invalid `emp_text` -> fail closed; do not use `Number`, `Text_6`, email, name, or guessed value;
12. return bound Employee_Code + exact Kintone User Code only after all gates pass.

Do not keep the current latent `Kintone_User_Code` / `Account_Status` pseudo-source as the canonical path if it conflicts with this Baseline. Preserve backward compatibility only when clearly isolated and not used by the new canonical resolver.

### Required target tests

At minimum:
- Vassana-like valid row: `vassana` + active + `emp_text=0044` -> bound 0044;
- Natta-like row: `natta` + active + blank `emp_text` -> fail closed;
- mapping field missing -> missing/fail closed;
- selected user array empty -> missing/fail closed;
- selected user array has 2 users -> fail closed;
- inactive row -> missing/fail closed;
- duplicate active mapping rows -> ambiguous;
- wrong Kintone user -> missing;
- `admin-form` -> denied, never bound;
- name/email similarity alone -> never considered.

## 3. Required Core Behavior B — Effective Requester Resolution

Pure helper/service behavior must support:

```text
DEDICATED mode:
Effective_Requester_User = exact dedicated Kintone User

SHARED mode:
Effective_Requester_User = authoritative App795 Requester_User
```

Rules:
- dedicated mode must not require App795 Requester_User membership solely to create own requester snapshot;
- shared behavior must remain unchanged;
- missing dedicated mapping must not silently fall back to shared identity;
- `admin-form` remains no business requester authority.

Do not integrate UI/session switching in this R1 unless required by an existing canonical owner and covered by focused tests. Main-App/Home integration belongs to a later reviewed WP.

## 4. Required Core Behavior C — Own-MBO Self-Appraiser Elision

Implement one pure/canonical routing transformation owned by routing service or the existing canonical routing owner.

Input:
- authoritative resolved App795 route;
- current dedicated Kintone User Code;
- explicit context proving this is the employee's **own MBO**.

Rules:
1. if not own-MBO context, route must be returned unchanged;
2. if own route contains no self appraiser, route unchanged;
3. if own route contains self, remove only the self appraiser from the effective route before App794 workflow snapshot;
4. preserve remaining approver order and existing applicable approval rules;
5. recalculate effective technical topology using the repository's existing supported topology conventions;
6. never auto-approve;
7. never generate approval timestamp/comment/history event;
8. do not modify App795 source record/data;
9. do not alter subordinate/other-employee TMG1/TMG2 Marketing route behavior;
10. if no non-self appraiser remains, fail closed with a clear deterministic error/status;
11. transformation must be deterministic and side-effect free; do not mutate the original route object.

### Mandatory Natta test

Input master route equivalent to:
```text
Routing_Key = TMG1|Marketing
Manager L1  = natta
GM L1       = uchida
Topology    = M1_G1
current dedicated user = natta
ownMbo = true
```

Expected effective route:
```text
1st effective appraiser = uchida
Manager_User             = uchida
GM_User                  = empty
Routing_Topology         = M1_ONLY
self approval event      = none
```

The same route with `ownMbo=false` must remain:
```text
natta -> uchida
M1_G1
```

Also test:
- no-self route unchanged;
- self-only route -> fail closed;
- input object not mutated;
- supported generic topology behavior remains internally consistent with existing topology tests.

## 5. Exact Allowed Source Scope

Primary allowed source files:
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js` only if the canonical App53 mapping lookup belongs there
- `src/services/routing-service.js`

Existing directly related focused test files may be edited. If no suitable existing identity/self-route test owner exists, **one** new focused test file may be created with a clear domain name; do not proliferate test files.

Read-only unless a proven compile/test dependency requires otherwise:
- `src/main-mbo-app.js`
- `src/services/annual-record-service.js`
- current route/integration tests
- `package.json`

### STOP rule for scope expansion

If correct implementation requires editing `src/main-mbo-app.js`, UI files, build/deploy scripts, App794 field schema, ACL scripts, or more than the three primary source owners above, STOP and report the exact dependency. Do not widen this WP automatically.

## 6. Forbidden Actions

```text
LIVE_GET                    = 0 unless user/Control Plane separately requests evidence
LIVE_POST                   = 0
LIVE_PUT                    = 0
LIVE_DELETE                 = 0
APP53_SCHEMA_WRITE          = 0
APP53_RECORD_WRITE          = 0
APP794_APP_ACL_WRITE        = 0
APP794_RECORD_ACL_WRITE     = 0
GROUP_CREATE_OR_MEMBERSHIP  = 0
APP795_WRITE                = 0
APP801_WRITE                = 0
PROCESS_WRITE               = 0
CUSTOMIZATION_UPLOAD        = 0
DEPLOY                      = 0
PASSWORD_RESET_EXECUTION    = 0
ROLLBACK                    = 0
```

Do not create/populate `MBO_Kintone_User` in live Kintone.
Do not create `MBO_DEDICATED_ACCESS` in live Kintone.
Do not guess Natta Employee_Code.

## 7. Verification Minimum

Run focused tests for:
- dedicated mapping resolver;
- effective requester logic;
- own-MBO self-appraiser elision;
- existing App795 team/executive topology regression directly affected.

Then run full `npm test` if practical.
Run `git diff --check`.

Evidence must report:
- exact changed files;
- focused test counts;
- full suite result or exact unrelated/blocking failure;
- zero live mutation/deploy counts;
- explicit statement that Natta blank Employee_Code remains fail-closed and was not invented.

Create one new evidence file:

`project-docs/D1_HYBRID_IDENTITY_CORE_SOURCE_R1_EVIDENCE.md`

Do not edit historical evidence.

## 8. Acceptance Ceiling

Maximum executor status:

```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1_READY_PENDING_CHATGPT_REVIEW
```

This source result does NOT authorize App53 schema/data write, group/ACL write, App794 deployment, or live UAT.

## 9. Commit / Stop

If tests are acceptable:
1. commit focused changes;
2. push to `ai/antigravity-wp002c`;
3. STOP;
4. next owner = ChatGPT independent review.

If scope expansion or a security ambiguity is discovered, STOP without improvising a larger architecture.
