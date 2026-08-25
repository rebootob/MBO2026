# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4A FINAL EXACTNESS CLEANUP

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `2a0c4b774ff3e04912769c11664b5aba0ee91ae1`
> **Mode:** TINY CODE EXACTNESS + DOC CONSISTENCY ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## REVIEW RESULT

Accepted from the previous final correction:

```text
code commit = 4d5a1bf6a8cae1fddd59972430e0b5e45fbbf7ca
docs commit = 2a0c4b774ff3e04912769c11664b5aba0ee91ae1
commit order = PASS
code scope = PASS
REGRESSION_COVERAGE_GATE = PASS (306/306 reported; >=291 baseline)
DEPENDENCY_CONTRACT_GATE = PASS
EFFECTIVE_OVERLAP_GATE = PASS
TRIPLE_HASH_GATE = PASS
FINAL_PUBLISH_READBACK_GATE = PASS
LIFECYCLE_GATE = PASS
SUPERSESSION_FAIL_CLOSED_GATE = PASS
ZERO_KINTONE_STAGE4A_GATE = PASS
```

Three exactness issues remain.

---

# MUST FIX 1 — OFFSET REGEX GROUP DESTRUCTURING IS SHIFTED

Current `isValidIsoDateTime()` regex captures:

```text
1 year
2 month
3 day
4 hour
5 minute
6 second
7 fraction
8 full timezone token (Z or +HH:MM)
9 offset sign
10 offset hour
11 offset minute
```

But current destructuring skips only group 7 and assigns:

```text
tzSign    <- group 8
tzHourStr <- group 9
tzMinStr  <- group 10
```

So the explicit timezone component validation does not actually read sign/hour/minute as intended.

Correct the destructuring (or equivalent explicit indexing) so offset validation truly reads groups 9/10/11.

Required explicit behavior remains:

```text
+23:59 = syntactically valid offset component range
+24:00 = reject
+09:60 = reject
```

Do not rely only on `new Date()` for these component bounds.

Add/retain a direct regression test proving a valid high-range offset such as `+23:59` passes and invalid `+24:00` / `+09:60` fail.

---

# MUST FIX 2 — CURRENT PIPELINE STATUS MUST BE UNAMBIGUOUS

Current living docs still use both:

```text
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
```

and in current App/Target descriptions:

```text
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

For every current Stage 4A state/target description, use exactly:

```text
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
```

Historical pre-Stage4 statements may retain `NOT_DEPLOYED` only if explicitly historical.

---

# MUST FIX 3 — AI_REVIEW_PACKAGE COMMIT METADATA IS STALE

The current `AI_REVIEW_PACKAGE.md` commit table still stops at the earlier Stage 3C forensic checkpoint.

Add current Stage 4A traceability, at minimum:

```text
f010e26fbc61e39ee84874a1c024492acf0c81fa = Stage 4A implementation
683cc0eaae66faa1e335e122b7aff8aba08ad9e7 = Stage 4A first hardening
4d5a1bf6a8cae1fddd59972430e0b5e45fbbf7ca = Stage 4A final correction
2a0c4b774ff3e04912769c11664b5aba0ee91ae1 = Stage 4A final evidence before this cleanup
<new code commit> = Stage 4A exactness cleanup
<new docs commit> = Stage 4A final review evidence
```

Historical Stage 3C rows may remain.

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
git merge-base --is-ancestor 2a0c4b774ff3e04912769c11664b5aba0ee91ae1 HEAD
```

Required:

```text
branch = ai/antigravity-wp002c
local HEAD = remote HEAD
reviewed head 2a0c4b7... is in ancestry
tracked working tree clean before edits
```

No reset/rebase/stash/force-push automatically.

---

# STEP 1 — CODE / TEST EXACTNESS

Allowed files only:

- `src/services/scoring-config-master-service.js`
- `tests/scoring-config-master-service.test.js`

Do only the timezone capture/component exactness correction.
Preserve all 306-test semantic coverage already restored.
Do not refactor unrelated logic.

Required tests:

```text
valid +23:59 offset passes
+24:00 rejects
+09:60 rejects
invalid calendar with offset rejects
valid leap day with offset passes
all prior Stage 4A tests remain present
```

Run:

```bash
git diff --check
npm test
```

All tests must pass and final total must remain >= 306.

Commit exactly:

```text
fix: correct scoring config timezone capture exactness
```

Push and verify local HEAD = remote HEAD.

---

# STEP 2 — DOC CONSISTENCY

Allowed docs only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Required current state:

```text
STAGE4A_PUBLISH_INTEGRITY_FOUNDATION = EXACTNESS_CLEANUP_COMPLETE / PENDING CHATGPT FINAL REVIEW
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_KINTONE_ADAPTER_STATUS = NOT_IMPLEMENTED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
BASELINE_SEED_STATUS = NOT_STARTED
RECORD_COUNT = 0 (last verified Kintone checkpoint)
THIS_STAGE_4A_EXACTNESS_CLEANUP_KINTONE_CALLS = 0
THIS_STAGE_4A_EXACTNESS_CLEANUP_KINTONE_WRITES = 0
PREWRITE_BACKUP_RETENTION_UNTIL_INDEPENDENT_REVIEW = MANDATORY
NEXT_ACTION = AWAIT CHATGPT FINAL STAGE 4A REVIEW
```

Use actual final test total consistently in current operational sections.
Update AI_REVIEW_PACKAGE Stage 4A commit metadata as required above.

Commit exactly:

```text
docs: finalize wp-002c stage4a exactness evidence
```

Push, verify local HEAD = remote HEAD, tracked working tree clean, then STOP.

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
Do not modify resolver/core client/write guard/UI/domain baseline values.
Do not start WP-002D.

# REVIEW EXPECTATION

Expected exactly two Antigravity commits after this assignment:

1. `fix: correct scoring config timezone capture exactness`
2. `docs: finalize wp-002c stage4a exactness evidence`

Final expected gates:

- `CANONICALIZATION_GATE = PASS`
- `DEPENDENCY_CONTRACT_GATE = PASS`
- `EFFECTIVE_OVERLAP_GATE = PASS`
- `TRUSTED_DATETIME_GATE = PASS`
- `TRIPLE_HASH_GATE = PASS`
- `TRUSTED_AUDIT_GATE = PASS`
- `FINAL_PUBLISH_READBACK_GATE = PASS`
- `REGRESSION_COVERAGE_GATE = PASS`
- `LIFECYCLE_GATE = PASS`
- `SUPERSESSION_FAIL_CLOSED_GATE = PASS`
- `DOC_EVIDENCE_CONSISTENCY_GATE = PASS`
- `ZERO_KINTONE_STAGE4A_GATE = PASS`
- `GIT_PUSH_SYNC_GATE = PASS`
- `WP002C_STAGE4A_GATE = PASS`
