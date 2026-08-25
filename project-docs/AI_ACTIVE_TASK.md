# AI ACTIVE TASK — ANTIGRAVITY WP-002C STAGE 4B MISSING TRACEABILITY ROWS ONLY

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `ad87defbfa7f072406e7795b50f310c3ee40dc0b`
> **Mode:** ONE-FILE DOC FIX ONLY
> **Source/Test changes:** ZERO
> **Kintone calls/writes:** ZERO

## REVIEW RESULT

The previous docs closure commit correctly fixed:

```text
IMPLEMENTATION_STATUS Current Work Package = PASS
commit count after prior assignment = exactly 1
prior commit scope = docs-only
branch push sync = PASS
```

However, `project-docs/AI_REVIEW_PACKAGE.md` only changed the section heading. It did NOT append the required Stage 4B traceability rows.

This task fixes ONLY that omission.

---

# ONLY AUTHORIZED FILE

```text
project-docs/AI_REVIEW_PACKAGE.md
```

Do not modify any other file.

---

# REQUIRED EXACT TABLE CHANGE

In section:

```text
## 1. Commit Verification Metadata (DEC-030, Stage 4A & Stage 4B Traceability)
```

The existing table currently ends with the Stage 4A final doc closure row.

First replace this stale row:

```markdown
| **Stage 4A Final Doc Closure** | *(Review Head)* | `docs: close wp-002c stage4a evidence consistency` |
```

with the real commit:

```markdown
| **Stage 4A Final Doc Closure** | `b8f4771b5d31361c6cf85c91b3809ebd5cd3d993` | `docs: close wp-002c stage4a evidence consistency` |
```

Then, immediately after it and BEFORE `## 2. Gate Summary`, append EXACTLY these Stage 4B rows:

```markdown
| **Stage 4A Closure / Stage 4B Authorization** | `f24f247cc22a5b73ad855047d33c2cdb591b41b7` | `docs: close wp-002c stage4a review gate` |
| **Stage 4B Repository Implementation** | `ab162b3e530b0e87f76ecc46589cd117e1ac8c6c` | `feat: add scoring config kintone repository foundation` |
| **Stage 4B First-Pass Evidence** | `7fbd9e8ec555198933a8e1fffb302e59b4ea8286` | `docs: record wp-002c stage4b repository foundation` |
| **Stage 4B Repository Hardening** | `5b71558edf7a781e5b0bc7e1f5d6d266b9ca8cb6` | `fix: harden scoring config kintone repository exactness` |
| **Stage 4B Hardening Evidence** | `ec122945856e87fdee84bb20571aaa9ef68f0039` | `docs: record wp-002c stage4b repository hardening` |
| **Stage 4B Final Exactness Correction** | `ac9ce5dce2ffa2a45cab44a88c46cf7bd6215465` | `fix: finalize scoring config repository storage exactness` |
| **Stage 4B Final Correction Evidence** | `b69e2d1d7fa396ddcabbb7df5f789674fc034158` | `docs: finalize wp-002c stage4b repository evidence` |
| **Stage 4B Final Doc Closure Attempt** | `ad87defbfa7f072406e7795b50f310c3ee40dc0b` | `docs: close wp-002c stage4b review evidence` |
```

Do not change the Gate Summary or any other content in the file.

---

# VALIDATION

Run:

```bash
git diff --check
git diff --name-only
git diff -- project-docs/AI_REVIEW_PACKAGE.md
npm test
```

Required:

```text
changed files = exactly 1
changed file = project-docs/AI_REVIEW_PACKAGE.md
source/test/config changes = 0
all tests PASS
expected suite = 370/370 unless unchanged suite legitimately reports higher
```

Before committing, visually confirm all eight Stage 4B rows above are present in the table.

---

# COMMIT / PUSH

Commit exactly:

```text
docs: add missing wp-002c stage4b traceability rows
```

Push only to:

```text
origin/ai/antigravity-wp002c
```

Verify:

```text
local HEAD = remote HEAD
tracked working tree clean
```

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
Do not modify source/test/config.
Do not start Stage 4C.
Do not seed records.
Do not start WP-002D.

# REVIEW EXPECTATION

ChatGPT expects exactly one Antigravity commit after this assignment, changing exactly `AI_REVIEW_PACKAGE.md`.

If the eight Stage 4B rows are present exactly and scope/sync remain clean, then:

```text
DOC_EVIDENCE_CONSISTENCY_GATE = PASS
WP002C_STAGE4B_GATE = PASS
```
