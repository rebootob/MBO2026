# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C GUARDED SCHEMA CONFIGURATION

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Primary Execution Plane:** Antigravity
> **Codex:** NOT ACTIVE; do not delegate to Codex
> **Repository:** `rebootob/MBO2026`
> **Execution / Review Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage-3B Head:** `d4b8eb0cb2939162f3128cf4325ff9b8ffe6bd95`
> **Target App:** `796` — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Environment:** SANDBOX / Production FALSE

## CONTROL PLANE GATE DECISION

Stage 3B has passed independent review:

```text
WP002C_STAGE3B_GATE = PASS
App 796 = LIVE_DEPLOYED
Deploy status = SUCCESS
Access = CREATOR_ONLY / DEFAULT_DENY
Schema = NOT_CONFIGURED
Seed = NOT_STARTED
Publish pipeline = NOT_DEPLOYED
```

This task authorizes the next narrowly scoped stage only:

```text
STAGE 3C — CREATE AND DEPLOY THE EXACT 23-FIELD WP-002C SCHEMA ON EXISTING APP 796
```

It does NOT authorize baseline records, publish service execution, lifecycle transitions, layout customization, views, process management, JavaScript customization, permission changes, App creation, deletion, or WP-002D.

## AUTHORITATIVE SCHEMA CONTRACT

Source: `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md` section 4 and `src/profiles/scoring-config-master.js` enums.

Create exactly these 23 fields, no more and no fewer:

| # | Code | Type | Required | Unique |
|---:|---|---|:---:|:---:|
| 1 | Master_Record_Key | SINGLE_LINE_TEXT | YES | YES |
| 2 | Profile_Code | SINGLE_LINE_TEXT | YES | NO |
| 3 | Profile_Family | SINGLE_LINE_TEXT | YES | NO |
| 4 | Scoring_Config_Code | SINGLE_LINE_TEXT | YES | NO |
| 5 | Scoring_Config_Version | SINGLE_LINE_TEXT | YES | NO |
| 6 | Effective_From | DATE | YES | NO |
| 7 | Effective_To | DATE | YES | NO |
| 8 | Fiscal_Year | SINGLE_LINE_TEXT | YES | NO |
| 9 | PartA_Weight | NUMBER | YES | NO |
| 10 | PartB_Weight | NUMBER | YES | NO |
| 11 | Expected_Appraiser_Count | NUMBER | YES | NO |
| 12 | Appraiser_Weight_Rule_Code | SINGLE_LINE_TEXT | YES | NO |
| 13 | Part_A_Scoring_Mode | DROP_DOWN | YES | NO |
| 14 | Competency_Set_Code | SINGLE_LINE_TEXT | YES | NO |
| 15 | PartA_Rounding_Rule | SINGLE_LINE_TEXT | YES | NO |
| 16 | PartB_Raw_Rounding_Rule | SINGLE_LINE_TEXT | YES | NO |
| 17 | PartB_Weighted_Rounding_Rule | SINGLE_LINE_TEXT | YES | NO |
| 18 | Final_Rounding_Rule | SINGLE_LINE_TEXT | YES | NO |
| 19 | Supersedes_Config_Version | SINGLE_LINE_TEXT | YES | NO |
| 20 | Config_Status | DROP_DOWN | YES | NO |
| 21 | Published_At | DATETIME | NO | NO |
| 22 | Published_By | USER_SELECT | NO | NO |
| 23 | Configuration_Hash | SINGLE_LINE_TEXT | NO | NO |

### Exact drop-down options

`Part_A_Scoring_Mode`:

```text
0 DIFFICULTY_ACHIEVEMENT_MATRIX
1 ACHIEVEMENT_DIRECT
```

`Config_Status`:

```text
0 DRAFT
1 VALIDATED
2 PUBLISHED
3 SUPERSEDED
4 RETIRED
```

Each option key and label must be identical to the value above. Do not invent additional options.

For Stage 3C, field labels must equal the exact field codes. Do not introduce alternate Thai/English UI labels yet; UI/layout refinement is a later separately authorized stage.

Do not set business defaults that were not frozen in the plan. In particular, do not auto-default `Config_Status`, publisher, dates, weights, or scoring mode at schema level.

## KINTONE API CONTRACT

Kintone official behavior: Add Form Fields updates **pre-live** settings and requires a later Deploy App Settings call to publish those settings. Use the latest revision returned/read back; never use `-1` and never omit revision in this controlled stage.

Allowed write sequence is exactly:

```text
1. POST /k/v1/preview/app/form/fields.json   [maximum 1 attempt]
2. POST /k/v1/preview/app/deploy.json        [maximum 1 attempt]
```

No PUT/DELETE is authorized.

## STAGE 0 — GIT / STATE SAFETY GATE

Run first:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor d4b8eb0cb2939162f3128cf4325ff9b8ffe6bd95 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
working tree = clean
local HEAD = remote HEAD
reviewed Stage-3B commit is in ancestry
```

If not, STOP. Do not reset/rebase/stash/force-push automatically.

Read before execution:

- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/phase-3/MBO-P03-WP-002C_PLAN.md`
- `src/profiles/scoring-config-master.js`
- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`

## STAGE 1 — IMPLEMENT EXACT SCHEMA SAFETY PATH BEFORE ANY KINTONE WRITE

Prefer modifying existing files; do not create new modules unless absolutely necessary.

Authorized implementation files:

- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

### Required guard

Add a narrow single-use authorization such as `assertScoringMasterSchemaAuthorization(...)` with a fixed stage constant equivalent to:

```text
STAGE_3C_SCHEMA_CONFIGURATION
```

It must fail closed unless all are true:

- work package exactly `MBO-P03-WP-002C`
- App ID exactly `796`
- App name exact approved name
- explicit user authorization true
- active window true
- non-empty authorization ID
- authorization ID not already consumed in current process
- operation sequence exactly `FORM_FIELDS_ADD -> APP_DEPLOY`
- requested schema is the exact 23-field contract
- no caller-selectable alternate App ID/path/schema

Do not change global `DISCOVERY_MODE`.
Do not populate global `WRITE_ALLOWED_APPS`.
Do not weaken protected App blocks.
Do not reuse the Stage-3A live-activation authorization for schema writes.

### Required exact schema function

Implement one cohesive exact-purpose function in existing `src/core/kintone-client.js` for Stage 3C. It must hard-bind:

```text
App ID = 796
App name = MBO Profile & Scoring Configuration Master [Sandbox]
POST fields endpoint = /k/v1/preview/app/form/fields.json
Deploy endpoint = /k/v1/preview/app/deploy.json
Field manifest = exact 23 fields above
```

The caller must not be able to inject extra properties/fields or alternate endpoints.

### Tests required before write

Add tests covering at minimum:

1. wrong WP rejected
2. wrong App rejected
3. wrong stage rejected
4. missing explicit authorization rejected
5. repeated authorization ID rejected
6. operation sequence mismatch rejected
7. manifest has exactly 23 unique field codes
8. every field type / required / unique flag matches authoritative contract
9. `Master_Record_Key.unique === true`; all others not unique
10. Part A mode options exactly two and ordered correctly
11. Config status options exactly five and ordered correctly
12. no unexpected/default business values in schema
13. preflight stops if any planned field already exists
14. field POST targets only App 796 and occurs at most once
15. field POST uses exact numeric revision read from preflight
16. field POST transport uncertainty causes GET-only reconciliation, never a POST retry
17. partial/mismatched preview readback stops before deploy
18. deploy uses exact post-schema revision and occurs at most once
19. deploy success does not require parsing a JSON body
20. post-deploy success requires exact live field readback
21. no write path to Apps 794/795 or protected Apps
22. no record/layout/view/process/customization/ACL/delete write path

Run:

```bash
git diff --check
npm test
```

All tests must pass.

## STAGE 2 — COMMIT IMPLEMENTATION BEFORE KINTONE WRITE

Before commit, changed code files must be only the three authorized implementation/test files.

Commit exactly:

```text
feat: add guarded wp-002c schema configuration
```

Push to:

```text
origin/ai/antigravity-wp002c
```

Verify local HEAD = remote HEAD and working tree clean.

Only after this commit/push and passing tests may Kintone write execution begin.

## STAGE 3 — LOCAL SECURE PRE-WRITE BACKUP + GET-ONLY PREFLIGHT

Use `.env.local` only locally; never print/commit secrets.

Create/verify a local secure-backup snapshot of App 796's current live/pre-live management state using existing project backup practices. At minimum preserve safe JSON for:

- live app identity/settings
- live form fields
- live ACL
- preview app settings
- preview form fields
- preview ACL

Do not push backup payloads if they contain environment/account metadata. Record only `BACKUP_VERIFIED = YES` and a safe local evidence identifier/hash in the final report.

Then GET-only preflight:

```text
GET /k/v1/app.json?id=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/app/form/fields.json?app=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
```

Required:

```text
live App 796 exact name = PASS
live ACL = CREATOR_ONLY / DEFAULT_DENY
preview ACL = CREATOR_ONLY / DEFAULT_DENY
all 23 planned field codes absent from live
all 23 planned field codes absent from preview
preview revision = valid current numeric revision
```

If any planned field already exists or identity/ACL is unexpected, make zero Kintone writes and STOP.

Run full `npm test` again immediately before write.

## STAGE 4 — ONE-TIME FORM FIELD POST

Authorization ID:

```text
MBO-P03-WP-002C-STAGE3C-20260825-0610-ICT
```

Submit at most one:

```text
POST /k/v1/preview/app/form/fields.json
```

Body must contain only:

```text
app = 796
properties = exact 23-field schema
revision = exact current preflight preview revision
```

As soon as request is sent:

```text
STAGE3C_FIELD_POST_ATTEMPTS = 1
```

Never issue attempt 2.

### Field POST success

Require HTTP success and a numeric returned revision. Record it as:

```text
POST_SCHEMA_REVISION
```

### Transport uncertainty

Do not retry. GET preview fields/settings only.

- if all 23 fields exist exactly and a numeric latest revision is proven: reconciliation may continue
- if zero fields exist: STOP; no retry under this authorization
- if partial/mismatched state: STOP; no deploy

### Explicit HTTP failure

STOP. No retry. No deploy.

## STAGE 5 — EXACT PREVIEW READBACK BEFORE DEPLOY

GET:

```text
GET /k/v1/preview/app/form/fields.json?app=796
GET /k/v1/preview/app/settings.json?app=796
GET /k/v1/preview/app/acl.json?app=796
```

Verify all 23 fields exactly against the contract:

- type
- code
- required
- unique
- drop-down option labels and order
- no additional WP-002C field outside the manifest

Also verify ACL remains creator-only/default-deny.

Require exact latest numeric preview revision. This is the only revision permitted in deploy.

If mismatch: STOP. Do not deploy.

## STAGE 6 — ONE-TIME DEPLOY OF SCHEMA

Submit at most one:

```text
POST /k/v1/preview/app/deploy.json
```

Exact body:

```json
{
  "apps": [
    {
      "app": 796,
      "revision": "<EXACT_POST_SCHEMA_REVISION>"
    }
  ]
}
```

Rules:

- no `revert`
- no `-1`
- no second App
- deploy POST attempts <= 1
- successful deploy response has no required JSON response body
- transport uncertainty never triggers retry

After send:

```text
STAGE3C_DEPLOY_POST_ATTEMPTS = 1
```

Poll deploy status GET only, maximum 30 checks, about 2 seconds apart, until `SUCCESS`, `FAIL`, or `CANCEL`.

`FAIL`/`CANCEL`/timeout => no retry, preserve evidence, STOP.

## STAGE 7 — POSITIVE LIVE SCHEMA VERIFICATION

After deploy status SUCCESS, GET only:

```text
GET /k/v1/app.json?id=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/app/form/fields.json?app=796
GET /k/v1/apps.json?ids[0]=796
```

Require:

```text
App ID/name exact
App 796 published/catalog visible
ACL = CREATOR_ONLY / DEFAULT_DENY
23/23 planned fields exist
23/23 types correct
required flags correct
Master_Record_Key unique = true
all other unique flags = false
Part_A_Scoring_Mode options exact
Config_Status options exact
```

Do not claim schema configured based only on deploy status.

Also verify no record was created/seeded. Use a safe read-only record count/query if available and report `RECORD_COUNT = 0`.

## STAGE 8 — DOCUMENTATION / EVIDENCE

Only after positive live verification PASS, update:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`
- `project-docs/APP_REGISTRY.md`

Record Control Plane Stage-3B closure and Stage-3C actual state:

```text
WP002C_STAGE3B_GATE = PASS
WP-002C Stage 3C = SCHEMA CONFIGURATION COMPLETE / PENDING CHATGPT REVIEW
APP_ID = 796
APP_STATUS = LIVE_DEPLOYED
SCHEMA_STATUS = CONFIGURED_23_FIELDS
SCHEMA_FIELD_COUNT = 23
ACCESS_STATUS = CREATOR_ONLY / DEFAULT_DENY
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
WP-002D = NOT STARTED
NEXT_ACTION = AWAIT CHATGPT INDEPENDENT REVIEW OF STAGE 3C
```

Do not claim lifecycle immutability/publish integrity is operational merely because fields exist. Those controls are later stages.

If a write was attempted but final live verification failed/was uncertain, update only minimum safe write-history evidence and do NOT set `SCHEMA_STATUS = CONFIGURED_23_FIELDS`.

## STAGE 9 — FINAL TEST / GIT PUSH

Run:

```bash
git diff --check
npm test
git status --short
git diff --name-only
```

All tests must pass.

Verified success evidence commit:

```text
chore: record wp-002c schema configuration
```

Failed/uncertain evidence commit:

```text
chore: record wp-002c schema attempt evidence
```

Push only to `origin/ai/antigravity-wp002c`, verify local HEAD = remote HEAD and working tree clean, then STOP.

## MAXIMUM KINTONE WRITE BOUNDARY

For this entire Stage 3C:

```text
APP_CREATE POST = 0
ACL PUT = 0
FORM FIELDS POST = 1 maximum
FORM FIELDS PUT = 0
FORM FIELDS DELETE = 0
DEPLOY POST = 1 maximum
LAYOUT WRITE = 0
VIEW WRITE = 0
PROCESS WRITE = 0
CUSTOMIZATION WRITE = 0
RECORD WRITE = 0
RECORD DELETE = 0
APP DELETE = 0
```

Apps 794/795 and protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 must receive zero writes.

## ROLLBACK / FAILURE RULE

No automatic destructive rollback is authorized.

If schema exists only in preview or live verification is uncertain:

- do not retry POST
- do not delete fields
- do not call deploy `revert=true`
- do not delete App 796
- do not create another App
- preserve exact evidence and STOP

Any revert/remove operation requires a new Control Plane authorization.

## FINAL REPORT

Report only safe evidence:

- execution plane / branch
- starting HEAD
- implementation commit SHA
- authorization ID
- pre-write backup verified YES/NO + safe evidence ID/hash
- preflight live/preview identity + revision
- preflight ACL result
- preflight 23-field absence result
- tests before write total/pass/fail
- field POST attempt count + outcome + returned/reconciled revision
- preview 23/23 exact readback PASS/FAIL
- deploy POST attempt count + status sequence/final status
- live App/catalog verification
- live ACL verification
- live schema 23/23 exact verification
- record count
- all Kintone write counts
- tests after operation total/pass/fail
- evidence/status commit SHA
- changed files
- local HEAD = remote HEAD YES/NO
- working tree clean YES/NO
- final schema status
- STOP confirmation

Never expose usernames, passwords, tokens, cookies, authorization headers, `.env.local`, or sensitive backup content.

# REVIEW EXPECTATION

ChatGPT will inspect GitHub branch `ai/antigravity-wp002c` directly and verify:

1. Stage-3B reviewed commit remains in ancestry and Stage-3B PASS is recorded.
2. Implementation uses existing files unless a new file was clearly necessary.
3. Dedicated Stage-3C guard is exact-App / exact-stage / single-use / fail-closed.
4. Global discovery/protected-app safety was not weakened.
5. Exact schema contains 23 fields only and matches authoritative types/flags.
6. Master_Record_Key is the only unique field.
7. Drop-down options match frozen enums exactly.
8. No invented schema defaults/business rules were introduced.
9. Implementation/tests were committed and pushed before Kintone schema write.
10. Backup gate was verified before write.
11. Live + preview preflight proved fields absent before creation.
12. Form Fields POST occurred <= 1 time and targeted only App 796 with exact revision.
13. No retry occurred after failure/uncertainty.
14. Preview readback was exact before deploy.
15. Deploy POST occurred <= 1 time using exact post-schema revision.
16. Deploy status alone was not used as schema-success proof.
17. Live schema readback proves 23/23 fields and exact critical settings.
18. ACL remained creator-only/default-deny.
19. Record count remains zero and no seed occurred.
20. Apps 794/795 and protected Apps received zero writes.
21. No layout/view/process/customization/permission/delete/write-scope expansion occurred.
22. Tests pass before and after operation.
23. Living docs/evidence match actual state and do not overclaim publish/lifecycle controls.
24. Git local/remote heads are synchronized.
25. WP-002D did not start.

Expected gates:

- `STAGE3C_IMPLEMENTATION_GATE = PASS / FAIL`
- `SCHEMA_CONTRACT_GATE = PASS / FAIL`
- `PREWRITE_BACKUP_GATE = PASS / FAIL`
- `SCHEMA_WRITE_SCOPE_GATE = PASS / FAIL`
- `SCHEMA_SINGLE_ATTEMPT_GATE = PASS / FAIL`
- `PREVIEW_SCHEMA_READBACK_GATE = PASS / FAIL`
- `SCHEMA_DEPLOY_GATE = PASS / FAIL / UNCERTAIN`
- `LIVE_SCHEMA_VERIFICATION_GATE = PASS / FAIL / UNVERIFIABLE`
- `ACL_PRESERVATION_GATE = PASS / FAIL`
- `ZERO_SEED_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `KINTONE_SAFETY_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = PASS / BLOCKED / FAIL`
