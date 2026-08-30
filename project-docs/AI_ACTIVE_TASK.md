# AI ACTIVE TASK — D1 HYBRID IDENTITY CORE SOURCE R1 CORRECTIVE

Mode: **ANTIGRAVITY SOURCE / FOCUSED TEST ONLY — APP53 PRODUCTION READ-ONLY / NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Review Starting Point

ChatGPT independently reviewed executor commit:

```text
EXECUTOR_COMMIT = 20747ef3781d5085e9718f511bd76cf667879399
REVIEW_RESULT   = CORRECTIVE
```

Scope discipline was good: exactly two source files, one focused test file and one evidence file changed. No App53 schema/record, deploy, ACL, group, UI, main-app, build or dist file changed.

User additionally reconfirmed that **App53 is Production** and requires special caution. The mandatory Baseline now states:

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

This corrective is SOURCE/TEST only. It must not access or modify live App53.

Mandatory Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

Do not edit Control Plane documents or Baselines.

## 1. Finding A — Canonical App53 Mapping Resolver Is Fail-Open

Current `resolveDedicatedKintoneUserMapping()` incorrectly accepts superseded/noncanonical pseudo fields:
- `Account_Status` fallback when `Number_0` is absent;
- default Active when both are absent;
- `Kintone_User_Code` fallback when `MBO_Kintone_User` is absent;
- `Employee_Code` fallback when `emp_text` is absent;
- USER_SELECT item `.value` fallback instead of requiring `.code`.

This violates the exact Production App53 contract.

### Required correction

Canonical dedicated resolver must use **only** this App53 shape:

```text
Number_0         = 1
MBO_Kintone_User = USER_SELECT value array with exactly one user object
selected user    = exact .code match
emp_text         = canonical Employee_Code
```

Rules:
1. `Number_0` missing/malformed/not exactly active `1` -> not an active candidate / fail closed;
2. never use `Account_Status` for canonical dedicated binding;
3. `MBO_Kintone_User` missing/malformed/not an array/exactly-one condition not met -> no canonical mapping / fail closed;
4. never use `Kintone_User_Code` as fallback in the canonical resolver;
5. selected USER_SELECT item must be an object with a nonblank `.code`; do not use `.value` as identity fallback;
6. current Kintone User Code must be an exact nonblank string: reject leading/trailing whitespace rather than silently normalizing it;
7. selected `.code` comparison is exact/case-sensitive;
8. `emp_text` is the only Employee_Code source; never fall back to `Employee_Code`, `Number`, name, email, Text_6 or guessed value;
9. validate nonblank `emp_text` with the repository's canonical Employee_Code validator/contract before returning `IDENTITY_BOUND`;
10. exactly one active canonical mapping row -> bound; zero -> missing; more than one -> ambiguous;
11. Natta-like blank `emp_text` remains fail closed;
12. `admin-form` remains denied.

If legacy `resolveEmployeeIdentity()` compatibility tests depend on the superseded pseudo source, do **not** weaken the canonical resolver. Keep any truly required legacy compatibility clearly isolated from `resolveDedicatedKintoneUserMapping`; if a source consumer cannot be reconciled within the allowed files, STOP and report.

### Mandatory tests

Add explicit tests proving the canonical resolver does **not** bind from:
- `Account_Status` without `Number_0`;
- missing `Number_0` even if other fields look valid;
- `Kintone_User_Code` without `MBO_Kintone_User`;
- `Employee_Code` without `emp_text`;
- USER_SELECT item with only `.value` but no `.code`;
- Kintone user input with leading/trailing whitespace;
- selected code differing only by case;
- malformed/invalid canonical `emp_text`.

Retain Vassana 0044 PASS, Natta blank FAIL, inactive, duplicate, multi-user, wrong-user and admin-form tests.

## 2. Finding B — Effective Requester Mode Must Fail Closed

Current helper treats any mode other than exact `DEDICATED` as SHARED and silently trims the dedicated Kintone User Code.

### Required correction

`resolveEffectiveRequesterUser()` must:
- accept only exact `DEDICATED` or `SHARED` mode;
- unknown/missing/malformed mode -> deterministic fail closed;
- DEDICATED requires exact nonblank native Kintone User Code with no leading/trailing whitespace normalization;
- DEDICATED returns only that exact code;
- SHARED preserves the already accepted App795 `Requester_User` behavior; do not broaden it;
- `admin-form` remains denied;
- no missing dedicated mapping may silently fall back to SHARED.

Add tests for unknown mode, dedicated whitespace input and current accepted dedicated/shared paths.

## 3. Finding C — Own-MBO Elision Loses Slot Semantics

Current implementation flattens all individual approver users across M1/M2/G1/G2, then rebuilds topology by **number of users**. This can:
- turn multiple users in one approval slot into multiple workflow levels;
- lose the approval rule associated with the original surviving slot when that slot shifts;
- silently drop users when flattened count exceeds four;
- use case-insensitive identity comparison despite exact Kintone user identity;
- silently skip the self-approval guard when `isOwnMbo=true` but current dedicated user code is missing.

### Required correction — preserve slots, not flattened users

Treat the authoritative route as up to four ordered **slot objects**:

```text
M1 = Manager_Level1_Approvers + Manager_Level1_Approval_Rule
M2 = Manager_Level2_Approvers + Manager_Level2_Approval_Rule
G1 = GM_Level1_Approvers      + GM_Level1_Approval_Rule
G2 = GM_Level2_Approvers      + GM_Level2_Approval_Rule
```

For `isOwnMbo=true`:
1. require exact nonblank `currentDedicatedUserCode`; missing/whitespace-normalized identity must fail closed;
2. compare Kintone user codes exactly/case-sensitively;
3. remove only the self user from each slot array;
4. keep all other users in that slot and preserve their order;
5. keep the approval rule belonging to each surviving slot;
6. drop only slots that become empty;
7. shift surviving **slots** left into supported canonical topology positions while carrying each surviving slot's rule with it;
8. synchronize `Manager_User`, `First_Manager_User`, `GM_User`, Has flags and `Routing_Topology` with the effective slots;
9. no user may be silently truncated/dropped;
10. zero remaining non-self slots/users -> deterministic fail closed;
11. if self is absent, business route semantics remain unchanged;
12. never mutate the input route;
13. never modify App795 data or fabricate approval event/timestamp/comment/history.

Canonical supported effective shapes remain:

```text
1 surviving slot -> M1_ONLY
2 surviving slots -> M1_G1
3 surviving slots -> M1_M2_G1
4 surviving slots -> M1_M2_G1_G2
```

### Mandatory tests

Retain the Natta canonical case:
`natta -> uchida / M1_G1` -> own route `uchida / M1_ONLY` and subordinate route unchanged.

Add at least:
- ownMbo=true + missing/whitespace dedicated user -> fail closed;
- exact case-sensitive self comparison;
- a slot containing `[self, other]` keeps `other` in one slot rather than creating another workflow level;
- a non-`ALL` approval rule on a surviving slot follows that slot when shifted;
- multi-user surviving slot does not truncate users;
- input object remains unmodified;
- self-only still fails closed;
- generic 3/4-slot topology regression remains consistent.

## 4. Allowed Files

Allowed source:
- `src/services/mbo-identity-service.js`
- `src/services/routing-service.js`

Allowed tests:
- `tests/d1-hybrid-identity-core-source.test.js`
- directly related pre-existing identity/routing test only if needed to reconcile a superseded assertion

Allowed evidence:
- create `project-docs/D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_EVIDENCE.md`

Do not overwrite historical R1 evidence.

Read-only:
- `src/services/employee-service.js` unless only importing/reusing its canonical validator can be done without editing it;
- `src/main-mbo-app.js`;
- UI/build/deploy/config files;
- all Baselines/Control Plane docs.

If more source scope is required, STOP and report.

## 5. App53 Production Hard Stop

Forbidden in this corrective:

```text
LIVE_GET                    = 0
LIVE_POST                   = 0
LIVE_PUT                    = 0
LIVE_DELETE                 = 0
APP53_SCHEMA_WRITE          = 0
APP53_RECORD_WRITE          = 0
APP53_IMPORT_OR_BULK_WRITE  = 0
APP794_APP_ACL_WRITE        = 0
APP794_RECORD_ACL_WRITE     = 0
GROUP_CREATE_OR_MEMBERSHIP  = 0
APP795_WRITE                = 0
APP801_WRITE                = 0
PROCESS_WRITE               = 0
CUSTOMIZATION_UPLOAD        = 0
DEPLOY                      = 0
PASSWORD_RESET_EXECUTION    = 0
ROLLBACK                    = 0
```

Do not open a live App53 write path for testing. Use fixtures only.
Do not create `MBO_Kintone_User` in Production.
Do not populate Vassana/Natta mapping in Production.
Do not correct Natta `emp_text` in Production.

## 6. Verification Minimum

Run:
- corrected focused Hybrid Identity suite;
- directly affected existing identity/routing regression tests;
- full `npm test` if practical;
- `git diff --check`.

Evidence must report exact changed files, exact test counts/results, zero live operations, and explicitly state:

```text
APP53_PRODUCTION_TOUCHED = NO
NATTA_EMPLOYEE_CODE_GUESSED = NO
```

## 7. Acceptance Ceiling / Stop

Maximum executor status:

```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_READY_PENDING_CHATGPT_REVIEW
```

Commit focused changes, push, then STOP. Next owner = ChatGPT independent review.
