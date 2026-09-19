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

## 13. Owner product principle — simple for users, simple for developers

This is a permanent Owner directive and must guide architecture, implementation, review, and UAT decisions.

```text
PRIMARY_PRODUCT_PRINCIPLE =
USER_EASY_TO_USE_AND_DEVELOPER_EASY_TO_MAINTAIN

MINIMIZE_USER_STEPS = REQUIRED
MINIMIZE_HIDDEN_COMPLEXITY = REQUIRED
PREFER_EXISTING_KINTONE_AUTHORITY = REQUIRED
DUPLICATE_STATE_WITHOUT_BUSINESS_NEED = FORBIDDEN
PLACEHOLDER_VALUES_TO_MAKE_VALIDATION_PASS = FORBIDDEN
OVERENGINEERING = FORBIDDEN
```

For users:
- keep the normal business flow short and understandable;
- reuse existing Kintone login/session and the existing MBO Login Lock;
- do not add a second login, PIN, identity ceremony, or technical step unless the Owner explicitly requires it;
- audit/provenance/security logic should remain behind the normal business workflow whenever possible;
- errors must fail closed but should identify the actual business/technical problem clearly.

For developers:
- prefer Kintone native/system fields when they are already the authoritative source, instead of creating duplicate custom fields;
- prefer one obvious authoritative data path over multiple aliases/fallback chains;
- do not invent placeholder routing keys, hashes, department keys, default identities, or other values only to make validation/tests pass;
- tests must model the real live Kintone contract instead of forcing production code to match mock-only fields;
- choose the smallest change that solves the proven business defect.

When two designs are functionally equivalent, prefer the design with:
1. fewer user steps;
2. fewer persisted fields;
3. fewer hidden fallbacks;
4. fewer cross-file side effects;
5. smaller and independently testable modules;
6. lower future maintenance cost.

## 14. Mandatory modular JavaScript rule

MBO2026 production customization is JavaScript. In this document, “separate Java files” means **separate JavaScript `.js` modules/files**, not the Java programming language.

Permanent coding rule:

```text
NO_NEW_MEGA_FILE_LOGIC = YES
ONE_PRIMARY_BUSINESS_FUNCTION_PER_MODULE = REQUIRED
EXPLICIT_IMPORT_EXPORT_BOUNDARIES = REQUIRED
INDEPENDENT_UNIT_TESTABILITY = REQUIRED
SEPARATE_SIDE_EFFECTS_FROM_PURE_LOGIC = REQUIRED
```

For every NEW business function or materially changed business function:
- place the primary business function in its own clearly named `.js` module whenever it can be independently invoked/tested;
- a module should normally expose one primary responsibility / one primary exported business function;
- keep pure calculation/validation logic separate from Kintone API writes, DOM/UI actions, and process-transition side effects;
- import dependencies explicitly; avoid hidden globals and cross-file mutation;
- keep file/function names aligned with business purpose so a developer can locate the logic without searching a monolithic file;
- write or update focused tests against the extracted module when the changed behavior is testable.

Small private helpers MAY remain in the same module only when they are tightly coupled to the primary function, not reused elsewhere, and extracting them would make the code harder to understand. This exception must not be used to accumulate unrelated business logic in one file.

### Existing large files

Existing large files such as `src/main-mbo-app.js` are **not authorization for a project-wide refactor during D3**.

Apply the modular rule incrementally:
- when a bounded D3 fix materially changes a self-contained function, prefer extracting that touched business logic into a dedicated module;
- do not refactor unrelated code merely for style;
- do not delay D3 closure for a broad cleanup;
- after D3 closure, larger decomposition may be proposed as a separate maintenance package.

The goal is maintainability, not file-count maximization.

## 15. Anti-expansion rule for D3

The simplicity/modularity directives above MUST NOT be used to expand the current D3 scope.

For the current D3 closure path:

```text
FIX_ONLY_PROVEN_BLOCKERS = YES
NO_UNRELATED_REFACTOR = YES
NO_ARCHITECTURE_REDESIGN = YES
NO_NEW_INFRASTRUCTURE = YES
D3_CLOSURE_PRIORITY = HIGH
```

A D3 change should be rejected or reduced if it:
- adds new user steps without a proven requirement;
- adds duplicate fields where an authoritative Kintone/system value already exists;
- creates placeholder/default provenance to silence a validator;
- introduces a new abstraction layer that is not needed for the proven defect;
- refactors unrelated working code;
- turns a bounded defect fix into a general platform redesign.

The preferred D3 implementation pattern is:

```text
PROVEN_LIVE_DEFECT
-> SMALLEST AUTHORITATIVE FIX
-> FOCUSED TEST
-> CONTROLLED BUILD/DEPLOY
-> SHARED UAT
-> DEDICATED UAT
-> D3 CLOSED
```

