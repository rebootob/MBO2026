# AI ACTIVE TASK — M10M-R2B APP796 PUBLISHED INTEGRITY CLOSURE — READ ONLY

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Parent execution under review: `89eee588a4638beca57cb165c16970e887e3d2b6`
> Target: App796 Sandbox published scoring integrity for `PROF_DGM`, `PROF_GM`, `PROF_VP`
> Kintone write/deploy authorization: **NONE**
> Previous M10M-R2A write authorization: **CONSUMED / CLOSED / MUST NOT BE REUSED**
> Required final status: `READY FOR CHATGPT REVIEW`

---

## 0. CONTROL-PLANE CLASSIFICATION

The M10M-R2A Executive Direct implementation is **HOLD_PENDING_APP796_INTEGRITY_REVIEW**.

Reason:

- M10M-R2A changed App796 `PROF_DGM.Expected_Appraiser_Count` from `2` to `1` by direct record PUT.
- `Expected_Appraiser_Count` is one of the 19 immutable payload fields used by `computeConfigurationHash()`.
- App796 records are published scoring configurations.
- The scoring lifecycle/publish service verifies immutable payload/hash equality and treats `PUBLISHED` as a lifecycle state that may transition only to `SUPERSEDED` or `RETIRED`; it does not define direct mutation of published immutable payload as a valid update path.

Therefore the prior evidence line:

```text
APP796_READBACK = PASS
```

proved only selected values, not published hash integrity.

This task must determine the actual live state using GET/read-only evidence only.

---

## 1. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Capture:

```text
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
```

Read completely, in this order:

1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
3. `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`
4. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
5. `project-docs/AI_ACTIVE_TASK.md`
6. `project-docs/CURRENT_STATE.md`
7. `project-docs/HANDOFF.md`
8. `project-docs/AI_REVIEW_PACKAGE.md`
9. `src/profiles/scoring-config-master.js`
10. `src/services/scoring-config-master-service.js`
11. `src/services/scoring-config-kintone-repository.js`

Confirmed Baseline is authoritative.

---

## 2. HARD SAFETY BOUNDARY — READ ONLY

This task authorizes only read-only discovery and local computation.

Allowed Kintone operations:

```text
GET only
```

Forbidden:

```text
POST = 0
PUT = 0
DELETE = 0
DEPLOY = 0
record update = 0
schema update = 0
ACL update = 0
Process update = 0
App794 write = 0
App795 write = 0
App796 write = 0
App53 write = 0
other-app write = 0
```

If any mismatch is found, **DO NOT REPAIR IT IN THIS TASK**.

Do not reuse the previous M10M-R2A authorization.

No browser workflow action. No notification action. No real-user workflow test.

---

## 3. SOURCE INTEGRITY CONTRACT TO VERIFY

`src/profiles/scoring-config-master.js` defines these 19 immutable payload fields:

```text
Master_Record_Key
Profile_Code
Profile_Family
Scoring_Config_Code
Scoring_Config_Version
Effective_From
Effective_To
Fiscal_Year
PartA_Weight
PartB_Weight
Expected_Appraiser_Count
Appraiser_Weight_Rule_Code
Part_A_Scoring_Mode
Competency_Set_Code
PartA_Rounding_Rule
PartB_Raw_Rounding_Rule
PartB_Weighted_Rounding_Rule
Final_Rounding_Rule
Supersedes_Config_Version
```

`Configuration_Hash` must equal SHA-256 produced by the repository's own:

```js
canonicalizeScoringConfigPayload(liveRecord)
computeConfigurationHash(canonicalPayload)
```

Do not implement a different hash algorithm as the primary proof.

Audit/lifecycle fields such as these are not part of the 19-field hash payload:

```text
Config_Status
Published_At
Published_By
Configuration_Hash
```

---

## 4. LIVE APP796 READ — EXACT SCOPE

Read the actual App796 Sandbox records for exactly:

```text
PROF_DGM
PROF_GM
PROF_VP
```

Prefer one GET query that returns all three records, or read the full eight-record App796 master if that is simpler under the existing helper. Do not mutate anything.

For each target profile capture the exact live values of:

```text
$id
$revision
all 19 immutable payload fields
Config_Status
Configuration_Hash
Published_By
Published_At
```

Also record duplicate count per `Profile_Code + Fiscal_Year + Config_Status=PUBLISHED`.

Required expected business values currently confirmed:

```text
PROF_DGM: PartA=50, PartB=50, Expected_Appraiser_Count=1
PROF_GM:  PartA=50, PartB=50, Expected_Appraiser_Count=1
PROF_VP:  PartA=50, PartB=50, Expected_Appraiser_Count=1
```

Do not treat those three values alone as integrity PASS.

---

## 5. RECOMPUTE HASH FROM LIVE PAYLOAD

For each of DGM / GM / VP:

1. Flatten the Kintone record into the values expected by `canonicalizeScoringConfigPayload()`.
2. Run `canonicalizeScoringConfigPayload(livePayload)` from current repo source.
3. Run `computeConfigurationHash(canonicalPayload)` from current repo source.
4. Compare:

```text
STORED_CONFIGURATION_HASH
vs
RECOMPUTED_LIVE_CONFIGURATION_HASH
```

Record exact full 64-character hashes.

Primary integrity condition:

```text
Config_Status == PUBLISHED
AND Stored Configuration_Hash is nonblank
AND Stored Configuration_Hash == Recomputed live hash
AND Master_Record_Key == Profile_Code + "::" + Scoring_Config_Version
AND exactly one published config exists for that Profile_Code/Fiscal_Year effective scope
```

Do not change any field even if this condition fails.

---

## 6. CONTROL-PLANE DIAGNOSTIC HASHES — SECONDARY ONLY

These values were independently precomputed by the Control Plane from the current canonical source and are diagnostic cross-checks only. The primary proof remains recomputation from **actual live fields** using repo functions.

```text
CURRENT_SOURCE_EXPECTED_HASH_PROF_DGM_COUNT1 = 6067f92597eed02c50e472c8f99081ba9c7fe7bc14a69b58273e380c510bf043
CURRENT_SOURCE_EXPECTED_HASH_PROF_GM_COUNT1  = 49b6912644339418e5f685dd9d90d3dd764a857449bf48ce2cf7cc0259c68130
CURRENT_SOURCE_EXPECTED_HASH_PROF_VP_COUNT1  = a3157a453fed67544428160809e4353e229b6fabe1c740aec22ef8477795d452
```

Historical DGM source immediately before the R2 count change used `Expected_Appraiser_Count = 2`. Its diagnostic hash under the then-canonical payload is:

```text
HISTORICAL_DGM_COUNT2_HASH_DIAGNOSTIC = dbf21f31100d3a6878e1ffc5e5866f0fb0284596abda8b1f3555141e8337c10e
```

If live DGM has:

```text
Expected_Appraiser_Count = 1
Stored Configuration_Hash = historical count-2 hash
Recomputed live hash = current count-1 hash
```

classify explicitly as:

```text
PUBLISHED_IMMUTABLE_MUTATION_CONFIRMED
```

Do not repair.

If diagnostic hashes differ because another immutable live field differs from current source, report the exact differing immutable field(s); do not force a conclusion from the diagnostic constants.

---

## 7. REQUIRED RECORD-BY-RECORD RESULT

Produce a compact table/evidence block for all three profiles:

```text
PROFILE_CODE
RECORD_ID
REVISION
CONFIG_STATUS
MASTER_RECORD_KEY
EXPECTED_APPRAISER_COUNT
PART_A_WEIGHT
PART_B_WEIGHT
STORED_HASH
RECOMPUTED_LIVE_HASH
HASH_MATCH = PASS | FAIL
PUBLISHED_UNIQUE = PASS | FAIL
PUBLISH_AUDIT_FIELDS_PRESENT = PASS | FAIL
INTEGRITY_RESULT = PASS | FAIL
```

If any immutable field is malformed/missing and canonicalization fails, classify that profile as FAIL and include the exact canonicalization error.

---

## 8. OVERALL CLASSIFICATION

Use exactly one overall result:

### A. All three pass

```text
APP796_PUBLISHED_INTEGRITY = PASS
M10M_R2A_APP796_GATE = PASS
```

### B. DGM or any target hash mismatch / published immutable mutation

```text
APP796_PUBLISHED_INTEGRITY = MUST_FIX
M10M_R2A_APP796_GATE = BLOCKED_PENDING_REPAIR_DESIGN
```

### C. Cannot obtain complete read-only evidence

```text
APP796_PUBLISHED_INTEGRITY = BLOCKED_READ_EVIDENCE
M10M_R2A_APP796_GATE = BLOCKED
```

Do not use `PASS_WITH_OBSERVATION` for a hash mismatch. Hash mismatch on a published scoring config is a correctness/integrity defect.

---

## 9. NO UNNECESSARY EXECUTION

Because this task is read-only and must not change runtime/source:

- Do **not** run browser smoke.
- Do **not** run workflow UAT.
- Do **not** run full `npm test` merely for phase movement.
- Do **not** run full build merely for phase movement.
- Do **not** edit source/dist/tests.

A small local Node command/script used only to import the existing hash functions and compute hashes is allowed. Do not create a permanent new script unless necessary; prefer an ephemeral command or existing helper.

---

## 10. DOCUMENTATION / GIT SCOPE

After the read-only audit:

Allowed Git changes are documentation/evidence only:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do not change Confirmed Baseline to claim integrity PASS unless the live evidence actually proves it.

Do not change source/dist/tests.

If mismatch is found, document the mismatch fact and STOP; repair design is a new Control Plane task and requires fresh explicit authorization before any Kintone write.

---

## 11. REQUIRED FINAL EVIDENCE

Report at minimum:

```text
M10M_R2B = READY_FOR_CHATGPT_REVIEW
HEAD = <sha>
APP796_GET_COUNT = <n>
APP796_WRITE_COUNT = 0
OTHER_KINTONE_WRITE_COUNT = 0

DGM_RECORD_ID = <id>
DGM_CONFIG_STATUS = <status>
DGM_EXPECTED_APPRAISER_COUNT = <value>
DGM_STORED_HASH = <hash>
DGM_RECOMPUTED_LIVE_HASH = <hash>
DGM_HASH_MATCH = PASS|FAIL
DGM_INTEGRITY = PASS|FAIL

GM_RECORD_ID = <id>
GM_CONFIG_STATUS = <status>
GM_EXPECTED_APPRAISER_COUNT = <value>
GM_STORED_HASH = <hash>
GM_RECOMPUTED_LIVE_HASH = <hash>
GM_HASH_MATCH = PASS|FAIL
GM_INTEGRITY = PASS|FAIL

VP_RECORD_ID = <id>
VP_CONFIG_STATUS = <status>
VP_EXPECTED_APPRAISER_COUNT = <value>
VP_STORED_HASH = <hash>
VP_RECOMPUTED_LIVE_HASH = <hash>
VP_HASH_MATCH = PASS|FAIL
VP_INTEGRITY = PASS|FAIL

APP796_PUBLISHED_INTEGRITY = PASS|MUST_FIX|BLOCKED_READ_EVIDENCE
M10M_R2A_APP796_GATE = PASS|BLOCKED_PENDING_REPAIR_DESIGN|BLOCKED
SOURCE_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
```

---

## 12. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

### What
Read-only integrity verification of published DGM/GM/VP scoring configurations.

### Where
App796 Sandbox records plus existing scoring hash source functions.

### How
GET live records -> flatten live values -> canonicalize with existing source -> recompute SHA-256 -> compare with stored `Configuration_Hash`.

### Why
M10M-R2A directly changed an immutable published DGM field, so selected-value read-back is insufficient to prove scoring-master integrity.

### Expected Impact
Zero runtime change. Evidence only.

### Risk
Very low if GET-only boundary is respected. Main risk is accidentally reusing previous write script/authorization; this is explicitly forbidden.

### Test Plan
Hash/status/key/uniqueness/audit-field comparisons described above. No workflow/browser/full-suite execution.

### Rollback Plan
Not applicable: zero Kintone writes and zero source changes are permitted.

---

## 13. STOP CONDITION

After GET evidence and local hash computation:

1. verify Kintone write count = 0;
2. verify source/dist/test change count = 0;
3. commit only allowed documentation/evidence updates if needed;
4. push same branch;
5. STOP.

Do not repair App796 in this task.

Final line must be exactly:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```
