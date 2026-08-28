# AI ACTIVE TASK — D1 APP794 ACCEPTED CUSTOMIZATION DEPLOY

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW PRODUCTION CUSTOMIZATION DEPLOY ONLY**

## 0. Exact User Authorization

User explicitly approved on 2026-08-28:

```text
APP794_D1_CUSTOMIZATION_DEPLOY = APPROVED
TARGET_APP = 794
```

Exact accepted artifact:

```text
ACCEPTED_SOURCE_COMMIT = 63796999a321a24e1cbd29ceaad82b43980fe8ea
TARGET_PATH            = dist/mbo-employee-app.js
TARGET_GIT_BLOB_SHA    = 96ec6424e7b7f528e82117b566ac96accb0ffb16
```

The same blob SHA exists at current branch HEAD. Therefore:
- DO NOT rebuild;
- DO NOT edit source;
- DO NOT change CSS;
- DO NOT add features;
- DO NOT deploy any different JS artifact.

This approval does NOT authorize:
- App801 credential create/update/reset/delete;
- App53/795/796 write;
- group/ACL change;
- schema/process change;
- D2-D7 work;
- UAT data mutation;
- any unrelated App794 customization change.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `skills/kintone/safe-live-change.md`
5. `dist/mbo-employee-app.js`
6. existing `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only for evidence continuity

Do not scan repository/history.
Do not create a planning package.

## 2. Mandatory Pre-Write Gates

Before any Kintone customization write:

### A. Exact Artifact Identity
Verify the local target file is exactly the Git-tracked artifact above.

Required:

```text
TARGET_PATH = dist/mbo-employee-app.js
TARGET_GIT_BLOB_SHA = 96ec6424e7b7f528e82117b566ac96accb0ffb16
ARTIFACT_IDENTITY = PASS
```

If not exact:

```text
DEPLOY_RESULT = BLOCKED_ARTIFACT_DRIFT
APP794_CUSTOMIZATION_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
```

STOP.

### B. Live App794 Customization Read-Back
Read the current effective App794 customization and revision before write.

Capture sanitized metadata only:
- live revision;
- scope;
- desktop JS entry types/names or URLs;
- desktop CSS entry types/names or URLs;
- mobile JS/CSS entry types/names or URLs.

Require exactly one current desktop FILE entry named:

```text
mbo-employee-app.js
```

If target is missing or appears more than once, STOP before write.

### C. Rollback-Ready Backup
Before write, obtain rollback-ready copies of every current FILE customization required to restore the exact pre-write state.

Backup must cover current:
- desktop JS;
- desktop CSS;
- mobile JS;
- mobile CSS;
- scope and entry ordering.

The backup may remain local/temp and must not expose tokens/cookies.
Git evidence contains metadata/hash only, not full backup source unless already tracked and necessary.

If rollback-ready backup cannot be proven, STOP before write.

## 3. Exact Allowed Change

Construct the new App794 customization from the **live pre-write state**, not from an old backup document.

Preserve exactly:
- current scope;
- all desktop CSS entries;
- all mobile JS/CSS entries;
- all URL entries;
- all desktop JS entries other than the single FILE target `mbo-employee-app.js`;
- entry ordering as far as Kintone permits.

Change exactly one thing:

```text
replace current desktop FILE mbo-employee-app.js
with current Git dist/mbo-employee-app.js
(blob SHA 96ec6424e7b7f528e82117b566ac96accb0ffb16)
```

Upload the accepted file, update App794 customization using the current revision/concurrency mechanism, then apply/deploy through the normal Kintone customization deployment path.

Do not touch records, schema, process management, permissions, or other apps.

## 4. Deployment Completion Gate

After issuing deploy/apply:
- wait/poll until Kintone reports deployment completion;
- HTTP success alone is not PASS;
- if deployment reports failure, STOP and preserve exact error evidence.

Do not start UAT in this task.

## 5. Mandatory Post-Deploy Verification

After Kintone deployment completes:

1. live-read the effective App794 customization again;
2. verify the target desktop JS still appears exactly once as `mbo-employee-app.js`;
3. obtain/read the effective deployed target file content;
4. calculate a content SHA-256 (or another stable explicit content hash) for:
   - local accepted `dist/mbo-employee-app.js`;
   - effective deployed `mbo-employee-app.js`;
5. require the two content hashes to match exactly;
6. compare pre-write vs post-write customization metadata and prove every non-target entry is unchanged;
7. verify App794 records/schema/process/ACL were not changed by this packet.

Required result fields:

```text
APP794_REVISION_BEFORE = <value>
APP794_REVISION_AFTER = <value>
TARGET_FILE_NAME_AFTER = mbo-employee-app.js
TARGET_CONTENT_HASH_MATCH = YES
NON_TARGET_CUSTOMIZATION_PRESERVED = YES
DEPLOYMENT_COMPLETED = YES
```

## 6. Rollback Rule

If post-deploy verification fails or any non-target customization changed unexpectedly:

1. STOP all forward work;
2. restore the exact backed-up pre-write customization using the rollback-ready copies;
3. deploy/apply rollback;
4. wait for rollback completion;
5. live-read and prove restoration;
6. report `ROLLED_BACK_PENDING_REVIEW`.

Do not improvise a partial cleanup.
If rollback itself is blocked, STOP and report exact blocker immediately.

## 7. Mandatory Counters

Report exactly:

```text
APP794_CUSTOMIZATION_WRITES_EXECUTED = <count>
APP794_DEPLOY_EXECUTED = <count>
APP794_ROLLBACK_WRITES_EXECUTED = <count>
APP794_ROLLBACK_DEPLOY_EXECUTED = <count>
APP794_RECORD_WRITES_EXECUTED = 0
APP801_WRITES_EXECUTED = 0
APP53_795_796_WRITES_EXECUTED = 0
GROUP_ACL_WRITES_EXECUTED = 0
D2_D7_WRITES_EXECUTED = 0
SOURCE_FILES_CHANGED = 0
```

Clearly define whether upload-file calls are counted separately from customization-setting writes; do not hide them.

## 8. Evidence / Delivery

Update the existing evidence file only:

`project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`

Append one concise section:

```text
## 12. App794 D1 Accepted Customization Deploy
```

Include only sanitized evidence:
- authorization/target app;
- accepted source commit + Git blob SHA;
- revision before/after;
- pre/post customization entry metadata;
- rollback-ready backup status;
- target local/deployed content hashes (hash values are allowed; source content is not required);
- deployment status;
- non-target preservation result;
- rollback result if used;
- mandatory counters.

Do NOT commit:
- API token;
- cookies/auth headers;
- downloaded untracked production source unless required for rollback and explicitly safe;
- credentials/password/hash data from App801;
- unrelated employee data.

Prefer one evidence commit + one push.
Final executor report <= 15 concise lines.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

If rollback occurs:

```text
ROLLED_BACK_PENDING_INDEPENDENT_REVIEW
```

STOP after push or on first real blocker.
Do NOT begin UAT and do NOT start another work package.
ChatGPT performs the next independent review.
