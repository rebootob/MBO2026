# AI ACTIVE TASK — M10M-R2A LIVE MASTER CORRECTION

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Blocked implementation commit: `44fa76df801e692631a005a9f1a25b82705931a4`
> App53: READ-ONLY
> App794: Sandbox only
> App795: Sandbox Routing Master — WRITE AUTHORIZED ONLY FOR THIS TASK AFTER BACKUP
> App796: Sandbox — inspect/read first; write only if actual config requires correction
> Production authorization: NONE
> Final status required: `READY FOR CHATGPT REVIEW`

---

## 0. CONTROL-PLANE REVIEW RESULT — BLOCKED

The user manually checked App795 (`https://ttmet.cybozu.com/k/795/`) and confirmed that the following Executive Direct routing rows are **NOT PRESENT**:

```text
POSITION_DGM
POSITION_GM
POSITION_VP
```

Therefore the prior R2 evidence claim:

```text
APP795_EXECUTIVE_ROWS = POSITION_DGM, POSITION_GM, POSITION_VP
APP795_READBACK = PASS
```

is false / unsupported and MUST NOT remain as accepted evidence.

M10M-R2 is **BLOCKED** until real App795 Sandbox master data exists and is read back successfully.

Do not claim PASS based on unit mocks, local arrays, planned data, or documentation text.

---

## 1. CONFIRMED BUSINESS RULE

For these Employee Positions from App53:

```text
Deputy General Manager (DGM)
General Manager (GM)
Vice President (VP)
```

required route is:

```text
DGM / GM / VP
      ↓
President
      ↓
1st Appraiser only
```

Exactly one appraiser slot.

Forbidden:

```text
President → President
```

Executive Direct topology is conceptually:

```text
M1_ONLY
```

User-facing label:

```text
ผู้ประเมินลำดับที่ 1 / 1st Appraiser
```

Do not expose `Manager_Level1_Approvers` as a business role label; it is compatibility storage only.

---

## 2. MANDATORY STARTUP

Pull latest branch and confirm clean/safe state:

```text
git status
git branch --show-current
git log -5 --oneline
```

Read before work:

1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
3. `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
5. `project-docs/AI_ACTIVE_TASK.md`
6. `project-docs/AI_REVIEW_PACKAGE.md`
7. relevant routing/process/scoring source and deployment scripts

Important: the current baseline/documentation may contain the premature claim `SANDBOX IMPLEMENTED / REVIEW PENDING`. Because the user confirmed App795 rows do not exist, treat that runtime-implementation claim as incorrect until corrected by this task.

---

## 3. DO NOT REWRITE THE ROUTING ENGINE

The R2 code direction is acceptable in principle:

- Position normalization for DGM / GM / VP
- dedicated keys `POSITION_DGM`, `POSITION_GM`, `POSITION_VP`
- `M1_ONLY`
- `GM_User = []`
- no President duplication

Do not rewrite this architecture unless live Kintone constraints prove it invalid.

Focus this task on closing the real Sandbox configuration/evidence gap and any real Process/config mismatch discovered during live verification.

---

## 4. APP795 — REAL SANDBOX DISCOVERY FIRST

Before any write:

### 4.1 Read schema

Read actual App795 form/schema and document exact field codes/types used for:

```text
Routing_Key
Section_Code (if present/used)
Team (if present/used)
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
Active
```

Do not guess a field.

### 4.2 Read all active routing rows

Capture:

```text
PREWRITE_ACTIVE_ROUTE_COUNT
```

Verify existing 17-route baseline and exact TMG routes before mutation.

Specifically confirm existing keys include:

```text
TMG2|CAD
TMG2|Production
TMG2|Marketing
```

Do not modify or duplicate those rows.

### 4.3 Confirm executive rows are absent

Required pre-write evidence:

```text
POSITION_DGM = NOT_FOUND
POSITION_GM  = NOT_FOUND
POSITION_VP  = NOT_FOUND
```

If any are unexpectedly present, STOP and reconcile with user observation before writing.

---

## 5. PRESIDENT DESTINATION — NO INVENTION

Determine the real Sandbox Kintone user identity representing the currently approved President destination from authoritative Kintone configuration/data.

Do not invent:

```text
president
somcai_president
email guesses
employee-name-derived user codes
```

App53 may be used READ-ONLY for employee/business identity context, but App53 employee name alone is not sufficient proof of a Kintone User code.

Record evidence:

```text
PRESIDENT_KINTONE_USER_CODE = <actual value>
PRESIDENT_DISPLAY_NAME = <actual value if available>
PRESIDENT_IDENTITY_SOURCE = <where verified>
```

If the President Kintone destination cannot be verified, STOP. Do not write App795.

---

## 6. REQUESTER_USER FOR EXECUTIVE ROWS

Do not leave `Requester_User` blank unless an existing reviewed rule explicitly supports it.

Do not make blank requester mean allow-all.

Inspect the actual requester boundary used by the Sandbox workflow and determine the correct authorized `Requester_User` for the Executive Direct rows.

Because general employees may operate through a shared Kintone account, preserve the existing Kintone requester-boundary model; do not confuse Requester_User with the employee identity from App53.

Document the selected requester configuration before write.

---

## 7. BACKUP GATE BEFORE APP795 WRITE

Before writing App795:

1. Export/read snapshot of all active App795 records.
2. Record record IDs and all routing fields needed to restore.
3. Store backup in the project's established safe backup/evidence location.
4. Record pre-write active row count.
5. Verify no duplicate target keys already exist.
6. Prepare rollback instructions.

No App795 write is allowed before this gate passes.

---

## 8. CREATE REAL APP795 EXECUTIVE ROWS

Create exactly three active Executive Direct routing rows unless actual schema requires an equivalent representation:

### Row A

```text
Routing_Key = POSITION_DGM
Requester_User = <verified requester boundary>
Manager_Level1_Approvers = [<verified President Kintone user>]
Manager_Level2_Approvers = []
GM_Level1_Approvers = []
GM_Level2_Approvers = []
Active = Active
```

### Row B

```text
Routing_Key = POSITION_GM
Requester_User = <verified requester boundary>
Manager_Level1_Approvers = [<verified President Kintone user>]
Manager_Level2_Approvers = []
GM_Level1_Approvers = []
GM_Level2_Approvers = []
Active = Active
```

### Row C

```text
Routing_Key = POSITION_VP
Requester_User = <verified requester boundary>
Manager_Level1_Approvers = [<verified President Kintone user>]
Manager_Level2_Approvers = []
GM_Level1_Approvers = []
GM_Level2_Approvers = []
Active = Active
```

Do not put President in both M1 and G1.

Do not alter the 17 existing normal routes.

Expected active route count after successful creation, if baseline count is still exactly 17:

```text
20
```

But use actual pre-write count + 3 rather than blindly assuming 20.

---

## 9. APP795 POST-WRITE READ-BACK — MANDATORY

After write, query App795 again from Kintone.

For each key, record:

```text
Record ID
Routing_Key
Requester_User
Manager_Level1_Approvers
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
Active
```

Required invariant for all three:

```text
exactly 1 active row per key
exactly 1 President in first appraiser slot
0 second-manager appraisers
0 GM-level appraisers
no duplicate President
```

Only after this may you state:

```text
APP795_READBACK = PASS
```

Screenshots alone are helpful but not sufficient; include structured API/read-back evidence.

---

## 10. APP794 PROCESS MANAGEMENT — VERIFY REAL NATIVE PATH

Do not confuse JavaScript/UI `WORKFLOW_PATH_M1_ONLY` with native Kintone Process Management.

Read actual App794 Sandbox Process Management configuration.

Current known baseline has 16 states / 28 actions and normal M1_G1 uses states 03→04, 08→09, 13→14.

For `M1_ONLY`, verify the native Process can actually perform:

```text
Goal:
01 Draft Objective
→ 03 Manager Objective Review (President as 1st Appraiser)
→ 05 Objective Approved

Mid-Year:
06 Employee Mid-Year
→ 08 Manager Mid-Year Review (President)
→ 10 Mid-Year Completed

Final:
11 Employee Self Evaluation
→ 13 Manager Final Evaluation (President)
→ 15 HR Final Check
→ 16 Completed
```

Required skips:

```text
04 GM Objective Review
09 GM Mid-Year Review
14 GM Final Evaluation
```

### Critical rule

If native Kintone Process Management does NOT contain safe M1_ONLY actions/conditions to make these skips based on topology, do NOT claim:

```text
APP794_PROCESS_EXEC_DIRECT = PASS
```

Instead implement the minimum Sandbox Process change required, with:

- pre-write Process backup
- semantic diff
- preservation of all M1_G1 actions
- no production write
- post-deploy read-back
- regression verification

Do not remove 04/09/14 globally. They remain required for normal M1_G1 routes.

---

## 11. VALIDATION ENGINE — ACTION SEMANTICS

Check that `M1_ONLY` does not merely suppress the `GM_User missing` error while still sending the native action to a GM-review state.

For each phase, validate the action/transition itself is topology-correct.

Required:

```text
M1_ONLY at 03 -> next = 05
M1_ONLY at 08 -> next = 10
M1_ONLY at 13 -> next = 15
```

Normal M1_G1 remains:

```text
03 -> 04 -> 05
08 -> 09 -> 10
13 -> 14 -> 15
```

Add tests against action selection/validation, not just UI path arrays.

---

## 12. APP796 — VERIFY REAL SCORING MASTER

Read actual App796 Sandbox rows for:

```text
PROF_DGM
PROF_GM
PROF_VP
```

Required business configuration:

```text
Expected_Appraiser_Count = 1
PartA_Weight = 50
PartB_Weight = 50
```

Do not claim `APP796_READBACK = PASS / NO_WRITE_REQUIRED` based only on `getCanonicalBaselineMasterConfigs()` source code.

If App796 actual values differ:

1. backup affected rows;
2. show Before → After;
3. update only these profiles;
4. read back from Kintone;
5. preserve all other scoring fields.

If they already match, record actual Record IDs and values and make zero writes.

---

## 13. APP53 READ-ONLY

No writes to App53.

Use confirmed baseline / read-only data for position context.

No employee master mutation is authorized.

---

## 14. TESTS — REQUIRED

Keep all existing R2 tests and add live/config guards where testable.

Minimum required local tests:

```text
DGM -> POSITION_DGM -> M1_ONLY
GM -> POSITION_GM -> M1_ONLY
VP -> POSITION_VP -> M1_ONLY
President exists in exactly one appraiser array
GM_User = []
missing executive route -> fail closed
duplicate executive route -> fail closed
blank Requester_User does not authorize ordinary user
TMG2 CAD/Production/Marketing unchanged
normal non-TMG route unchanged
M1_ONLY action path skips 04/09/14
M1_G1 action path still includes 04/09/14
PROF_DGM/GM/VP expected appraiser count = 1
Part A/B remains 50/50
```

Run full suite and build.

---

## 15. CORRECT FALSE / PREMATURE DOCUMENTATION

Update `project-docs/AI_REVIEW_PACKAGE.md`.

Do not preserve unsupported claims from R2.

The prior claim that App795 read-back already passed must be explicitly marked rejected/corrected.

Also reconcile `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`:

- Until real App795 + App794 native Process + App796 verification passes, status must NOT say runtime implementation is complete.
- After all gates pass, update baseline to the exact verified Sandbox state.

Do not alter user-confirmed business rule DGM/GM/VP → President single appraiser; only correct implementation-status claims.

---

## 16. REQUIRED REVIEW EVIDENCE

Final evidence must contain at minimum:

```text
M10M_R2A = READY_FOR_REVIEW
PRIOR_R2_REVIEW = BLOCKED_FALSE_APP795_READBACK
APP795_PREWRITE_ACTIVE_COUNT = <n>
APP795_POSITION_DGM_RECORD_ID = <id>
APP795_POSITION_GM_RECORD_ID = <id>
APP795_POSITION_VP_RECORD_ID = <id>
APP795_POSTWRITE_ACTIVE_COUNT = <n+3>
APP795_READBACK = PASS
PRESIDENT_KINTONE_USER_CODE = <actual verified code>
PRESIDENT_DUPLICATION_COUNT = 0
APP794_NATIVE_M1_ONLY_PATH = PASS
APP794_PROCESS_PRE_POST_REVISION = <before> -> <after or unchanged>
APP796_DGM_RECORD_ID = <id>
APP796_GM_RECORD_ID = <id>
APP796_VP_RECORD_ID = <id>
APP796_READBACK = PASS
APP53_WRITE_COUNT = 0
PRODUCTION_WRITE_COUNT = 0
NORMAL_M1_G1_REGRESSION = PASS
TMG2_REGRESSION = PASS
NPM_TEST = PASS (<count>/<count>)
BUILD = PASS
```

If any value cannot be proven from real Kintone read-back, do not write PASS.

---

## 17. ROLLBACK

Document exact rollback:

### App795
Delete/revert only the three Executive rows created by this task, restoring the exact pre-write snapshot.

### App794 Process
If changed, restore exact pre-write Process config and verify revision/semantic parity.

### App796
If changed, restore exact pre-write values for PROF_DGM / PROF_GM / PROF_VP only.

### Git
Provide parent commit and revert procedure.

---

## 18. STOP CONDITION

After all required live evidence, tests, build, and documentation corrections:

1. inspect `git diff`;
2. confirm no credentials/secrets were committed;
3. commit and push same branch;
4. do not self-approve;
5. stop exactly at:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```

If App795 rows were not actually created and read back, final status MUST NOT be READY FOR REVIEW.
