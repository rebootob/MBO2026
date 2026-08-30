# AI ACTIVE TASK — D1 APP800 DEPLOYMENT TOOL COMPATIBILITY R1 CORRECTIVE R2 — TEST/EVIDENCE ONLY

Mode: **ANTIGRAVITY FOCUSED TEST / FULL TEST / EVIDENCE ONLY — NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET EXECUTION**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point / Independent Review

Executor corrective source commit reviewed:

`14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd`

Independent result:

```text
FINDING_G_CREATOR_LOGIC        = IMPLEMENTED
FINDING_H_EVERYONE_LOGIC       = IMPLEMENTED
FINDING_I_EXACT_PRINCIPAL_SET  = IMPLEMENTED
FINDING_J_CANONICAL_DELEGATION = IMPLEMENTED
SOURCE_DEFECT_FOUND            = NO
TEST_EVIDENCE_COMPLETE         = NO
D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_REVIEW = CORRECTIVE_TEST_EVIDENCE_ONLY
DEPLOY_READY = NO
```

Do **not** redesign or modify deployment source unless an added required test actually exposes a real defect. The intended task is to close explicit security test/evidence gaps only.

Hybrid Identity / Natta / Vassana and Reset UI source remain OUT OF SCOPE.

## 1. Why This Small Corrective Exists

The current implementation logic in `scripts/kintone/deploy-delivery-sprint02.js` already appears to enforce the intended G/H/I/J behavior:
- exact 3-row App800 ACL set;
- canonical CREATOR with all seven rights true;
- exact `GROUP / HR_ADMIN_GROUP` with View-only rights;
- explicit everyone row with all seven rights false;
- strict boolean permission properties;
- canonical dist-only bundle delegation;
- no ACL write.

However the executor evidence states broader test coverage than the reviewed test file actually contains. Security acceptance requires the explicit proof below.

## 2. Required Explicit Test Cases

Modify `tests/sprint02-delivery.test.js` only as needed to add these cases.

### A. HR malformed rights -> FAIL CLOSED

Add at least one explicit ACL sample where:
- CREATOR is valid full;
- everyone is valid denied;
- HR_ADMIN_GROUP identity is valid;
- one required HR right is missing, undefined, string-valued, null, or otherwise non-boolean.

Expected:
`assertApp800LeastPrivilegeAcl(...)` throws because every required HR right must be an explicit boolean.

### B. everyone malformed rights -> FAIL CLOSED

Add at least one explicit ACL sample where:
- CREATOR is valid full;
- HR_ADMIN_GROUP is valid View-only;
- everyone identity is present;
- one required everyone right is missing or non-boolean.

Expected:
`assertApp800LeastPrivilegeAcl(...)` throws.

### C. Extra denied principal -> FAIL CLOSED

Current test proves an extra privileged USER is rejected. Also prove an unexpected fourth principal is rejected even when **all its rights are false**.

Example extra principal:
- USER/GROUP/ORGANIZATION not part of the accepted App800 ACL;
- all seven rights false.

Expected:
FAIL CLOSED because accepted principal set is exact, not merely privilege-based.

### D. Actual accepted `everyone` representation -> PASS

Prior App800 readback evidence showed the everyone principal may be represented as a group/code form rather than synthetic `entity.type = EVERYONE`.

Add a valid exact ACL sample using:

```text
entity.type = GROUP
entity.code = everyone
```

with all seven rights exactly false.

Expected:
PASS.

This proves the validator supports the actual accepted Kintone representation without weakening the exact `code=everyone` identity rule.

## 3. Canonical Bundle Regression

Retain and rerun the existing Finding J test proving a fake caller-provided classic-looking bundle cannot replace canonical `dist/hr-control-center-bundle.js`.

No source/bundle regeneration is required unless existing canonical artifact validation unexpectedly fails.

## 4. Source Change Rule

Expected source modifications:

```text
scripts/kintone/deploy-delivery-sprint02.js = 0
```

If any new required test fails because the current validator has a real logic defect:
1. STOP;
2. report exact failing test and why;
3. do not patch source automatically in this R2 task.

Control Plane will decide whether a source corrective is warranted.

## 5. Exact Allowed Files

Allowed to modify:

```text
tests/sprint02-delivery.test.js
project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_R2_EVIDENCE.md
```

Read-only:

```text
scripts/kintone/deploy-delivery-sprint02.js
scripts/kintone/build-hrcc-ui.js
src/ui/hr-control-center.js
src/ui/mbo-kintone-auth-adapter.js
dist/hr-control-center-bundle.js
dist/hr-control-center.css
```

Forbidden:
- Control Center / Active Task / Confirmed Baselines / skills;
- App794 source;
- App53/App795 source/schema/data;
- Reset UI source;
- App801 credential core;
- Hybrid Identity/My Approval Tasks;
- unrelated D2/D3/D5/D7 work.

## 6. Required Verification

At minimum:

1. existing valid exact ACL test = PASS;
2. actual `GROUP / everyone` valid ACL = PASS;
3. malformed HR boolean = FAIL CLOSED;
4. malformed everyone boolean = FAIL CLOSED;
5. extra denied principal = FAIL CLOSED;
6. existing missing/reduced CREATOR tests remain PASS;
7. existing extra privileged/duplicate principal tests remain PASS;
8. canonical caller-bypass prevention test remains PASS;
9. Sprint02/tooling suite = PASS;
10. Reset UI focused suite = PASS;
11. full `npm test` = PASS;
12. `git diff --check` = PASS;
13. Live operations all zero.

## 7. Safety — Zero Live Operations

```text
LIVE_GET                      = 0
LIVE_POST                     = 0
LIVE_PUT                      = 0
LIVE_DELETE                   = 0
CUSTOMIZATION_UPLOAD          = 0
DEPLOY                        = 0
APP800_ACL_WRITE              = 0
APP801_ACL_WRITE              = 0
PASSWORD_RESET_EXECUTION_LIVE = 0
ROLLBACK                      = 0
HYBRID_IDENTITY_SOURCE_CHANGE = 0
```

Do not call `executeDeploy()`.

## 8. Evidence

Create:

`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_R2_EVIDENCE.md`

Record:
- starting HEAD;
- exact files changed;
- source file change count = 0;
- explicit test names/results for A/B/C/D above;
- Sprint02/tooling test result;
- Reset UI focused result;
- full `npm test` result;
- `git diff --check` result;
- exact Live operation counts all zero;
- `STATUS = PENDING_CHATGPT_REVIEW`.

Commit + push one minimal test/evidence commit, then STOP.

Maximum executor status:

`D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_R2_READY_PENDING_CHATGPT_REVIEW`

## 9. Next Owner

After commit/push:

`NEXT_OWNER = CHATGPT INDEPENDENT REVIEW`

Do not deploy and do not begin Hybrid Identity audit automatically.
