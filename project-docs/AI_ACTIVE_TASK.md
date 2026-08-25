# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4A REVIEW HARDENING

> **Control Plane:** ChatGPT / Project Lead / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Stage 4A Head:** `3f773414783c3b8903c4be7085cce8eb6764c44b`
> **Mode:** CODE/TEST HARDENING + LIVING-DOC EVIDENCE CORRECTION ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## REVIEW RESULT

Accepted Stage 4A evidence:

```text
Stage 3C exception closure commit = cca9389c5b8f054ef8bd6c8ccddb7d34d6786137
Stage 4A implementation commit = f010e26fbc61e39ee84874a1c024492acf0c81fa
Stage 4A evidence commit = 3f773414783c3b8903c4be7085cce8eb6764c44b
commit ordering = PASS
implementation file scope = PASS
canonicalization foundation = PASS
triple-hash foundation = PASS
effective-overlap positive/boundary tests = PASS
trusted audit ordering = PASS
final publish read-back foundation = PASS
lifecycle matrix = PASS
supersession fail-closed = PASS
Stage 4A Kintone calls/writes = 0 (reported; no Kintone/network implementation in Stage 4A source scope)
latest reported npm test = 291/291 PASS
```

Stage 4A is NOT yet approved for Stage 4B. The following MUST FIX items are required.

---

# MUST FIX A — OVERLAP ROW CONTRACT MUST FAIL CLOSED ON MALFORMED DATES/STATUS

Current service verifies overlap row object/profile/FY, then directly compares:

```text
candidateFrom <= pubTo && pubFrom <= candidateTo
```

A row with missing/invalid `Effective_From` or `Effective_To` can therefore evaluate false and silently bypass the overlap gate.

Before any overlap comparison, every row returned by `findPublishedByProfileFiscalYear()` must be verified as a valid published-domain row for this query.

Require each row:

```text
plain object, not Array
Profile_Code === candidate.Profile_Code
Fiscal_Year === candidate.Fiscal_Year
Config_Status === PUBLISHED
Effective_From = exact valid YYYY-MM-DD
Effective_To = exact valid YYYY-MM-DD
Effective_From <= Effective_To
```

Any missing/wrong/malformed value must throw:

```text
REPOSITORY_RESPONSE_INVALID
```

before audit provider calls and before `publishRecord()`.

Do not silently filter malformed rows.
Do not silently ignore wrong-status rows.
Do not treat missing dates as non-overlap.

You may add one small internal validation helper inside the existing service file. Do not create another source module.

---

# MUST FIX B — DEPENDENCY INTERFACE CONTRACT MUST BE VALIDATED BEFORE ORCHESTRATION

Constructor currently checks only that repository/audit provider are objects.

Require these repository methods to be functions before any publish orchestration begins:

```text
findByMasterKey
createValidatedRecord
getByRecordId
findPublishedByProfileFiscalYear
publishRecord
```

Require audit provider methods:

```text
getPublisherIdentity
getPublishedAt
```

Missing/non-function repository methods must fail with stable `REPOSITORY_RESPONSE_INVALID`.
Missing/non-function audit methods must fail with stable trusted-audit error (`TRUSTED_PUBLISHER_INVALID` or a clearly stable trusted-audit contract error).

This validation must happen before persistence or any dependency method call.

Also strengthen repository response shape checks so arrays are not accepted where an exact record object is required.

For `createValidatedRecord()` numeric IDs, reject `NaN`/`Infinity`; a string ID must be non-empty after trim.

---

# MUST FIX C — CANDIDATE STATUS CONTRACT MUST BE EXACT

Frozen Stage 4A contract:

```text
Config_Status may be absent or DRAFT only.
```

Current implementation also accepts `null` and empty string.

Correct behavior:

```text
undefined/absent -> allowed
DRAFT -> allowed
null -> reject UNTRUSTED_LIFECYCLE_FIELD
"" -> reject UNTRUSTED_LIFECYCLE_FIELD
VALIDATED/PUBLISHED/SUPERSEDED/RETIRED -> reject
```

Do not weaken the caller audit/hash rejection rules.

---

# MUST FIX D — TRUSTED PUBLISHED TIMESTAMP MUST BE A REAL TIMEZONE-AWARE DATETIME

Current `new Date(value)` validation accepts date-only strings such as `2026-04-01`.

`Published_At` is Kintone DATETIME audit data. Require a valid timezone-aware ISO-8601 datetime, supporting examples such as:

```text
2026-04-01T00:00:00Z
2026-04-01T09:00:00+09:00
2026-04-01T00:00:00.123Z
```

Reject:

```text
2026-04-01
not-a-date
invalid calendar/time/offset values
```

Keep the exact trusted value (trimmed) for publish patch and final equality verification.

---

# MUST FIX E — STAGE 4A LIVING EVIDENCE CONSISTENCY

The Stage 4A evidence commit did not update `CHANGELOG_AI.md` for Stage 4A, and `AI_REVIEW_PACKAGE.md` still has current gate/test references at `243/243` while current state reports `291/291`.

Also avoid contradictory current `PUBLISH_PIPELINE_STATUS` values (`FOUNDATION_IMPLEMENTED_NOT_DEPLOYED` vs `NOT_DEPLOYED`) in the same current-state section.

After hardening, all current operational sections must use the actual final test total and this semantic distinction:

```text
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
```

Historical entries may preserve historical test counts if explicitly historical.

`CHANGELOG_AI.md` must receive a Stage 4A implementation/hardening entry.

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
git merge-base --is-ancestor 3f773414783c3b8903c4be7085cce8eb6764c44b HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
reviewed head 3f773414... is in ancestry
local HEAD = remote HEAD
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

Read:

- `project-docs/AI_ACTIVE_TASK.md`
- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `src/services/scoring-config-master-service.js`
- `tests/scoring-config-master-service.test.js`

---

# STEP 1 — CODE / TEST HARDENING

Allowed code/test files only:

- `src/services/scoring-config-master-service.js`
- `tests/scoring-config-master-service.test.js`

Do not modify `src/profiles/scoring-config-master.js` unless a reviewer requirement above is impossible without doing so. It should not be necessary.

Required new/strengthened tests include:

1. overlap row missing `Effective_From` rejects before audit/publish
2. overlap row missing `Effective_To` rejects before audit/publish
3. overlap row malformed date rejects
4. overlap row reversed period rejects
5. overlap row status missing/wrong rejects
6. valid `PUBLISHED` overlap row still detects inclusive overlap
7. valid non-overlap published row still passes
8. missing each required repository method fails before dependency calls/persistence (table-driven test allowed)
9. missing each audit provider method fails before repository orchestration (table-driven allowed)
10. array returned where exact record object expected is rejected
11. invalid numeric record IDs (`NaN`, `Infinity`) reject
12. candidate `Config_Status = null` rejects
13. candidate `Config_Status = ""` rejects
14. candidate `Config_Status = DRAFT` still passes
15. date-only trusted `Published_At` rejects
16. ISO Z timestamp passes
17. ISO offset timestamp passes
18. invalid timezone/calendar datetime rejects
19. audit provider still not called before validation/read-back/overlap gates
20. publish patch still contains lifecycle/audit fields only
21. triple-hash/final-readback/lifecycle/supersession tests remain passing
22. service remains free of Kintone/network/filesystem/Git runtime dependencies

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Commit exactly:

```text
fix: harden scoring config publish service contracts
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD before proceeding to docs.

---

# STEP 2 — LIVING DOC EVIDENCE CORRECTION

Allowed docs only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Required current state:

```text
WP002C_STAGE3C_GATE = PASS_WITH_DOCUMENTED_EVIDENCE_EXCEPTION
R1_PREWRITE_BACKUP_PROVENANCE_GATE = UNVERIFIABLE_ACCEPTED
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = HARDENED / PENDING CHATGPT RE-REVIEW
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified checkpoint; Stage 4A and this correction made zero Kintone calls)
THIS STAGE 4A CORRECTION KINTONE CALLS = 0
THIS STAGE 4A CORRECTION KINTONE WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT RE-REVIEW BEFORE STAGE 4B
```

Use actual final `npm test` total consistently in current operational sections.
Historical test counts must be clearly historical.
Add a Stage 4A changelog entry describing implementation + hardening + zero Kintone calls/writes.

Commit exactly:

```text
docs: correct wp-002c stage4a review evidence
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
Do not seed baseline configurations.
Do not implement Kintone adapter.
Do not modify core client/write guard/resolver/UI.
Do not start Stage 4B or WP-002D.

---

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new Antigravity commits after this assignment: code/tests then docs.
2. Code commit changes only service + service tests.
3. Dependency method contracts fail before orchestration.
4. Candidate status is absent/DRAFT only.
5. Every overlap row is exact PUBLISHED + exact profile/FY + valid ordered dates before comparison.
6. Malformed overlap rows cannot silently pass as non-overlap.
7. Trusted `Published_At` is timezone-aware valid datetime, not date-only.
8. Triple hash and final exact read-back remain fail-closed.
9. Publish patch remains lifecycle/audit only.
10. Supersession remains fail-closed.
11. Service still has no Kintone/network/filesystem/Git dependency.
12. Full tests pass.
13. Living docs have one current Stage 4A test total and consistent pipeline status.
14. CHANGELOG includes Stage 4A.
15. Kintone calls/writes remain zero.
16. Git local/remote sync passes.

Expected gates:

- `STAGE3C_EVIDENCE_EXCEPTION_CLOSURE_GATE = PASS`
- `CANONICALIZATION_GATE = PASS`
- `DEPENDENCY_CONTRACT_GATE = PASS / FAIL`
- `PUBLISH_SERVICE_ARCHITECTURE_GATE = PASS / FAIL`
- `TRIPLE_HASH_GATE = PASS`
- `EFFECTIVE_OVERLAP_GATE = PASS / FAIL`
- `TRUSTED_AUDIT_GATE = PASS / FAIL`
- `FINAL_PUBLISH_READBACK_GATE = PASS`
- `LIFECYCLE_GATE = PASS`
- `SUPERSESSION_FAIL_CLOSED_GATE = PASS`
- `DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL`
- `ZERO_KINTONE_STAGE4A_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE4A_GATE = PASS / BLOCKED`
