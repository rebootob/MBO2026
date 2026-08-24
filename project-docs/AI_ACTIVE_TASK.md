# AI ACTIVE TASK — CONTROLLED EXECUTION

> **Control Plane:** ChatGPT / approved human reviewer
> **Execution Plane:** Codex
> **Rule:** Codex executes this file exactly. Do not redesign architecture, expand scope, or rewrite this task file.

## 1. Active Work Package

- **WP:** `MBO-P03-WP-002C`
- **Mode:** `PLAN CORRECTION ONLY`
- **Branch:** `ai/codex-wp002c`
- **Accepted base:** `develop @ 9d263a4`
- **Target App:** `MBO Profile & Scoring Configuration Master [Sandbox]`
- **App ID:** `NOT_ALLOCATED`
- **App Status:** `NOT_CREATED`
- **Kintone Writes:** `0`
- **Implementation Authorization:** `NO`
- **App Creation Authorization:** `NO`

## 2. Execution Rules

1. Work only on `ai/codex-wp002c`.
2. Do not modify source code or tests in this task.
3. Do not create the Kintone App.
4. Do not perform POST/PUT/DELETE/DEPLOY to Kintone.
5. Do not touch Apps `53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795`.
6. Do not start WP-002D.
7. Do not solve `SEC-DEP-001`.
8. Do not modify `project-docs/AI_ACTIVE_TASK.md`.
9. Read only the files required for this task; avoid repository-wide re-analysis unless a direct dependency requires it.

## 3. Files Allowed To Change

Primary:
- `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md`

Living docs only if needed for accurate status/metadata:
- `project-docs/CURRENT_STATE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/CHANGELOG_AI.md`

No source/test/config implementation changes are authorized in this task.

## 4. Required Plan Corrections

### A. App-Creation Bootstrap Safety

The current safety stack cannot authorize `APP_CREATE` because a new App has no App ID yet.

Update the plan to require a dedicated narrow bootstrap authorization contract, conceptually:

`assertAppCreationAuthorization(authConfig, requestConfig)`

It must validate at minimum:
- `workPackageId === MBO-P03-WP-002C`
- `operation === APP_CREATE`
- explicit user authorization is true
- active one-time write window is true
- expected change manifest exists
- requested App name equals exactly `MBO Profile & Scoring Configuration Master [Sandbox]`

It must NOT require an App ID before creation.
It must NOT disable `DISCOVERY_MODE` globally.
It must NOT authorize generic POST or arbitrary App creation.

Future minimal implementation boundary must account for:
- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `config/sandbox-apps.json`
- `project-docs/APP_REGISTRY.md`
- one cohesive future service only if necessary: `src/services/scoring-config-master-service.js`

### B. Post-Creation Registration Order

Lock this exact future sequence:

1. Explicit user authorization.
2. Exact-name `APP_CREATE` bootstrap gate.
3. Create exactly one approved App.
4. Capture returned real numeric App ID.
5. Read back using that exact returned App ID.
6. Verify exact App name and ownership.
7. Register the verified ID in `config/sandbox-apps.json`.
8. Register the same verified ID in `project-docs/APP_REGISTRY.md`.
9. Only then allow normal App-ID-scoped WP writes to that exact App.
10. Restore default deny after the authorized write stage.

### C. Stored Hash Read-Back Integrity

Before publish, require all three values to match exactly:

`EXPECTED_HASH === READBACK.Configuration_Hash === computeConfigurationHash(READBACK_IMMUTABLE_PAYLOAD)`

Any missing/malformed/mismatched value, wrong record, or wrong `Master_Record_Key` must fail closed with:

`CONFIG_READBACK_MISMATCH`

### D. Published Effective-Period Uniqueness

Before `PUBLISHED`, query existing `PUBLISHED` records for the same:
- `Profile_Code`
- `Fiscal_Year`

Block overlapping effective ranges using:

`candidate.Effective_From <= existing.Effective_To`
AND
`existing.Effective_From <= candidate.Effective_To`

Failure code:

`SCORING_CONFIG_EFFECTIVE_OVERLAP`

Never resolve ambiguity by choosing newest/highest version.

### E. Supersession Contract

Clarify:
- `Supersedes_Config_Version` is lineage metadata only.
- It does not automatically deactivate an older version.
- Lifecycle transition must explicitly manage `PUBLISHED -> SUPERSEDED`.
- The publish sequence must preserve exactly-one active published configuration for the same Profile/FY/effective date.
- Interrupted multi-record activation must fail closed and require controlled recovery; do not silently leave ambiguous published records.

### F. Trusted Publish Audit

Lock:
- `Published_By` comes from trusted authenticated publisher identity, never arbitrary request payload.
- `Published_At` comes from trusted system/Kintone time, never caller business input.

After final publish update, perform exact-record read-back and verify:
- `Config_Status === PUBLISHED`
- `Master_Record_Key === expected`
- `Configuration_Hash === expected`
- `Published_By === trusted publisher`
- `Published_At` is present and valid

Failure code:

`PUBLISH_VERIFICATION_FAILED`

### G. Test Plan Additions

Add planned tests for:
- wrong App name rejected
- missing explicit authorization rejected
- wrong WP rejected
- one-target App creation only
- registry not updated before identity verification
- same verified ID written to both registries
- expected/stored/recomputed hash mismatch cases
- overlapping published effective period rejected
- different FY does not conflict
- different Profile_Code does not conflict
- caller cannot override `Published_By`
- caller cannot control `Published_At`
- final post-publish read-back verified

## 5. Preserve Existing Approved Contracts

Do not change:
- exact App name
- 23-field schema
- 19-field immutable payload
- `Master_Record_Key` required + unique
- `KINTONE_ONLY` architecture
- version immutability
- current 8 baseline values as evidence only
- App794/App795 no-write boundary for WP-002C
- permanent read-only protected Apps
- `SEC-DEP-001 = OPEN`
- WP-002D boundary

## 6. Current Accepted Baseline Metadata

Where a living document intends to identify the current accepted `develop` baseline, use:

`9d263a4`

Do not rewrite historical references that intentionally identify Phase 2 or earlier commits.

## 7. Verification

Run:

```bash
git diff --check
npm test
```

Expected regression baseline:

`148/148 PASS`

If source or test files changed, STOP and revert only your own unauthorized changes before committing.

## 8. Git

Remain on:

`ai/codex-wp002c`

Suggested plan-correction commit:

`docs: harden wp-002c bootstrap and publish safety`

Then, only if needed by DEC-030, a separate metadata commit:

`docs: update wp-002c corrected review metadata`

Push the branch.
Do NOT merge to `develop`.

## 9. Final Report

Report only:
- branch
- files changed
- plan correction commit SHA
- metadata commit SHA if any
- tests total/passed/failed
- Kintone POST/PUT/DELETE/DEPLOY counts
- App created YES/NO
- `SCORING_MASTER_APP_ID`

Then STOP.

# REVIEW EXPECTATION

Independent review will verify:

1. Exact target App name is unchanged.
2. App ID remains `NOT_ALLOCATED` and App remains `NOT_CREATED`.
3. No Kintone write occurred.
4. Dedicated exact-name `APP_CREATE` bootstrap authorization is planned.
5. Bootstrap does not require an App ID before creation.
6. `DISCOVERY_MODE` is not globally disabled or broadly bypassed.
7. Post-create identity read-back precedes registry updates.
8. Verified real App ID is planned for both `config/sandbox-apps.json` and `APP_REGISTRY.md`.
9. Normal writes become scoped only to that verified real App ID.
10. Expected hash, stored hash, and recomputed hash must all match.
11. Published effective-period overlap is blocked.
12. Supersession cannot silently create runtime ambiguity.
13. `Published_By` and `Published_At` use trusted sources.
14. Final post-publish read-back is mandatory.
15. No source/test implementation occurred in this task.
16. Regression remains `148/148`.
17. WP-002D was not started.

Expected gates:
- `APP_CREATION_SAFETY_GATE = PASS / FAIL`
- `PUBLISH_PIPELINE_PLAN_GATE = PASS / FAIL`
- `EFFECTIVE_UNIQUENESS_GATE = PASS / FAIL`
- `SECURITY_PLAN_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_PLAN_GATE = PASS / FAIL`
