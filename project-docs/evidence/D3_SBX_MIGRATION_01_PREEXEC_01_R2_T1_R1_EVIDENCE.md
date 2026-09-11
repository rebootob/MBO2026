# D3-SBX-MIGRATION-01-PREEXEC-01-R2-T1-R1 — Baseline Attribution Evidence

PACKAGE = D3-SBX-MIGRATION-01-PREEXEC-01-R2-T1-R1
EXECUTION_MODE = TEST-ONLY / BASELINE ATTRIBUTION
ZERO_KINTONE_IO = YES
CANONICAL_HEAD_AT_EXECUTION = ed0d3e8df48b521dd999aedd0d5b64c8d84b9a5d
R2_SOURCE = 50fc1459cfa1840ffacb272582c23ec382d522c8
BASELINE = 6f6351acbba6b5e898220002fb755821afa6c86c

## Execution Summary

Executed in two detached temporary worktrees without modifying the canonical worktree:
- WORKTREE A: 50fc1459cfa1840ffacb272582c23ec382d522c8 (R2 Source)
- WORKTREE B: 6f6351acbba6b5e898220002fb755821afa6c86c (Baseline)

Both worktrees executed `npm test` and `node --test tests/create-handler-form-state.test.js`.

---

## A) R2 SOURCE (50fc145) — `npm test`

```text
COMMAND: npm test
EXIT_CODE: 1
TOTAL: 1572
PASS: 1558
FAIL: 14
SUITES: 9
```

### Failed Tests
1. `tests/classic-bundle.test.js`
2. `tests/core-794-795-796-integration.test.js`
3. `Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls` (in `tests/create-handler-form-state.test.js:47:1`)
4. `Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls` (in `tests/create-handler-form-state.test.js:283:1`)
5. `tests/deploy-customization-preservation.test.js`
6. `tests/hr-control-center-reset-ui.test.js`
7. `tests/mbo-export-service.test.js`
8. `tests/mbo-session-manager.test.js`
9. `tests/mbo-xlsx-combined-composer.test.js`
10. `tests/mbo-xlsx-ooxml-feasibility.test.js`
11. `tests/mbo-xlsx-semantic-renderer.test.js`
12. `tests/mbo-xlsx-template-preparer-part-b.test.js`
13. `tests/mbo-xlsx-template-preparer.test.js`
14. `tests/migrate-app794-css-target.test.js`

### Exact Assertion / Error Text
For `tests/create-handler-form-state.test.js`:
```text
AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration

0 !== 1

    at loadBundleForDeterministicBusinessDate (file:///tests/create-handler-form-state.test.js:33:10)
    at TestContext.<anonymous> (file:///tests/create-handler-form-state.test.js:189:22)
    at Test.runInAsyncScope (node:async_hooks:214:14)
    at Test.run (node:internal/test_runner/test:1106:25)
    at Test.start (node:internal/test_runner/test:1003:17)
    at startSubtestAfterBootstrap (node:internal/test_runner/harness:358:17) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: 0,
  expected: 1,
  operator: 'strictEqual',
  diff: 'simple'
}
```

For external module dependency tests (missing devDependencies in isolated worktree):
```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'esbuild' imported from scripts/kintone/build-mbo-ui.js
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'xlsx-populate' imported from src/services/mbo-xlsx-template-preparer.js
```

---

## B) BASELINE (6f6351a) — `npm test`

```text
COMMAND: npm test
EXIT_CODE: 1
TOTAL: 1566
PASS: 1552
FAIL: 14
SUITES: 9
```

### Failed Tests
1. `tests/classic-bundle.test.js`
2. `tests/core-794-795-796-integration.test.js`
3. `Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls` (in `tests/create-handler-form-state.test.js:47:1`)
4. `Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls` (in `tests/create-handler-form-state.test.js:283:1`)
5. `tests/deploy-customization-preservation.test.js`
6. `tests/hr-control-center-reset-ui.test.js`
7. `tests/mbo-export-service.test.js`
8. `tests/mbo-session-manager.test.js`
9. `tests/mbo-xlsx-combined-composer.test.js`
10. `tests/mbo-xlsx-ooxml-feasibility.test.js`
11. `tests/mbo-xlsx-semantic-renderer.test.js`
12. `tests/mbo-xlsx-template-preparer-part-b.test.js`
13. `tests/mbo-xlsx-template-preparer.test.js`
14. `tests/migrate-app794-css-target.test.js`

### Exact Assertion / Error Text
For `tests/create-handler-form-state.test.js`:
```text
AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration

0 !== 1

    at loadBundleForDeterministicBusinessDate (file:///tests/create-handler-form-state.test.js:33:10)
    at TestContext.<anonymous> (file:///tests/create-handler-form-state.test.js:189:22)
    at Test.runInAsyncScope (node:async_hooks:214:14)
    at Test.run (node:internal/test_runner/test:1106:25)
    at Test.start (node:internal/test_runner/test:1003:17)
    at startSubtestAfterBootstrap (node:internal/test_runner/harness:358:17) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: 0,
  expected: 1,
  operator: 'strictEqual',
  diff: 'simple'
}
```

For external module dependency tests (missing devDependencies in isolated worktree):
```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'esbuild' imported from scripts/kintone/build-mbo-ui.js
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'xlsx-populate' imported from src/services/mbo-xlsx-template-preparer.js
```

---

## C) R2 SOURCE (50fc145) — `node --test tests/create-handler-form-state.test.js`

```text
COMMAND: node --test tests/create-handler-form-state.test.js
EXIT_CODE: 1
TOTAL: 2
PASS: 0
FAIL: 2
```

### Exact Result & Failure Signature
```text
✖ Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls
  AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration
  0 !== 1

✖ Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls
  AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration
  0 !== 1
```

---

## D) BASELINE (6f6351a) — `node --test tests/create-handler-form-state.test.js`

```text
COMMAND: node --test tests/create-handler-form-state.test.js
EXIT_CODE: 1
TOTAL: 2
PASS: 0
FAIL: 2
```

### Exact Result & Failure Signature
```text
✖ Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls
  AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration
  0 !== 1

✖ Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls
  AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration
  0 !== 1
```

---

## Attribution Verdict & Control Flags

```text
ATTRIBUTION_REPORTED_BY_EXECUTION_PLANE = PRE_EXISTING_BASELINE_FAILURE

CONTROL_PLANE_REVIEW = PENDING
PREEXEC_R2_CLOSED = NO
D3_SBX_MIGRATION_AUTHORIZED = NO

KINTONE_READS = 0
KINTONE_WRITES = 0
DEPLOYMENTS = 0
SOURCE_CHANGES = 0
TEST_CHANGES = 0

FINAL_CANONICAL_WORKTREE_STATUS = CLEAN
```
