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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / BUNDLE+EMPLOYEE-CODE FIX PROVISIONALLY PASS / PREVIEW FILEKEY FIX PROVISIONALLY PASS / PRE-UPLOAD SAFETY STILL CORRECTIVE |
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

## 4. Independent Review — Commit 5f08dd6a4b2f7ad1f245df0f8e1de2d4ac7297b7

Exact Git comparison from parent `dc3bdaff8df70eaac6c95512cb0e3f7c76ff0ece` proves this executor commit changes only:

```text
scripts/kintone/deploy-custom-ui.js
tests/deploy-customization-preservation.test.js
```

No business/UI/auth module, CSS, dist bundle, Baseline, Control Center, or D2-D7 source was changed by the executor commit.

### Accepted parts

1. Full preflight is now called before `uploadFile()` in the live path.
2. Missing/blank scope and Preview revision are checked before upload.
3. URL/FILE entry types and basic entry fields are checked before upload.
4. Target missing/ambiguous checks occur before upload.
5. Preview non-target FILE keys remain the source for Preview PUT preservation.
6. Only the target JS is uploaded; CSS is not uploaded.
7. The corrective stays outside `main-mbo-app.js` and does not violate the confirmed modular source architecture.

### Remaining blocking findings

The source package is still **CORRECTIVE** because deterministic invalid states can still pass preflight and fail only after the JS upload.

#### A. Target fileKey exemption is too broad

Current Preview FILE-key validation exempts any preview FILE whose `file.name === targetFileName`, regardless of section.

Only the exact replacement target in `preview.desktop.js` may be exempt from requiring its old Preview fileKey. A same-named FILE under desktop CSS or mobile JS/CSS is non-target and must retain a valid Preview fileKey.

Otherwise a malformed same-named retained FILE can pass preflight, then `buildPreviewCustomizePayload()` fails after the new JS has already been uploaded.

#### B. Missing section/list structure can silently become empty arrays

`validateEntryList(list = [])` and topology helpers currently treat an absent `desktop.css`, `mobile.js`, or `mobile.css` as `[]`.

If the same structure is absent in both live and preview responses, preflight can accept malformed/unknown response structure and the PUT builder can silently construct empty arrays.

Live and Preview responses must explicitly contain `desktop` and `mobile` objects with `js` and `css` arrays before upload.

#### C. Scope must be a valid Kintone customization scope

Official Kintone customization scope values are:

```text
ALL
ADMIN
NONE
```

A non-empty unknown string must not pass preflight.

#### D. Revision validation must actually preserve concurrency protection

Kintone documents that `revision = -1` disables revision checking. Current preflight accepts any non-empty revision, including `-1` or a non-numeric value.

The preflight must require the Preview revision returned by Kintone to be a valid positive integer revision and must reject `-1` so the PUT remains concurrency-guarded.

GitHub has no CI/status check for this commit, so `npm test` is not independently proven by GitHub status.

Therefore:

```text
COMMIT_5F08_PREFLIGHT_ORDER = PASS
COMMIT_5F08_BASIC_ENTRY_VALIDATION = PASS
COMMIT_5F08_FULL_FAIL_CLOSED_PREFLIGHT = CORRECTIVE REQUIRED
SOURCE_PACKAGE_OVERALL = NOT PASS YET
APP794_REDEPLOY = BLOCKED / NOT AUTHORIZED
```

## 5. Exact Next Corrective Scope

The next executor task is SOURCE / TEST ONLY and must be the smallest final pre-upload safety correction.

Required correction:

1. Require explicit `desktop` and `mobile` objects in both live and Preview customization.
2. Require explicit `js` and `css` arrays in each object; missing lists must fail closed instead of defaulting to `[]`.
3. Accept scope only from `ALL | ADMIN | NONE`, and require live == Preview scope.
4. Require Preview revision to be a positive integer value and reject `-1` / malformed revisions.
5. Identify the exact target as one FILE entry named `mbo-employee-app.js` in `preview.desktop.js`.
6. Only that exact target entry may omit its old Preview fileKey because it will be replaced.
7. Every other Preview FILE in desktop/mobile JS/CSS must have a non-empty Preview fileKey, even if its filename happens to equal the target filename.
8. All above checks must finish before `uploadFile()`.
9. Add focused tests proving each invalid structure causes zero upload/write calls.
10. Do not refactor deployment tooling or business modules beyond this exact defect.

No Kintone write/deploy is authorized in this corrective task.

## 6. Source Architecture Decision — Confirmed

Canonical modular source rules live in:

```text
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

No Big-Bang refactor is allowed during this D1 production corrective. The large `src/ui/employee-part-a-ui.js` decomposition starts only after the active D1 blocker is stable.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = LOW — exact unresolved preflight defects only
```

Antigravity may execute only the new `project-docs/AI_ACTIVE_TASK.md`, push one narrow source/test commit, and STOP.

## 8. Knowledge / Baseline Maintenance

Baseline promotion:
`NONE — no durable business rule changed in this review.`

Reusable Kintone skill extraction:
`PASS — customization preflight must validate exact target context, explicit response structure, valid scope, and a revision value that does not disable concurrency checking before file upload.`
