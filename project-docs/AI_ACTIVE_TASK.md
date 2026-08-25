# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4B REPOSITORY HARDENING

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4B head:** `7fbd9e8ec555198933a8e1fffb302e59b4ea8286`
> **Mode:** CODE/TEST HARDENING + LIVING-DOC EVIDENCE CORRECTION ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

# REVIEW RESULT

Accepted from Stage 4B first pass:

```text
Stage 4A closure commit = f24f247cc22a5b73ad855047d33c2cdb591b41b7
Stage 4B implementation commit = ab162b3e530b0e87f76ecc46589cd117e1ac8c6c
Stage 4B evidence commit = 7fbd9e8ec555198933a8e1fffb302e59b4ea8286
commit order = PASS
implementation scope = PASS (4 authorized code/test files only)
repository source file count = 1
repository test file count = 1
query escaping foundation = PASS
USER_SELECT foundation = PASS
lifecycle-only publish patch = PASS
optimistic revision propagation foundation = PASS
no-retry foundation = PASS
reported regression = 367/367 PASS
Stage 4B Kintone calls/writes = 0
```

Stage 4B is NOT approved for Stage 4C yet. The following MUST FIX items are required.

---

# MUST FIX A — REUSE THE EXISTING APP-796 SAFETY CONSTANT; KEEP APP ID NUMERIC

Current repository defines a second constant:

```text
export const WP002C_SCORING_MASTER_APP_ID = '796'
```

This duplicates the existing safety constant in `src/core/sandbox-write-guard.js`, where:

```text
WP002C_SCORING_MASTER_APP_ID = 796
```

This is not only duplication: the repository currently sends string `'796'` to `authorizeWrite`, while the existing safety guard requires integer App IDs. That would break the future live authorization bridge.

Required:

- import/reuse `WP002C_SCORING_MASTER_APP_ID` from `src/core/sandbox-write-guard.js`
- do not redefine the value locally
- repository `appId` must be numeric `796`
- request params/body `app` must be numeric `796`
- authorizer context `appId` must be numeric `796`
- re-exporting the imported constant from the repository file is allowed for test ergonomics

Do NOT modify `sandbox-write-guard.js`.

---

# MUST FIX B — RAW KINTONE NORMALIZATION MUST BE EXACT, NOT TRIM/COERCE

Current `normalizeRawRecord()` performs:

```text
String(value).trim()
```

for scalar fields, and trims `Published_By.code`.

This can hide storage corruption. For example a stored `Master_Record_Key = " PROF... "` can normalize to the expected key and incorrectly pass an exact read-back gate.

Required raw-storage contract:

1. raw record must be a true plain object (not Array/null/class instance)
2. `$id` and `$revision` wrappers must be plain objects
3. `$id.value` and `$revision.value` must be exact positive safe-integer strings; surrounding whitespace is invalid
4. every non-USER_SELECT business field wrapper must be a plain object with its own `value`
5. every scalar Kintone business `value` must already be a string; do not silently stringify numbers/objects
6. preserve scalar strings exactly — NO `.trim()` mutation in normalization
7. `Published_By`:
   - `[] -> ''`
   - one user whose `.code` is a non-empty string after whitespace validation -> return the exact original `.code`, not a trimmed replacement
   - >1/malformed -> fail closed
8. unknown raw fields remain ignored
9. output remains exactly 23 business fields + `__recordId` + `__storageRevision`

Also preserve exact caller query identity:

- `findByMasterKey()` may validate `trim() !== ''`, but query and equality must use the exact caller string, not a trimmed semantic replacement
- same principle for `Profile_Code` and `Fiscal_Year`

Malformed storage remains:

```text
REPOSITORY_RESPONSE_INVALID
```

---

# MUST FIX C — REQUEST/AUTH FAILURE ERRORS MUST NOT LEAK DEPENDENCY MESSAGES

Current code wraps request errors using `${err.message}`. A live bridge error may contain URLs, server payloads, usernames, query content, or secrets.

Required normal caller error messages:

```text
KINTONE_REPOSITORY_REQUEST_FAILED
WRITE_AUTHORIZATION_FAILED
```

Do not append the raw thrown dependency message.
Do not include raw HTTP bodies/URLs/credentials/query values in the stable error.
No automatic retry.

Add tests where the fake request/authorizer throws a message containing a sentinel secret such as `SECRET_DO_NOT_LEAK`, and assert the public error does not contain that sentinel.

---

# MUST FIX D — RECORD ID / REVISION TOKENS MUST BE SAFE-INTEGER EXACT

Current repository accepts arbitrarily large digit strings and later compares revisions with `Number(...)`. That can lose precision above `Number.MAX_SAFE_INTEGER`.

Implement one small internal helper in the existing repository file; no new module.

For record IDs and revision tokens:

- number input: `Number.isSafeInteger(value) && value > 0`
- string input: exact `/^[1-9]\d*$/`, no surrounding whitespace, numeric value must be a safe integer > 0
- reject unsafe/overflow values
- reject decimal/negative/zero/NaN/Infinity

Apply to:

- raw `$id.value`
- raw `$revision.value`
- `getByRecordId(recordId)` input
- create response `id`
- create response `revision`
- `publishRecord(recordId, ..., expectedRevision)`
- publish response `revision`

For Kintone create/publish response payloads, require the documented string-shaped ID/revision values rather than silently coercing malformed response types.

Revision advancement comparison must occur only after exact safe-integer validation.

Harden `ScoringConfigMasterService` defensively too:

- initial `__storageRevision` must be exact positive safe-integer string
- final `__storageRevision` must be exact positive safe-integer string
- no trim-based acceptance
- compare only validated safe integers

Required service tests additionally include:

```text
initial revision with whitespace -> CONFIG_READBACK_MISMATCH
initial unsafe revision -> CONFIG_READBACK_MISMATCH
final revision missing -> PUBLISH_VERIFICATION_FAILED
final revision malformed/unsafe -> PUBLISH_VERIFICATION_FAILED
final revision not advanced -> PUBLISH_VERIFICATION_FAILED
normal 1 -> 2 advancement -> PUBLISH_VERIFIED
```

---

# MUST FIX E — WRITE AUTHORIZER MUST BE THE LAST PRE-REQUEST GATE

For each write method:

1. validate all repository inputs
2. build/validate the complete Kintone request body
3. only then call `authorizeWrite(context)`
4. require return exactly `true`
5. immediately perform the single injected write request

There must be no payload mapping/string conversion that can still fail after authorization has been consumed and before the request is issued.

For `createValidatedRecord()`, also require all 23 planned storage fields to be present before authorization. Do not silently turn a missing immutable field into `''`.

For `publishRecord()`, build the exact lifecycle-only patch before authorization, then authorize, then request.

Add tests proving malformed/missing create fields fail before authorizer and request.

---

# MUST FIX F — LIVING DOC TRACEABILITY / CURRENT WORK PACKAGE

`AI_REVIEW_PACKAGE.md` does not currently include the Stage 4B implementation/evidence commits in its main commit traceability table.

Add:

```text
f24f247cc22a5b73ad855047d33c2cdb591b41b7 — Stage 4A closure / Stage 4B authorization
ab162b3e530b0e87f76ecc46589cd117e1ac8c6c — Stage 4B repository implementation
7fbd9e8ec555198933a8e1fffb302e59b4ea8286 — Stage 4B first-pass evidence
<new hardening commit> — Stage 4B repository hardening
<new docs commit> — Stage 4B hardening evidence
```

Also fix the stale current line in `IMPLEMENTATION_STATUS.md`:

```text
Current Work Package = Stage 3C-R1 Controlled Dropdown Repair
```

It must describe Stage 4B repository foundation/hardening. Historical Stage 3C log sections must remain unchanged.

Add/update Stage 4B entry in `CHANGELOG_AI.md`.

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
git merge-base --is-ancestor 7fbd9e8ec555198933a8e1fffb302e59b4ea8286 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed head 7fbd9e8... is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force push automatically.

---

# STEP 1 — CODE / TEST HARDENING

Allowed code/test files only:

```text
src/services/scoring-config-kintone-repository.js
tests/scoring-config-kintone-repository.test.js
src/services/scoring-config-master-service.js
tests/scoring-config-master-service.test.js
```

Do not modify:

```text
src/core/kintone-client.js
src/core/sandbox-write-guard.js
src/profiles/scoring-config-master.js
src/profiles/profile-scoring-resolver.js
config/sandbox-apps.json
UI/main app files
```

Preserve all existing Stage 4A/4B semantic tests.
Add hardening tests for all requirements above.

Run:

```bash
git diff --check
npm test
```

Required:

```text
all tests PASS
full suite >= 367 tests
```

Commit exactly:

```text
fix: harden scoring config kintone repository exactness
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD before docs.

---

# STEP 2 — DOC EVIDENCE CORRECTION

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
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = HARDENED / PENDING CHATGPT RE-REVIEW
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = NOT_IMPLEMENTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; hardening made zero Kintone calls)
STAGE4B_KINTONE_CALLS = 0
STAGE4B_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT STAGE 4B RE-REVIEW BEFORE ANY LIVE REQUEST BRIDGE
```

Use actual final test count consistently in current operational sections.
Historical test counts may remain when clearly historical.

Commit exactly:

```text
docs: record wp-002c stage4b repository hardening
```

Push, verify local HEAD = remote HEAD and tracked working tree clean, then STOP.

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
Do not seed records.
Do not implement the live request bridge.
Do not implement the real write-authorization bridge.
Do not implement live trusted audit provider.
Do not wire resolver.
Do not start Stage 4C or WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new Antigravity commits after this assignment: code/tests then docs.
2. Code commit changes only the four authorized code/test files.
3. App ID is imported from the existing guard constant and is numeric 796 everywhere.
4. Raw normalization preserves exact storage strings; no trim/coercion can hide mismatches.
5. Published_By returns exact user code after validation.
6. IDs/revisions reject whitespace, unsafe integers and malformed response types.
7. Revision comparison cannot lose Number precision.
8. Request/authorization errors do not leak dependency messages.
9. Authorizer is the last gate before each write request.
10. Missing create fields fail before authorization/request.
11. Query escaping remains correct.
12. Duplicate/no-silent-selection behavior remains correct.
13. Stage 4A triple-hash/overlap/trusted-audit/final-readback gates remain passing.
14. Service optimistic concurrency tests cover initial/final exact revision failures and normal advancement.
15. No retry behavior remains intact.
16. Full regression >=367 and all pass.
17. Stage 4B Kintone calls/writes remain zero.
18. AI_REVIEW_PACKAGE has Stage 4B commit traceability.
19. Current Work Package no longer incorrectly says Stage 3C-R1.
20. Git local/remote sync passes.

Expected gates:

```text
STAGE4A_CLOSURE_GATE = PASS
KINTONE_REPOSITORY_ARCHITECTURE_GATE = PASS / FAIL
APP_ID_SAFETY_BINDING_GATE = PASS / FAIL
RAW_DOMAIN_MAPPING_GATE = PASS / FAIL
USER_SELECT_MAPPING_GATE = PASS / FAIL
QUERY_ESCAPE_GATE = PASS
WRITE_AUTHORIZATION_BOUNDARY_GATE = PASS / FAIL
ERROR_REDACTION_GATE = PASS / FAIL
OPTIMISTIC_CONCURRENCY_GATE = PASS / FAIL
TRIPLE_HASH_GATE = PASS
FINAL_PUBLISH_READBACK_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
REGRESSION_GATE = PASS / FAIL
ZERO_KINTONE_STAGE4B_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4B_GATE = PASS / BLOCKED
```
