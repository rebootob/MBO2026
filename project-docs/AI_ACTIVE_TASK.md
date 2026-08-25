# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4A FINAL CORRECTION

> **Control Plane:** ChatGPT / Project Lead / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `92d3454602f80a9eabc2c1021f0c387233e2e1a7`
> **Mode:** FINAL CODE/TEST CORRECTION + LIVING-DOC CONSISTENCY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## REVIEW RESULT

The first Stage 4A hardening pass substantially fixed the requested contracts.

Accepted:

```text
hardening code commit = 683cc0eaae66faa1e335e122b7aff8aba08ad9e7
hardening docs commit = 92d3454602f80a9eabc2c1021f0c387233e2e1a7
commit order = PASS
code scope = service + service tests only
DEPENDENCY_CONTRACT_GATE = PASS
CANDIDATE_STATUS_CONTRACT = PASS
EFFECTIVE_OVERLAP_ROW_CONTRACT = PASS
TRIPLE_HASH_GATE = PASS in runtime implementation
FINAL_PUBLISH_READBACK_GATE = PASS in runtime implementation
LIFECYCLE_GATE = PASS
SUPERSESSION_FAIL_CLOSED_GATE = PASS
ZERO_KINTONE_STAGE4A_GATE = PASS
reported suite = 283/283 PASS
```

Two blocking review findings remain, plus one document-consistency correction.

---

# MUST FIX A — TIMEZONE-OFFSET DATETIME CALENDAR VALIDATION IS INCOMPLETE

Current `isValidIsoDateTime()` validates exact calendar components against the parsed Date only when the input ends with `Z`.

As a result, an offset timestamp such as:

```text
2026-02-31T00:00:00+09:00
```

can be normalized by JavaScript into March and incorrectly pass the helper.

The contract is a valid timezone-aware ISO-8601 datetime regardless of whether timezone is `Z` or an explicit offset.

Fix inside the existing service file only.

Required behavior:

```text
PASS: 2026-04-01T00:00:00Z
PASS: 2026-04-01T09:00:00+09:00
PASS: 2026-04-01T00:00:00.123Z
PASS: valid leap day such as 2028-02-29T09:00:00+09:00

FAIL: 2026-04-01
FAIL: 2026-02-31T00:00:00Z
FAIL: 2026-02-31T00:00:00+09:00
FAIL: 2026-04-31T00:00:00+09:00
FAIL: 2026-04-01T25:00:00+09:00
FAIL: 2026-04-01T00:60:00+09:00
FAIL: 2026-04-01T00:00:60+09:00
FAIL: invalid offset such as +24:00 or +09:60
```

Validate calendar day/month independently of timezone conversion (e.g. exact days-in-month/leap-year validation) and validate offset components explicitly before accepting the parsed datetime.

Keep the trusted timestamp's exact trimmed representation for publish patch/final equality.

---

# MUST FIX B — HARDENING MUST NOT DELETE STAGE 4A REGRESSION COVERAGE

The original Stage 4A evidence reported:

```text
291/291 PASS
```

After hardening the suite is reported as:

```text
283/283 PASS
```

The hardening commit modified `tests/scoring-config-master-service.test.js` with substantial deletions and removed multiple original contract tests. For example the explicit final `Config_Status != PUBLISHED` verification test was deleted.

Hardening may consolidate duplicated setup, but it must not remove semantic coverage from the original Stage 4A contract.

Restore the original semantic regression coverage while preserving all newly added hardening tests.

At minimum preserve/restore explicit coverage for all of the following:

### Caller/lifecycle injection

```text
caller PUBLISHED rejected
caller VALIDATED rejected
caller Published_By rejected
caller Published_At rejected
caller Configuration_Hash rejected
unsupported supersession rejected before persistence
```

### Duplicate/domain/persistence contract

```text
duplicate master key rejected
malformed findByMasterKey response rejected
invalid domain config rejected before persistence
createValidatedRecord missing/invalid ID rejected
```

### Initial exact read-back / triple hash

```text
wrong Master_Record_Key rejected
missing stored Configuration_Hash rejected
expected hash != stored hash rejected
expected hash != recomputed hash rejected
stored hash != recomputed hash rejected
status != VALIDATED rejected
```

### Effective-overlap contract

```text
same-day inclusive boundary overlap rejected
contained overlap rejected
enveloping overlap rejected
non-overlap earlier passes
non-overlap later passes
wrong Profile_Code row rejected
wrong Fiscal_Year row rejected
malformed/non-array overlap response rejected
missing/malformed/reversed dates rejected
wrong/missing PUBLISHED status rejected
```

### Trusted audit

```text
audit provider not called before all earlier gates pass
missing publisher rejected
invalid timestamp rejected
date-only timestamp rejected
valid Z timestamp passes
valid offset timestamp passes
invalid offset-calendar datetime rejected
invalid timezone offset rejected
```

### Publish patch + final exact verification

```text
publish patch contains lifecycle/audit fields only
final status != PUBLISHED rejected
final Master_Record_Key mismatch rejected
final Configuration_Hash mismatch rejected
final immutable payload mutation rejected
final publisher mismatch rejected
final timestamp mismatch rejected
final success requires recomputed hash equality
```

### Lifecycle / architecture

```text
allowed lifecycle matrix passes
invalid/reverse/direct jumps fail
service has no Kintone/network/filesystem/Git runtime dependency
```

Do not remove any currently-added hardening tests to make the count fit.
Semantic coverage is the primary gate, but the final full-suite test count must not be lower than the accepted pre-hardening 291-test baseline.

---

# MUST FIX C — REMOVE CURRENT PUBLISH PIPELINE STATUS AMBIGUITY

Current living docs still contain both:

```text
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
```

and a current target description containing:

```text
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

Use one current vocabulary consistently:

```text
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
```

Historical/pre-Stage4 checkpoints may retain `NOT_DEPLOYED` only if clearly labelled historical.

Also update the review package commit metadata so the current Stage 4A implementation/hardening/final-correction commits are visible rather than leaving the review head table at the earlier Stage 3C forensic checkpoint.

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
git merge-base --is-ancestor 92d3454602f80a9eabc2c1021f0c387233e2e1a7 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
reviewed head 92d3454... is in ancestry
local HEAD = remote HEAD
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

---

# STEP 1 — FINAL CODE / TEST CORRECTION

Allowed files only:

- `src/services/scoring-config-master-service.js`
- `tests/scoring-config-master-service.test.js`

Do not change domain rules, baseline configs, resolver, core client, write guard, UI, main app, or any Kintone integration.

Required:

1. Fix timezone-offset calendar validation.
2. Preserve all current hardening behavior.
3. Restore all lost Stage 4A semantic regression coverage listed above.
4. Add explicit tests for offset invalid-calendar and invalid offset components.
5. Keep dependency-injected/no-network architecture.
6. Keep supersession fail-closed.
7. Keep final triple-hash/read-back fail-closed.

Run:

```bash
git diff --check
npm test
```

All tests must pass.
Final full-suite test total must be >= 291.

Commit exactly:

```text
fix: finalize scoring config datetime and regression coverage
```

Push only to `origin/ai/antigravity-wp002c`.
Verify local HEAD = remote HEAD before docs.

---

# STEP 2 — FINAL LIVING-DOC EVIDENCE CORRECTION

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
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = FINAL_CORRECTION_COMPLETE / PENDING CHATGPT FINAL REVIEW
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint; no Kintone access in Stage 4A)
THIS_STAGE_4A_FINAL_CORRECTION_KINTONE_CALLS = 0
THIS_STAGE_4A_FINAL_CORRECTION_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT FINAL STAGE 4A REVIEW BEFORE STAGE 4B
```

Use actual final full-suite test count consistently in current operational sections.
Do not rewrite historical counts.

Update `AI_REVIEW_PACKAGE.md` commit metadata with at least:

```text
f010e26 = Stage 4A implementation
683cc0e = Stage 4A first hardening
<new code commit> = Stage 4A final correction
<new docs commit> = Stage 4A final evidence
```

Commit exactly:

```text
docs: finalize wp-002c stage4a review evidence
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
Do not implement Stage 4B.
Do not implement a Kintone adapter.
Do not wire the resolver.
Do not start WP-002D.

---

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new execution commits: code/tests then docs.
2. Code commit changes service + service-test only.
3. Offset timestamps receive exact calendar validation independent of timezone conversion.
4. Invalid offset-calendar and invalid offset-component tests pass.
5. Original Stage 4A semantic test coverage is restored, not traded away for hardening tests.
6. Full test total is >= 291 and all pass.
7. Dependency/overlap/status hardening remains intact.
8. Triple-hash gate remains fail-closed.
9. Every final read-back dimension has explicit regression coverage.
10. Trusted audit gates remain fail-closed.
11. Supersession remains unimplemented/fail-closed.
12. No Kintone/network/filesystem/Git runtime dependency was added.
13. Current living docs use one unambiguous pipeline-status vocabulary.
14. Stage 4A commit metadata is current.
15. Kintone calls/writes = zero.
16. Git remote branch points to final evidence commit and reported local/remote sync passes.

Expected gates:

- `STAGE3C_EVIDENCE_EXCEPTION_CLOSURE_GATE = PASS`
- `CANONICALIZATION_GATE = PASS`
- `DEPENDENCY_CONTRACT_GATE = PASS`
- `EFFECTIVE_OVERLAP_GATE = PASS`
- `TRUSTED_DATETIME_GATE = PASS / FAIL`
- `TRIPLE_HASH_GATE = PASS`
- `TRUSTED_AUDIT_GATE = PASS`
- `FINAL_PUBLISH_READBACK_GATE = PASS`
- `REGRESSION_COVERAGE_GATE = PASS / FAIL`
- `LIFECYCLE_GATE = PASS`
- `SUPERSESSION_FAIL_CLOSED_GATE = PASS`
- `DOC_EVIDENCE_CONSISTENCY_GATE = PASS / FAIL`
- `ZERO_KINTONE_STAGE4A_GATE = PASS`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE4A_GATE = PASS / BLOCKED`
