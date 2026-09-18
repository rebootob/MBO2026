# Evidence: D3 Mixed Identity Audit Integration Regression 01 (R1)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R1`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R1-20260918-OWNER-01`
- **Authorized Base HEAD:** `e2035593abdc40588046c82dbb622f793eea979e`
- **Pre-Mixed-Identity Baseline Commit Used:** `e143259f120794e8c7201d93c727d3f47efcd6bd`
- **Mode:** EVIDENCE + BASELINE ATTRIBUTION CORRECTIVE ONLY
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Result

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Current HEAD:** `e2035593abdc40588046c82dbb622f793eea979e`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `e2035593abdc40588046c82dbb622f793eea979e`
- **Preflight Verification:** `HEAD == origin/ai/antigravity-wp002c == e2035593abdc40588046c82dbb622f793eea979e` (Exact match, NO DRIFT)

---

## 2. Six Failing Suites Recheck & Failure Signatures

Each of the 6 suites was rerun individually to capture exact error classes, messages, stack traces, and exit codes:

### Suite 1: `tests/deploy-customization-preservation.test.js`
- **Command:** `node --test tests/deploy-customization-preservation.test.js`
- **Exit Code:** 1
- **Totals:** 51 tests (37 pass, 14 fail, 0 skipped/todo/cancelled)
- **First Failing Test:** `BLOCKER_B_AUTHORIZATION_CONSUMPTION: Not consumed during local validation/build/read preflight; consumed at upload boundary; replay rejected; invalid auth causes zero network` (Line 1079)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `The input did not match the regular expression /INVALID_SCOPE_BLOCKED_PRE_UPLOAD/. Input: 'Error: DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK: Working tree has uncommitted or untracked changes before Live execution.'`
- **Stack Trace / Trigger:**
  ```text
  Error: DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK: Working tree has uncommitted or untracked changes before Live execution.
      at validatePrebuildSourceManifest (scripts/kintone/deploy-custom-ui.js:118:11)
      at executeDeployCustomUi (scripts/kintone/deploy-custom-ui.js:1520:3)
  ```
- **Root Cause Analysis:** During the test run of `deploy-customization-preservation.test.js`, earlier build-only subtests emit bundled artifacts into `dist/mbo-employee-app.js`, making the local git working tree dirty. Subtests expecting upload boundary errors like `INVALID_SCOPE_BLOCKED_PRE_UPLOAD` invoke `executeDeployCustomUi`, which executes `validatePrebuildSourceManifest` (a safety guard verifying clean git status). Seeing the dirty `dist/mbo-employee-app.js`, it immediately aborts with `DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK`.
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD` for `tests/deploy-customization-preservation.test.js`: **0 diff** (Identical)
  - Git diff between `e143259f` and `HEAD` for `scripts/kintone/deploy-custom-ui.js`: **0 diff** (Identical)
  - Pre-mixed baseline test run exhibits identical behavior.
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

### Suite 2: `tests/mbo-export-service.test.js`
- **Command:** `node --test tests/mbo-export-service.test.js`
- **Exit Code:** 0 (Exit 0 because only 1 subtest failed inside suite; Node test runner outputs failure block)
- **Totals:** 43 tests (42 pass, 1 fail)
- **First Failing Test:** `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_INPUT_IMMUTABILITY: caller template buffers are not mutated during export generation` (Line 748)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `Local Part A owner template missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Missing Path:** `C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Root Cause Analysis:** Requires external binary template file on disk. The directory `app info/` is not tracked by Git (untracked in working environment and absent from git tree).
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD` for `tests/mbo-export-service.test.js`: **0 diff**
  - `git ls-tree e143259f "app info"` returns empty (never tracked).
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

### Suite 3: `tests/mbo-xlsx-combined-composer.test.js`
- **Command:** `node --test tests/mbo-xlsx-combined-composer.test.js`
- **Exit Code:** 1
- **First Failing Test:** `COMBINED_XLSX_COMPOSER_STATIC_PREVIEW_PARITY: composed workbook preserves Part A visual and structural fidelity` (Line 385)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `Local Part A owner template missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Missing Path:** `C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD`: **0 diff**
  - `git ls-tree e143259f "app info"` returns empty (never tracked).
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

### Suite 4: `tests/mbo-xlsx-semantic-renderer.test.js`
- **Command:** `node --test tests/mbo-xlsx-semantic-renderer.test.js`
- **Exit Code:** 1
- **First Failing Test:** `XLSX_SEMANTIC_RENDERER_PART_A_TEMPLATE_PRESERVATION: renders semantic model onto Part A template while preserving byte-for-byte non-target XML parts` (Line 274)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `Local Part A owner template missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Missing Path:** `C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD`: **0 diff**
  - `git ls-tree e143259f "app info"` returns empty (never tracked).
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

### Suite 5: `tests/mbo-xlsx-template-preparer-part-b.test.js`
- **Command:** `node --test tests/mbo-xlsx-template-preparer-part-b.test.js`
- **Exit Code:** 1
- **First Failing Test:** `PREPARER_PART_B_OWNER_TEMPLATE_INTEGRATION: structural & style parity for Part B master template` (Line 185)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `Local Part B owner template file missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_B.xlsx`
- **Missing Path:** `C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_B.xlsx`
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD`: **0 diff**
  - `git ls-tree e143259f "app info"` returns empty (never tracked).
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

### Suite 6: `tests/mbo-xlsx-template-preparer.test.js`
- **Command:** `node --test tests/mbo-xlsx-template-preparer.test.js`
- **Exit Code:** 1
- **First Failing Test:** `PREPARER_PART_A_OWNER_TEMPLATE_INTEGRATION: N=4..10 complete proof matrix, deep row structural parity & frozen baseline matrix` (Line 394)
- **Error Class:** `AssertionError [ERR_ASSERTION]`
- **Error Message:** `Local Part A owner template file missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Missing Path:** `C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`
- **Pre-Mixed Baseline Comparison (`e143259f`):**
  - Git diff between `e143259f` and `HEAD`: **0 diff**
  - `git ls-tree e143259f "app info"` returns empty (never tracked).
- **Attribution:** `PRE_EXISTING_BASELINE_FAILURE`

---

## 3. Baseline Attribution Master Table

| Suite | Current Result | Exact Failure Class & Message | Pre-Baseline Result (`e143259f`) | Attribution | Proof Reference | Confidence |
|---|---|---|---|---|---|---|
| `tests/deploy-customization-preservation.test.js` | 37 Pass / 14 Fail | `AssertionError [ERR_ASSERTION]: DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | Identical file contents at `e143259f`; triggered by dirty `dist/` created by prior subtests | HIGH |
| `tests/mbo-export-service.test.js` | 42 Pass / 1 Fail | `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at .../app info/data/PMS_Staff & Chief_PART_A.xlsx` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | `git diff e143259f..HEAD -- tests/mbo-export-service.test.js` = empty; `app info/` untracked in git at both HEAD and `e143259f` | HIGH |
| `tests/mbo-xlsx-combined-composer.test.js` | 0 Pass / 1 Fail | `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at .../app info/data/PMS_Staff & Chief_PART_A.xlsx` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | `git diff e143259f..HEAD -- tests/mbo-xlsx-combined-composer.test.js` = empty; untracked binary template | HIGH |
| `tests/mbo-xlsx-semantic-renderer.test.js` | 0 Pass / 1 Fail | `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at .../app info/data/PMS_Staff & Chief_PART_A.xlsx` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | `git diff e143259f..HEAD -- tests/mbo-xlsx-semantic-renderer.test.js` = empty; untracked binary template | HIGH |
| `tests/mbo-xlsx-template-preparer-part-b.test.js` | 0 Pass / 1 Fail | `AssertionError [ERR_ASSERTION]: Local Part B owner template file missing at .../app info/data/PMS_Staff & Chief_PART_B.xlsx` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | `git diff e143259f..HEAD -- tests/mbo-xlsx-template-preparer-part-b.test.js` = empty; untracked binary template | HIGH |
| `tests/mbo-xlsx-template-preparer.test.js` | 0 Pass / 1 Fail | `AssertionError [ERR_ASSERTION]: Local Part A owner template file missing at .../app info/data/PMS_Staff & Chief_PART_A.xlsx` | Identical (0 git diff between `e143259f` and HEAD) | `PRE_EXISTING_BASELINE_FAILURE` | `git diff e143259f..HEAD -- tests/mbo-xlsx-template-preparer.test.js` = empty; untracked binary template | HIGH |

---

## 4. Invariant & Accounting Verification

- **NEW_REGRESSION_COUNT:** **0**
- **UNATTRIBUTED_COUNT:** **0**
- **UNSUPPORTED_PRE_EXISTING_CLAIMS:** **0**
- **ALL_6_FAILURES_RERUN_INDIVIDUALLY:** **YES**
- **EXACT_FAILURE_SIGNATURE_CAPTURED:** **YES**
- **ATTRIBUTION_EVIDENCE_RESOLVABLE:** **YES**
- **SOURCE_CHANGE:** **0** (Production code unchanged)
- **TEST_CHANGE:** **0** (Test files unchanged)
- **ZERO-I/O ACCOUNTING:**
  - KINTONE_READS: 0
  - KINTONE_WRITES: 0
  - SCHEMA_READS: 0
  - SCHEMA_WRITES: 0
  - PROCESS_WRITES: 0
  - RECORD_WRITES: 0
  - DEPLOYMENT: 0
  - UAT: 0
  - REAL_OAUTH: 0
  - EXTERNAL_BACKEND: 0

---

## 5. Control State & Stop Gate

- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R1`
- **Status:** `DELIVERED / REVIEW_REQUIRED`
- **Current Gate:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **NEXT_GATE_NOT_STARTED:** `YES`
- **Prohibited Work Not Started:**
  - App798 schema preflight: NOT STARTED
  - Schema deployment: NOT STARTED
  - App794 deployment: NOT STARTED
  - SHARED UAT: NOT STARTED
  - DEDICATED UAT: NOT STARTED
  - D3 closure: NOT STARTED
