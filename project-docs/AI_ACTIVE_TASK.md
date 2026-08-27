# AI ACTIVE TASK — D1-C2B EXACT READ-ONLY RUNTIME FACTS ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `51a98831e108dd60571f60863c891852e0b874b8`
> Mode: FASTEST SAFE PATH / FACT GATHERING ONLY / NO SOURCE CHANGES / NO KINTONE WRITE OR DEPLOY

## 0. INDEPENDENT REVIEW RESULT

Accepted:
- D1-C1 source corrective = ACCEPTED.
- D1-C2A `Account_Status === LOCKED` fix = PASS by source review.
- Scope = PASS (password service + focused test only).

Not accepted:
- The D1-C2A closure manifest is NOT exact enough for one user authorization.
- Its commit reports `KINTONE_READS_EXECUTED = 0`, so it did not provide the required exact current ACL principals.
- `PROPOSED_KINTONE_WRITE_MANIFEST` is ambiguous (`App801 or dedicated Session App`).
- `IDENTITY_BINDING_SOURCE = NOT_AVAILABLE` and `TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE` remain blockers.
- App794 direct URL/REST isolation remains `UNSAFE`.

GitHub has no CI/status evidence for the reviewed commit. Do not claim CI PASS.

## 1. GOAL — ONE LAST READ-ONLY FACT PACKAGE

Do NOT implement more auth code.
Do NOT change UI.
Do NOT modify Kintone.

Collect only the exact facts needed for ChatGPT to make the final architecture/write decision without another speculative cycle.

Prefer <= 8 Kintone GET requests total. Never print secrets, Password_Hash, tokens, MFA values, or full credential records.

## 2. EXACT READS REQUIRED

### A. App801
Read only:
1. form field schema relevant to auth/session lifecycle;
2. App ACL;
3. record ACL if configured/available.

Report exact:
- current field codes/types/options;
- exact ACL entities/principals and rights;
- confirm `Password_Expires_At` absent/present;
- confirm whether `Kintone_User_Code` absent/present.

### B. App794
Read only:
1. App ACL;
2. Record ACL.

Report exact:
- each entity/principal/group relevant to employee/general/shared access;
- the exact rule that makes direct record URL/REST access unsafe;
- HR/appraiser/admin principals/rules that must be preserved;
- whether native Kintone ACL can distinguish Employee 0118 from Employee 0119 under the CURRENT authenticated Kintone account model.

Do not say merely `everyone`; include the exact returned entity type/code/name when available.

### C. Identity binding source
Read App53 form schema only first.

If App53 contains an actual Kintone user-code/user-selector binding field, read ONLY `Employee_Code` + that binding field (minimum fields, no names/other employee data) and compute ambiguity locally without printing the employee list.

If App53 has no such field, report exactly:
`IDENTITY_BINDING_SOURCE = NOT_AVAILABLE`

If another already-existing authoritative source is proven by repository/live configuration, name it exactly. Do not invent one.

Report:
- `KINTONE_USER_BINDING_UNIQUE = YES | NO | NOT_PROVEN`
- if NO, only the conflicting principal code and count; do not dump employee data.

### D. Trusted runtime
Repository review already shows only local Node tooling/preview and Kintone deployment scripts, not a deployed trusted auth backend.

Confirm whether there is any ACTUAL existing trusted runtime/configuration in the project environment. Do not create one.

Report exactly:
`TRUSTED_BACKEND_RUNTIME = <actual runtime> | NOT_AVAILABLE`

The local `npm run ui:preview` process is NOT production/sandbox-deployed infrastructure.

## 3. LOCK THE SMALLEST SESSION DESIGN — NO “OR” OPTIONS

For planning purposes, prefer the existing App801 as a **single-active-session-per-employee** store unless a live Kintone constraint proves this impossible.

Proposed minimum App801 session fields to validate against Kintone capabilities:
- `Password_Expires_At` — DATETIME
- `Session_Token_Hash` — SINGLE_LINE_TEXT (hash only; never raw token)
- `Session_Expires_At` — DATETIME
- `Session_Requires_Password_Change` — DROP_DOWN `YES|NO`
- `Session_Data_Authorized` — DROP_DOWN `YES|NO`
- `Session_Kintone_User_Code` — SINGLE_LINE_TEXT

Do NOT add them yet.
Do NOT propose a new Session App unless a specific Kintone limitation makes the App801 single-session model unsafe/impossible; if so, state that exact limitation.

Identity field `Kintone_User_Code` for the credential record itself must NOT be added speculatively until Section C proves the authoritative mapping model.

## 4. REQUIRED EXACT REPORT

Create an evidence-only commit (`--allow-empty` is allowed) with NO source/doc changes after this control commit. Put the facts in the commit message body and completion report.

Required:

```text
D1C2A_LOCKED_SOURCE_FIX = PASS_PENDING_CHATGPT_FINAL_ACCEPTANCE

APP801_PASSWORD_EXPIRES_FIELD = PRESENT | ABSENT
APP801_KINTONE_USER_CODE_FIELD = PRESENT | ABSENT
APP801_ACL = <exact entities/rights>
APP801_RECORD_ACL = <exact rules or NONE>
APP801_SINGLE_SESSION_MODEL = FEASIBLE | NOT_FEASIBLE:<exact reason>

APP794_APP_ACL = <exact entities/rights>
APP794_RECORD_ACL = <exact rules>
APP794_UNSAFE_PRINCIPAL = <exact entity/rule>
APP794_PRESERVE_PRIVILEGED_RULES = <exact HR/appraiser/admin rules>
NATIVE_ACL_CAN_DISTINGUISH_0118_0119 = YES | NO | NOT_PROVEN

IDENTITY_BINDING_SOURCE = <exact source> | NOT_AVAILABLE
KINTONE_USER_BINDING_UNIQUE = YES | NO | NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = <exact runtime> | NOT_AVAILABLE

FINAL_PROPOSED_KINTONE_WRITE_MANIFEST =
- App801: <one exact field list; no alternatives>
- App801 ACL: <exact change or NO_CHANGE>
- App794 ACL: <exact rule/entity changes, or BLOCKED_PENDING_RUNTIME if impossible before runtime choice>

NON_KINTONE_RUNTIME_BLOCKER = <exact item or NONE>

KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
SOURCE_FILES_CHANGED = 0
DOC_FILES_CHANGED_BY_ANTIGRAVITY = 0
D1C2B_STATUS = EVIDENCE_READY_FOR_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

## 5. STOP CONDITIONS

Stop and report, do not design around it, if either is true:
- current Kintone principal model cannot uniquely bind one Employee_Code;
- no trusted backend runtime exists and App794 native ACL cannot enforce secondary-MBO-login identity.

These are architecture/runtime blockers, not reasons to weaken security.

## 6. OUT OF SCOPE

- no source changes
- no tests needed because no source changes
- no UI work
- no App801/App794 schema/ACL writes
- no credential provisioning
- no session-store implementation
- no deploy
- no backend framework/hosting creation
- no MFA
- no D2-D7 work

Run only:
```bash
git diff --check
git status --short
```

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2A LOCKED FIX SOURCE PASS / D1-C2B THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
