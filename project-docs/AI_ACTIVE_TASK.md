# AI ACTIVE TASK — M10C-AUTH-D KINTONE-ONLY ACCESS GATE PREFLIGHT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `107bc511aa980e627c005eb154562dc8a283c2df`
> Mode: READ-ONLY FEASIBILITY REVIEW — NO KINTONE WRITES / NO DEPLOY

# NORTH STAR

```text
App795 routing              = READY 17/17
App796 scoring              = READY 8/8
App800 HR Control Center    = LIVE
App801 auth metadata app    = LIVE / empty / restricted

USER DECISION:
- no extra Kintone user licenses
- no external auth server/hosting/integration
- use Kintone only

GOAL:
Find the safest feasible Kintone-only employee access-gate model for employees using a shared Kintone account.
```

# IMPORTANT SECURITY CLASSIFICATION

The Kintone-only model must be treated as an INTERNAL APPLICATION ACCESS GATE unless evidence proves stronger guarantees.
A shared Kintone account is not individual employee identity.
Do not claim SSO, MFA, or strong independent authentication.

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP801_RECORD_WRITES = 0
APP801_SCHEMA_WRITES = 0
APP801_ACL_WRITES = 0
APP794_WRITES = 0
APP53_WRITES = 0
CUSTOMIZATION_DEPLOY = 0
PASSWORD_PROVISIONING = 0
LOGIN_GO_LIVE = 0
TOTP_IMPLEMENTATION = 0
EXTERNAL_DEPLOY = 0
```

# STEP 1 — APP801 / SHARED ACCOUNT ACCESS REALITY

Using read-only evidence, determine:

```text
CAN_SHARED_ACCOUNT_READ_APP801_NOW = YES/NO/UNKNOWN
CAN_BROWSER_CUSTOMIZATION_USE_APP801_WITH_CURRENT_ACL = YES/NO
WOULD_KINTONE_ONLY_VERIFICATION_REQUIRE_ACL_WEAKENING = YES/NO
```

Do not weaken App801 ACL.
Do not embed privileged credentials in browser JavaScript.

# STEP 2 — EVALUATE KINTONE-ONLY OPTIONS

Evaluate these options:

```text
A. shared account + browser-side employee access gate
B. shared account + simple per-employee internal PIN/access code model
C. Kintone workflow/record-permission based model
D. native individual Kintone identity (document why extra licenses are required)
E. any tenant-native feature that can distinguish employees without additional licensed accounts
```

For each report:

```text
FEASIBLE
SECURITY_LEVEL
REQUIRES_ACL_WEAKENING
CAN_PREVENT_EMPLOYEE_CODE_SWITCHING
CAN_ENFORCE_EMPLOYEE_RECORD_ISOLATION
RECOMMENDATION
```

# STEP 3 — STRICT EMPLOYEE DATA ISOLATION CHECK

Determine whether Kintone-only + shared account can actually enforce all of:

```text
Employee A cannot read Employee B record
Employee A cannot edit Employee B record
Employee A cannot switch Employee_Code through browser/devtools
Employee A cannot bypass the custom gate through a direct App794 URL/API call
```

Required:

```text
STRICT_EMPLOYEE_DATA_ISOLATION_WITH_SHARED_ACCOUNT = YES / NO / PARTIAL
```

Clearly separate real Kintone enforcement from UI-only deterrence.

# STEP 4 — APP801 FUTURE ROLE

Determine:

```text
APP801_FUTURE_ROLE = KEEP / REPURPOSE_LATER / REMOVE_LATER / BLOCKED
```

Do not change or delete App801 in this task.
If App801 no longer has a safe runtime role, flag it for a later controlled No-Orphan decision.

# STEP 5 — GOOGLE AUTHENTICATOR / TOTP FEASIBILITY

Under Kintone-only + shared-account constraints, report:

```text
KINTONE_ONLY_TOTP_FEASIBLE = YES/NO/PARTIAL
TOTP_CAN_BE_VERIFIED_WITHOUT_EXPOSING_THE_VERIFICATION_SECRET_TO_SHARED_BROWSER = YES/NO
RECOMMENDED_TOTP_STATUS = ENABLE / DEFER / REJECT
```

Do not implement TOTP in this task.

# STEP 6 — FINAL DELIVERY PATH

Choose exactly one:

```text
PATH_A = Kintone-only internal gate is acceptable for MBO scope
PATH_B = Kintone-only UI gate cannot satisfy strict employee isolation; redesign authorization/workflow using native Kintone controls
PATH_C = Kintone-only is not acceptable for intended security requirement
```

If PATH_A: define smallest next repository-only implementation scope.
If PATH_B: propose the safest Kintone-only workflow/authorization redesign.
If PATH_C: stop with reason.

# STEP 7 — CURRENT-DOC RECONCILIATION

Update living docs only where required so current truth states:

```text
EXTERNAL_AUTH_SERVICE_SELECTED = NO
KINTONE_ONLY_DIRECTION = USER_SELECTED
SHARED_ACCOUNT_LIMITATION = ACTIVE SECURITY CONSTRAINT
```

Preserve prior Node.js auth design as historical/abandoned direction, not current delivery path.
Do not close SEC-DEP-001 unless actually proven closed.

# STEP 8 — TEST / GIT

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
KINTONE_WRITES_THIS_TASK = 0
EXTERNAL_DEPLOY_THIS_TASK = 0
APP801_RECORD_COUNT_EXPECTED = 0
npm test = PASS
git diff --check = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED_WITH_EXPLANATION
local HEAD = origin/ai/antigravity-wp002c after push
```

# FINAL REQUIRED SUMMARY

```text
M10C_AUTH_D_KINTONE_ONLY_PREFLIGHT = COMPLETE / BLOCKED
USER_SELECTED_KINTONE_ONLY = YES
EXTERNAL_AUTH_SERVICE_SELECTED = NO
CAN_SHARED_ACCOUNT_READ_APP801_NOW = actual
CAN_BROWSER_CUSTOMIZATION_USE_APP801_WITH_CURRENT_ACL = actual
STRICT_EMPLOYEE_DATA_ISOLATION_WITH_SHARED_ACCOUNT = actual
DIRECT_APP794_BYPASS_RISK = actual
EMPLOYEE_CODE_SWITCHING_RISK = actual
APP801_FUTURE_ROLE = actual
KINTONE_ONLY_TOTP_FEASIBLE = actual
RECOMMENDED_TOTP_STATUS = actual
FINAL_RECOMMENDED_PATH = PATH_A / PATH_B / PATH_C
NEXT_REPOSITORY_IMPLEMENTATION_SCOPE = exact / NONE
NEXT_TASK_KINTONE_WRITES = NONE / exact
NEXT_TASK_USER_AUTHORIZATION_REQUIRED = YES/NO
KINTONE_WRITES_THIS_TASK = 0
EXTERNAL_DEPLOY_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW ONLY
```

Commit and push same branch, then STOP.

Do NOT deploy login.
Do NOT weaken App801 ACL.
Do NOT create employee auth records.
Do NOT implement TOTP.
Do NOT deploy App794 customization.
