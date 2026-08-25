# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4C GUARDED BRIDGE HARDENING

> **Control Plane:** ChatGPT / Project Lead / Architect / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4C first-pass head:** `53e32ce95187745b9179289d6bed0409ab021339`
> **Stage 4C implementation commit:** `c281364e6ab96c690dcf019d0372d48f83dbb273`
> **Target App:** 796 — `MBO Profile & Scoring Configuration Master [Sandbox]`
> **Mode:** CODE/TEST EXACTNESS HARDENING + LIVING-DOC EVIDENCE ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO
> **`.env.local`:** DO NOT USE

# INDEPENDENT REVIEW RESULT — FIRST PASS

Accepted:

```text
Stage 4B closure commit = c43aad83d46cfb065db7c2afa06a6b97ce732d1d
Stage 4C implementation commit = c281364e6ab96c690dcf019d0372d48f83dbb273
Stage 4C evidence commit = 53e32ce95187745b9179289d6bed0409ab021339
commit order = PASS
implementation scope = PASS (exactly 3 authorized code/test files)
evidence scope = PASS (5 living docs only)
PREWRITE_BACKUP_CONTRACT_FOUNDATION = PASS
AUTHORIZATION_REPLAY_FOUNDATION = PASS
INJECTED_TRANSPORT_ONLY = PASS
BRIDGE_PATH_ALLOWLIST_FOUNDATION = PASS
ERROR_REDACTION = PASS
NO_RETRY = PASS
DISCOVERY_MODE = true
WRITE_ALLOWED_APPS = []
reported regression = 421/421 PASS
Stage 4C Kintone calls/writes = 0
```

Stage 4C is NOT approved for live transport composition yet. Fix the exactness defects below.

---

# MUST FIX A — BIND THE AUTHORIZATION TO THE ACTUAL REPOSITORY WRITE CONTEXT APP ID

The Stage 4B repository authorizer context already carries `appId`.
The Stage 4C guard currently validates `authConfig.appId = 796` and the manifest App ID, but ignores `requestContext.appId`.

This means a mismatched/miswired context containing another App ID is not independently rejected by the specialized guard.

Required for BOTH logical operations:

```text
requestContext.appId = numeric 796
requestContext.appId === authConfig.appId
manifest change.appId === requestContext.appId
```

Do not coerce or stringify App IDs.

Update valid request-context fixtures to include:

```text
appId: 796
```

Required tests:

```text
create requestContext.appId = 794 rejected
create requestContext.appId = 795 rejected
create requestContext.appId = protected App 53 rejected
publish requestContext.appId = 794 rejected
publish requestContext.appId = protected App 53 rejected
missing requestContext.appId rejected
string '796' requestContext.appId rejected
valid numeric 796 passes
```

The guard must remain independently unable to authorize any App other than numeric 796.

---

# MUST FIX B — MANIFEST MUST BE STRUCTURALLY EXACT, NOT ONLY CONTAIN REQUIRED VALUES

The task requires an **exact one-change manifest**. Current validation permits extra properties on the change object.

Require the manifest itself to be a true plain object with exactly one top-level key:

```text
expectedChanges
```

Require `expectedChanges` to contain exactly one true plain-object change.

For create, change keys must be EXACTLY:

```text
operation
appId
masterRecordKey
```

For publish, change keys must be EXACTLY:

```text
operation
appId
recordId
expectedRevision
```

No extra keys.
No missing keys.
No prototype/class instances.

The values must still match the request context exactly and App ID must be numeric 796.

Required tests:

```text
manifest extra top-level key rejected
create change extra key rejected
create change missing key rejected
publish change extra key rejected
publish change missing expectedRevision rejected
class-instance manifest rejected
class-instance change rejected
```

---

# MUST FIX C — COMPLETE THE REQUIRED ID / REVISION NEGATIVE COVERAGE

Existing test names claim ID/revision coverage, but the loops primarily vary IDs.
Add explicit independent revision tests.

Authorization guard required tests:

```text
publish expectedRevision numeric 1 rejected
publish expectedRevision whitespace ' 1 ' rejected
publish expectedRevision '0' rejected
publish expectedRevision '-1' rejected
publish expectedRevision unsafe '9007199254740993' rejected
publish manifest expectedRevision numeric 1 rejected
```

Bridge PUT required tests:

```text
body.revision numeric 1 rejected
body.revision whitespace ' 1 ' rejected
body.revision '0' rejected
body.revision '-1' rejected
body.revision unsafe '9007199254740993' rejected
```

Keep all existing ID tests.

---

# MUST FIX D — BRIDGE EXACTNESS / DEFENSE IN DEPTH

Modify only the existing Stage 4C bridge in `src/core/kintone-client.js`.

## D1 — Reuse the existing App-796 safety constant

`kintone-client.js` already imports:

```text
WP002C_SCORING_MASTER_APP_ID
```

Use that constant throughout the new Stage 4C bridge instead of repeating literal `796` in validation/path construction wherever practical.
The resulting path/body must still contain numeric/text `796` as required by Kintone.

## D2 — Exact method tokens

Repository contract methods are exact uppercase tokens.
Accept only:

```text
GET
POST
PUT
```

Do not silently normalize lowercase/mixed-case methods.

Required tests:

```text
'get' rejected
'post' rejected
'put' rejected
' GET ' rejected
```

## D3 — Stable malformed-request failure

Do not destructure an unvalidated request argument in a way that can expose a raw `TypeError`.
The returned bridge function should fail with exact:

```text
SCORING_CONFIG_BRIDGE_REQUEST_FAILED
```

for null/undefined/non-plain request specifications.

Required tests:

```text
bridge() rejected with stable code
bridge(null) rejected with stable code
bridge([]) rejected with stable code
bridge(class instance) rejected with stable code
```

## D4 — Exact lifecycle wrapper shapes

For PUT defense-in-depth, require exact wrapper structures:

```text
Config_Status = { value: 'PUBLISHED' }
Published_By = { value: [{ code: <exact non-empty string> }] }
Published_At = { value: <exact non-empty string> }
```

Require:

```text
Object.keys(Config_Status) exactly ['value']
Object.keys(Published_By) exactly ['value']
Object.keys(Published_By.value[0]) exactly ['code']
Object.keys(Published_At) exactly ['value']
```

Reject extra wrapper/user properties.

Required tests:

```text
Config_Status wrapper extra key rejected
Published_By wrapper extra key rejected
Published_By user extra key rejected
Published_At wrapper extra key rejected
```

## D5 — Complete path allowlist tests

The implementation already appears fail-closed, but add explicit tests for the required categories:

```text
schema endpoint rejected
ACL endpoint rejected
deploy endpoint rejected
unknown endpoint rejected
existing query string in path rejected
```

---

# MUST FIX E — LIVING DOC CURRENT-STATE / TRACEABILITY

The current implementation docs have two stale areas.

## E1 — `project-docs/IMPLEMENTATION_STATUS.md`

Current line still says Stage 4B final-correction review state.
Change current-state line to Stage 4C hardening state. Historical Stage 4B/Stage 3C log entries must remain intact.

After hardening use:

```text
Current Work Package = MBO-P03-WP-002C (Stage 4C Guarded Request Bridge Foundation — HARDENED / PENDING CHATGPT RE-REVIEW)
```

## E2 — `project-docs/AI_REVIEW_PACKAGE.md`

Change section title to include Stage 4C traceability.

The main commit table must include these missing/current rows:

```text
d0bfbd9d7983911d8003010635fbfcf6e9307b28 — Stage 4B Final Review Closure — docs: add missing wp-002c stage4b traceability rows
c43aad83d46cfb065db7c2afa06a6b97ce732d1d — Stage 4B Closure / Stage 4C Authorization — docs: close wp-002c stage4b and authorize stage4c
c281364e6ab96c690dcf019d0372d48f83dbb273 — Stage 4C First-Pass Implementation — feat: add scoring config guarded request bridge foundation
53e32ce95187745b9179289d6bed0409ab021339 — Stage 4C First-Pass Evidence — docs: record wp-002c stage4c guarded bridge foundation
<new hardening code commit> — Stage 4C Hardening
<new evidence commit> — Stage 4C Hardening Evidence
```

Replace the old `*(Review Head)*` Stage 4C evidence placeholder with real SHA `53e32ce95187745b9179289d6bed0409ab021339`.

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
git merge-base --is-ancestor 53e32ce95187745b9179289d6bed0409ab021339 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed head 53e32ce... is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

---

# STEP 1 — CODE / TEST HARDENING

Authorized files only:

```text
src/core/sandbox-write-guard.js
src/core/kintone-client.js
tests/safety-guard.test.js
```

Do NOT modify:

```text
src/services/scoring-config-kintone-repository.js
src/services/scoring-config-master-service.js
src/profiles/scoring-config-master.js
src/profiles/profile-scoring-resolver.js
config/sandbox-apps.json
.env.local
UI/main app files
```

Preserve every existing Stage 4C test and add the hardening tests above.

Run:

```bash
git diff --check
npm test
```

Required:

```text
all tests PASS
full suite >= 421 tests
Kintone calls = 0
Kintone writes = 0
```

Commit exactly:

```text
fix: harden scoring config stage4c bridge exactness
```

Push only to:

```text
origin/ai/antigravity-wp002c
```

Verify local HEAD = remote HEAD before docs.

---

# STEP 2 — HARDENING EVIDENCE DOCS

Allowed docs only:

```text
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Required current state:

```text
WP002C_STAGE4A_GATE = PASS
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = PASSED / FROZEN
WP002C_STAGE4B_GATE = PASS
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = PASSED / FROZEN
STAGE4C_GUARDED_REQUEST_BRIDGE_FOUNDATION = HARDENED / PENDING CHATGPT RE-REVIEW
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = GUARD_CONTRACT_IMPLEMENTED_NOT_WIRED
PREWRITE_BACKUP_CONTRACT_STATUS = DURABLE_RETENTION_REQUIRED / NOT_EXECUTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; Stage 4C hardening made zero Kintone calls)
STAGE4C_KINTONE_CALLS = 0
STAGE4C_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT STAGE 4C RE-REVIEW BEFORE ANY LIVE TRANSPORT COMPOSITION OR KINTONE PREFLIGHT
```

Use actual final test total consistently in current operational sections.

Commit exactly:

```text
docs: record wp-002c stage4c bridge hardening
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD and tracked working tree clean.
Then STOP.

---

# STRICT BOUNDARY

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
Kintone RECORD WRITE = 0
```

Do not use `.env.local`.
Do not access App 796.
Do not create a real backup artifact yet.
Do not compose bridge with `kintoneRequest`, `getKintoneConnection`, fetch, or another live transport.
Do not open a live write window.
Do not change `DISCOVERY_MODE`.
Do not change `WRITE_ALLOWED_APPS`.
Do not seed baseline configurations.
Do not publish records.
Do not implement trusted live audit provider.
Do not wire resolver.
Do not start Stage 4D or WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two Antigravity commits after this assignment: hardening code/tests then evidence docs.
2. Code commit changes exactly the three authorized code/test files.
3. `requestContext.appId` is mandatory numeric 796 and bound to auth + manifest.
4. Specialized guard rejects context App 794/795/protected/other/missing/string IDs.
5. Manifest top-level and change keys are structurally exact.
6. Publish revision negative tests independently cover numeric/whitespace/zero/negative/unsafe values.
7. Bridge uses `WP002C_SCORING_MASTER_APP_ID` rather than a parallel App-ID authority.
8. Bridge method tokens are exact uppercase.
9. Null/undefined/non-plain bridge request specifications fail with stable redacted error.
10. PUT lifecycle wrappers and USER_SELECT user object have exact key shapes.
11. Schema/ACL/deploy/unknown/query-string paths are explicitly regression-tested fail-closed.
12. Durable backup contract/replay/failed-validation-not-consumed behavior remains passing.
13. Injected-transport-only/no retry/error redaction remains passing.
14. Existing `kintoneRequest()` discovery write lock remains unchanged.
15. `DISCOVERY_MODE = true`, `WRITE_ALLOWED_APPS = []` remain unchanged.
16. Full suite >=421 and all pass.
17. Kintone calls/writes remain zero and `.env.local` unused.
18. AI_REVIEW_PACKAGE contains complete Stage 4B closure + Stage 4C traceability.
19. IMPLEMENTATION_STATUS current work package reflects Stage 4C, not Stage 4B.
20. Git branch is synced and clean.

Expected re-review gates:

```text
STAGE4B_CLOSURE_GATE = PASS
RECORD_WRITE_GUARD_SCOPE_GATE = PASS / FAIL
CONTEXT_APP_BINDING_GATE = PASS / FAIL
PREWRITE_BACKUP_CONTRACT_GATE = PASS
AUTHORIZATION_REPLAY_GATE = PASS
MANIFEST_EXACTNESS_GATE = PASS / FAIL
REQUEST_BRIDGE_ARCHITECTURE_GATE = PASS
BRIDGE_PATH_ALLOWLIST_GATE = PASS / FAIL
APP_ID_SAFETY_BINDING_GATE = PASS / FAIL
LIFECYCLE_ONLY_WRITE_GATE = PASS / FAIL
ERROR_REDACTION_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
DISCOVERY_LOCK_PRESERVATION_GATE = PASS
REGRESSION_GATE = PASS / FAIL
ZERO_KINTONE_STAGE4C_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4C_GATE = PASS / BLOCKED
```
