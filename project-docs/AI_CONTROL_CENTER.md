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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / SOURCE CORRECTIVE PASS / CORRECTIVE REDEPLOY AWAITING AUTHORIZATION |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = SOURCE CORRECTIVE ACCEPTED / PRE-DEPLOY TEST GATE REQUIRED
D1_LIVE_CUTOVER                     = IN PROGRESS / BLOCKED PENDING CORRECTIVE REDEPLOY
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED / PASS
APP801_GROUP_ACL_MODEL              = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = EXECUTED / NOT ACCEPTED
APP794_CORRECTIVE_REDEPLOY          = NOT AUTHORIZED / WAITING EXACT USER APPROVAL
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

The prior App794 deploy authorization is consumed. A corrective redeploy is a new production-impacting action and requires exact user authorization.

## 3. Accepted D1 State That Remains Valid

```text
MBO_EMPLOYEE_ACCESS_GROUP = PASS
APP801_GROUP_ACL = PASS
CREDENTIAL_CANDIDATE_GATE = PASS / 128
APP801_PROVISIONING = PASS / 128 / independently live verified
```

Manual final D1 UAT remains `BLOCKED / NOT STARTED` until corrective redeploy succeeds and is independently verified.

## 4. Independent Source Review — Commit ed1d8e8573efeb47845cc07dcd81853842ed307e

Exact Git comparison from parent `d30ff50a3299c86dfc828a59a39da20dff23a4ea` proves the executor commit changes only:

```text
scripts/kintone/deploy-custom-ui.js
tests/deploy-customization-preservation.test.js
```

No business/UI/auth module, CSS, generated dist artifact, Baseline, Control Center, Active Task, or D2-D7 source was changed by the executor commit.

### Accepted corrections

1. Full deterministic preflight remains before `uploadFile()`.
2. Both Live and Preview customization must explicitly contain `desktop` / `mobile` objects and `js` / `css` arrays; missing structure no longer defaults silently to empty arrays during preflight.
3. Customization scope is restricted to `ALL | ADMIN | NONE` and Live must equal Preview.
4. Preview revision must resolve to a positive integer and `-1` is rejected so revision checking is not disabled.
5. Target identification is exactly one Preview desktop JS FILE named `mbo-employee-app.js`.
6. The old-fileKey exemption is scoped by exact object identity to that single Preview desktop JS target entry only.
7. Same-named FILE entries in desktop CSS / mobile JS / mobile CSS remain non-target and require valid Preview fileKeys.
8. Preview non-target FILE keys remain preserved in the Preview PUT payload.
9. Only replacement JS is uploaded by the live path; CSS is not uploaded.
10. Source modularity remains intact; no code was moved into `main-mbo-app.js` and no broad refactor was mixed into the production corrective.

### Independent API contract check

Cybozu documentation independently confirms:
- customization scope values are `ALL`, `ADMIN`, `NONE`;
- update `revision` accepts number/string;
- `revision = -1` or omitted revision disables revision checking;
- retained FILE keys for a Preview customization update should come from Preview/Test customization state.

### Test-execution evidence limitation

GitHub exposes no CI status or workflow run for this commit. Therefore:

```text
STATIC_SOURCE_REVIEW = PASS
FOCUSED_TEST_SOURCE_REVIEW = PASS
GITHUB_CI_EXECUTION_EVIDENCE = NONE
NPM_TEST_EXECUTION = NOT INDEPENDENTLY PROVEN BY GITHUB
```

This does not require another source corrective. Instead, any future corrective redeploy task must run `npm run ui:build` and `npm test` as a mandatory local pre-deploy gate and must execute zero Kintone writes if either fails.

Therefore:

```text
COMMIT_ED1_FINAL_PREFLIGHT_CORRECTIVE = PASS
D1_SOURCE_CORRECTIVE_PACKAGE = PASS / ACCEPTED FOR CONTROLLED REDEPLOY
APP794_CORRECTIVE_REDEPLOY = WAITING USER AUTHORIZATION
```

## 5. Current Artifact Identity

At accepted source commit `ed1d8e8573efeb47845cc07dcd81853842ed307e`:

```text
dist/mbo-employee-app.js Git blob SHA = 2a9a3c5bfe896b51f482c016f66863bffeddb679
dist/mbo-employee.css    Git blob SHA = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

The corrective commit itself did not change either dist artifact. Future redeploy must rebuild locally first and confirm the generated target JS is source-consistent; unchanged CSS must not be uploaded.

## 6. Source Architecture Decision — Confirmed

Canonical modular source rules live in:

```text
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

No Big-Bang refactor is allowed during D1 live stabilization. The large `src/ui/employee-part-a-ui.js` decomposition begins only after the D1 live blocker is stable and must proceed one feature/menu extraction at a time.

## 7. Exact Next Action

```text
NEXT_ACTION_OWNER = User / Control Plane authorization decision
ANTIGRAVITY_REQUIRED = NO
DUPLICATE_WORK_RISK = HIGH if executor runs before authorization
```

If the user approves `App794 Corrective Redeploy`, ChatGPT will issue one exact redeploy Active Task with:
- local `npm run ui:build` + `npm test` before any remote write;
- backup/read-back of effective and Preview customization;
- strict preflight before upload;
- upload target JS only;
- preserve non-target Preview fileKeys including CSS;
- Preview PUT with exact revision;
- deploy and poll;
- post-deploy effective read-back and artifact verification;
- STOP before UAT.

## 8. Knowledge / Baseline Maintenance

Baseline promotion:
`NONE — existing SOURCE_CODE_ARCHITECTURE baseline already covers the durable architecture rule.`

Reusable Kintone skill extraction:
`NO NEW UPDATE REQUIRED — skills/kintone/safe-live-change.md already records explicit structure, exact-target fileKey preservation, valid scope, Preview/Test fileKeys, and revision concurrency safeguards.`
