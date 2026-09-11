# D3-SBX-MIGRATION-01-PREEXEC-01-R2 — Local Runtime Test Evidence

Updated: 2026-09-11 ICT
Repository: `C:\Users\allda\Desktop\Dev\git\MBO2026`
Canonical Branch: `ai/antigravity-wp002c`
Base HEAD: `50fc1459cfa1840ffacb272582c23ec382d522c8`
Mode: `TEST-EVIDENCE-PUBLISH ONLY / ZERO KINTONE I/O`
Execution Plane: `Antigravity only`

## 1. Runtime Environment
```text
OS: Windows 11
Node.js: v24.11.1
npm: 11.6.2
```

## 2. Canonical Repository Runtime Test
Command:
```bash
npm test
# (node --test tests/*.test.js services/mbo-auth-bridge/tests/*.test.js)
```

Execution Summary:
```text
Exit Code: 1
Total Tests: 1708
Pass: 1706
Fail: 2
Skipped: 0
```

Failing Tests:
1. `tests/create-handler-form-state.test.js:47:1`
   - Test: `Create Handler Form State Corrective: Authenticated Create Autoload uses event.record authority with 0 kintone.app.record.get/set calls`
   - Error: `AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration (0 !== 1)`
2. `tests/create-handler-form-state.test.js:283:1`
   - Test: `Create Handler Form State Corrective: Lookup failure path remains fail-closed with 0 kintone.app.record.get/set calls`
   - Error: `AssertionError [ERR_ASSERTION]: compiled bundle must contain exactly one internal testResolutionBusinessDate declaration (0 !== 1)`

Diagnostic Observation:
The test harness helper `loadBundleForDeterministicBusinessDate()` searches `dist/mbo-employee-app.js` for `/\b(?:let|var)\s+testResolutionBusinessDate\s*=\s*null\s*;/g`. This regex did not match the compiled artifact in the local build. This failure is isolated to the client form state date harness and matches the known blocker documented in `AI_CONTROL_CENTER.md`: `LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER`.

## 3. Targeted PREEXEC-R2 Binding Test
Command:
```bash
node --test tests/d3-sbx-migration-live-binding.test.js tests/d3-sbx-migration-live-binding-r2.test.js
```

Execution Summary:
```text
Exit Code: 0
Total Tests: 16
Pass: 16
Fail: 0
Skipped: 0
```

Verifications Proved:
- Deploy polling waits through `PROCESSING` and returns only after `SUCCESS`
- Deploy `FAIL` is terminal and fails closed
- Deploy `CANCEL` is terminal and fails closed
- Deploy `PROCESSING` timeout is result-uncertain and does not auto-retry POST
- Uncertain deploy POST can be resolved only by bounded `SUCCESS` status readback
- Deploy status transport uncertainty fails closed without write retry
- Binding scope exactly matches frozen runner contract
- Transport contract rejects generic extra callables
- Read scope blocks non-guard apps before snapshot access
- App 795 optional-field stage uses only POST preview fields endpoint
- Schema scope rejects fields outside the frozen App 795 contract
- App 795 finalization uses only PUT preview fields endpoint
- Schema activation requires a staged revision and can deploy only the exact app
- Record update is exact-20 App 795 PUT only
- App 794 schema stage requires exactly the five provenance fields
- Durable file ledger rejects authorization replay across instances

## 4. Safety & Governance Evidence
```text
Kintone Reads: 0
Kintone Writes: 0
Schema Writes: 0
Process Writes: 0
Record Writes: 0
ACL Writes: 0
Deployments: 0
Live Migration Executions: 0
```

Standing Hygiene Rule:
Build residue in `dist/` (`dist/hr-control-center-bundle.js`, `dist/mbo-employee-app.js`, `dist/mbo-employee-app-classic-test.js`) generated during `npm test` was restored and cleaned per standing Owner hygiene authorization.

## 5. Result Verdict
```text
PREEXEC_R2_TARGETED_BINDING_TESTS = PASS (16/16)
CANONICAL_REPOSITORY_RUNTIME_TEST = FAIL (1706 PASS / 2 FAIL)
VERDICT = REVIEW_REQUIRED
```

Submitted to ChatGPT Control Plane for independent review and corrective guidance.
