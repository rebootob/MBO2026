# AI ACTIVE TASK — M10M-R2D APP796 SUPERSESSION SUPPORT + DGM REPAIR CANDIDATE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Parent design checkpoint: `985c077756d5985d8a43ca17ee92ad2a3058cc4a`
> Target: lifecycle-correct source support and exact dry-run manifest for `PROF_DGM` App796 repair
> Kintone authorization: **NONE**
> Kintone calls/writes/deploys in this task: **0**
> Previous M10M-R2A authorization: **CONSUMED / CLOSED / MUST NOT BE REUSED**
> Required final status: `READY FOR CHATGPT REVIEW`

---

## 0. CONTROL-PLANE DESIGN RESULT

M10M-R2B proved:

```text
PROF_DGM record 6 = PUBLISHED
Expected_Appraiser_Count = 1
Stored hash = dbf21f31100d3a6878e1ffc5e5866f0fb0284596abda8b1f3555141e8337c10e
Recomputed live hash = 6067f92597eed02c50e472c8f99081ba9c7fe7bc14a69b58273e380c510bf043
PUBLISHED_IMMUTABLE_MUTATION_CONFIRMED
```

GM and VP integrity passed and are **OUT OF SCOPE / MUST REMAIN UNCHANGED**.

The existing architecture requires immutable version history in App796, safe hash-verified publish, and historical preservation. Current source explicitly has:

```text
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
```

The lifecycle-correct repair architecture is therefore:

```text
A. restore corrupted historical PROF_DGM::v1.0.0 to its exact original immutable payload (Count=2, stored historical hash valid)
B. create new PROF_DGM::v1.1.0 with Count=1
C. validate/hash/read-back new version while VALIDATED
D. atomically switch:
      old v1.0.0: PUBLISHED -> SUPERSEDED
      new v1.1.0: VALIDATED -> PUBLISHED
E. verify exactly one current PUBLISHED DGM config and both hashes valid
```

**Do not execute A-E in this task.** This task builds and tests the local reusable lifecycle support and produces the exact future execution manifest only.

---

## 1. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Read completely in this order:

1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
3. `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`
4. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
5. `project-docs/AI_ACTIVE_TASK.md`
6. `project-docs/CURRENT_STATE.md`
7. `project-docs/HANDOFF.md`
8. `project-docs/AI_REVIEW_PACKAGE.md`
9. `project-docs/DECISIONS.md` — DEC-024, DEC-029, DEC-035, DEC-036, DEC-038
10. `project-docs/phase-3/MBO-P03-WP-002_PLAN.md`
11. `src/profiles/scoring-config-master.js`
12. `src/services/scoring-config-master-service.js`
13. `src/services/scoring-config-kintone-repository.js`
14. `src/core/kintone-client.js`
15. `src/core/sandbox-write-guard.js`
16. relevant scoring repository/service/guard tests

Do not contact Kintone in this task.

---

## 2. HARD BOUNDARY — LOCAL ONLY

Forbidden:

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
browser workflow = 0
real-user workflow/notification = 0
App794/App795/App796/App53/other-app mutation = 0
```

Allowed:
- source changes needed for generic lifecycle-correct supersession support;
- tests;
- local dry-run payload/hash computation;
- documentation/evidence.

Do not create or update real App796 records.

---

## 3. VERSION / IDENTITY DECISIONS — LOCKED FOR CANDIDATE

The authoritative plan explicitly separates stable profile identity from version and gives `v1.0.0`, `v1.1.0` as the version convention.

Future corrected DGM candidate is:

```text
Master_Record_Key = PROF_DGM::v1.1.0
Profile_Code = PROF_DGM
Profile_Family = PROFILE_MANAGEMENT
Scoring_Config_Code = SCORE_CFG_DGM_V1
Scoring_Config_Version = v1.1.0
Fiscal_Year = FY2026
PartA_Weight = 50
PartB_Weight = 50
Expected_Appraiser_Count = 1
Appraiser_Weight_Rule_Code = EQUAL_DISTRIBUTION_V1
Part_A_Scoring_Mode = DIFFICULTY_ACHIEVEMENT_MATRIX
Competency_Set_Code = COMP_SET_MANAGEMENT_V1
PartA_Rounding_Rule = ROUNDING_LEGACY_PER_APP_CALC
PartB_Raw_Rounding_Rule = ROUNDING_LEGACY_PER_APP_CALC
PartB_Weighted_Rounding_Rule = ROUNDING_LEGACY_PER_APP_CALC
Final_Rounding_Rule = ROUNDING_LEGACY_PER_APP_CALC
Supersedes_Config_Version = v1.0.0
```

`Scoring_Config_Code` remains `SCORE_CFG_DGM_V1`. Do not invent a second version axis in that field; `Scoring_Config_Version` is the version carrier and `Master_Record_Key` is the native unique identity.

For this Sandbox repair candidate, preserve FY2026 effective scope from the confirmed current DGM business configuration:

```text
Effective_From = 2026-04-01
Effective_To = 2027-03-31
```

This is a correction-before-go-live to the current FY Sandbox configuration, not a rollback/re-activation of a historical superseded version. Existing App794 annual snapshots, if any, remain governed by DEC-024 and are not mutated by this work.

Diagnostic expected hash for the above v1.1.0 payload, using the current 19-field canonical hash contract:

```text
DGM_V110_EXPECTED_HASH_DIAGNOSTIC = e69989df7118601b95b3c4df1a0d7cfc6c5b2c3bf3be124a0470d82ff079892e
```

Primary proof must still be the repository function output from the implemented candidate; do not hardcode the diagnostic hash as authoritative runtime logic.

---

## 4. DO NOT ALTER CLEAN BOOTSTRAP BASELINE SEMANTICS UNNECESSARILY

`getCanonicalBaselineMasterConfigs()` may continue to represent a clean/fresh baseline environment and must not be mechanically changed to v1.1.0 merely because the existing Sandbox requires a repair history.

Do not force a fresh empty App796 installation to contain a nonexistent predecessor reference.

The live Sandbox repair version is an operational lifecycle history concern, separate from a clean bootstrap baseline.

Any change to the canonical bootstrap configs requires a concrete demonstrated need and must be called out for ChatGPT review.

---

## 5. IMPLEMENT GENERIC SUPERSESSION PUBLISH SUPPORT

Implement the **smallest reusable lifecycle capability** needed for a future corrected version. Do not implement a general ability to edit PUBLISHED immutable fields.

Preferred design: add a separate explicit service path such as:

```text
publishSupersedingScoringConfig(...)
```

rather than weakening `publishScoringConfig()` fail-closed behavior.

Required service behavior:

1. candidate must contain a real non-`NONE` `Supersedes_Config_Version`;
2. canonicalize and validate the 19 immutable fields using existing functions;
3. derive/verify `Master_Record_Key = Profile_Code::Scoring_Config_Version`;
4. reject duplicate new Master_Record_Key;
5. resolve published configs for same Profile/Fiscal Year;
6. require exactly one intended predecessor whose:
   - Profile_Code matches;
   - Fiscal_Year matches;
   - Scoring_Config_Version equals candidate `Supersedes_Config_Version`;
   - Config_Status = PUBLISHED;
   - stored Configuration_Hash equals recomputed predecessor hash;
7. reject missing predecessor, duplicate predecessor, wrong-profile predecessor, malformed predecessor, or corrupted predecessor;
8. overlap logic may ignore **only that exact predecessor** because it will be superseded in the atomic activation; any other overlapping PUBLISHED config must still fail closed;
9. compute new expected hash with existing `computeConfigurationHash()`;
10. create new record in VALIDATED using existing safe create path;
11. read it back and require triple-hash equality before activation;
12. obtain trusted Published_By/Published_At via existing audit provider;
13. call repository atomic supersession activation;
14. final read-back old + new;
15. verify old = SUPERSEDED, old immutable payload/hash unchanged;
16. verify new = PUBLISHED, new immutable payload/hash exact;
17. query published configs and prove exactly one current PUBLISHED config for Profile/FY and it is the new record;
18. return a deterministic `SUPERSESSION_PUBLISH_VERIFIED` result.

Do not allow a candidate to supersede itself.
Do not allow a `SUPERSEDED`/`RETIRED` predecessor to be reactivated.
Do not mutate GM/VP.

---

## 6. REPOSITORY — ATOMIC STATUS SWITCH

Add the minimum repository operation needed for atomic activation, e.g.:

```text
activateSupersessionAtomically(...)
```

It must use Kintone Bulk Request with **exactly two revision-guarded Update Record operations** in one `/k/v1/bulkRequest.json` request:

### Request 1 — predecessor

```text
App = 796
Record = exact predecessor record ID
Revision = exact pre-activation revision
Patch = Config_Status: SUPERSEDED only
```

Do not overwrite predecessor:
- immutable fields;
- `Configuration_Hash`;
- `Published_By`;
- `Published_At`.

### Request 2 — new validated version

```text
App = 796
Record = exact new record ID
Revision = exact VALIDATED read-back revision
Patch:
  Config_Status = PUBLISHED
  Published_By = trusted publisher
  Published_At = trusted timestamp
```

Kintone Bulk Request provides transaction-style rollback of all included operations if any included request fails. The implementation must still fail closed on malformed/partial/unexpected response and perform post-request GET verification before declaring success.

Do not include POST creation in the same atomic activation batch. The new record must already exist as hash-verified VALIDATED before this switch.

---

## 7. REQUEST BRIDGE — NARROW BULK SUPPORT ONLY

Current `createScoringConfigRepositoryRequestBridge()` only accepts:
- GET record(s)
- POST one record
- PUT publish one record

Extend it only enough for the exact App796 Bulk Request shape required by section 6.

Required fail-closed validation:
- method exactly POST;
- path exactly `/k/v1/bulkRequest.json`;
- top-level body only `requests`;
- exactly 2 requests;
- both nested methods exactly PUT;
- both nested API paths exactly `/k/v1/record.json`;
- both nested payload app IDs exactly 796;
- IDs/revisions positive safe-integer strings;
- first nested record patch exact one key `Config_Status=SUPERSEDED`;
- second nested record patch exact three keys `Config_Status=PUBLISHED`, `Published_By`, `Published_At`;
- predecessor and new record IDs must be different;
- reject extra fields, extra requests, DELETE/PATCH, other apps, or arbitrary record patches.

Do not loosen the existing ordinary POST/PUT bridge validation.

---

## 8. WRITE AUTHORIZATION GUARD — FUTURE CAPABILITY, STILL CLOSED NOW

Extend/add a **separate** narrow scoring supersession authorization operation for future execution, for example:

```text
SCORING_CONFIG_SUPERSEDE_AND_PUBLISH
```

It must require:
- exact App796 identity;
- exact Work Package/stage/contract;
- explicit user authorization = true;
- active window = true;
- fresh verified App796 pre-write backup evidence;
- exact predecessor record ID + revision + master key/version;
- exact new record ID + revision + master key/version;
- exact expected status switch;
- single-use authorization ID / replay protection;
- no DELETE;
- no other app;
- no generic arbitrary patch.

**Do not set authorization true in this task.** Tests must prove missing/false/stale/replayed/wrong-app/wrong-record/wrong-version manifests fail closed.

---

## 9. FORENSIC RESTORATION — MANIFEST ONLY, NO GENERIC PUBLISHED EDIT API

Do **not** add a generic repository method that permits arbitrary immutable edits to PUBLISHED scoring configs.

Instead produce an exact future one-time restoration manifest for corrupted predecessor `PROF_DGM::v1.0.0`.

Known before-state from R2B:

```text
Record ID = 6 (must be rediscovered/verified fresh before future write)
Config_Status = PUBLISHED
Scoring_Config_Version = v1.0.0
Expected_Appraiser_Count = 1
Stored Hash = dbf21f31100d3a6878e1ffc5e5866f0fb0284596abda8b1f3555141e8337c10e
Recomputed Live Hash = 6067f92597eed02c50e472c8f99081ba9c7fe7bc14a69b58273e380c510bf043
```

Historical intended v1.0.0 state:

```text
Expected_Appraiser_Count = 2
Stored/Expected historical hash = dbf21f31100d3a6878e1ffc5e5866f0fb0284596abda8b1f3555141e8337c10e
```

Future execution must first verify all 19 live immutable fields against the pre-R2 historical payload and prove that **Expected_Appraiser_Count is the only immutable difference** before any restoration PUT.

If any other immutable field differs: STOP. Do not restore automatically.

Future restoration write, if separately authorized, must change **only**:

```text
Expected_Appraiser_Count: 1 -> 2
```

with exact record revision guard, leaving stored historical hash and all audit fields unchanged. Immediate read-back must recompute to the historical hash before any v1.1.0 creation is allowed.

Do not implement a normal application path for this one-time forensic mutation.

---

## 10. FUTURE LIVE REPAIR SEQUENCE — DESIGN MANIFEST

Document this exact ordered future sequence; DO NOT EXECUTE NOW:

### Phase A — fresh gate
1. GET all App796 records / target DGM versions.
2. capture fresh complete App796 backup + SHA-256/readability.
3. verify target live state has not drifted from R2B expectations.
4. verify GM/VP still hash PASS and remain out of mutation scope.
5. verify no `PROF_DGM::v1.1.0` already exists.

### Phase B — restore historical v1.0.0 integrity
6. compare all 19 live v1.0.0 immutable fields with historical pre-R2 payload.
7. require only Count differs.
8. exact revision-guarded PUT Count `1 -> 2`.
9. GET/read-back v1.0.0.
10. require stored hash == recomputed hash == historical hash.

**If any later step before activation fails, leave this restored v1.0.0 intact and STOP. Do NOT roll it back into the known-corrupt count1/hash-mismatch state.**

At this point business count1 is not yet activated, but App796 integrity is restored.

### Phase C — prepare new v1.1.0
11. construct exact v1.1.0 candidate defined in section 3.
12. validate locally.
13. create as VALIDATED via normal guarded create path.
14. GET/read-back and triple-hash verify.
15. if create/read-back fails, clean up the new non-published VALIDATED candidate only if exact-target cleanup is separately included in authorization/rollback manifest; otherwise STOP and preserve evidence.

### Phase D — atomic activation
16. fresh GET predecessor and new candidate revisions.
17. execute one atomic Bulk Request:
    - v1.0.0 PUBLISHED -> SUPERSEDED
    - v1.1.0 VALIDATED -> PUBLISHED + audit fields
18. if Bulk Request fails, rely on transaction rollback and GET both records to prove neither status switch partially committed.
19. GET/read-back both records.
20. prove old historical hash still valid.
21. prove new hash valid and count=1.
22. prove exactly one PUBLISHED DGM FY2026 config = v1.1.0.
23. prove no other App796 record changed.

No delete of historical v1.0.0.
No App794/App795 mutation.
No workflow/notification test.

---

## 11. ROLLBACK SEMANTICS

### Before atomic activation
If new v1.1.0 preparation fails after old v1.0.0 has been restored, retain the restored historical v1.0.0 as PUBLISHED and STOP. This leaves integrity correct even though the new business count1 is not yet activated.

Do **not** intentionally restore the known corrupt state.

### Atomic activation failure
Bulk Request must result in both status changes or neither. Verify via GET; do not manually guess or retry after uncertain transport without reconciliation.

### After a successful atomic activation
Do not reactivate/mutate old v1.0.0 as rollback. Authoritative version governance requires any future rollback to create another new version/master key/effective period while preserving v1.0.0 and v1.1.0 history.

---

## 12. TESTS — REQUIRED LOCAL COVERAGE

Add focused tests for the new lifecycle capability.

At minimum:

### Service
- valid v1.0.0 predecessor + v1.1.0 candidate -> creates VALIDATED, verifies hash, atomic activation, final verification PASS;
- `Supersedes_Config_Version = NONE` rejected by superseding path;
- self-supersede rejected;
- missing predecessor fails closed before create;
- multiple published predecessors fail closed;
- predecessor version mismatch fails closed;
- predecessor stored/recomputed hash mismatch fails closed;
- wrong profile/FY predecessor fails closed;
- unrelated overlapping PUBLISHED config fails closed;
- exact predecessor overlap allowed only because it is the target being atomically superseded;
- new VALIDATED read-back hash mismatch stops before activation;
- post-activation old not SUPERSEDED fails;
- post-activation new not PUBLISHED fails;
- post-activation >1 or 0 PUBLISHED configs fails closed;
- old immutable fields/hash must remain unchanged;
- new immutable fields/hash must remain unchanged.

### Repository / bridge
- exact two-PUT Bulk Request accepted;
- predecessor patch contains status only;
- new patch contains status + audit fields only;
- revision guards included;
- rollback/error response fails closed;
- malformed bulk response fails closed;
- 1 or 3+ requests blocked;
- non-PUT nested method blocked;
- wrong API path blocked;
- wrong app blocked;
- same predecessor/new record ID blocked;
- extra patch field blocked.

### Authorization
- no explicit user authorization blocked;
- inactive window blocked;
- missing/unverified backup blocked;
- wrong app/record/version/revision blocked;
- replay blocked;
- DELETE/arbitrary mutation cannot be authorized.

Run targeted affected tests, then run full `npm test` once because this changes the central scoring publish lifecycle/guard/bridge.

No browser smoke. No UI build/redeploy is required unless the project's test runner itself requires a build; do not run unrelated UI preview.

---

## 13. NO-ORPHAN / SCOPE RULE

Preferred source files to modify:

```text
src/services/scoring-config-master-service.js
src/services/scoring-config-kintone-repository.js
src/core/kintone-client.js
src/core/sandbox-write-guard.js
existing related test files
```

Do not create a new permanent repair script merely for the one-time DGM restoration unless absolutely necessary and justified. Prefer a documented execution manifest + ephemeral future executor for the forensic step.

No UI source/dist changes.
No routing source changes.
No App794 Process changes.
No GM/VP changes.

---

## 14. REQUIRED REVIEW EVIDENCE

Final evidence must contain:

```text
M10M_R2D = READY_FOR_CHATGPT_REVIEW
PARENT_HEAD = 985c077756d5985d8a43ca17ee92ad2a3058cc4a
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
SOURCE_CHANGED_FILES = <exact list>
TEST_CHANGED_FILES = <exact list>

DGM_NEW_VERSION = v1.1.0
DGM_NEW_MASTER_KEY = PROF_DGM::v1.1.0
DGM_NEW_SUPERSEDES = v1.0.0
DGM_NEW_EXPECTED_APPRAISER_COUNT = 1
DGM_NEW_PART_A_B = 50/50
DGM_NEW_HASH = <computed by implemented source>

SUPERSESSION_SERVICE = PASS
ATOMIC_BULK_REPOSITORY = PASS
BULK_BRIDGE_FAIL_CLOSED = PASS
SUPERSESSION_AUTH_GUARD = PASS
FORENSIC_RESTORE_MANIFEST = READY_NO_WRITE
GM_VP_SCOPE_UNCHANGED = PASS
APP794_APP795_SCOPE_UNCHANGED = PASS
TARGETED_TESTS = PASS (<n>/<n>)
NPM_TEST = PASS (<n>/<n>)
NO_ORPHAN_ARTIFACT_GATE = PASS
```

Do not claim live App796 repair complete.

---

## 15. STOP CONDITION

1. inspect diff;
2. confirm no credentials/secrets;
3. confirm Kintone call/write count = 0;
4. commit source/tests/docs candidate;
5. push same branch;
6. STOP.

Final line exactly:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```

After ChatGPT review, only if candidate passes will the Control Plane ask the user for **fresh explicit App796 repair authorization** for the future live execution.
