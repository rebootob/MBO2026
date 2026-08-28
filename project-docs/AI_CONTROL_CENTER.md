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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / BUNDLE+EMPLOYEE-CODE CORRECTIVE PROVISIONALLY PASS / DEPLOY-SCRIPT FILEKEY CORRECTIVE REQUIRED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = CORRECTIVE REVIEW IN PROGRESS
D1_LIVE_CUTOVER                     = IN PROGRESS / BLOCKED AT APP794 RUNTIME
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED / PASS
APP801_GROUP_ACL_MODEL              = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = EXECUTED / NOT ACCEPTED
APP794_REDEPLOY                     = NOT AUTHORIZED
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

The prior App794 deploy authorization is consumed. No materially changed artifact may be redeployed until a new exact authorization is recorded after source acceptance.

## 3. Accepted D1 State That Remains Valid

```text
MBO_EMPLOYEE_ACCESS_GROUP = PASS
APP801_GROUP_ACL = PASS
CREDENTIAL_CANDIDATE_GATE = PASS / 128
APP801_PROVISIONING = PASS / 128 / independently live verified
```

Manual final D1 UAT remains `BLOCKED / NOT STARTED`.

## 4. Corrective Source Review — Commit 5044eb47f0302327e6bc180d504f72132f6a0fbe

Independent Git review compared exact parent `0e636b2fd024e6aedc94ac893e70fecaaf425a14` to corrective commit `5044eb47f0302327e6bc180d504f72132f6a0fbe`.

Changed files are limited to the authorized source/build/test scope:

```text
dist/mbo-employee-app.js
scripts/kintone/deploy-custom-ui.js
src/core/fiscal-year-engine.js
src/ui/mbo-kintone-auth-adapter.js
tests/classic-bundle.test.js
tests/mbo-kintone-auth-adapter.test.js
```

Not changed:
- `src/main-mbo-app.js`;
- dedicated login-gate source module;
- CSS source/dist;
- Baseline / Control Center / Active Task;
- D2-D7 files.

### Provisionally accepted corrections

1. Classic bundle build order now includes `src/ui/mbo-kintone-auth-adapter.js` and `src/ui/mbo-kintone-login-gate.js` before `src/main-mbo-app.js`.
2. Dedicated auth modules remain separate; no class/function copy was inserted into `main-mbo-app.js`.
3. `tests/classic-bundle.test.js` now checks one auth-adapter definition, one login-gate definition, runtime class resolution/instantiation, and source-to-dist exactness.
4. Employee Code validation now allows the confirmed string character set `[A-Za-z0-9_.-]+` and preserves leading zeroes.
5. Focused auth tests include `50.03`, `50.02`, `0050_2`, and rejection of injection syntax before any Kintone call.
6. `dist/mbo-employee.css` is absent from the diff and therefore unchanged in Git.

These corrections resolve the previously proven missing-class runtime root cause at source level, subject to final local-test evidence and the remaining deploy-script blocker below.

## 5. Blocking Finding — Wrong FileKey Environment for Preview PUT

`deploy-custom-ui.js` currently reads retained customization entries from:

```text
GET /k/v1/app/customize.json
```

and then forwards those retained FILE entries into:

```text
PUT /k/v1/preview/app/customize.json
```

This is not accepted.

Kintone's customization update contract requires an unchanged uploaded FILE retained in a Preview PUT to use the `fileKey` obtained from the Preview/Test-environment customization read (`GET /k/v1/preview/app/customize.json`). Production/effective FILE keys must not be assumed valid for Preview PUT.

The current code also forwards raw GET FILE objects. The corrective implementation must construct the PUT payload using only the fields accepted by the update API (`type + url` for URL entries, `type + file.fileKey` for FILE entries).

Therefore:

```text
CORRECTIVE_COMMIT_5044_BUNDLE_FIX = PROVISIONALLY PASS
CORRECTIVE_COMMIT_5044_EMPLOYEE_CODE_FIX = PROVISIONALLY PASS
CORRECTIVE_COMMIT_5044_DEPLOY_PRESERVATION = CORRECTIVE REQUIRED
SOURCE_PACKAGE_OVERALL = NOT PASS YET
APP794_REDEPLOY = BLOCKED / NOT AUTHORIZED
```

## 6. Exact Next Corrective Scope

The next executor task is SOURCE / TEST ONLY and must not redo accepted work.

It must correct `scripts/kintone/deploy-custom-ui.js` so a future JS-only replacement:

1. reads both effective/live customization and Preview/Test customization;
2. fails closed if live and preview topology/scope differ unexpectedly before the change;
3. obtains retained FILE keys from Preview/Test customization, not Production customization;
4. identifies exactly one target desktop FILE named `mbo-employee-app.js`;
5. uploads only the replacement JS;
6. constructs the Preview PUT payload from the Preview/Test state using only supported update fields;
7. preserves order, scope, URL entries, mobile entries, and all non-target preview FILE keys;
8. includes the Preview revision in the PUT request to guard against concurrent change;
9. does not upload CSS;
10. has focused tests proving only the target JS key changes and CSS/non-target keys remain the Preview keys.

No Kintone write/deploy is authorized in this corrective task.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = LOW — task is limited to the unresolved fileKey/API-contract defect
```

Antigravity must execute only the new `project-docs/AI_ACTIVE_TASK.md`, push one narrow source/test commit, and STOP.

## 8. Knowledge Maintenance

Baseline promotion:
`NONE — no durable business/architecture rule changed.`

Reusable Kintone skill extraction:
`PASS — update safe-live-change guidance to distinguish Production customization read-back from Preview fileKeys required by Preview customization PUT.`
