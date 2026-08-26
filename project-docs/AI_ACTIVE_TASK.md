# AI ACTIVE TASK — M10M-R2 EXECUTIVE DIRECT ROUTING (DGM / GM / VP → PRESIDENT)

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Parent implementation under correction: `611003a10f2ce26b2f08fa3821d65d0530169667`
> Target: Executive Direct routing for **DGM / GM / VP**
> App53: READ-ONLY employee source
> App794: Sandbox code / UI / Process Management only as required by this task
> App795: Sandbox Routing Master
> App796: Sandbox scoring configuration only if required to align expected appraiser count
> Production authorization: **NONE**
> Final status required: `READY FOR CHATGPT REVIEW`

---

## 0. CONTROL-PLANE REVIEW RESULT

M10M-R1 corrected the earlier hard-coded-President and requester-authorization defects, but it is still **BLOCKED** for runtime completion because:

1. `POSITION_GM` was proven only by unit mocks; no real App795 master-row/read-back evidence was supplied.
2. The R1 GM result puts the same President into both `Manager_Level1_Approvers` and `GM_Level1_Approvers` while returning `M1_G1`, which can represent President twice instead of one Executive Direct appraiser.
3. The confirmed business target is now explicitly expanded by the user to **DGM / GM / VP**.

Do not deploy R1 as complete.

This R2 task must close Executive Direct routing end-to-end in Sandbox with minimum blast radius.

---

## 1. MANDATORY STARTUP

Pull latest branch and verify local HEAD equals origin.

Capture:

```text
git status
git branch --show-current
git log -5 --oneline
```

Read completely before implementation:

1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
3. `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `project-docs/BUSINESS_RULES.md`
6. `project-docs/ARCHITECTURE.md`
7. `project-docs/FIELD_DICTIONARY.md`
8. `project-docs/APP_REGISTRY.md`
9. `project-docs/AI_ACTIVE_TASK.md`
10. `project-docs/CURRENT_STATE.md`
11. `project-docs/HANDOFF.md`
12. `project-docs/AI_REVIEW_PACKAGE.md`

Confirmed Baseline is authoritative.

---

## 2. USER-CONFIRMED BUSINESS RULE — EXECUTIVE DIRECT

The following requester Positions must use **Executive Direct** routing:

```text
Deputy General Manager (DGM)
General Manager (GM)
Vice President (VP)
```

Required business route for all three:

```text
DGM / GM / VP
      ↓
President
      ↓
1st Appraiser only
```

President is the **single evaluator/appraiser/approval route member** for this executive route.

Forbidden result:

```text
President
↓
President
```

There must be exactly **1 configured appraiser slot** for the Executive Direct route.

User-facing label remains:

```text
ผู้ประเมินลำดับที่ 1 / 1st Appraiser
```

Do not use `Manager`, `GM`, or `President` as the route-slot label. `President` may appear only as the resolved person's position/name context.

---

## 3. POSITION NORMALIZATION

Use exact, controlled normalization; do not use broad substring matching.

Canonical routing classes:

```text
Deputy General Manager → DEPUTY_GENERAL_MANAGER
DGM                    → DEPUTY_GENERAL_MANAGER   (only if present/confirmed as a source value)

General Manager        → GENERAL_MANAGER
General manager        → GENERAL_MANAGER
GM                     → GENERAL_MANAGER          (only if present/confirmed as a source value)

Vice President         → VICE_PRESIDENT
VP                     → VICE_PRESIDENT           (only if present/confirmed as a source value)
```

Requirements:
- trim leading/trailing whitespace;
- case-insensitive exact normalization for confirmed labels;
- do not treat `Assistant General Manager`, `Senior Manager`, `Factory Manager`, or unrelated titles as Executive Direct by substring;
- App53 remains READ-ONLY.

If live App53 read is available, record exact active raw values for DGM/GM/VP. Otherwise use confirmed baseline and existing profile definitions, clearly stating live App53 read was unavailable.

---

## 4. ROUTING PRECEDENCE

Required resolver precedence:

```text
1. Normalize Position
2. Is canonical Position one of:
   - DEPUTY_GENERAL_MANAGER
   - GENERAL_MANAGER
   - VICE_PRESIDENT

   YES → Executive Direct App795 routing
   NO  → existing normal routing

3. Existing TMG exact Section|Team rule
4. Existing non-TMG Section rule
5. Missing/duplicate/incomplete route → FAIL CLOSED
```

For an Executive Direct employee, Section/Team must not override the Position rule.

Examples:

```text
DGM + any Section/Team → President only
GM  + TMH3             → President only
GM  + TMG2|CAD         → President only
VP  + any Section/Team → President only
```

---

## 5. APP795 — REAL EXECUTIVE MASTER DATA

### 5.1 Read First

Before any App795 write:

1. Read actual App795 Sandbox schema.
2. Read all active routing rows.
3. Record current count.
4. Confirm current 17 normal active rows and exact TMG routes.
5. Confirm real destination-user field structure.
6. Determine the real Kintone President user identity from authoritative available data. Do **not** infer a user code from App53 employee name alone.
7. Export/pre-write snapshot and ensure rollback material exists.

### 5.2 Preferred Routing Keys

Use existing `Routing_Key` architecture; do not add Position/Priority fields unless absolutely necessary.

Preferred dedicated keys:

```text
POSITION_DGM
POSITION_GM
POSITION_VP
```

Each must resolve to the same currently valid President destination under the user-confirmed rule.

If a single shared master key is clearly safer under the existing schema, document the reason and preserve deterministic position-to-route mapping. Do not silently change convention.

### 5.3 Single-Appraiser Data Contract

Executive route records must represent one appraiser only.

Preferred compatibility model, subject to actual existing field contract:

```text
Manager_Level1_Approvers = [President]
Manager_Level2_Approvers = []
GM_Level1_Approvers      = []
GM_Level2_Approvers      = []
```

Do **not** put President into both Manager L1 and GM L1 merely to fit `M1_G1`.

The technical field name `Manager_Level1_Approvers` is compatibility storage only. User-facing UI must still call it `1st Appraiser`.

If existing Process/contract requires a different single-slot storage choice, inspect and document it before changing data; the invariant is **one President, one appraiser slot, one action stage per evaluation phase**.

### 5.4 Requester Authorization

Preserve the confirmed `Requester_User` authorization boundary.

- Never treat blank `Requester_User` as allow-all.
- Do not invent requester identities.
- Reuse/derive the correct approved Sandbox requester boundary from actual existing routing/business configuration.
- If the correct requester boundary cannot be determined safely, STOP before App795 write and report the blocker.

### 5.5 Before → After / Read-back

For every new/changed executive record, evidence must show:

```text
Routing Key
Requester_User
1st appraiser storage field
President Kintone user code/name returned by Kintone
other approver fields = empty as required
Active
Record ID
```

Read back exact values after write.

No production write.

---

## 6. APP794 — TRUE SINGLE-APPRAISER TOPOLOGY

R2 must not reuse `M1_G1` semantics if that causes two appraiser stages.

Inspect the actual resolver, route parser, UI, validation, and Process Management behavior and implement a deterministic **single-appraiser technical topology**.

Recommended conceptual topology:

```text
M1_ONLY
```

If an equivalent single-appraiser topology already exists, reuse it instead of inventing another code.

Required invariants:

```text
Expected appraiser slots = 1
Appraiser 1 = President
Appraiser 2 = absent
Appraiser 3 = absent
Appraiser 4 = absent
```

The resolver must return one President only and must not alias/copy that person into a second compatibility field.

Unknown topology must remain fail closed.

---

## 7. APP794 PROCESS MANAGEMENT — EXECUTIVE DIRECT PATH

The current normal M1_G1 path contains two review stages per phase. Executive Direct requires only one President review stage per phase.

Do not redesign the 5 macro phases. Do not remove existing normal states/routes.

Inspect current Process states/actions and add the **minimum topology-guarded bypass/transition support** required so single-appraiser executive records use one appraiser stage per phase.

Preferred minimum-blast-radius concept if compatible with current architecture:

### Goal Setting

```text
01 Draft Objective
→ 03 Manager Objective Review   [technical legacy state; user-facing 1st Appraiser]
→ 05 Objective Approved
```

Skip `04 GM Objective Review` for single-appraiser topology.

### Mid-Year

```text
06 Employee Mid-Year
→ 08 Manager Mid-Year Review    [technical legacy state; user-facing 1st Appraiser]
→ 10 Mid-Year Completed
```

Skip `09 GM Mid-Year Review`.

### Final Evaluation

```text
11 Employee Self Evaluation
→ 13 Manager Final Evaluation   [technical legacy state; user-facing 1st Appraiser]
→ 15 HR Final Check
→ 16 Completed
```

Skip `14 GM Final Evaluation`.

This is a recommended compatibility path, not permission to blindly edit Process Management. First verify that existing appraiser-slot/UI/action logic maps Appraiser 1 to these technical states.

If using Manager technical states would violate existing contracts, choose the smallest safe single-stage path and document why.

### Return / Resubmit

For Executive Direct, President must be able to return to the employee edit state using the existing business pattern:

```text
Goal return   → 01 Draft Objective
Mid-Year return → 06 Employee Mid-Year
Final return  → 11 Employee Self Evaluation
```

Resubmit must return to the same single President stage, not to a skipped second appraiser stage.

### Guards

- Normal existing M1_G1 records must continue their current two-appraiser path unchanged.
- Executive Direct records must never enter the second-appraiser GM technical states.
- Existing First-Manager states remain unavailable unless their topology genuinely requires them.
- Route/topology mismatch must fail closed.

Any Process write requires pre-write backup, exact semantic diff, post-write read-back, and rollback evidence.

---

## 8. APP796 — SCORING CONFIGURATION CONSISTENCY

Direct-to-President as one evaluator requires the scoring model to expect one appraiser for the executive profiles.

Read App796 Sandbox configurations for:

```text
PROF_DGM
PROF_GM
PROF_VP
```

Verify at minimum:

```text
Expected_Appraiser_Count
Part A / Part B ratio
published/active state
```

Part A / Part B weighting remains confirmed:

```text
DGM = 50 / 50
GM  = 50 / 50
VP  = 50 / 50
```

Do not change 50/50.

Required Executive Direct scoring target:

```text
Expected_Appraiser_Count = 1
```

for `PROF_DGM`, `PROF_GM`, and `PROF_VP`.

If all three already equal 1, no App796 write.

If any differ, make only the minimum Sandbox configuration change after:
- backup;
- Before → After evidence;
- validation against publish-integrity rules;
- read-back.

Do not modify unrelated profiles.

One appraiser means that single President appraiser receives 100% of the appraiser contribution under the confirmed equal-distribution rule. This does **not** change Part A / Part B 50/50 weighting.

---

## 9. ROUTE PREVIEW / UI

Executive route display must be truthful.

Required business-facing display:

```text
Route Scenario: Executive Direct — 1 Appraiser
Position: DGM / GM / VP
1st Appraiser: <resolved President name>
Source: App795
Routing Key: POSITION_DGM / POSITION_GM / POSITION_VP (or reviewed equivalent)
```

Do not display:
- fake second appraiser;
- `President → President`;
- fake master-data priority;
- `Preview Only / Routing Pending` after the Sandbox implementation has actually been read-back and deployed successfully.

Before implementation is proven, Preview may continue to show Pending.

Technical state names may remain secondary diagnostics only.

---

## 10. TMG2 RULES — PRESERVE

R2 must preserve the confirmed TMG2 behavior:

```text
TMG2|CAD
TMG2|Production
TMG2|Marketing
```

- TMG2 CAD is one route across Die Casting / Injection context.
- No TMG2 Admin route.
- Missing Team → `TEAM_REQUIRED`.
- Unknown exact Team → `ROUTE_NOT_FOUND`.
- Duplicate route → `AMBIGUOUS_ROUTE`.
- No Section-only fallback.

Executive Position precedence must override TMG2 when the employee is DGM/GM/VP.

---

## 11. REQUIRED TEST MATRIX

### Position normalization

- DGM full canonical label → `DEPUTY_GENERAL_MANAGER`
- GM capitalization variants → `GENERAL_MANAGER`
- VP full canonical label → `VICE_PRESIDENT`
- Non-executive Manager/Section Manager must NOT normalize as executive

### Executive routing

TC01 DGM + normal Section → President only / 1 slot

TC02 GM + TMH3 → President only / 1 slot

TC03 GM + TMG2|CAD → President only; TMG2 route must not win

TC04 VP + any Section → President only / 1 slot

TC05 missing `POSITION_DGM` route → fail closed

TC06 missing `POSITION_GM` route → fail closed

TC07 missing `POSITION_VP` route → fail closed

TC08 duplicate executive route → `AMBIGUOUS_ROUTE`

TC09 executive route with no President destination → `APPROVER_NOT_FOUND`

TC10 blank Requester_User ordinary user → denied

### Topology

TC11 Executive route has exactly 1 appraiser slot

TC12 President is not duplicated into second appraiser slot

TC13 single-appraiser path skips technical second-appraiser states in all 3 evaluation phases

TC14 Executive return/resubmit returns to the same President stage

TC15 normal M1_G1 route still follows existing two-appraiser workflow unchanged

### TMG regression

TC16 TMG2 CAD → existing route

TC17 TMG2 Production → existing route

TC18 TMG2 Marketing → existing route

TC19 TMG2 missing Team → `TEAM_REQUIRED`

TC20 TMG2 unknown Team → `ROUTE_NOT_FOUND`

### Scoring

TC21 PROF_DGM expected appraiser count = 1

TC22 PROF_GM expected appraiser count = 1

TC23 PROF_VP expected appraiser count = 1

TC24 Part A/B remains 50/50 for all three

### UI

TC25 Executive Direct displays exactly 1st Appraiser = President and no 2nd Appraiser

---

## 12. REGRESSION / SAFETY GATES

Before any Sandbox deployment:

```text
npm test = PASS
build = PASS
focused R2 tests = PASS
requester authorization regression = PASS
normal M1_G1 regression = PASS
TMG regression = PASS
```

Before App795/App796/Process write:
- pre-write backup exists;
- current schema/read-back documented;
- affected records/config known;
- exact Before → After documented;
- rollback material verified.

After write:
- exact read-back PASS;
- no unrelated rows/config changed;
- Production write count = 0;
- App53 write count = 0.

Do not use real employees for destructive workflow tests. Use only controlled Sandbox UAT fixtures/accounts permitted by the confirmed baseline.

---

## 13. BASELINE UPDATE — MANDATORY IN SAME REVIEWED CHANGE

Because this is an approved business-rule change, update confirmed baseline files in the same R2 change after implementation/read-back evidence is known.

At minimum update:

### `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`

Replace the old `Future Executive Routing Target — NOT YET IMPLEMENTED` status with exact Sandbox truth, including:
- DGM / GM / VP → President;
- one appraiser only;
- technical single-appraiser topology chosen;
- App795 keys/records;
- Process path used;
- implementation status (`SANDBOX IMPLEMENTED / REVIEW PENDING` until ChatGPT approval, then closure can be marked reviewed).

Do not claim Production ready.

### `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`

Add confirmed DGM/GM/VP canonical Position normalization only for source values actually confirmed.

### `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`

If App796 is changed/read-back to one expected appraiser for DGM/GM/VP, document the confirmed executive appraiser-count rule while preserving 50/50 Part A/B.

Do not create duplicate baseline files.

---

## 14. REQUIRED REVIEW EVIDENCE

Update `project-docs/AI_REVIEW_PACKAGE.md` with an M10M-R2 section containing at minimum:

```text
M10M_R2 = READY_FOR_REVIEW
PARENT_R1_COMMIT = 611003a10f2ce26b2f08fa3821d65d0530169667
EXECUTIVE_POSITIONS = DGM, GM, VP
EXECUTIVE_DESTINATION = President
EXECUTIVE_APPRAISER_COUNT = 1
EXECUTIVE_TOPOLOGY = <actual chosen topology>
PRESIDENT_DUPLICATION_COUNT = 0
HARDCODED_PRESIDENT_COUNT = 0
BLANK_REQUESTER_ALLOW_ALL_COUNT = 0
APP795_EXECUTIVE_ROWS = <actual keys / record IDs>
APP795_READBACK = PASS
APP796_DGM_EXPECTED_APPRAISERS = 1
APP796_GM_EXPECTED_APPRAISERS = 1
APP796_VP_EXPECTED_APPRAISERS = 1
APP796_READBACK = PASS / NO_WRITE_REQUIRED
APP794_PROCESS_EXEC_DIRECT = PASS
NORMAL_M1_G1_REGRESSION = PASS
TMG2_REGRESSION = PASS
APP53_WRITE_COUNT = 0
PRODUCTION_WRITE_COUNT = 0
NPM_TEST = PASS
BUILD = PASS
```

Also include:
- exact App795 schema fields used;
- real President destination as returned from Kintone (do not expose secrets);
- Before/After tables for App795/App796/Process changes;
- Process state/action counts before and after;
- App794 revision before/after if deployed;
- tests and counts;
- git diff summary;
- commit SHA;
- rollback commands/procedure;
- remaining risks.

Do not describe unit mocks as live Kintone evidence.

---

## 15. STOP / BLOCK CONDITIONS

STOP the affected write/deploy and report if:

- President Kintone destination cannot be authoritatively resolved;
- requester boundary for executive master rows cannot be safely determined;
- App794 cannot represent a true single-appraiser path without an unreviewed broad workflow redesign;
- App796 configuration conflicts with one-appraiser completeness and cannot be safely repaired within Sandbox scope;
- any unrelated active route changes unexpectedly;
- any Production write would be required;
- backup/read-back/rollback gate fails.

Do not invent data to bypass a blocker.

---

## 16. DEFINITION OF DONE

M10M-R2 is ready for independent review only when:

- [ ] DGM / GM / VP normalization implemented from confirmed source labels
- [ ] Executive Position precedence overrides Section/Team
- [ ] App795 contains reviewed dedicated Executive Direct routing data
- [ ] President destination comes from App795, never hard-coded
- [ ] DGM → President only
- [ ] GM → President only
- [ ] VP → President only
- [ ] Exactly one appraiser slot
- [ ] President duplication count = 0
- [ ] App794 single-appraiser topology works
- [ ] Executive Process path has one appraiser stage per phase
- [ ] Return/resubmit works for Executive Direct
- [ ] Normal M1_G1 unchanged
- [ ] TMG2 rules unchanged
- [ ] PROF_DGM expected appraiser count = 1
- [ ] PROF_GM expected appraiser count = 1
- [ ] PROF_VP expected appraiser count = 1
- [ ] 50/50 Part A/B unchanged for DGM/GM/VP
- [ ] requester authorization preserved
- [ ] App53 writes = 0
- [ ] Production writes = 0
- [ ] npm test PASS
- [ ] build PASS
- [ ] Sandbox read-back evidence complete
- [ ] Confirmed Baseline updated in-place
- [ ] rollback documented
- [ ] final git status clean

Do not self-approve.

When complete, commit and push the same branch, then stop with exactly:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```
