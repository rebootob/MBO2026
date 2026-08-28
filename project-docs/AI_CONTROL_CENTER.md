# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / APP794 LIVE FAIL-CLOSED / SOURCE+BUNDLE CORRECTIVE REQUIRED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = CORRECTIVE REQUIRED / PREVIOUS SOURCE ACCEPTANCE REOPENED BY LIVE RUNTIME EVIDENCE
D1_LIVE_CUTOVER                     = IN PROGRESS / BLOCKED AT APP794 RUNTIME
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED / PASS
APP801_GROUP_ACL_MODEL              = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = EXECUTED / NOT ACCEPTED / CORRECTIVE SOURCE REQUIRED
APP794_REDEPLOY                     = NOT AUTHORIZED IN CURRENT CORRECTIVE TASK
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

The prior App794 deploy authorization is consumed. It does not authorize a corrective redeploy of a materially changed artifact.

## 3. Accepted D1 State That Remains Valid

```text
MBO_EMPLOYEE_ACCESS_GROUP = PASS
APP801_GROUP_ACL = PASS
CREDENTIAL_CANDIDATE_GATE = PASS / 128
APP801_PROVISIONING = PASS / 128 / independently live verified
```

These accepted gates are not reopened by the App794 bundle defect.

Manual final D1 UAT remains `BLOCKED / NOT STARTED`.

## 4. App794 Deploy Review — CORRECTIVE

Executor deploy evidence commit:
`94b55b43944bdf95a0fd598aabcb8db5bf91e190`

The executor reported revision 40 -> 41 and successful target-file hash verification. Git proves the evidence commit changed only the evidence document, not source.

The deployment is **not accepted** because subsequent independent live evidence and source inspection prove the deployed runtime is nonfunctional.

### Independent live evidence
The user opened live App794 after deployment and the page displayed:

```text
MBO Login Gate Not Initialized
The MBO authentication system could not be started. Access blocked.
[FAIL_CLOSED_GATE_NULL]
```

This is a safe fail-closed outcome from an exposure perspective, but D1 is not functional and cannot proceed to UAT.

### Proven root cause — incomplete classic bundle
`src/main-mbo-app.js` imports and constructs:

```text
MboKintoneAuthAdapter
MboKintoneLoginGate
```

But the deployed `dist/mbo-employee-app.js` references these names without containing their class definitions.

`scripts/kintone/deploy-custom-ui.js` manually concatenates source files but omits:

```text
src/ui/mbo-kintone-auth-adapter.js
src/ui/mbo-kintone-login-gate.js
```

Therefore login-gate initialization throws at runtime, the catch path leaves `mboLoginGate = null`, and App794 correctly falls into `[FAIL_CLOSED_GATE_NULL]`.

### Proven test gap
`tests/classic-bundle.test.js` rebuilds the expected bundle using the same incomplete source-file list as the build script. Syntax parsing therefore passes even though required runtime classes are missing. A syntax-only classic-bundle test is insufficient for runtime dependency completeness.

### Additional Baseline mismatch — Employee Code format
Confirmed D1 Baseline allows real Employee Codes containing punctuation, including:

```text
50.03
50.02
0050_2
```

Current source in `src/ui/mbo-kintone-auth-adapter.js` and `src/core/fiscal-year-engine.js` restricts codes to `[A-Za-z0-9_-]+`, which rejects the dot-containing confirmed codes. This must be corrected consistently before the next source acceptance.

### Non-target CSS deviation
The prior exact deploy scope allowed only the accepted JS target to change, but `scripts/kintone/deploy-custom-ui.js` always re-uploads both JS and CSS and rebuilds the customization payload with both new fileKeys. This explains the executor-reported CSS upload and can cause non-target metadata drift even when CSS bytes are unchanged.

## 5. Independent Review Verdict

```text
APP794_DEPLOY_REVIEW = CORRECTIVE / NOT PASS
LIVE_D1_RUNTIME = FAIL-CLOSED / NONFUNCTIONAL
SOURCE_ACCEPTANCE = REOPENED FOR NARROW CORRECTIVE
FINAL_D1_UAT = BLOCKED
```

No rollback is ordered automatically. The current live state is visibly fail-closed; an improvised production rollback/redeploy would itself be another write and is outside the source-only corrective scope.

## 6. Exact Corrective Scope

The next executor task is **SOURCE / BUILD / TEST ONLY**. It must:

1. include `mbo-kintone-auth-adapter.js` and `mbo-kintone-login-gate.js` in the classic bundle before `main-mbo-app.js`;
2. add a runtime-completeness test that would fail if required auth classes are omitted; syntax-only checks are not sufficient;
3. align Employee Code validation/Record Key handling with the confirmed Baseline so `50.03`, `50.02`, and `0050_2` are accepted while injection strings/quotes/spaces remain rejected;
4. change the deployment implementation so future single-file JS replacement preserves existing non-target live customization entries/fileKeys and does not automatically re-upload unchanged CSS;
5. rebuild `dist/mbo-employee-app.js` using build-only mode;
6. prove `dist/mbo-employee.css` remains byte-identical / Git-blob-identical;
7. run the required focused tests plus full `npm test`;
8. commit source/build/test changes and STOP for independent review.

No Kintone write/deploy is authorized in this corrective task.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = NO
```

Antigravity must execute only `project-docs/AI_ACTIVE_TASK.md`, push one corrective source commit, and STOP.

## 8. Knowledge Maintenance

Baseline promotion:
`NONE — the existing Baseline was correct; implementation/build artifacts were inconsistent with it.`

Reusable Kintone skill extraction:
`PASS — update existing skills for classic-bundle runtime dependency completeness and preservation of non-target Kintone FILE customization entries/fileKeys.`
