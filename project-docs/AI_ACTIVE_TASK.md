# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4C CLOSURE + STAGE 4D-A READ-ONLY LIVE PREFLIGHT FOUNDATION

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4C final head:** `6f03d9049ce4377534f6b494a715ee0b7ba9afb2`
> **Target App:** 796 — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Mode:** STAGE 4C GOVERNANCE CLOSURE + STAGE 4D-A CODE/UNIT FOUNDATION ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO
> **`.env.local`:** DO NOT USE

# CONTROL PLANE DECISION

Independent review is complete:

```text
WP002C_STAGE4C_GATE = PASS
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = PASSED / FROZEN
reported regression = 441/441 PASS
```

Accepted Stage 4C gates:

```text
STAGE4B_CLOSURE_GATE = PASS
RECORD_WRITE_GUARD_SCOPE_GATE = PASS
CONTEXT_APP_BINDING_GATE = PASS
PREWRITE_BACKUP_CONTRACT_GATE = PASS
AUTHORIZATION_REPLAY_GATE = PASS
MANIFEST_EXACTNESS_GATE = PASS
REQUEST_BRIDGE_ARCHITECTURE_GATE = PASS
BRIDGE_PATH_ALLOWLIST_GATE = PASS
APP_ID_SAFETY_BINDING_GATE = PASS
LIFECYCLE_ONLY_WRITE_GATE = PASS
ERROR_REDACTION_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
DISCOVERY_LOCK_PRESERVATION_GATE = PASS
REGRESSION_GATE = PASS
ZERO_KINTONE_STAGE4C_GATE = PASS
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

# WHY STAGE 4D-A

The authoritative WP-002C plan separates:

- live adapter/read-back capability
- app/schema creation
- baseline seeding
- publish activation
- runtime resolver wiring

Stage 4D-A prepares a **strict read-only live preflight function** that can later be invoked under a separately reviewed Stage 4D-B with `.env.local`.

This task MUST NOT perform the live invocation.

After Stage 4D-A:

```text
READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = IMPLEMENTED_NOT_EXECUTED
LIVE_KINTONE_READ_RECONCILIATION = NOT_STARTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
```

---

# STEP 0 — GIT SAFETY

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
git merge-base --is-ancestor 6f03d9049ce4377534f6b494a715ee0b7ba9afb2 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed Stage 4C final head is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

Read before work:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/phase-3/MBO-P03-WP-002C_PLAN.md
src/core/kintone-client.js
src/core/sandbox-write-guard.js
src/services/scoring-config-kintone-repository.js
tests/safety-guard.test.js
```

---

# STEP 1 — DURABLE STAGE 4C CLOSURE / STAGE 4D-A AUTHORIZATION

Update only these living docs:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current operational state:

```text
WP002C_STAGE4A_GATE = PASS
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = PASSED / FROZEN
WP002C_STAGE4B_GATE = PASS
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = PASSED / FROZEN
WP002C_STAGE4C_GATE = PASS
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = PASSED / FROZEN
STAGE4D_A_READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = AUTHORIZED / NOT_STARTED
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = NOT_IMPLEMENTED
LIVE_KINTONE_READ_RECONCILIATION = NOT_STARTED
PREWRITE_BACKUP_CONTRACT_STATUS = DURABLE_RETENTION_REQUIRED / NOT_EXECUTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; not re-read in this task)
NEXT_ACTION = EXECUTE STAGE 4D-A READ-ONLY LIVE PREFLIGHT FOUNDATION
```

Update Stage 4C final doc closure traceability with the real SHA:

```text
6f03d9049ce4377534f6b494a715ee0b7ba9afb2 — docs: close wp-002c stage4c review evidence
```

Do not convert the Stage 3C evidence exception into PASS.

Run:

```bash
git diff --check
```

Commit exactly:

```text
docs: close wp-002c stage4c and authorize stage4d-a
```

Push only to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD before code changes.

---

# STEP 2 — IMPLEMENT READ-ONLY LIVE PREFLIGHT FOUNDATION

Modify existing file only:

```text
src/core/kintone-client.js
```

Do not create a new module.

Add exactly one exported Stage 4D-A orchestration function with recommended name:

```text
verifyScoringConfigReadOnlyLivePreflight({ transport = kintoneRequest } = {})
```

The function is asynchronous.

## 2.1 Safety contract

The function MUST:

- issue GET only
- target numeric `WP002C_SCORING_MASTER_APP_ID` only
- target exact `WP002C_APPROVED_APP_NAME` only
- never accept caller-selectable App ID
- never accept caller-selectable path
- never send POST/PUT/PATCH/DELETE
- never modify `DISCOVERY_MODE`
- never modify `WRITE_ALLOWED_APPS`
- never call `fetch` directly
- never call `getKintoneConnection` directly
- never read environment variables directly
- use the provided `transport(path, { method })` dependency
- default `transport` to existing `kintoneRequest` ONLY so a later separately authorized task can execute the preflight without adding another live transport path
- perform zero I/O merely by importing the module or defining the function

Validate that `transport` is a function before any operation.

Stable Stage 4D-A failure code:

```text
STAGE4D_READ_PREFLIGHT_FAILED
```

Do not append raw transport error messages, credentials, response bodies, or secrets.

No retries.

## 2.2 Exact GET sequence

Use exactly these hardcoded read targets, in this order:

```text
1. GET /k/v1/app/settings.json?app=796
2. GET /k/v1/preview/app/settings.json?app=796
3. GET /k/v1/app/form/fields.json?app=796
4. GET /k/v1/preview/app/form/fields.json?app=796
5. GET /k/v1/app/acl.json?app=796
6. GET /k/v1/preview/app/acl.json?app=796
7. GET records through the existing Stage 4C bridge using query `limit 1`
```

For steps 1–6 call the injected transport directly with exact `{ method: 'GET' }`.

For step 7 MUST reuse:

```text
createScoringConfigRepositoryRequestBridge({ transport })
```

and call it with:

```text
{
  method: 'GET',
  path: '/k/v1/records.json',
  params: {
    app: WP002C_SCORING_MASTER_APP_ID,
    query: 'limit 1'
  }
}
```

This must result in the transport target:

```text
/k/v1/records.json?app=796&query=limit%201
```

Do not duplicate Stage 4C query encoding logic.

## 2.3 Exact verification

Live and preview settings must each be a true plain object and satisfy:

```text
name === WP002C_APPROVED_APP_NAME
revision = non-empty digits-only string
```

Do not require live revision === preview revision.

Live and preview fields payloads must each:

- be a true plain object
- have true plain-object `properties`
- have digits-only string `revision`
- pass existing `assertExact23FieldSchema(properties, 'STAGE4D_READ_PREFLIGHT_FAILED')`

Do not invent a competing schema verifier.

Live and preview ACL payloads must each:

- be true plain objects
- pass existing `assertCreatorOnlyAcl(payload, 'STAGE4D_READ_PREFLIGHT_FAILED')`

The final records response must:

- be a true plain object
- contain `records` as an array
- contain zero records

If one or more records exist, fail closed with `STAGE4D_READ_PREFLIGHT_FAILED`.
Do not inspect, mutate, delete, publish, or seed any record.

## 2.4 Safe return evidence

Return only safe summary metadata:

```text
{
  appId: 796,
  appName: exact approved name,
  liveSettingsRevision: <string>,
  previewSettingsRevision: <string>,
  liveFieldsRevision: <string>,
  previewFieldsRevision: <string>,
  liveAclRevision: <string>,
  previewAclRevision: <string>,
  plannedFieldCount: 23,
  liveAclStatus: 'CREATOR_ONLY',
  previewAclStatus: 'CREATOR_ONLY',
  recordCount: 0,
  repositoryBridgeGetVerified: true
}
```

Do not return headers, connection data, raw payloads, usernames, passwords, API tokens, Basic Auth values, cookies, or URLs containing credentials.

---

# STEP 3 — TESTS

Modify existing test file only:

```text
tests/safety-guard.test.js
```

Do not create a new test file.

Import the new preflight function and add meaningful tests covering at minimum:

1. valid exact fake read sequence passes
2. exact seven calls occur in exact order
3. every transport call uses method GET
4. exact App 796 paths are used
5. record lookup is routed through Stage 4C bridge and exact encoded path is observed
6. safe summary return contains only expected keys/values
7. wrong live app name rejected
8. wrong preview app name rejected
9. malformed live settings rejected
10. malformed preview settings rejected
11. non-numeric live settings revision rejected
12. non-numeric preview settings revision rejected
13. live schema mismatch rejected
14. preview schema mismatch rejected
15. malformed live fields payload rejected
16. malformed preview fields payload rejected
17. live ACL mismatch rejected
18. preview ACL mismatch rejected
19. malformed ACL payload rejected
20. non-zero records rejected
21. malformed records response rejected
22. transport throw is redacted to exact Stage 4D failure code
23. transport is not retried after failure
24. invalid/non-function transport rejected before calls
25. function source does not directly reference `fetch(`, `getKintoneConnection(`, `process.env`, or `.env.local`
26. `DISCOVERY_MODE` remains true
27. `WRITE_ALLOWED_APPS` remains empty
28. existing `kintoneRequest()` still blocks POST
29. existing Stage 4C bridge still rejects POST/PUT malformed write shapes as covered by prior tests
30. importing/constructing test dependencies makes zero Kintone calls

Use fake injected transport only.

---

# STEP 4 — CODE VALIDATION / COMMIT

Authorized code/test files only:

```text
src/core/kintone-client.js
tests/safety-guard.test.js
```

Do NOT modify:

```text
src/core/sandbox-write-guard.js
src/services/scoring-config-kintone-repository.js
src/services/scoring-config-master-service.js
src/profiles/scoring-config-master.js
src/profiles/profile-scoring-resolver.js
config/sandbox-apps.json
.env.local
UI/main app files
```

Run:

```bash
git diff --check
npm test
```

Required:

```text
all tests PASS
full suite >= 441
Kintone calls = 0
Kintone writes = 0
```

Commit exactly:

```text
feat: add scoring config read-only live preflight foundation
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD before evidence docs.

---

# STEP 5 — STAGE 4D-A EVIDENCE DOCS

Update only:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current operational state:

```text
WP002C_STAGE4C_GATE = PASS
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = PASSED / FROZEN
STAGE4D_A_READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = COMPLETE / PENDING CHATGPT REVIEW
READ_ONLY_LIVE_PREFLIGHT_FOUNDATION = IMPLEMENTED_NOT_EXECUTED
LIVE_KINTONE_READ_RECONCILIATION = NOT_STARTED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
PREWRITE_BACKUP_CONTRACT_STATUS = DURABLE_RETENTION_REQUIRED / NOT_EXECUTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; Stage 4D-A made zero Kintone calls)
STAGE4D_A_KINTONE_GETS = 0
STAGE4D_A_KINTONE_WRITES = 0
NEXT_ACTION = AWAIT CHATGPT STAGE 4D-A REVIEW BEFORE CONTROLLED LIVE GET PREFLIGHT
```

Use actual final test total consistently in current operational sections.

Add Stage 4D-A implementation commit traceability to `AI_REVIEW_PACKAGE.md`.

Commit exactly:

```text
docs: record wp-002c stage4d-a read preflight foundation
```

Push and verify local HEAD = remote HEAD and tracked working tree clean.
Then STOP.

---

# STRICT RUNTIME / KINTONE BOUNDARY

For this entire Stage 4D-A task:

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
Kintone RECORD WRITE = 0
```

Do not use `.env.local`.
Do not invoke `verifyScoringConfigReadOnlyLivePreflight()` with the default live transport.
Do not access App 796 over the network.
Do not create a backup artifact.
Do not open a write window.
Do not change `DISCOVERY_MODE`.
Do not change `WRITE_ALLOWED_APPS`.
Do not seed baseline configurations.
Do not publish any record.
Do not implement trusted live audit provider.
Do not wire resolver.
Do not start Stage 4D-B or WP-002D.

---

# FINAL REPORT

Report only safe evidence:

- branch
- assignment/start HEAD
- Stage 4C closure/Stage 4D-A authorization commit SHA
- Stage 4D-A code commit SHA
- Stage 4D-A evidence commit SHA
- changed files per commit
- exact seven fake GET sequence PASS/FAIL
- exact App 796 binding PASS/FAIL
- live+preview identity validation PASS/FAIL
- live+preview 23-field schema validation PASS/FAIL
- live+preview creator-only ACL validation PASS/FAIL
- Stage 4C bridge reuse for records GET PASS/FAIL
- zero-record fail-closed check PASS/FAIL
- transport redaction PASS/FAIL
- no retry PASS/FAIL
- discovery lock preserved PASS/FAIL
- full test total/pass/fail
- Kintone GETs = 0
- Kintone writes = 0
- `.env.local` used = NO
- default live preflight invoked = NO
- local HEAD = remote HEAD YES/NO
- tracked working tree clean YES/NO
- STOP confirmation

# REVIEW EXPECTATION

ChatGPT will inspect GitHub directly and verify:

1. Stage 4C is durably recorded PASS/FROZEN.
2. Stage 4D-A code commit changes exactly `kintone-client.js` and `safety-guard.test.js`.
3. No guard/service/repository/resolver/config/UI changes occur.
4. Preflight has no caller-selectable App ID/path/method.
5. All six metadata/schema/ACL targets are hardcoded GETs for App 796.
6. Records GET reuses the Stage 4C bridge with query `limit 1`.
7. Both live and preview identity are exact-name + numeric-revision verified.
8. Both live and preview schemas reuse `assertExact23FieldSchema`.
9. Both live and preview ACLs reuse `assertCreatorOnlyAcl`.
10. Any existing record fails closed before future seed authorization.
11. Raw transport errors are redacted and requests are never retried.
12. Default composition uses `kintoneRequest` only; no direct fetch/env/connection use in the new function.
13. Existing discovery write lock is preserved.
14. Full regression >=441 and all pass.
15. Stage 4D-A Kintone GETs/writes = 0 and `.env.local` unused.
16. No actual live preflight, seed, publish, backup execution, audit-provider wiring, resolver wiring, or WP002D occurred.
17. Git remote branch points to final evidence commit.

Expected gates:

```text
STAGE4C_CLOSURE_GATE = PASS / FAIL
READ_ONLY_PREFLIGHT_ARCHITECTURE_GATE = PASS / FAIL
APP_ID_SAFETY_BINDING_GATE = PASS / FAIL
LIVE_PREVIEW_IDENTITY_CONTRACT_GATE = PASS / FAIL
LIVE_PREVIEW_SCHEMA_CONTRACT_GATE = PASS / FAIL
LIVE_PREVIEW_ACL_CONTRACT_GATE = PASS / FAIL
STAGE4C_BRIDGE_REUSE_GATE = PASS / FAIL
ZERO_RECORD_PREFLIGHT_GATE = PASS / FAIL
ERROR_REDACTION_GATE = PASS / FAIL
NO_RETRY_FAIL_CLOSED_GATE = PASS / FAIL
DISCOVERY_LOCK_PRESERVATION_GATE = PASS / FAIL
REGRESSION_GATE = PASS / FAIL
ZERO_KINTONE_STAGE4D_A_GATE = PASS / FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4D_A_GATE = PASS / BLOCKED
```
