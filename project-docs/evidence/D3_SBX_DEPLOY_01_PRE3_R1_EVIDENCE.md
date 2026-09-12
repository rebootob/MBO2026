# D3-SBX-DEPLOY-01-PRE3-R1 Evidence Record

Updated: 2026-09-12 ICT

## 1. Package Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-PRE3-R1
BASE_HEAD = fe9b828f67ba2759d6430fda736d01c14253fd9d
MODE = LOCAL EXECUTOR FAIL-CLOSED HARDENING / ZERO KINTONE I/O / ZERO DEPLOYMENT
TARGET_APP = 794
TARGET_PROCESS = 19 STATES / 40 ACTIONS
TARGET_BUILDER = scripts/kintone/build-d3-workflow-payload.js (buildD3WorkflowPayload)
TARGET_OVERRIDE_ALLOWED = NO
EXPECTED_BASELINE_REQUIRED = YES
CANONICAL_WORKFLOW_VALIDATOR = validateWorkflowPayloadStructure
AUTHORIZATION_CONSUMPTION_POINT = IMMEDIATELY BEFORE FIRST FUTURE PUT
NO_WRITE_RETRY = ENFORCED
```

## 2. Independent Review Provenance & Scope Expansion
```text
PRE3_INDEPENDENT_REVIEW = REQUEST CORRECTIVE / CORE DESIGN ACCEPTABLE / DEPLOY SAFETY CONTRACT INCOMPLETE
PRE3_R1_OWNER_SCOPE_EXPANSION = OPTION B ONLY (Extract pure structural validator in src/core/workflow-validator.js)
```

## 3. Implemented Correctives
```text
CORRECTIVE_1 = EXPECTED BASELINE FINGERPRINT REQUIRED
- executeD3ProcessDeploy requires expectedBaselineFingerprint (64 lowercase hex SHA-256) before any transport I/O
- Fails closed with EXPECTED_BASELINE_FINGERPRINT_REQUIRED if missing or malformed with 0 transport requests
- Verifies both liveFingerprint and previewFingerprint match expectedBaselineFingerprint exactly

CORRECTIVE_2 = CANONICAL TARGET OVERRIDE REMOVED
- targetBuildOverride parameter removed from production path
- Target strictly produced from canonical buildD3WorkflowPayload using observed preview revision
- Semantic fingerprint enforced to match canonical buildD3WorkflowPayload target

CORRECTIVE_3 = EXISTING WORKFLOW VALIDATOR ENFORCED
- validateWorkflowPayloadStructure extracted in src/core/workflow-validator.js as a pure structural validator
- Validates root payload, states, state indexes, assignee types, FIELD_ENTITY field types, actions, from/to refs, and filterCond
- Existing validateWorkflowPayload preserved as guarded wrapper calling assertSandboxWriteTarget
- executeD3ProcessDeploy executes D3 required-field validation followed by validateWorkflowPayloadStructure before authorization/write boundary

CORRECTIVE_4A = DEPLOY POST NULL/MALFORMED RESULT FAIL CLOSED
- deployResponse must be a non-null, non-array object with status < 400
- Fails closed on null, undefined, primitive, or array with D3_DEPLOY_POST_UNCERTAIN (0 status polls, no retry)
- Fails closed on HTTP error status with D3_DEPLOY_POST_FAILED (no retry)

CORRECTIVE_4B = FINAL PREVIEW CONVERGENCE VERIFIED
- After deployment terminal SUCCESS, both final LIVE process and final PREVIEW process are read back
- Enforces finalLiveFingerprint == targetFingerprint (D3_FINAL_LIVE_READBACK_MISMATCH if not)
- Enforces finalPreviewFingerprint == targetFingerprint (D3_FINAL_PREVIEW_READBACK_MISMATCH if not)
```

## 4. Modified Symbols & Files
- `scripts/kintone/deploy-d3-workflow.js`:
  - `executeD3ProcessDeploy` (hardened baseline validation, canonical target lock, structural validation, deploy POST fail-closed, live+preview convergence)
  - `validateWorkflowPayloadStructure` imported from `src/core/workflow-validator.js`
- `src/core/workflow-validator.js`:
  - `validateWorkflowPayloadStructure(payload, fieldTypes)` (NEW exported pure structural validator)
  - `validateWorkflowPayload(payload, fieldTypes)` (preserved guarded wrapper)
- `tests/d3-process-deploy.test.js`:
  - 53 targeted tests covering all failure modes, baseline requirements, and write sequence
- `tests/workflow-validator.test.js`:
  - 5 targeted tests covering pure structural validation and guarded wrapper behavior

## 5. Targeted Test Results
```text
tests/d3-process-deploy.test.js = 53/53 PASS
tests/d3-workflow-payload.test.js = 42/42 PASS
tests/sandbox-write-guard.test.js = 7/7 PASS
tests/workflow-validator.test.js = 5/5 PASS
TOTAL_PRE3_R1_TARGETED_PASS = 107
TOTAL_PRE3_R1_TARGETED_FAIL = 0
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
```

## 6. Operational Counters
```text
PRE3_R1_LIVE_PROCESS_READ = NOT PERFORMED
KINTONE_READS = 0
KINTONE_WRITES = 0
PROCESS_READS = 0
PROCESS_WRITES = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
CUSTOMIZATION_WRITES = 0
FILE_UPLOADS = 0
APP_DEPLOY_POSTS = 0
DEPLOYMENTS = 0
UAT = 0
PRODUCTION_READY = NO
```

## 7. Release Manifest Governance
```text
FINAL_PROCESS_RELEASE_MANIFEST = NOT MATERIALIZED
FINAL_UI_RELEASE_MANIFEST = NOT MATERIALIZED
REASON = Must be materialized just-in-time against the exact future deployment commit HEAD
```
