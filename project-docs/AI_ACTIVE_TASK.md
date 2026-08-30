# AI ACTIVE TASK — D1 APP800 DEPLOYMENT TOOL COMPATIBILITY R1

Mode: **ANTIGRAVITY SOURCE / TEST / LOCAL ARTIFACT VALIDATION ONLY — NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET EXECUTION**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

Accepted App800 Reset MBO Password UI source commit:

`a7a9f02aff6b497f3f8e0009dd377437a3701416`

Independent Control Plane result:

```text
D1_APP800_PASSWORD_RESET_UI_SOURCE_R1 = PASS
SOURCE_ACCEPTED                        = YES
DEPLOY_READY                           = NO
```

Do not modify the accepted Reset UI feature unless a tooling compatibility test proves a real source defect. Hybrid Identity / Natta / Vassana remains OUT OF SCOPE.

## 1. Why This Task Exists

The accepted App800 source is now a real ES module that statically imports the canonical:

`src/ui/mbo-kintone-auth-adapter.js`

Canonical local build already produces:

```text
dist/hr-control-center-bundle.js
dist/hr-control-center.css
```

using `scripts/kintone/build-hrcc-ui.js` / esbuild.

Legacy deployment helper:
`scripts/kintone/deploy-delivery-sprint02.js`

is no longer compatible because it attempts to synthesize a classic bundle from raw source with string manipulation rather than using the reviewed generated artifact.

It also contains a stale `assertCreatorOnlyAcl(...)` post-deploy check, while the accepted App800 ACL intentionally includes `HR_ADMIN_GROUP` View-only authority.

This task fixes **deployment tooling compatibility only**. Do not deploy.

## 2. Canonical Artifact Rule

Deployment tooling must stop rebuilding HRCC by regex/string manipulation.

Preferred design:
- the canonical build remains `node scripts/kintone/build-hrcc-ui.js`;
- deployment helper consumes the already-generated/reviewable:
  - `dist/hr-control-center-bundle.js`
  - `dist/hr-control-center.css`;
- deployment helper validates the candidate before any future upload path can use it.

Required local validation before a candidate is considered usable:
- JS file exists and is non-empty;
- CSS file exists and is non-empty;
- JS parses as classic browser script;
- no runtime `import` / `export` statements remain;
- bundle contains canonical `MboKintoneAuthAdapter` implementation;
- bundle contains `resetMboPassword` implementation;
- no fallback raw-source/string-bundling path is used.

Do not duplicate the esbuild build logic in the deploy script.

## 3. Legacy `buildClassicHrccBundle` Compatibility

Current legacy tests call `buildClassicHrccBundle(rawSource, ...)`, which is obsolete for module-based HRCC source.

Replace/update this contract narrowly rather than teaching it to strip imports.

Acceptable outcomes:
- remove/deprecate raw-source bundling and replace tests with a pure validator/loader for the canonical dist artifact; or
- retain a compatibility-named helper only if it consumes/validates the canonical generated bundle rather than manipulating raw source.

Forbidden:
- regex removal of import statements;
- copy/paste of `MboKintoneAuthAdapter`;
- secondary bundle engine;
- manual concatenation of module source;
- runtime global adapter workaround.

## 4. App800 ACL Post-Readback Contract

Current accepted native App800 ACL is **not creator-only**.

Required accepted shape:

```text
CREATOR
  technical admin rights preserved

HR_ADMIN_GROUP
  View   = YES
  Add    = NO
  Edit   = NO
  Delete = NO
  Manage = NO
  Import = NO
  Export = NO

everyone
  all application rights = NO
```

Update deployment-tool readback validation so it can verify this least-privilege state without writing or modifying ACL.

Rules:
- do not call ACL PUT/POST;
- do not add/remove groups;
- do not use `assertCreatorOnlyAcl` for App800 candidate deployment verification;
- validation must fail closed if `HR_ADMIN_GROUP` is missing, over-privileged, or `everyone` gains rights;
- preserve technical CREATOR authority;
- do not touch App801 ACL in this task.

Implement the ACL check as a pure/testable validation helper where practical.

## 5. Exact Allowed Files

Allowed to modify:

```text
scripts/kintone/deploy-delivery-sprint02.js
tests/sprint02-delivery.test.js
```

Allowed only if strictly necessary for a proven compatibility seam:

```text
scripts/kintone/build-hrcc-ui.js
```

Read-only/reference:

```text
src/ui/hr-control-center.js
src/ui/mbo-kintone-auth-adapter.js
dist/hr-control-center-bundle.js
dist/hr-control-center.css
project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_R2_EVIDENCE.md
```

Create one evidence file:

`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_EVIDENCE.md`

Forbidden:
- App794 source
- App53/App795 source/schema/data
- Reset UI feature redesign
- App801 credential core modification
- Hybrid Identity/My Approval Tasks implementation
- ACL/process/schema writes
- Control Center / Active Task / Confirmed Baselines / skills
- unrelated D2/D3/D5/D7 code

## 6. Required Tests

At minimum prove:

1. canonical App800 dist JS/CSS can be loaded by the deploy-helper path;
2. canonical JS passes classic-script syntax validation;
3. canonical JS has no runtime import/export residue;
4. canonical JS includes `MboKintoneAuthAdapter` and `resetMboPassword`;
5. deploy-helper path does not read raw `src/ui/hr-control-center.js` to synthesize a replacement bundle;
6. no import-stripping/string-concatenation workaround exists;
7. accepted App800 ACL sample with CREATOR + `HR_ADMIN_GROUP` View only + everyone denied = PASS;
8. HR Add/Edit/Delete/Manage/Import/Export elevation = FAIL CLOSED;
9. missing HR group = FAIL CLOSED;
10. everyone privilege = FAIL CLOSED;
11. existing non-HRCC safety/write-guard tests remain intact;
12. full `npm test` = PASS with no legacy Sprint02 bundle failures;
13. `git diff --check` = PASS.

No real Kintone call is necessary for this source/test task.

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

Do not run `executeDeploy()`.
Do not upload files.
Do not call preview customization/deploy APIs.

## 8. Evidence

Create:

`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_EVIDENCE.md`

Record:
- starting HEAD;
- exact files changed;
- old incompatibility and exact replacement design;
- proof canonical dist artifacts are consumed/validated;
- proof raw-source string bundle path is removed/deprecated;
- ACL validation contract + tests;
- focused test results;
- full `npm test` result;
- `git diff --check` result;
- Live operation counts all zero;
- `STATUS = PENDING_CHATGPT_REVIEW`.

Commit + push one focused implementation commit, then STOP.

Maximum executor status:

`D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_READY_PENDING_CHATGPT_REVIEW`

## 9. Next Owner

After commit/push:

`NEXT_OWNER = CHATGPT INDEPENDENT REVIEW`

Do not deploy and do not begin Hybrid Identity audit automatically.
