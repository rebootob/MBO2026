# D3-SBX-MIGRATION-01-PRE1 — Exact Migration Manifest / Scorer / ACL Plan

Status: EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING  
Mode: PLAN-ONLY / ZERO KINTONE WRITE / ZERO SCHEMA WRITE / ZERO PROCESS WRITE / ZERO DEPLOYMENT  
Canonical base HEAD: `a8c839db3d1160be2fce2880fd6c9cdc6b0e2aee`  
Accepted preflight evidence ZIP SHA-256: `cd6fd048a15faa5bdb490828463049b2890b654d49a517b91167bf3a8ee528ad`

## 1. Scope and non-authority

This PRE1 package converts the accepted live read-only evidence into a deterministic migration plan. It does **not** authorize or execute Kintone reads/writes, schema changes, process changes, data backfill, deployment, UAT, or production cutover.

`D3-SBX-MIGRATION-01` remains NOT AUTHORIZED.

## 2. Exact App795 20-route seed manifest

Machine-readable manifest: `project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json`  
Route manifest SHA-256 (canonical JSON over exact route array): `b51fb7f4e81953c48858409a1ceb8ea948c0a2e0eb384ad3aabc9b6640d7a04b`

| # | Source id / rev | Routing_Key | Topology | Route_Pattern | Active slots | Scorer proposal | Version_Key | Effective interval |
|---:|---|---|---|---|---|---|---|---|
| 1 | 1 / r5 | `TME1` | M1_G1 | `PATTERN_2_M1_G1` | M1=suthas → G1=somrudee | `[1, 2]` | `TME1#v1` | 2026-04-01 → 2027-03-31 |
| 2 | 13 / r2 | `TMF1` | M1_G1 | `PATTERN_2_M1_G1` | M1=vassana → G1=kito | `[1, 2]` | `TMF1#v1` | 2026-04-01 → 2027-03-31 |
| 3 | 14 / r2 | `TMF2` | M1_G1 | `PATTERN_2_M1_G1` | M1=vassana → G1=kito | `[1, 2]` | `TMF2#v1` | 2026-04-01 → 2027-03-31 |
| 4 | 15 / r2 | `TMF3` | M1_G1 | `PATTERN_2_M1_G1` | M1=vassana → G1=kito | `[1, 2]` | `TMF3#v1` | 2026-04-01 → 2027-03-31 |
| 5 | 16 / r2 | `TMG1|Production` | M1_G1 | `PATTERN_2_M1_G1` | M1=prompan → G1=uchida | `[1, 2]` | `TMG1|Production#v1` | 2026-04-01 → 2027-03-31 |
| 6 | 17 / r2 | `TMG2|Production` | M1_G1 | `PATTERN_2_M1_G1` | M1=prompan → G1=uchida | `[1, 2]` | `TMG2|Production#v1` | 2026-04-01 → 2027-03-31 |
| 7 | 18 / r2 | `TMH1` | M1_G1 | `PATTERN_2_M1_G1` | M1=supparat → G1=pattama | `[1, 2]` | `TMH1#v1` | 2026-04-01 → 2027-03-31 |
| 8 | 19 / r2 | `TMH2` | M1_G1 | `PATTERN_2_M1_G1` | M1=papatchaya → G1=pattama | `[1, 2]` | `TMH2#v1` | 2026-04-01 → 2027-03-31 |
| 9 | 20 / r2 | `TMH3` | M1_G1 | `PATTERN_2_M1_G1` | M1=chatrawee → G1=pattama | `[1, 2]` | `TMH3#v1` | 2026-04-01 → 2027-03-31 |
| 10 | 21 / r2 | `TMS1` | M1_G1 | `PATTERN_2_M1_G1` | M1=satit → G1=makino | `[1, 2]` | `TMS1#v1` | 2026-04-01 → 2027-03-31 |
| 11 | 22 / r2 | `TMT1` | M1_G1 | `PATTERN_2_M1_G1` | M1=pitchayadol → G1=weerakul | `[1, 2]` | `TMT1#v1` | 2026-04-01 → 2027-03-31 |
| 12 | 23 / r2 | `TMT2` | M1_G1 | `PATTERN_2_M1_G1` | M1=darat → G1=somrudee | `[1, 2]` | `TMT2#v1` | 2026-04-01 → 2027-03-31 |
| 13 | 24 / r1 | `TMG1|Admin` | M1_G1 | `PATTERN_2_M1_G1` | M1=amporn → G1=uchida | `[1, 2]` | `TMG1|Admin#v1` | 2026-04-01 → 2027-03-31 |
| 14 | 25 / r1 | `TMG1|CAD` | M1_G1 | `PATTERN_2_M1_G1` | M1=phubodin → G1=uchida | `[1, 2]` | `TMG1|CAD#v1` | 2026-04-01 → 2027-03-31 |
| 15 | 26 / r1 | `TMG1|Marketing` | M1_G1 | `PATTERN_2_M1_G1` | M1=natta → G1=uchida | `[1, 2]` | `TMG1|Marketing#v1` | 2026-04-01 → 2027-03-31 |
| 16 | 27 / r1 | `TMG2|CAD` | M1_G1 | `PATTERN_2_M1_G1` | M1=phubodin → G1=uchida | `[1, 2]` | `TMG2|CAD#v1` | 2026-04-01 → 2027-03-31 |
| 17 | 28 / r1 | `TMG2|Marketing` | M1_G1 | `PATTERN_2_M1_G1` | M1=natta → G1=uchida | `[1, 2]` | `TMG2|Marketing#v1` | 2026-04-01 → 2027-03-31 |
| 18 | 29 / r1 | `POSITION_DGM` | M1_ONLY | `PATTERN_1_M1` | M1=tsuchihira | `[1]` | `POSITION_DGM#v1` | 2026-04-01 → 2027-03-31 |
| 19 | 30 / r1 | `POSITION_GM` | M1_ONLY | `PATTERN_1_M1` | M1=tsuchihira | `[1]` | `POSITION_GM#v1` | 2026-04-01 → 2027-03-31 |
| 20 | 31 / r1 | `POSITION_VP` | M1_ONLY | `PATTERN_1_M1` | M1=tsuchihira | `[1]` | `POSITION_VP#v1` | 2026-04-01 → 2027-03-31 |

All 20 rows are planned as **in-place updates** of the existing App795 rows. `Version_Number=1`, `Version_Status=ACTIVE`, existing requester/approver identities, Effective_From/To, Section/Team, Remark and deprecated legacy fields are preserved unless explicitly listed as target changes.

### Approval-rule normalization

D3 V1 requires active sequential slots to use `ALL`; inactive slots are planned blank to remove legacy ANY semantics:

- `M1_G1`: M2=`''`, M1=`ALL`, G1=`ALL`, G2=`''`
- `M1_ONLY`: M2=`''`, M1=`ALL`, G1=`''`, G2=`''`

No route identity or appraiser identity is guessed.

## 3. Scorer mapping decision packet

Live App795 has no `Scorer_Priority_Slots`; automatic inference is forbidden by the accepted D3 contract. PRE1 therefore records the following as an **evidence-derived proposal only**:

```text
M1_G1   -> [1,2]   (17 routes)
M1_ONLY -> [1]     (3 executive routes)
```

Status: **PENDING OWNER/HR APPROVAL**.

Migration execution must fail closed until the Owner/HR explicitly approves the exact mapping. Approval of PRE1 itself does not convert this proposal into business authority.

## 4. App795 schema diff plan

Accepted live baseline: App795 revision `11`, 20 records.

Planned target differences:

1. `Routing_Key`: keep required=true, change `unique: true -> false`.
2. Add `Version_Key`: SINGLE_LINE_TEXT, required=true, unique=true.
3. Add `Version_Number`: NUMBER, required=true, min=1.
4. Add `Version_Status`: DROP_DOWN, required=true, lifecycle values DRAFT/ACTIVE/CANCELLED/SUPERSEDED.
5. Add `Route_Pattern`: DROP_DOWN, required=true, five canonical D3 V1 patterns.
6. Add `Scorer_Priority_Slots`: SINGLE_LINE_TEXT, required=true.
7. `Effective_From`: change `required: false -> true` while preserving exact current value `2026-04-01` on all 20 rows.
8. `Effective_To`: no schema change; preserve `2027-03-31` on all 20 current rows.
9. Active slot approval rules remain/are normalized to ALL; inactive slot rules are blanked.
10. Legacy `Active` and deprecated legacy routing fields remain physically present for cutover compatibility; they are not deleted in this migration.

### Required sequencing safety

The live executor must use a reviewed staged write sequence that does not create an intermediate state where existing records cannot be seeded because newly added target fields are already enforced as required. If the final executor cannot prove that Kintone safely accepts required-field creation on populated App795, it must stage additions as non-required, seed/read-back all 20 rows, and only then enforce final required properties. This is a migration-executor requirement, not an authorization to write.

## 5. App794 provenance schema plan

Accepted live baseline: App794 revision `70`, 344 fields, 1 existing record. The five D3 provenance fields are missing:

- `Frozen_Profile_Code` — SINGLE_LINE_TEXT, target required=true
- `K_expected_Snapshot` — NUMBER, target required=true, min=1, max=2
- `Effective_Routing_Key` — SINGLE_LINE_TEXT, target required=true
- `Effective_Route_Version_Key` — SINGLE_LINE_TEXT, target required=true
- `Effective_Scorer_Slots_Snapshot` — SINGLE_LINE_TEXT, target required=true

PRE1 identifies a tooling gap: the locked D3 migration tooling contains a guarded App795 schema planner/rollback planner, but no D3-specific guarded App794 provenance-field migration executor is present in the reviewed scripts inventory. A future write gate must not substitute an unrelated generic deployment script. The App794 executor/plan must be implemented or explicitly reviewed before any schema write.

Because the accepted preflight read did not export the contents of the one existing App794 record, PRE1 does **not** invent provenance backfill values. Required-field enforcement for App794 must be staged so historical data is not guessed or corrupted.

## 6. App795 ACL plan — least privilege

Current App795 live ACL baseline:

- `MBO_DEDICATED_ACCESS`: view only
- `MBO_EMPLOYEE_ACCESS`: view only
- `CREATOR`: full existing rights
- `everyone`: no rights
- `HR_ADMIN_GROUP`: no explicit App795 right
- field ACL: none
- record ACL: none

Proposed future ACL for `HR_ADMIN_GROUP`:

```text
appEditable      = false
recordViewable   = true
recordAddable    = true
recordEditable   = true
recordDeletable  = false
recordImportable = false
recordExportable = false
```

Rationale: HR self-service requires route create/edit/publish/supersede record mutations but historical route deletion is forbidden; app/schema administration, import and export are not required by the App800 business workflow.

PRE1 recommendation: **do not grant this ACL during D3-SBX-MIGRATION-01**. Keep migration credentials/authority separate and defer the HR write ACL change until immediately before App800 self-service activation under a separately authorized deployment/security gate. `admin-form` remains outside `HR_ADMIN_GROUP` and gains no implicit HR mutation authority.

## 7. Pre-write backup and drift guards required for D3-SBX-MIGRATION-01

Before any future write, execution must fresh-read and hash a new backup bundle. The accepted PRE1/preflight evidence is planning evidence, not a substitute for a fresh write-time backup.

Minimum write-time guards:

- canonical Git HEAD must equal the exact migration-authorized HEAD;
- App795 schema/app revision and ACL revision must match the approved baseline or STOP for re-plan;
- App794 schema/app revision must match approved baseline or STOP;
- exact App795 record set must remain 20/20 with the same Routing_Key set;
- every source record id and `$revision` must equal the manifest expectation;
- requester and M1/M2/G1/G2 identities must match the manifest;
- Effective_From/Effective_To must match the manifest;
- no duplicate Routing_Key, no added/missing row, no unreviewed route topology;
- scorer mapping must be explicitly Owner/HR approved before seed;
- backup SHA-256 and artifact location must be recorded before first write.

Any mismatch = STOP / HEAD_OR_LIVE_DRIFT / regenerate PRE1 evidence. No merge/rebase/reset/force or blind overwrite.

## 8. Planned write sequence for future migration gate — NOT AUTHORIZED HERE

1. Fresh backup + SHA-256 + read-back verification.
2. Reconfirm exact 20 record revisions and schema revisions.
3. Stage App795 additive D3 fields safely.
4. Relax `Routing_Key` uniqueness only after backup and drift guards pass.
5. Seed exact 20 rows in place using this manifest and the separately approved scorer mapping.
6. Normalize approval rules to D3 V1 ALL/blank semantics.
7. Enforce final App795 required/unique field properties after row seed read-back if staged requiredness is necessary.
8. Add App794 provenance fields using a separately reviewed D3-specific guarded executor; do not guess historical provenance.
9. Read back schema + all 20 App795 rows + App794 field definitions.
10. Confirm Process Management remains unchanged at the accepted `16 states / 31 actions` baseline during migration.
11. Confirm App798 remains unchanged; no archive records are created by schema migration.
12. Stop. Do not deploy runtime/process/UI automatically.

## 9. Post-write acceptance/read-back contract for future migration gate

App795 must read back with:

- exactly 20 migrated rows and no extra/missing route;
- `Version_Key = <Routing_Key>#v1`, all unique;
- `Version_Number = 1` on all 20;
- `Version_Status = ACTIVE` on all 20;
- 17 `PATTERN_2_M1_G1` and 3 `PATTERN_1_M1`;
- scorer slots exactly equal to the separately approved mapping;
- exact M1/G1 identities preserved; executive M1 exact; no M2/G2 identity invented;
- active approval rules ALL, inactive rules blank;
- Effective_From/To unchanged from manifest;
- no interval overlap/gap introduced for the current v1 set;
- legacy fields preserved and no historical row deleted.

App794 must read back with the five D3 provenance field definitions present. No existing App794 business provenance value may be invented by migration.

ACL must remain unchanged during migration if the PRE1 defer recommendation is accepted. Process must remain `16/31`; deployment target `19/40` belongs to D3-SBX-DEPLOY-01, not migration.

## 10. Rollback plan

If any App795 seed/read-back fails:

- stop further writes;
- restore exact backed-up App795 record values with revision guards;
- if no versioned duplicate rows were introduced, restore `Routing_Key` uniqueness only after proving all Routing_Key values are unique;
- additive D3 fields may remain inert rather than being destructively removed;
- legacy runtime authority remains unchanged until a separately authorized runtime deployment.

For App794, additive provenance fields should normally remain inert rather than destructive removal; never fabricate backfill values merely to satisfy a field requirement.

App798 immutable records are never deleted as rollback. Process/customization remain untouched in this migration plan, so there is no process/customization rollback action in PRE1.

## 11. PRE1 blockers before migration authorization

```text
BLOCKER_1 = SCORER_MAPPING_NOT_OWNER_HR_APPROVED
BLOCKER_2 = APP794_D3_PROVENANCE_MIGRATION_EXECUTOR_NOT_REVIEWED
BLOCKER_3 = APP794_EXISTING_RECORD_PROVENANCE_BACKFILL_POLICY_NOT_DEFINED
BLOCKER_4 = FRESH_WRITE_TIME_BACKUP_AND_DRIFT_CHECK_PENDING
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER (not a schema-migration blocker, but still blocks runtime deployment)
```

PRE1 completion must not be interpreted as authorization for `D3-SBX-MIGRATION-01`.
