# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4D-B CONTROLLED LIVE GET PREFLIGHT

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4D-A final head:** `902a57db95d77fc15eefd2b18c11ef4e61cafb04`
> **Reviewed Stage 4D-A code:** `322d12bd8eac7f23b8b823826d2a4852077ca4b1`
> **Target App:** 796 — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Mode:** CONTROLLED LIVE READ-ONLY PREFLIGHT
> **Authorized network operations:** GET ONLY, exact Stage 4D-A sequence
> **Authorized Kintone writes:** ZERO
> **`.env.local`:** MAY BE USED ONLY AS LOCAL READ-ONLY CONNECTION INPUT; NEVER PRINT / COPY / COMMIT / MODIFY

# CONTROL PLANE DECISION

Independent review is complete:

```text
WP002C_STAGE4D_A_GATE = PASS
STAGE4D_A_READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = PASSED / FROZEN
reported regression = 471/471 PASS
```

Accepted Stage 4D-A gates:

```text
STAGE4C_CLOSURE_GATE = PASS
READ_ONLY_PREFLIGHT_ARCHITECTURE_GATE = PASS
APP_ID_SAFETY_BINDING_GATE = PASS
LIVE_PREVIEW_IDENTITY_CONTRACT_GATE = PASS
LIVE_PREVIEW_SCHEMA_CONTRACT_GATE = PASS
LIVE_PREVIEW_ACL_CONTRACT_GATE = PASS
STAGE4C_BRIDGE_REUSE_GATE = PASS
ZERO_RECORD_PREFLIGHT_GATE = PASS
ERROR_REDACTION_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
DISCOVERY_LOCK_PRESERVATION_GATE = PASS
REGRESSION_GATE = PASS
ZERO_KINTONE_STAGE4D_A_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS
GIT_PUSH_SYNC_GATE = PASS
```

Stage 3C historical evidence exception remains unchanged:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
```

Do not rewrite historical evidence.

---

# STAGE 4D-B PURPOSE

Execute the already-reviewed Stage 4D-A function against real Kintone App 796 exactly once as a controlled read-only reconciliation.

This stage proves the current real state of:

```text
live app identity
preview app identity
live 23-field schema
preview 23-field schema
live creator-only ACL
preview creator-only ACL
record count == 0
Stage 4C records GET bridge composition
```

This is NOT a write authorization and NOT a seed/publish authorization.

---

# STEP 0 — GIT / REVIEWED-CODE INTEGRITY

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor 902a57db95d77fc15eefd2b18c11ef4e61cafb04 HEAD
git diff --quiet 322d12bd8eac7f23b8b823826d2a4852077ca4b1 HEAD -- src/core/kintone-client.js tests/safety-guard.test.js
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed Stage 4D-A final head is in ancestry
reviewed Stage 4D-A code/test diff since 322d12b = EMPTY
tracked working tree clean
```

If any requirement fails: STOP. Do not run live preflight.

Read before execution:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/phase-3/MBO-P03-WP-002C_PLAN.md
src/core/kintone-client.js
src/core/sandbox-write-guard.js
```

---

# STEP 1 — DURABLE STAGE 4D-A CLOSURE / STAGE 4D-B AUTHORIZATION

Update only these living docs:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current state before live GET:

```text
WP002C_STAGE4D_A_GATE = PASS
STAGE4D_A_READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = PASSED / FROZEN
STAGE4D_B_CONTROLLED_LIVE_GET_PREFLIGHT = AUTHORIZED / NOT_EXECUTED
READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = PASSED / FROZEN
LIVE_KINTONE_READ_RECONCILIATION = NOT_STARTED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
PREWRITE_BACKUP_CONTRACT_STATUS = DURABLE_RETENTION_REQUIRED / NOT_EXECUTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified checkpoint only; Stage 4D-B has not re-read yet)
NEXT_ACTION = EXECUTE ONE CONTROLLED LIVE GET PREFLIGHT FOR APP 796
```

Update Stage 4D-A final closure traceability with real SHA:

```text
902a57db95d77fc15eefd2b18c11ef4e61cafb04 — docs: close wp-002c stage4d-a review evidence
```

Run:

```bash
git diff --check
```

Commit exactly:

```text
docs: close wp-002c stage4d-a and authorize stage4d-b
```

Push only to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

Do not modify source/test/config files.

---

# STEP 2 — LOCAL SECRET SAFETY PREFLIGHT

`.env.local` may be used in this stage only because real GETs are now explicitly authorized.

DO NOT display, cat, type, print, copy, upload, diff, commit, hash, or otherwise expose `.env.local` contents.

Run only metadata/safety checks:

```bash
git check-ignore -q .env.local
```

Required: exit code 0.

Verify it is not tracked. Use a command that does not print contents, for example:

```bash
git ls-files --error-unmatch .env.local
```

Required: this command MUST fail because `.env.local` must not be tracked.

Check required variable PRESENCE ONLY, never values:

```bash
node --env-file=.env.local --input-type=module -e "const keys=['KINTONE_BASE_URL','KINTONE_USERNAME','KINTONE_PASSWORD']; console.log(JSON.stringify(Object.fromEntries(keys.map(k=>[k,Boolean(process.env[k])])))); if(keys.some(k=>!process.env[k])) process.exit(1)"
```

Expected safe output contains booleans only:

```text
KINTONE_BASE_URL = true
KINTONE_USERNAME = true
KINTONE_PASSWORD = true
```

If `.env.local` is missing, tracked, not ignored, or required variables are absent: STOP without live calls.

Do NOT modify `.env.local`.

---

# STEP 3 — PRE-LIVE SAFETY / REGRESSION

Run:

```bash
npm test
```

Required:

```text
471/471 PASS or legitimately higher
0 FAIL
```

Confirm safety constants without secrets:

```bash
node --input-type=module -e "const g=await import('./src/core/sandbox-write-guard.js'); console.log(JSON.stringify({DISCOVERY_MODE:g.DISCOVERY_MODE,WRITE_ALLOWED_APPS:g.WRITE_ALLOWED_APPS,APP_ID:g.WP002C_SCORING_MASTER_APP_ID,APP_NAME:g.WP002C_APPROVED_APP_NAME}))"
```

Required:

```text
DISCOVERY_MODE = true
WRITE_ALLOWED_APPS = []
APP_ID = 796
APP_NAME = exact approved name
```

If not exact: STOP.

---

# STEP 4 — EXECUTE ONE CONTROLLED LIVE PREFLIGHT

Execute the reviewed function one time only.

Important authentication rule for this run:

- load `.env.local` into the process
- DO NOT alter `.env.local`
- delete `KINTONE_API_TOKEN` from the process before requests
- therefore existing `kintoneRequest` uses username/password (+ Basic Auth only if already configured)
- never print credentials or headers

Use the existing reviewed `kintoneRequest` as the only network transport, wrapped only to count attempted/successful GET calls safely.

Run exactly one live preflight command equivalent to:

```bash
node --env-file=.env.local --input-type=module -e "delete process.env.KINTONE_API_TOKEN; const m=await import('./src/core/kintone-client.js'); let attemptedGetCalls=0; let successfulGetCalls=0; const transport=async(path,opts)=>{attemptedGetCalls+=1; const r=await m.kintoneRequest(path,opts); successfulGetCalls+=1; return r;}; try{const result=await m.verifyScoringConfigReadOnlyLivePreflight({transport}); console.log(JSON.stringify({status:'PASS',attemptedGetCalls,successfulGetCalls,result}));}catch{console.error(JSON.stringify({status:'FAIL',error:'STAGE4D_READ_PREFLIGHT_FAILED',attemptedGetCalls,successfulGetCalls})); process.exit(1)}"
```

DO NOT run this command more than once.

## Expected PASS contract

The one safe JSON output must prove:

```text
status = PASS
attemptedGetCalls = 7
successfulGetCalls = 7
result.appId = 796
result.appName = MBO Profile & Scoring Configuration Master [Sandbox]
result.plannedFieldCount = 23
result.liveAclStatus = CREATOR_ONLY
result.previewAclStatus = CREATOR_ONLY
result.recordCount = 0
result.repositoryBridgeGetVerified = true
```

Revision strings may differ between live and preview and must be recorded only as safe numeric revision strings.

No raw Kintone payload may be persisted.

## Failure contract

If the command fails:

- DO NOT retry
- DO NOT diagnose by making more Kintone calls
- DO NOT use curl/Postman/browser/API explorer as fallback
- DO NOT alter `.env.local`
- record only:
  - `STAGE4D_READ_PREFLIGHT_FAILED`
  - attemptedGetCalls
  - successfulGetCalls
- current live record count becomes `UNKNOWN_CURRENT / LAST_VERIFIED_0`
- proceed only to failure evidence docs and STOP

---

# STEP 5 — ABSOLUTE WRITE PROHIBITION

For the whole Stage 4D-B task:

```text
Kintone POST = 0
Kintone PUT = 0
Kintone PATCH = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
Kintone RECORD WRITE = 0
Kintone SCHEMA WRITE = 0
Kintone ACL WRITE = 0
```

Do not invoke:

```text
createAndVerifyScoringConfigMasterPreview
activateScoringConfigMasterLive
configureAndDeployScoringMasterSchema
repairScoringMasterDropdownSchema
ScoringConfigKintoneRepository.createValidatedRecord
ScoringConfigKintoneRepository.publishRecord
```

Do not open any write authorization window.
Do not change `DISCOVERY_MODE`.
Do not change `WRITE_ALLOWED_APPS`.
Do not create a pre-write backup because no write is authorized.
Do not seed.
Do not publish.
Do not supersede/retire.
Do not implement trusted audit identity.
Do not wire resolver.
Do not start WP-002D.

---

# STEP 6 — EVIDENCE DOCS

Modify only:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

No source/test/config changes.

## If PASS

Record:

```text
WP002C_STAGE4D_A_GATE = PASS
STAGE4D_A_READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = PASSED / FROZEN
STAGE4D_B_CONTROLLED_LIVE_GET_PREFLIGHT = EXECUTED / PENDING CHATGPT REVIEW
LIVE_KINTONE_READ_RECONCILIATION = VERIFIED / PENDING CHATGPT REVIEW
LIVE_APP_IDENTITY = VERIFIED
PREVIEW_APP_IDENTITY = VERIFIED
LIVE_SCHEMA_23_FIELDS = VERIFIED
PREVIEW_SCHEMA_23_FIELDS = VERIFIED
LIVE_ACL_CREATOR_ONLY = VERIFIED
PREVIEW_ACL_CREATOR_ONLY = VERIFIED
REPOSITORY_BRIDGE_GET = VERIFIED
RECORD_COUNT = 0 (LIVE VERIFIED BY STAGE 4D-B)
STAGE4D_B_ATTEMPTED_GETS = 7
STAGE4D_B_SUCCESSFUL_GETS = 7
STAGE4D_B_KINTONE_WRITES = 0
ENV_LOCAL_USED = YES / LOCAL ONLY / NOT MODIFIED / NOT COMMITTED / NOT PRINTED
KINTONE_API_TOKEN_SENT = NO (removed from process for controlled run)
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
NEXT_ACTION = AWAIT CHATGPT STAGE 4D-B REVIEW BEFORE ANY WRITE-RELATED STAGE
```

Record the safe revision strings returned by the preflight:

```text
liveSettingsRevision
previewSettingsRevision
liveFieldsRevision
previewFieldsRevision
liveAclRevision
previewAclRevision
```

Do not record secrets, auth headers, raw response payloads, raw user objects, or `.env.local` contents.

Commit exactly:

```text
docs: record wp-002c stage4d-b live read preflight
```

## If FAIL

Record:

```text
STAGE4D_B_CONTROLLED_LIVE_GET_PREFLIGHT = BLOCKED / FAILED
LIVE_KINTONE_READ_RECONCILIATION = FAILED
ERROR_CODE = STAGE4D_READ_PREFLIGHT_FAILED
STAGE4D_B_ATTEMPTED_GETS = <safe count>
STAGE4D_B_SUCCESSFUL_GETS = <safe count>
STAGE4D_B_KINTONE_WRITES = 0
RECORD_COUNT = UNKNOWN_CURRENT / LAST_VERIFIED_0
ENV_LOCAL_USED = YES / LOCAL ONLY / NOT MODIFIED / NOT COMMITTED / NOT PRINTED
KINTONE_API_TOKEN_SENT = NO
NEXT_ACTION = AWAIT CHATGPT FAILURE REVIEW; NO RETRY
```

Commit exactly:

```text
docs: record wp-002c stage4d-b live read preflight failure
```

Run:

```bash
git diff --check
git diff --name-only
```

Required evidence-doc diff = only the five authorized living docs.

Push only `origin/ai/antigravity-wp002c`.

Verify:

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
```

Required:

```text
local HEAD = remote HEAD
tracked working tree clean
```

Then STOP.

---

# EXPECTED COMMIT SHAPE

After this Control Plane assignment, expect exactly two Antigravity commits on PASS:

```text
1. docs: close wp-002c stage4d-a and authorize stage4d-b
2. docs: record wp-002c stage4d-b live read preflight
```

No source/test/config commit is expected.

On FAIL, commit 2 must instead be:

```text
docs: record wp-002c stage4d-b live read preflight failure
```

---

# FINAL REPORT

Report only safe evidence:

- branch
- assignment/start HEAD
- Stage 4D-A closure / Stage 4D-B authorization commit SHA
- Stage 4D-B evidence commit SHA
- live preflight status PASS/FAIL
- attempted GET count
- successful GET count
- App ID / exact App name verification
- live/preview identity verification
- live/preview 23-field schema verification
- live/preview creator-only ACL verification
- repository bridge GET verification
- live record count if verified
- safe revision strings if PASS
- Kintone writes = 0
- `.env.local` used = YES/NO
- `.env.local` modified = NO
- `.env.local` committed = NO
- secrets printed = NO
- KINTONE_API_TOKEN sent = NO
- test total/pass/fail
- local HEAD = remote HEAD YES/NO
- tracked working tree clean YES/NO
- STOP confirmation

# REVIEW EXPECTATION

ChatGPT will inspect GitHub directly and verify:

1. Stage 4D-A is durably recorded PASS/FROZEN.
2. Exactly two Antigravity docs commits exist after this assignment on PASS.
3. No source/test/config file changed after reviewed Stage 4D-A code commit.
4. First Antigravity commit changes exactly the five living docs.
5. Second Antigravity commit changes exactly the five living docs.
6. `.env.local` is ignored/untracked and never committed.
7. Regression remains >=471 and PASS.
8. The live execution used the reviewed Stage 4D-A function and existing `kintoneRequest` only.
9. API token was removed from process and not sent.
10. Exactly 7 attempted and 7 successful GETs on PASS.
11. App 796 exact live/preview identity verified.
12. Live/preview 23-field schemas verified.
13. Live/preview creator-only ACLs verified.
14. Records GET reused Stage 4C bridge and record count is exactly 0.
15. No Kintone write/deploy occurred.
16. No backup, seed, publish, trusted audit provider, resolver wiring, or WP002D occurred.
17. Stage 3C evidence exception remains preserved.
18. Git branch points to final evidence commit.

Expected PASS gates:

```text
STAGE4D_A_CLOSURE_GATE = PASS / FAIL
REVIEWED_CODE_INTEGRITY_GATE = PASS / FAIL
LOCAL_SECRET_SAFETY_GATE = PASS / FAIL
LIVE_GET_ONLY_EXECUTION_GATE = PASS / FAIL
LIVE_APP_IDENTITY_GATE = PASS / FAIL
LIVE_SCHEMA_GATE = PASS / FAIL
LIVE_ACL_GATE = PASS / FAIL
LIVE_ZERO_RECORD_GATE = PASS / FAIL
STAGE4C_BRIDGE_LIVE_GET_GATE = PASS / FAIL
API_TOKEN_SUPPRESSION_GATE = PASS / FAIL
NO_RETRY_FAIL_CLOSED_GATE = PASS / FAIL
ZERO_KINTONE_WRITE_GATE = PASS / FAIL
REGRESSION_GATE = PASS / FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4D_B_GATE = PASS / BLOCKED
```
