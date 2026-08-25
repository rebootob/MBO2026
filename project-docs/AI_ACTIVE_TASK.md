# AI ACTIVE TASK — DELIVERY DAY SPRINT 03A-R1: GIT / NO-ORPHAN CLEANUP + EVIDENCE RECONCILIATION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `2372f5f7205f1910303c90d34c967f9f127ed61e`
> **Mode:** GIT/CODE/DOC CLEANUP ONLY — KINTONE WRITES = 0

# TODAY NORTH STAR

```text
M4 App 797 Hoshin Master           = PASS
M5 App 798 Revision Archive        = PASS
M6 App 796 Scoring Baseline        = LIVE EVIDENCE 8/8 PUBLISHED / BUSINESS STATE ACCEPTED PENDING CLEANUP
M7 App 795 Routing Baseline        = 1/12 / PREFLIGHT READY / ACR-002 STILL PROPOSED
M8 App 800 HR Dashboard MVP        = PASS
M9 End-to-end Smoke Test           = AFTER M7 WRITE CLOSURE

TODAY_DONE = NO
NEXT_CRITICAL_PATH = CLEAN SPRINT03A GIT/EVIDENCE -> USER ACR-002 DECISION -> M7 -> M9
```

# INDEPENDENT REVIEW RESULT — SPRINT 03A

Business/live evidence currently supports:

```text
M6_APP796_PUBLISHED_COUNT = 8/8
TRUSTED_PUBLISHER_IDENTITY_VERIFIED = YES
M6_DELETE_COUNT = 0
APP795_WRITES = 0
M7_REQUESTER_ACCOUNT_VERIFICATION = 9/9
M7_CURRENT_ACTIVE_COVERAGE = 1/12
M7_EXACT_SEED_MANIFEST = READY
ACR-002 = PROPOSED / USER APPROVAL REQUIRED
```

However `DELIVERY_SPRINT_03A_GATE = BLOCKED_TARGETED_CLEANUP` for repository governance defects below.

---

# MUST FIX 1 — ACCIDENTAL OUT-OF-SCOPE ARTIFACTS WERE COMMITTED

Commit `2372f5f...` accidentally introduced unrelated local/reference artifacts that were NOT authorized by Sprint03A and violate the user's mandatory No-Orphan rule.

Remove from the CURRENT branch tree all files introduced by this Sprint under:

```text
info app/305/PMS Asst.Sect.Mgr.&Specialist_Part_A.xlsx
info app/305/PMS Asst.Sect.Mgr.&Specialist_Part_B.xlsx
info app/307/PMS GM_Part_A.xlsx
info app/307/PMS GM_Part_B.xlsx
info app/310/PART A.xlsx
info app/310/PART B.xlsx
info app/640/PMS GM_Part A.xlsx
info app/640/PMS GM_Part B.xlsx
info app/643/PART A.xlsx
info app/643/PART B.xlsx
info app/715/PMS VP_Part_A_20260823223329.xlsx
info app/715/PMS VP_Part_B_20260823223342.xlsx
info app/716/PMS_Japan Staff_PART_B_20260823222607.xlsx
info app/716/PMS_Japan Staff_Part_A_20260823222555.xlsx
info app/App_283_Discovery_2026-08-23T08-31-33-378Z.json
info app/App_53_Discovery_2026-08-23T08-53-01-729Z.json
info app/info app.zip
walkthrough.md
```

These may remain in Git history as forensic history; do NOT rewrite history. They must not remain in the active branch tree.

Do not add replacement copies elsewhere.

Required:

```text
ACCIDENTAL_ARTIFACTS_REMOVED = 18/18
STALE_ACTIVE_ARTIFACTS = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

---

# MUST FIX 2 — DEC-023 STILL CONTAINS STALE 50/50 RULE

Current DEC-023 still says:

```text
Staff/Japan (70/30), All Management & Exec (50/50 - Confirmed)
```

This is stale and directly contradicts user-confirmed DEC-042.

Replace ONLY the active weight statement with:

```text
Staff / Japanese Staff = 70/30
Assistant Manager = 60/40
Section Manager and Above = 50/50
See DEC-042 for the user-reconfirmed authoritative position-ratio rule.
```

Do not delete DEC-042 or historical explanation in DEC-035.

Required:

```text
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS
STALE_SCORING_RULE_REFERENCES = 0
```

---

# MUST FIX 3 — SPRINT03A EVIDENCE / LIVING DOCS ARE INTERNALLY CONTRADICTORY

Examples currently observed:

```text
M6 says 8/8 PUBLISHED but Scoring Master detail still says RECORD_COUNT=0 / BASELINE_SEED_STATUS=NOT_STARTED
LIVE_RECORD_PUBLISH_STATUS still says NOT_STARTED
AI_REVIEW_PACKAGE still has duplicate NO_ORPHAN rows
AI_REVIEW_PACKAGE still has stale 471/471 test total
AI_REVIEW_PACKAGE generic THIS_TASK_KINTONE_CALLS/WRITES = 0 despite Sprint03A live writes
NEXT_ACTION still references older Sprint02R3 in stale rows
```

Reconcile current/living state only. Preserve historical sections and Stage3C evidence exception.

Canonical current state after Sprint03A must say:

```text
App796 RECORD_COUNT = 8
App796 PUBLISHED_COUNT = 8
App796 VALIDATED_COUNT = 0
BASELINE_SEED_STATUS = PUBLISHED_8_OF_8
LIVE_RECORD_PUBLISH_STATUS = BASELINE_8_OF_8_PUBLISHED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED (unless evidence proves otherwise)
M6_POST_COUNT = actual 8
M6_PUT_COUNT = actual 8
M6_DELETE_COUNT = 0
App795 writes = 0
npm test = 489/489 PASS (or actual newer total after cleanup)
```

Consolidate current NO_ORPHAN evidence to ONE canonical current block.

Do not fabricate network call totals that were not durably captured. If total GET count is unavailable, state `GET_TOTAL = NOT_DURABLY_COUNTED`; retain exact known POST/PUT/DELETE counts.

---

# MUST FIX 4 — SEED SCRIPT MUST RETURN TO FAIL-CLOSED POST-SEED BEHAVIOR

Current `scripts/kintone/seed-scoring-baseline.js` contains recovery/rerun logic that:

- skips existing PUBLISHED records and increments POST/PUT counters even though no write occurred
- directly completes a VALIDATED record by calling `repository.publishRecord()` outside the full ordered service publish contract

This violates the approved Sprint03A execution contract and can produce false future write counts.

Fix the EXISTING script only. Do not create another seeder.

Required behavior now that App796 contains the baseline:

1. Initial live preflight reads all App796 records before any possible write.
2. If record count is NOT 0, STOP fail-closed with a clear `SEED_BLOCKED_EXISTING_RECORDS` result/error and ZERO writes.
3. Do not skip existing PUBLISHED records as success.
4. Do not directly resume VALIDATED records.
5. Remove false counter increments for skipped/non-written operations.
6. The only allowed fresh-seed path remains an empty App796 -> 8 candidates sequentially through `ScoringConfigMasterService.publishScoringConfig()`.
7. No DELETE / rollback automation.
8. Preserve exact App796-only transport guard.

This script is now a controlled bootstrap tool, not an idempotent repair tool.

Add/adjust tests proving:

```text
existing 8 records -> seeder stops before POST/PUT
existing 1 PUBLISHED -> seeder stops before POST/PUT
existing 1 VALIDATED -> seeder stops before POST/PUT
no fake POST/PUT counter increments
no direct recovery publish path
DELETE/PATCH/wrong app remain blocked
```

Do NOT execute the seeder against live Kintone in this cleanup task.

---

# MUST FIX 5 — REVIEW UNPLANNED SERVICE/REPOSITORY ONE-LINE CHANGES

Commit `2372f5f...` also modified:

```text
src/services/scoring-config-master-service.js
src/services/scoring-config-kintone-repository.js
tests/scoring-config-kintone-repository.test.js
```

These changes occurred inside the evidence commit after the planned implementation commit.

Perform a local diff against `c9afab35c1cd5e1d7706c38b00f4c7a324ad3fca` for these three files.

- If a change was REQUIRED to make the approved live service/repository contract correct and is covered by tests, keep it and document the exact reason.
- If it was merely execution-time workaround, debug residue, or unrelated, revert that line to the reviewed pre-execution version.

Do not broaden service/repository behavior.

Required evidence:

```text
POST_IMPLEMENTATION_CODE_DRIFT = RECONCILED
UNJUSTIFIED_CODE_DRIFT = 0
```

---

# STEP 0 — SAFETY

Require:

```text
branch = ai/antigravity-wp002c
2372f5f... in ancestry
local HEAD = origin branch before work
tracked tree clean
```

No reset/rebase/force push/history rewrite.

This task performs NO Kintone writes and should require NO Kintone mutation credentials.

Do not run the live seed script.
Do not write App795.
Do not write any Kintone app.

---

# STEP 1 — CLEAN ACTIVE TREE + FIX CODE/DOC TRUTH

Perform exactly the cleanup above.

Run repository searches to prove:

```text
active DEC-023 stale generic management 50/50 wording = 0
active accidental info app artifacts listed above = 0
walkthrough.md accidental root file = absent
duplicate seeder scripts = 0
```

Do not delete legitimate historical evidence or retained local backups.

---

# STEP 2 — TEST

Run full:

```bash
npm test
```

Zero failures required.

Also run:

```bash
git status --short
git diff --check
```

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
POST_IMPLEMENTATION_CODE_DRIFT = RECONCILED
```

---

# STEP 3 — COMMIT / EVIDENCE

Expected exactly two commits after this Control Plane assignment:

```text
1. fix: clean sprint03a artifacts and restore fail-closed seeder
2. docs: reconcile sprint03a review evidence
```

The first commit may contain deletes + script/tests + justified service/repository reconciliation + DEC-023 correction if needed for atomic truth cleanup.
The second commit contains living evidence/status docs only.

Final evidence:

```text
DELIVERY_SPRINT_03A_R1 = COMPLETE / PENDING CHATGPT REVIEW
M6_BUSINESS_STATE = 8/8 PUBLISHED (UNCHANGED; NO LIVE WRITES THIS TASK)
M7_BUSINESS_STATE = 1/12 / ACR-002 PROPOSED
KINTONE_WRITES_THIS_TASK = 0
ACCIDENTAL_ARTIFACTS_REMOVED = 18/18
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS
SEEDER_FAIL_CLOSED_POST_SEED_GATE = PASS
POST_IMPLEMENTATION_CODE_DRIFT = RECONCILED
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
npm test = actual total / 0 FAIL
NEXT_ACTION = USER DECISION ON ACR-002
```

Push; require local HEAD = remote HEAD and tracked tree clean; STOP.

# STRICT OUT OF SCOPE

Do NOT:

- execute any Kintone write
- execute live seeder
- seed App795
- modify App796 records
- alter the 8 published records
- change scoring ratios
- create additional reference folders/files
- move accidental files elsewhere in repo
- rewrite Git history
- delete retained backup evidence

# REVIEW EXPECTATION

```text
M6_LIVE_BUSINESS_STATE_GATE = EXPECTED PASS
ACCIDENTAL_ARTIFACT_CLEANUP_GATE = PASS/FAIL
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS/FAIL
SEEDER_FAIL_CLOSED_POST_SEED_GATE = PASS/FAIL
POST_IMPLEMENTATION_CODE_DRIFT_GATE = PASS/FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL
KINTONE_ZERO_WRITE_CLEANUP_GATE = PASS/FAIL
REGRESSION_GATE = PASS/FAIL
GIT_PUSH_SYNC_GATE = PASS/FAIL
DELIVERY_SPRINT_03A_GATE = PASS/BLOCKED
```
