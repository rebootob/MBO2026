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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / BUNDLE+EMPLOYEE-CODE CORRECTIVE PROVISIONALLY PASS / PREVIEW FILEKEY FIX PROVISIONALLY PASS / PRE-UPLOAD SAFETY CORRECTIVE REQUIRED |
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

## 4. Corrective Review — Commit e55dbf5c1003ca3bdc071228fd6daf97956e16c9

Git comparison from exact parent `3c0173a1bbda94c9e67a7cd2c8c768b800aa7c39` proves the commit changes only:

```text
scripts/kintone/deploy-custom-ui.js
tests/deploy-customization-preservation.test.js
```

No bundle/auth/Employee-Code/CSS/business module was reopened.

### Provisionally accepted corrections

1. Script now reads both effective/live and Preview/Test customization.
2. Retained FILE keys used for Preview PUT are sourced from Preview/Test state, not Production/effective state.
3. Preview PUT entries are normalized to supported shapes only:
   - URL -> `{ type, url }`
   - FILE -> `{ type, file: { fileKey } }`
4. Only target `mbo-employee-app.js` is uploaded by the live path; CSS upload was removed.
5. Non-target Preview FILE keys, order, URL entries, mobile entries and scope are preserved by payload construction.
6. Focused tests cover Preview-vs-live fileKey differences, target replacement, CSS Preview key preservation, order, drift, missing target and ambiguous target.

## 5. Blocking Finding — Validation Happens Too Late

The source package is still **NOT PASS** because some fail-closed checks occur only after the replacement JS is already uploaded.

Current live order:

```text
GET live customize
GET preview customize
validateTopologyAlignment(...)
UPLOAD replacement JS
buildPreviewCustomizePayload(...)
  -> only here checks target missing/ambiguous
  -> only here checks retained preview fileKey presence
  -> revision is optional
```

This violates the intended safety order. A malformed preview state, missing/ambiguous target, missing retained fileKey, or missing revision can cause a Kintone file upload before the operation is blocked.

Additional strictness gaps:
- `buildPreviewCustomizePayload()` defaults missing scope to `ALL` instead of failing closed;
- missing Preview revision is allowed instead of being mandatory;
- `validateTopologyAlignment()` does not reject unsupported/malformed entry types before upload if both live/preview topology happen to match.

Therefore:

```text
PREVIEW_FILEKEY_SOURCE = PROVISIONALLY PASS
NON_TARGET_PREVIEW_FILEKEY_PRESERVATION = PROVISIONALLY PASS
PRE_UPLOAD_FAIL_CLOSED_GATE = CORRECTIVE REQUIRED
SOURCE_PACKAGE_OVERALL = NOT PASS YET
APP794_REDEPLOY = BLOCKED / NOT AUTHORIZED
```

## 6. Exact Next Corrective Scope

The next executor task is SOURCE / TEST ONLY. Do not redo accepted bundle/auth/Employee-Code/fileKey work.

Required correction:

1. validate live + preview customization completely **before any upload**;
2. require valid explicit scope; no fallback to `ALL` when source state is missing/malformed;
3. require non-empty Preview revision before upload and include it in PUT;
4. validate every entry before upload:
   - supported type only (`URL` / `FILE`);
   - URL requires non-empty url;
   - FILE requires non-empty name for topology comparison;
   - every retained Preview FILE requires non-empty preview fileKey;
5. require exactly one Preview desktop JS target `mbo-employee-app.js` before upload;
6. fail before upload on target missing/ambiguous;
7. only after full preflight passes may the script upload exactly one target JS;
8. focused tests must prove invalid states result in zero upload/write calls.

No Kintone write/deploy is authorized in this corrective task.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = LOW — only unresolved pre-upload safety gate remains
```

Antigravity must execute only `project-docs/AI_ACTIVE_TASK.md`, push one narrow source/test commit, and STOP.

## 8. Knowledge Maintenance

Baseline promotion:
`NONE — no durable business/architecture rule changed.`

Reusable Kintone skill extraction:
`PASS — safe live changes must complete all deterministic validation before the first irreversible/remote write, including file upload.`
