# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4B FINAL EXACTNESS CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `ec122945856e87fdee84bb20571aaa9ef68f0039`
> **Mode:** TINY CODE/TEST EXACTNESS + DOC TRACEABILITY ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## REVIEW RESULT

Accepted:

```text
commit order = PASS
code scope = PASS
APP_ID_SAFETY_BINDING_GATE = PASS
QUERY_ESCAPE_GATE = PASS
USER_SELECT_MAPPING_GATE = PASS
ERROR_REDACTION_GATE = PASS
WRITE_AUTHORIZATION_ORDER = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
TRIPLE_HASH_GATE = PASS
FINAL_PUBLISH_READBACK_GATE = PASS
reported regression = 370/370 PASS
ZERO_KINTONE_STAGE4B_GATE = PASS
```

Stage 4B remains BLOCKED only on the exactness items below.

---

# MUST FIX A — STORAGE ID/REVISION VALUES MUST BE STRING-SHAPED

`parsePositiveSafeIntegerToken()` currently accepts both numbers and strings and is reused for raw Kintone storage metadata and Kintone write responses.

The contract is different by boundary:

### Normal method inputs

For caller input such as `getByRecordId(recordId)` and `publishRecord(..., expectedRevision)`:

```text
positive safe integer number = allowed
exact positive safe integer string = allowed
```

### Kintone storage/response values

For all of these, require **string only**:

```text
rawRecord.$id.value
rawRecord.$revision.value
create response id
create response revision
publish response revision
```

Required storage token rules:

```text
typeof value === 'string'
/^[1-9]\d*$/
value === value.trim()
Number(value) is safe integer
> 0
```

Numeric `101` or numeric revision `1` from raw Kintone/response must fail closed as `REPOSITORY_RESPONSE_INVALID` rather than being silently converted to strings.

Recommended: keep one helper for caller token input and add one small storage-string helper in the same repository file. Do not create a new module.

Required tests:

```text
raw numeric $id rejected
raw numeric $revision rejected
create numeric id response rejected
create numeric revision response rejected
publish numeric revision response rejected
normal getByRecordId(101) input remains allowed
normal publish expectedRevision number input remains allowed
```

---

# MUST FIX B — TRUE PLAIN OBJECT CHECK

Current:

```js
Object.prototype.toString.call(obj) === '[object Object]'
```

also accepts class instances.

For storage/repository response structures that require a plain JSON object, reject class instances and non-plain prototypes.

Use an exact plain-object check appropriate for JSON payloads, for example requiring:

```text
obj !== null
object
not array
Object.getPrototypeOf(obj) === Object.prototype
```

Apply wherever `isPlainObject()` is currently used.

Tests must prove at least:

```text
class instance raw record rejected
class instance field wrapper rejected
class instance response object rejected
```

---

# MUST FIX C — SERVICE STORAGE REVISION MUST BE STRING ONLY

`ScoringConfigMasterService` currently accepts numeric `__storageRevision` and converts it with `String(...)`.

Repository-normalized Kintone metadata contract is an exact string.

For both initial and final read-back require:

```text
typeof __storageRevision === 'string'
exact /^[1-9]\d*$/
no surrounding whitespace
safe integer
```

No numeric coercion.

Required tests:

```text
initial numeric revision -> CONFIG_READBACK_MISMATCH
final numeric revision -> PUBLISH_VERIFICATION_FAILED
final revision missing -> PUBLISH_VERIFICATION_FAILED
final unsafe revision -> PUBLISH_VERIFICATION_FAILED
normal string '1' -> '2' advancement -> PUBLISH_VERIFIED
```

Keep all prior concurrency tests.

---

# MUST FIX D — CREATE PUBLISH AUDIT FIELDS MUST BE EXACT EMPTY STRINGS

For `createValidatedRecord()` require exactly:

```text
Published_By === ''
Published_At === ''
```

Do not accept `undefined`, `null`, missing, or other values.

All validation/mapping still occurs before authorizer.

Add tests proving:

```text
Published_By undefined property rejected before authorizer/request
Published_By null rejected before authorizer/request
Published_At undefined rejected before authorizer/request
Published_At null rejected before authorizer/request
```

---

# MUST FIX E — DOC TRACEABILITY ITEMS WERE NOT ACTUALLY APPLIED

`AI_REVIEW_PACKAGE.md` main commit table still ends at the Stage 4A final doc closure. Add explicit Stage 4B rows:

```text
f24f247cc22a5b73ad855047d33c2cdb591b41b7 — Stage 4A closure / Stage 4B authorization
ab162b3e530b0e87f76ecc46589cd117e1ac8c6c — Stage 4B repository implementation
7fbd9e8ec555198933a8e1fffb302e59b4ea8286 — Stage 4B first-pass evidence
5b71558edf7a781e5b0bc7e1f5d6d266b9ca8cb6 — Stage 4B repository hardening
 ec122945856e87fdee84bb20571aaa9ef68f0039 — Stage 4B hardening evidence
<new code commit> — Stage 4B final exactness correction
<new docs commit> — Stage 4B final evidence
```

Remove the accidental leading space before `ec122...` when writing the actual table.

`IMPLEMENTATION_STATUS.md` still incorrectly says:

```text
Current Work Package = MBO-P03-WP-002C (Stage 3C-R1 Controlled Dropdown Repair)
```

Change the current line to Stage 4B repository foundation/final exactness review state. Historical Stage 3C log sections must remain unchanged.

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
git merge-base --is-ancestor ec122945856e87fdee84bb20571aaa9ef68f0039 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed head ec12294... is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force push automatically.

---

# STEP 1 — FINAL CODE / TEST CORRECTION

Allowed files only:

```text
src/services/scoring-config-kintone-repository.js
tests/scoring-config-kintone-repository.test.js
src/services/scoring-config-master-service.js
tests/scoring-config-master-service.test.js
```

Do not modify core guard/client, domain, resolver, config, UI, or main app.

Preserve all existing semantic tests and add the exact tests above.

Run:

```bash
git diff --check
npm test
```

Required:

```text
all tests PASS
full suite >= 370
```

Commit exactly:

```text
fix: finalize scoring config repository storage exactness
```

Push only to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

---

# STEP 2 — FINAL DOC EVIDENCE

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
STAGE4B_KINTONE_REPOSITORY_FOUNDATION = FINAL_CORRECTION_COMPLETE / PENDING CHATGPT FINAL REVIEW
KINTONE_REPOSITORY_ADAPTER_STATUS = FOUNDATION_IMPLEMENTED_NOT_WIRED
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_REQUEST_BRIDGE_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_WRITE_AUTHORIZATION_STATUS = NOT_IMPLEMENTED
TRUSTED_AUDIT_LIVE_PROVIDER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; Stage 4B made zero Kintone calls)
STAGE4B_KINTONE_CALLS = 0
STAGE4B_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT FINAL STAGE 4B REVIEW BEFORE ANY LIVE REQUEST BRIDGE
```

Use actual final test count consistently in current operational sections.
Add the Stage 4B traceability rows exactly.
Fix current work package wording.

Commit exactly:

```text
docs: finalize wp-002c stage4b repository evidence
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
Do not implement live request/write-authorization/audit bridge.
Do not wire resolver.
Do not start Stage 4C or WP-002D.

# REVIEW EXPECTATION

ChatGPT expects exactly two Antigravity commits after this assignment:

1. `fix: finalize scoring config repository storage exactness`
2. `docs: finalize wp-002c stage4b repository evidence`

Expected final gates:

```text
STAGE4A_CLOSURE_GATE = PASS
KINTONE_REPOSITORY_ARCHITECTURE_GATE = PASS
APP_ID_SAFETY_BINDING_GATE = PASS
RAW_DOMAIN_MAPPING_GATE = PASS / FAIL
USER_SELECT_MAPPING_GATE = PASS
QUERY_ESCAPE_GATE = PASS
WRITE_AUTHORIZATION_BOUNDARY_GATE = PASS
ERROR_REDACTION_GATE = PASS
OPTIMISTIC_CONCURRENCY_GATE = PASS / FAIL
STORAGE_TOKEN_SHAPE_GATE = PASS / FAIL
PLAIN_OBJECT_GATE = PASS / FAIL
TRIPLE_HASH_GATE = PASS
FINAL_PUBLISH_READBACK_GATE = PASS
NO_RETRY_FAIL_CLOSED_GATE = PASS
REGRESSION_GATE = PASS / FAIL
ZERO_KINTONE_STAGE4B_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL
GIT_PUSH_SYNC_GATE = PASS / FAIL
WP002C_STAGE4B_GATE = PASS / BLOCKED
```
