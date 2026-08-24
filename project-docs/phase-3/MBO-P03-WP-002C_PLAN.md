# MBO-P03-WP-002C — Kintone Profile & Scoring Configuration Master (Plan Only)

## 1. Authority, Scope, and Stop Boundary

| Item | Value |
|---|---|
| Status | `PLAN_CREATED / PENDING_INDEPENDENT_REVIEW` |
| Implementation Authorization | `NO` |
| App Creation Authorization | `NO` |
| Kintone Write Authorization | `NO` |
| Target app name | `MBO Profile & Scoring Configuration Master [Sandbox]` |
| `SCORING_MASTER_APP_ID` | `NOT_ALLOCATED` |
| App status | `NOT_CREATED` |
| Environment | `SANDBOX` |
| Production | `FALSE` |
| Current `WRITE_ALLOWED_APPS` | `[]` |

This work package defines the future controlled Kintone master only. It creates no app, schema, record, permission, process-management setting, script, source code, test, Kintone API write, or deployment. It must not alter protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716, nor sandbox Apps 794 or 795.

## 2. Purpose — What, Where, Why, and Expected Impact

**What.** Plan a real Kintone-backed source for versioned profile and scoring configuration, with a fail-closed publish/read-back integrity pipeline.

**Where.** A future, separately authorized sandbox application with the exact name `MBO Profile & Scoring Configuration Master [Sandbox]`. Its ID is deliberately unknown until Kintone allocates it.

**Why.** `DEC-035` requires `LIVE_KINTONE_FIRST`; `DEC-038` requires `KINTONE_ONLY`. Runtime scoring configuration must not depend on Git, GitHub, filesystem, NAS, JSON, or source-code constants. Existing baseline objects and unit fixtures are evidence only, not a runtime authority or permanent restriction on configurations.

**Expected impact after future authorization.** The resolver can read only an exact, published, effective configuration from this master, while a controlled publisher can prove that the record persisted exactly as validated. No impact occurs in this plan-only WP.

## 3. Master Dependency and Future Bootstrap Gate

The current resolver dependency remains `SCORING_MASTER_APP_DEPENDENCY = NOT_ALLOCATED / NOT_CREATED`; injected records are the only permitted input until this gate is passed.

Future app creation is an explicit, one-time sequence, not a generic app-creation permission:

1. Obtain user authorization naming the exact target app above.
2. Create that exact app and capture Kintone's real numeric ID.
3. Read it back and prove the exact name and real ID match the authorization.
4. Update `APP_REGISTRY.md` only with that verified real ID.
5. Temporarily set the WP-specific allowlist to that real ID only; never inherit App 794/795 permissions.
6. Apply and read back the approved schema; then restore default deny unless a separately authorized step requires a write.

No fake numeric ID, inferred ID, name-search target, or broad allowlist is allowed.

## 4. Future Schema Contract (23 Fields)

`Master_Record_Key = {Profile_Code}::{Scoring_Config_Version}` is required, unique, and immutable. Fields 1–19 are the immutable payload covered by `Configuration_Hash`; fields 20–23 are lifecycle/audit fields and are excluded from the hash.

| # | Field Code | Kintone type | Required | Unique | Immutable payload | Editable lifecycle stage | Purpose |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Master_Record_Key` | SINGLE_LINE_TEXT | Yes | Yes | Yes | DRAFT only | Deterministic record identity |
| 2 | `Profile_Code` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Stable profile selector |
| 3 | `Profile_Family` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Profile family context |
| 4 | `Scoring_Config_Code` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Business configuration code |
| 5 | `Scoring_Config_Version` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Immutable version identifier |
| 6 | `Effective_From` | DATE | Yes | No | Yes | DRAFT only | Inclusive effective start |
| 7 | `Effective_To` | DATE | Yes | No | Yes | DRAFT only | Inclusive effective end |
| 8 | `Fiscal_Year` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Exact fiscal-year selector; `ALL` is prohibited |
| 9 | `PartA_Weight` | NUMBER | Yes | No | Yes | DRAFT only | Part A percentage |
| 10 | `PartB_Weight` | NUMBER | Yes | No | Yes | DRAFT only | Part B percentage |
| 11 | `Expected_Appraiser_Count` | NUMBER | Yes | No | Yes | DRAFT only | Required valid appraiser count |
| 12 | `Appraiser_Weight_Rule_Code` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Layer-1 weight rule |
| 13 | `Part_A_Scoring_Mode` | DROP_DOWN | Yes | No | Yes | DRAFT only | Part A scoring strategy |
| 14 | `Competency_Set_Code` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Competency configuration reference |
| 15 | `PartA_Rounding_Rule` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Part A rounding contract |
| 16 | `PartB_Raw_Rounding_Rule` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Part B raw rounding contract |
| 17 | `PartB_Weighted_Rounding_Rule` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Part B weighted rounding contract |
| 18 | `Final_Rounding_Rule` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Final-score rounding contract |
| 19 | `Supersedes_Config_Version` | SINGLE_LINE_TEXT | Yes | No | Yes | DRAFT only | Prior-version lineage (`NONE` for first version) |
| 20 | `Config_Status` | DROP_DOWN | Yes | No | No | Controlled transition only | Lifecycle state |
| 21 | `Published_At` | DATETIME | No | No | No | Controlled publish only | Publish audit timestamp |
| 22 | `Published_By` | USER_SELECT | No | No | No | Controlled publish only | Publisher audit identity |
| 23 | `Configuration_Hash` | SINGLE_LINE_TEXT | No | No | No | Controlled publish only | SHA-256 of fields 1–19 |

## 5. Future Validation, Lifecycle, and Publish Contract

Allowed lifecycle transitions are `DRAFT -> VALIDATED -> PUBLISHED`, `PUBLISHED -> SUPERSEDED`, and `PUBLISHED|SUPERSEDED -> RETIRED`. A rejected validation remains `DRAFT`; no reverse transition, published payload edit, or direct jump is allowed. A corrected configuration is a new DRAFT record/version with a new master key and effective period; it never mutates a published or superseded record.

The future controlled publish service must perform this ordered sequence:

1. Validate all domain rules: exact fiscal year, effective period, unique key, weights totaling 100, supported appraiser rule/count, scoring mode, competency/COCE rules, and rounding codes.
2. Set `Config_Status = VALIDATED`.
3. Canonicalize immutable fields 1–19 and compute `Configuration_Hash`.
4. Persist the validated payload and hash through the explicitly authorized real app ID.
5. Read back the same record by its exact Kintone record ID and `Master_Record_Key`.
6. Recompute the hash from read-back fields and compare it to the expected hash.
7. Transition to `PUBLISHED` only if every comparison matches; otherwise fail closed with `CONFIG_READBACK_MISMATCH` and do not publish.

`Config_Status` plus native Kintone permissions and a controlled server-side publish service is the recommended design. Kintone Process Management is not planned: it does not add integrity beyond status locking plus the publish/read-back service and increases workflow configuration and rollback burden. Future implementation must verify native capability; if native status locking is insufficient, it requires an explicit architecture change and authorization, not an implicit Process Management addition.

## 6. Future Access and Security Boundary

Native Kintone permissions are the security boundary; JavaScript UI and `authenticatedContext` are not a production authorization boundary. `DEC-039` remains `FROZEN / SECURITY CRITICAL`, and `SEC-DEP-001` (shared Kintone account identity binding) remains `OPEN` and unaffected.

Planned native permissions:

| Role | Future rights |
|---|---|
| HR Config Admin | Create and edit DRAFT records only; cannot edit published payload |
| HR Manager / Approved Publisher | Validate and publish only through controlled service |
| System Admin | Emergency operations only under a governed, separately authorized rollout |
| General Employee | No access |
| Runtime reader | Read published configurations only |

Actual group/account resolution, permissions, and field controls are out of scope until a later authorization. No App 794 permission is inherited.

## 7. Planned Implementation Boundary (Future Only)

Future code may add one cohesive injectable adapter/service at `src/services/scoring-config-master-service.js` with tests at `tests/scoring-config-master-service.test.js`. It may use `src/profiles/scoring-config-master.js` only for generic record mapping/domain primitives, not for a competing source-code scoring authority. `src/profiles/profile-scoring-resolver.js` may be wired to the live adapter only after the real ID is allocated. Reuse the exact-record read-back and response-normalization ideas from `AnnualRecordService`; do not modify code in this WP.

## 8. Future Test Plan

- App identity bootstrap: exact authorized app name, real ID read-back, and no registry update before proof.
- Schema: all 23 field codes, types, required/unique flags, master-key uniqueness, immutable vs audit partition, and no `Fiscal_Year = ALL`.
- Domain: invalid/missing fields, key mismatch/duplicate, invalid effective period, non-100 weights, invalid appraiser values, unsupported modes/rounding, and COCE inclusion fail closed.
- Versioning: no published mutation; replacement uses a new key/version and valid supersession lineage.
- Publishing: each ordered stage, wrong/missing record ID, wrong key, altered read-back payload/hash, and `CONFIG_READBACK_MISMATCH`.
- Source-of-truth: runtime resolution consumes only a published Kintone record; no Git/filesystem/JSON fallback.
- Safety: zero writes to protected apps and Apps 794/795; API fixture tests remain dependency-injected.

## 9. Staged Creation, Seeding, Rollback, and Git Plan

App/schema creation and baseline seeding are separate future authorization gates. The eight baseline configurations are staged evidence fixtures only; no record will be seeded by this WP.

Rollback is stage-specific: before app creation, only Git documentation may be reverted; for an empty app, deletion requires explicit authorization plus exact real ID, exact name, and proof of ownership—never a name search. After schema, quarantine/disable is preferred; exact-app deletion remains separately authorized and capability-dependent. After seeding, rollback targets only an explicit manifest of exact record IDs/keys, never any protected app or unrelated record. Delete-all operations are never implied.

This WP's Git plan is documentation only: commit the plan/living-state update, commit review metadata separately under `DEC-030`, push `ai/codex-wp002c`, and do not merge `develop`.

## 10. Current Verification and Stop

Current Kintone operations: `POST = 0`, `PUT = 0`, `DELETE = 0`, `DEPLOY = 0`, `WRITE_ALLOWED_APPS = []`. Required pre-commit verification is a documentation-only diff scope check and `npm test` (expected existing suite: 148 passing). Stop after plan/review-metadata commits and push; do not create the app, modify Kintone, seed data, implement the service, or begin WP-002D.
