# AI ACTIVE TASK — D1 APP800 PASSWORD RESET AUTHORITY DISCOVERY R1 CORRECTIVE

Mode: **ANTIGRAVITY READ-ONLY CORRECTIVE ONLY — GET ONLY + LOCAL GIT/BUILD PROVENANCE CHECK / NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY / NO PASSWORD RESET**  
Branch: `ai/antigravity-wp002c`

## 1. Why This Corrective Exists

First discovery evidence was useful but ChatGPT Independent Review found two overclaims that block a safe source WP:

1. evidence claimed deployed App800 CSS blob `8ace549b91c7b02a19de05c7584402eb49ad62d1` exactly matches current `src/styles/hr-control-center.css`, but canonical Git reports the current source CSS blob as `3d61fdc332698902c77d60d4d60ef60b06c58db1`;
2. evidence treated App800 ACL `CREATOR` as `admin-form` without proving the actual App800 `creator.code`.

The deployed JS bundle -> current source correspondence was also stated too strongly without a canonical App800 build/provenance chain.

This task only corrects the discovery evidence. Do not implement Reset UI yet.

## 2. Exact Corrective Checks

### A. Canonical Git identities

From the exact current branch HEAD observed before discovery, record using Git itself:

```text
git rev-parse HEAD
git hash-object src/ui/hr-control-center.js
git hash-object src/styles/hr-control-center.css
```

Record file byte sizes as well.

Do not normalize or rewrite either file.

### B. App800 Live + Preview exact customization

GET-only read both:
- `/k/v1/app/customize.json?app=800`
- `/k/v1/preview/app/customize.json?app=800`

Record separately for Live and Preview:
- revision;
- scope;
- Desktop JS count/order/type/name/fileKey;
- Desktop CSS count/order/type/name/fileKey;
- Mobile JS count/order;
- Mobile CSS count/order.

Where current safe GET tooling can download a FILE entry, compute and record exact Git-blob SHA for **both Live and Preview** copies.

If Preview file download/hash cannot be obtained read-only, write `UNKNOWN`; do not infer equality from name alone.

### C. Source-to-deployed provenance decision

For CSS:
- compare deployed Live/Preview file blob(s) with exact current Git source CSS blob;
- result must be one of `EXACT_MATCH`, `MISMATCH`, or `UNKNOWN`.

For JS:
- do not compare the deployed bundle blob directly to the unbundled source blob and call that source correspondence;
- search local Git/history for an existing committed App800 bundle/build recipe/provenance if available;
- if an exact deterministic local build can be reproduced **without changing tracked source/config/package files and without network**, compute its bundle Git-blob SHA and compare;
- if the exact historical build recipe cannot be proven, status = `UNKNOWN` even if code looks semantically related.

No new build/deploy script in this task.

### D. Prove App800 creator identity

GET-only read App800 app metadata using the appropriate Kintone Get App endpoint and record:

```text
creator.code
creator.name (if returned)
```

Then decide:

```text
APP800_CREATOR_IS_ADMIN_FORM = YES / NO / UNKNOWN
```

Only `YES` if the returned `creator.code` is exactly `admin-form`.

Do not assume the ACL `CREATOR` entity means `admin-form` without this proof.

### E. HR_ADMIN_GROUP

Preserve these separately:
- `HR_ADMIN_GROUP_IN_APP800_ACL = YES/NO` from App800 ACL;
- `HR_ADMIN_GROUP_EXISTS_IN_TENANT = YES/NO/UNKNOWN` only if safely proven by an available read-only User API path.

A failed/unsupported User API call must remain `UNKNOWN`; do not convert it to `NO`.

## 3. Evidence Update

Update only:
`project-docs/D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_EVIDENCE.md`

The corrected evidence must clearly mark the prior wrong/unsupported statements as superseded, not silently rewrite history.

Required final sections:
- exact starting HEAD;
- Git source identities;
- exact Live topology;
- exact Preview topology;
- Live/Preview downloadable file identities or UNKNOWN;
- CSS provenance decision;
- JS provenance decision;
- App800 `creator.code` proof;
- admin-form authority result;
- `HR_ADMIN_GROUP` ACL vs tenant-existence result;
- build/deploy tooling finding;
- GET count if available;
- POST/PUT/DELETE/upload/deploy/password-reset/ACL-write counts = 0.

## 4. Forbidden

```text
SOURCE_TEST_DIST_CHANGE         = 0
NEW_SCRIPT_CONFIG_PACKAGE_FILE  = 0
APP800_RECORD_WRITE             = 0
APP801_RECORD_WRITE             = 0
APP794_RECORD_WRITE             = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
CUSTOMIZATION_UPLOAD            = 0
DEPLOY                          = 0
PASSWORD_RESET                  = 0
ROLLBACK                        = 0
POST                            = 0
PUT                             = 0
DELETE                          = 0
```

Do not modify `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, baselines, skills, source, tests, dist, config, scripts, package files.
Do not revive `services/mbo-auth-bridge/`.

## 5. Completion

Commit + push only the corrected evidence file, then STOP.

Maximum executor status:
`D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_R1_CORRECTED_PENDING_CHATGPT_REVIEW`

## 6. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION = 60
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
NEXT_OWNER_AFTER_EXECUTION    = CHATGPT INDEPENDENT REVIEW
```
