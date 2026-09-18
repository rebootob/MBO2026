# D3 Kintone-Only Mixed Identity Audit Integration Design — Corrected Contract

## Document Metadata
```text
PACKAGE                      = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-DESIGN-01
AUTHORIZATION_ID             = MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-DESIGN-01-20260918-OWNER-01
STATUS                       = CORRECTED_DESIGN_CONTRACT / REVIEW_REQUIRED
CURRENT_AUTHORITY            = OWNER_DEC_D3_010
CURRENT_SYSTEM_BOUNDARY      = KINTONE_ONLY
CURRENT_ARCHITECTURE_TARGET  = KINTONE_ONLY_MIXED_IDENTITY_BUSINESS_AUDITABILITY
CURRENT_SECURITY_TARGET      = BUSINESS_AUDITABILITY_AND_TRACEABILITY
DIRECTION_LOCK               = project-docs/AI_DIRECTION_LOCK.md
TARGET_AUDIT_APP             = 798
SOURCE_WORKFLOW_APP          = 794
AUTHENTICATED_SESSION_APP    = 801
DEDICATED_MAPPING_APP        = 53
GAP_TO_CLOSE                 = LIVE_SHARED_ACTUAL_OPERATOR_GAP = PRESENT
```

## 1. Purpose and non-goals

This document defines the implementation contract for closing the verified Shared-user audit identity gap while staying fully inside Decision 010.

Non-goals:
- no external backend/trusted writer;
- no OAuth custody/attestation;
- no Redis/SQL/cloud runtime;
- no second login/PIN;
- no cryptographic non-repudiation claim;
- no source/schema/deployment execution in this design package.

## 2. Three identity roles

| Role | Field | Authority |
|---|---|---|
| Subject Employee | `Employee_Code` | App794 record being evaluated |
| Actual Operator | `Actual_Operator_Employee_Code` | Human authenticated by existing identity model |
| Kintone Login Principal | `Kintone_Login_User_Code` | Exact active Kintone account code |

`Employee_Code` MUST NOT be used as fallback for Actual Operator.

### SHARED
```text
Identity_Mode = SHARED
Actual_Operator_Employee_Code = currentEmployeeSelfContext.employeeCode
Kintone_Login_User_Code = currentEmployeeSelfContext.kintoneUserCode
```
The Kintone code must exactly match the active `kintone.getLoginUser().code`.

### DEDICATED
```text
Identity_Mode = DEDICATED
Actual_Operator_Employee_Code = authoritative App53 mapping already resolved into currentEmployeeSelfContext.employeeCode
Kintone_Login_User_Code = currentEmployeeSelfContext.kintoneUserCode
```

## 3. App798 five-field extension

Exactly five new logical fields:

| Field Code | Proposed Kintone Type | Application required for NEW Decision-010 events | Initial schema globally required? | Source |
|---|---|---:|---:|---|
| `Identity_Mode` | DROP_DOWN | YES | NO | context.mode |
| `Actual_Operator_Employee_Code` | SINGLE_LINE_TEXT | YES | NO | context.employeeCode |
| `Kintone_Login_User_Code` | SINGLE_LINE_TEXT | YES | NO | exact context.kintoneUserCode |
| `Action_Name` | SINGLE_LINE_TEXT | YES | NO | process event action |
| `To_Status` | SINGLE_LINE_TEXT | YES | NO | process event next status |

Proposed constraints:
- employee/user code: trimmed non-empty text, max 64;
- action/status: trimmed non-empty text, max 128;
- `Identity_Mode`: exact `SHARED` or `DEDICATED`.

The initial schema should remain compatible with historical rows. Requiredness is enforced in application/service logic for new Decision-010 events.

### Historical policy
```text
HISTORICAL_BACKFILL = NO_FABRICATED_VALUES
AUTOMATIC_IDENTITY_INFERENCE = FORBIDDEN
```

Historical records may leave all five new fields blank. Do not infer `Kintone_Login_User_Code` from `Archived_By` automatically. Any future backfill/migration requires separate explicit authorization.

### Kintone principal preservation
`Kintone_Login_User_Code` is the exact trimmed Kintone principal code. Do not lowercase/uppercase or otherwise normalize case.

## 4. Existing App798 contract preservation

All existing field semantics remain unchanged.

`Employee_Code` remains Subject Employee.

`Archived_By` remains Kintone USER_SELECT representation of the login principal for compatibility.

### Archive_Key
Do not redefine `Archive_Key`. It remains owned by `buildArchiveKey()` in `src/services/revision-archive-service.js`.

Current event-specific forms are:

```text
STAGE_COMPLETION_SNAPSHOT:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|STAGE_COMPLETION

EVALUATION_REVISION_CREATED:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|EVALUATION_REVISION_CREATED|TO_R<Superseded_By_Revision>

ROUTE_REASSIGNMENT_PRECHANGE:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|ROUTE_REASSIGNMENT_PRECHANGE|<Stable_Event_ID>
```

Future implementation must call/preserve the existing canonical builder rather than duplicating these strings in business code.

## 5. Target identity object and call chain

Proposed internal object:
```javascript
operatorContext = {
  identityMode,
  actualOperatorEmployeeCode,
  kintoneLoginUserCode
}
```

Target chain:
```text
currentEmployeeSelfContext
-> app.record.detail.process.proceed
-> validate active Kintone principal equality
-> executeProcessTransitionArchive(...)
-> RevisionArchiveService.archiveStageCompletion(...)
-> RevisionArchiveKintoneRepository
-> App798 create + exact readback verification
```

Exact source seams for future implementation:
- `src/main-mbo-app.js`
- `src/services/revision-archive-service.js`
- `src/services/revision-archive-kintone-repository.js`
- `tests/d3-stage-archive-integration.test.js`
- directly relevant App798 schema/deploy tooling only in later separately authorized packages.

## 6. Fail-closed contract

Required error classes/outcomes:
- `MISSING_IDENTITY_CONTEXT`
- `UNSUPPORTED_IDENTITY_MODE`
- `ACTUAL_OPERATOR_UNRESOLVED`
- `KINTONE_LOGIN_USER_UNRESOLVED`
- `IDENTITY_CONTEXT_MISMATCH`
- `SUBJECT_COLLAPSE_ATTEMPT`
- `ARCHIVE_PERSISTENCE_FAILED`

Rules:
- SHARED missing authenticated employee => block archive/transition.
- DEDICATED missing authoritative mapped employee => block.
- missing Kintone principal => block.
- context principal not exactly equal to active Kintone principal => block.
- never fall back Actual Operator to Subject Employee, shared Kintone code, requester, SYSTEM, or blank.

## 7. Canonical source reconciliation

Repository source currently contains historical Decision-009 flow through `handleD3BrowserTrustedTransition(...)` and `/api/mbo/d3/transaction/prepare-transition`, while the verified live App794 Rev 76 bundle uses the direct Kintone archive path.

Under Decision 010:
```text
EXTERNAL_PREPARE_TRANSITION_ENDPOINT_CURRENT_TARGET = NO
```

Future local implementation must reconcile canonical source to the Kintone-only call chain in section 5. Historical Decision-009 documents remain preserved; the external endpoint is not an active architecture target.

## 8. Readback and service verification

Future `RevisionArchiveService` must validate all five fields for new Decision-010 archive events.

Future `RevisionArchiveKintoneRepository._normalizeRecord()` must expose normalized values for the five fields so exact readback can verify:
- identity mode;
- actual operator employee code;
- exact Kintone login code;
- action;
- target status.

Existing snapshot/hash and archive-key validation remain unchanged.

## 9. Future test matrix

Minimum required tests:
1. SHARED valid identity.
2. SHARED missing actual employee => fail closed.
3. SHARED missing Kintone principal => fail closed.
4. SHARED context principal mismatch => fail closed.
5. DEDICATED valid App53-bound identity.
6. DEDICATED unresolved mapping => fail closed.
7. Subject differs from operator.
8. Subject legitimately equals operator without role collapse.
9. `Identity_Mode` persisted/read back.
10. `Actual_Operator_Employee_Code` persisted/read back.
11. exact-case `Kintone_Login_User_Code` persisted/read back.
12. `Action_Name` persisted/read back.
13. `Previous_Status` remains unchanged.
14. `To_Status` persisted/read back.
15. `Archived_By` compatibility preserved.
16. Snapshot/hash behavior unchanged.
17. Existing canonical `buildArchiveKey()` output unchanged.
18. Idempotent retry behavior unchanged.
19. Historical row without new fields remains readable.
20. No automatic historical identity inference/backfill.
21. Decision-009 external prepare endpoint is not the active path after source reconciliation.

## 10. Mandatory local-first delivery sequence

```text
1. Correct design accepted
2. Local source implementation
3. Local targeted tests
4. Local full-regression/baseline attribution
5. App798 schema preflight/readiness
6. Controlled App798 schema deployment
7. App794 customization build/deploy
8. Live readback verification
9. SHARED UAT
10. DEDICATED UAT
11. D3 closure
```

Do not perform live schema writes before the local implementation and local evidence are independently reviewed.

## 11. Design package execution accounting

```text
SOURCE_CHANGES = 0
TEST_CHANGES = 0
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
ACL_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
DEPLOYMENTS = 0
UAT = 0
EXTERNAL_INFRASTRUCTURE = 0
```

This document is a design contract only and does not authorize implementation.
