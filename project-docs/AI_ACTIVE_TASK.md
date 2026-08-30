# AI ACTIVE TASK — D1 APP800 DEPLOYMENT TOOL COMPATIBILITY R1 CORRECTIVE

Mode: **ANTIGRAVITY SOURCE / TEST / LOCAL ARTIFACT VALIDATION ONLY — NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET EXECUTION**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point / Review Result

Executor commit reviewed:
`cf0ae9d7d812ce7f855714434a1d56ca2d3042fc`

Independent result:

```text
D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_REVIEW = CORRECTIVE
DEPLOY_READY = NO
```

Do not redesign deployment. Preserve the good changes already present:
- `executeDeploy()` consumes canonical `dist/hr-control-center-bundle.js` and CSS;
- no raw-source regex/string bundle synthesis in the actual deploy path;
- canonical artifact validation exists;
- App800-specific ACL validator exists;
- full suite is currently 985/985 PASS.

Hybrid Identity / Natta / Vassana and Reset UI feature source remain OUT OF SCOPE.

## 1. Finding G — CREATOR Must Be Exact Full Technical Authority

Current validator only checks that a CREATOR/admin-form-like row exists.

Required exact contract:
- require exactly one canonical `entity.type === 'CREATOR'` entry;
- all relevant App ACL right fields must exist as booleans;
- CREATOR must be exactly:

```text
appEditable       = true
recordViewable    = true
recordAddable     = true
recordEditable    = true
recordDeletable   = true
recordImportable  = true
recordExportable  = true
```

Any false/missing/undefined/non-boolean CREATOR right -> FAIL CLOSED.
A plain USER row with code `admin-form` must not substitute for missing CREATOR.

Add tests for:
- valid full CREATOR -> PASS;
- missing CREATOR -> FAIL;
- CREATOR with one right false -> FAIL;
- malformed/missing right field -> FAIL.

## 2. Finding H — `everyone` Must Be Present and Explicitly Denied

Current validator allows `everyone` to be absent.

Required:
- require exactly one `everyone` entry (accepted code `everyone`; support the actual returned entity type without weakening code identity);
- require all relevant right fields to exist as booleans and be exactly false:

```text
appEditable       = false
recordViewable    = false
recordAddable     = false
recordEditable    = false
recordDeletable   = false
recordImportable  = false
recordExportable  = false
```

Missing everyone, any true right, or malformed/missing boolean -> FAIL CLOSED.

Add tests for:
- valid everyone denied -> PASS;
- missing everyone -> FAIL;
- any everyone privilege -> FAIL;
- missing/malformed right -> FAIL.

## 3. Finding I — Exact ACL Principal Set / No Silent Extras

Accepted App800 App ACL principal set is exactly:

```text
CREATOR
HR_ADMIN_GROUP
everyone
```

Required:
- exactly one of each expected principal;
- `HR_ADMIN_GROUP` must be `entity.type === 'GROUP'` and exact code `HR_ADMIN_GROUP`;
- HR rights must all be explicit booleans with exact View-only values:
  - recordViewable = true
  - appEditable/recordAddable/recordEditable/recordDeletable/recordImportable/recordExportable = false
- any unexpected USER/GROUP/ORGANIZATION/other principal -> FAIL CLOSED;
- duplicate expected principal -> FAIL CLOSED;
- malformed expected entity -> FAIL CLOSED.

Add focused tests for extra privileged principal and extra denied principal; both must fail because the readback no longer matches the accepted exact ACL shape.

Do not write ACL.

## 4. Finding J — Canonical Artifact Helper Must Not Accept Arbitrary Caller Bundle

Current deprecated `buildClassicHrccBundle(sourceText, ...)` can directly return caller-supplied text if it appears already bundled. That bypasses the canonical artifact rule.

Required narrow correction:
- preferred: remove this obsolete helper and remove unused test import if no repository caller requires it; OR
- retain the name only as a compatibility loader that ignores caller-provided source/bundle input and always delegates to `validateHrccBundleArtifacts()` and returns the canonical dist JS.

Must remain forbidden:
- raw-source bundling;
- regex import/export stripping;
- manual module concatenation;
- arbitrary caller-supplied JS as deploy candidate;
- duplicate bundle engine.

Add a test proving a fake caller-provided classic-looking bundle cannot replace the canonical dist artifact.

## 5. Preserve Accepted Tooling Behavior

Must remain true:
- canonical JS/CSS existence/non-empty checks;
- classic JS parse check;
- no runtime import/export residue;
- bundle includes `MboKintoneAuthAdapter` and `resetMboPassword`;
- `executeDeploy()` loads canonical dist artifacts directly;
- no ACL writes;
- no Live deploy run;
- Reset UI accepted source/dist remain untouched;
- App794/App53/App795/Hybrid Identity source untouched.

## 6. Exact Allowed Files

Allowed to modify:

```text
scripts/kintone/deploy-delivery-sprint02.js
tests/sprint02-delivery.test.js
project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_EVIDENCE.md
```

Read-only:

```text
scripts/kintone/build-hrcc-ui.js
src/ui/hr-control-center.js
src/ui/mbo-kintone-auth-adapter.js
dist/hr-control-center-bundle.js
dist/hr-control-center.css
```

Forbidden:
- App794 source;
- App53/App795 source/schema/data;
- Reset UI source redesign;
- App801 credential core;
- Hybrid Identity/My Approval Tasks;
- Control Center / Active Task / Confirmed Baseline / skills;
- unrelated D2/D3/D5/D7 work.

## 7. Required Verification

At minimum prove:

1. canonical dist loader/validator still PASS;
2. arbitrary caller bundle cannot bypass canonical dist;
3. exact valid ACL with full CREATOR + HR View-only + everyone denied = PASS;
4. missing CREATOR = FAIL CLOSED;
5. reduced/malformed CREATOR right = FAIL CLOSED;
6. missing everyone = FAIL CLOSED;
7. privileged/malformed everyone = FAIL CLOSED;
8. missing HR group = FAIL CLOSED;
9. HR privilege elevation or malformed HR rights = FAIL CLOSED;
10. any unexpected ACL principal = FAIL CLOSED;
11. duplicate expected principal = FAIL CLOSED;
12. focused Sprint02/tooling tests PASS;
13. Reset UI focused tests remain PASS;
14. full `npm test` = PASS;
15. `git diff --check` = PASS;
16. Live operations all zero.

## 8. Safety — Zero Live Operations

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

## 9. Evidence

Create:
`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_EVIDENCE.md`

Record:
- starting HEAD;
- exact files changed;
- exact corrections G/H/I/J;
- ACL exact-shape tests;
- canonical-artifact bypass prevention test;
- focused test results;
- Reset UI focused result;
- full `npm test` result;
- `git diff --check`;
- exact Live operation counts all zero;
- `STATUS = PENDING_CHATGPT_REVIEW`.

Commit + push one focused corrective commit, then STOP.

Maximum executor status:

`D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_READY_PENDING_CHATGPT_REVIEW`

## 10. Next Owner

After executor commit/push:
`NEXT_OWNER = CHATGPT INDEPENDENT REVIEW`

Do not deploy and do not begin Hybrid Identity audit automatically.
