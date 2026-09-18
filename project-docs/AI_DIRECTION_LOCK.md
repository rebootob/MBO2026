# MBO2026 — AI DIRECTION LOCK

> **Owner Directive / Mandatory for all AI agents**
> Purpose: keep every agent developing MBO2026 in one direction and prevent architecture/scope drift.
> This document does not replace current authorization state. Read it together with `AI_CONTROL_CENTER.md` and `control/02_ACTIVE_WORK_PACKAGE.md`.

## 1. Single project direction

```text
CURRENT_SYSTEM_BOUNDARY = KINTONE_ONLY
CURRENT_ARCHITECTURE_TARGET = KINTONE_ONLY_MIXED_IDENTITY_BUSINESS_AUDITABILITY
CURRENT_SECURITY_TARGET = BUSINESS_AUDITABILITY_AND_TRACEABILITY
CURRENT_OWNER_DECISION = OWNER_DEC_D3_010
```

The D3 objective is narrow:

```text
Close LIVE_SHARED_ACTUAL_OPERATOR_GAP
-> preserve business audit identity in App798
-> local verification
-> controlled Kintone deployment
-> SHARED UAT
-> DEDICATED UAT
-> D3 closure
```

If work does not directly support this chain, it is not the next D3 task unless the Owner explicitly changes priority.

## 2. In-scope platform

Allowed current production boundary:
- App 53: authoritative Dedicated employee mapping.
- App 794: MBO workflow and process actions.
- App 795: routing master.
- App 798: audit/history ledger.
- App 801: existing Shared-user Login Lock/session identity.
- Kintone JavaScript customization.
- Kintone native Process Management.
- Kintone REST APIs inside the existing tenant.

## 3. Explicit out-of-scope architecture

The following MUST NOT be introduced as a D3 requirement under Decision 010:
- external backend or external trusted writer;
- Redis, PostgreSQL, MySQL, or a new external database;
- cloud runtime, container service, VPS, Lambda, Cloud Run;
- external secret vault;
- OAuth token-custody server or new OAuth infrastructure;
- separate attestation service;
- new external identity provider;
- cryptographic non-repudiation platform.

Historical Decision 009 remains evidence/history only. It does not authorize implementation.

## 4. Do not convert limitations into scope

`KINTONE_ONLY_PLATFORM_LEVEL_ANTI_FORGERY = NOT_PROVEN` is an accepted limitation.

An AI agent MAY:
- document the limitation;
- describe residual risk;
- propose controls within the current Kintone boundary.

An AI agent MUST NOT:
- use the limitation to reopen Decision 009;
- add external infrastructure automatically;
- change the security target from business auditability to cryptographic non-repudiation;
- block D3 solely because cryptographic proof is unavailable.

## 5. Identity contract — never collapse roles

Three identities remain distinct:

```text
SUBJECT_EMPLOYEE
= App794.Employee_Code

ACTUAL_OPERATOR
= Actual_Operator_Employee_Code

KINTONE_LOGIN_PRINCIPAL
= Kintone_Login_User_Code
```

SHARED mode:
- Actual Operator = existing authenticated employee from Login Lock / App801.
- Kintone Login Principal = exact `kintone.getLoginUser().code`.
- Preserve BOTH.

DEDICATED mode:
- Actual Operator = authoritative App53 mapped employee.
- Kintone Login Principal = exact personal Kintone user code.

Permanent rules:
```text
NO_SECOND_LOGIN = YES
NO_SECOND_PIN = YES
NO_SUBJECT_AS_OPERATOR_FALLBACK = YES
NO_SHARED_ACCOUNT_AS_ACTUAL_OPERATOR_FALLBACK = YES
```

## 6. Repository-contract preservation

AI must inspect existing source contracts before defining replacements.

### Archive Key
`Archive_Key` semantics are owned by `buildArchiveKey()` in `src/services/revision-archive-service.js`.

Do not invent a new generic format.

Current event-specific patterns include:
```text
STAGE_COMPLETION:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|STAGE_COMPLETION

EVALUATION_REVISION_CREATED:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|EVALUATION_REVISION_CREATED|TO_R<Superseded_By_Revision>

ROUTE_REASSIGNMENT_PRECHANGE:
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|ROUTE_REASSIGNMENT_PRECHANGE|<Stable_Event_ID>
```

### Kintone user code
Preserve the exact trimmed user code. Do not lowercase, uppercase, remap, or normalize case.

### Historical audit rows
```text
HISTORICAL_BACKFILL = NO_FABRICATED_VALUES
AUTOMATIC_IDENTITY_INFERENCE = FORBIDDEN
```

Existing historical rows may remain blank in new identity fields. Any future migration/backfill requires its own explicit authorization and evidence.

## 7. Five-field App798 extension

Exactly these new logical fields are the current target:
- `Identity_Mode`
- `Actual_Operator_Employee_Code`
- `Kintone_Login_User_Code`
- `Action_Name`
- `To_Status`

Important requiredness rule:
- Application logic: REQUIRED for every new Decision-010 D3 archive event.
- Initial Kintone schema: do not mark fields globally required if doing so would invalidate historical rows.
- Historical rows: no invented values.

Existing `Employee_Code` remains Subject Employee.
Existing `Archived_By` remains the Kintone USER_SELECT principal for compatibility.

## 8. Canonical implementation seam

Target Kintone-only chain:
```text
currentEmployeeSelfContext
-> App794 process.proceed handler
-> executeProcessTransitionArchive(...)
-> RevisionArchiveService
-> RevisionArchiveKintoneRepository
-> App798
```

Canonical source must eventually be reconciled away from the historical Decision-009 target:
```text
/api/mbo/d3/transaction/prepare-transition
```

That endpoint is NOT the current implementation target.

## 9. Mandatory local-first execution order

No agent may jump directly to live schema/deployment from design.

```text
1. Correct/accept design contract
2. Local source implementation
3. Local targeted tests
4. Local regression/baseline attribution
5. App798 schema preflight
6. Controlled App798 schema deployment
7. App794 customization build/deploy
8. Live readback verification
9. SHARED UAT
10. DEDICATED UAT
11. D3 closure
```

Each step requires its own bounded authorization where governance requires it.

## 10. STOP-ON-DRIFT conditions

STOP and report to Control Plane if any proposal:
- introduces an out-of-scope external component;
- changes Decision 010 without explicit Owner approval;
- invents a new Archive_Key format;
- fabricates or infers historical operator identity;
- lowercases/normalizes Kintone user codes;
- adds a second login/PIN;
- deploys schema/customization before local implementation/tests;
- mixes Subject Employee with Actual Operator;
- auto-starts the next work package;
- expands a security observation into a new project requirement without Owner authorization.

## 11. One-next-gate rule

For `ต่อ` / `ต่อไป`:
- fresh-fetch;
- identify the smallest unfinished gate on the path in section 9;
- propose exactly one next package;
- do not execute it until explicit Owner approval.

For review:
- verify scope first;
- verify repository truth second;
- verify requested package evidence third;
- reject scope expansion even when technically interesting.

## 12. D3 completion direction

The intended direction remains:

```text
KINTONE-ONLY
-> MIXED IDENTITY
-> APP798 BUSINESS AUDIT
-> LOCAL TEST
-> CONTROLLED DEPLOY
-> SHARED UAT
-> DEDICATED UAT
-> D3 CLOSED
```

No AI agent may substitute a different architecture path without explicit Owner authorization.
