# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — COMBINED EMPLOYEE UI ONE-SHOT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev51 before this authorized execution / attachment persistence PASS / long-filename UI PASS / saved attachment Preview+Download PASS incl. User Live UAT / **Back to My MBO + My MBO cards + Native Comment mirror source+verification PASS; one-shot deploy authorized** / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — scheduled after current UI deploy/UAT |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted State — Do Not Reopen Without New Evidence

```text
APP794_LIVE_CUSTOMIZATION_REVISION       = 51 BEFORE AUTHORIZED EXECUTION; executor must re-read actual pre-deploy revision
APP794_LIVE_FORM_REVISION                = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT        = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE/DEPLOYMENT   = PASS / REV51
ATTACHMENT_RETRIEVAL_USER_LIVE_UAT       = PASS
ALL_ATTACHMENT_DEPLOY_AUTHS              = CONSUMED / CLOSED
```

Protected accepted behavior includes attachment persistence, atomic edit preflight, long filename containment, Preview/Download MIME safety, single-popup behavior, read-only retrieval, and existing Remove semantics.

## 3. Combined Employee UI Release Candidate — INDEPENDENT PASS

Reviewed release candidate commit:
`ea5254370360321d18bd768f379986609c241850`

Reviewed generated bundle identities:
```text
DIST_JS_BLOB_SHA  = a4975fc219269268bf2a0caffd084d233fa3e29a
DIST_CSS_BLOB_SHA = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

The candidate contains all three user-requested UI features:
1. Existing Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`; Create hides it.
2. My MBO home: responsive record-card/list UI; exact `Employee_Code = "{code}" order by Fiscal_Year desc`; non-completed = Open MBO; completed = View History; unchanged record URLs; zero Delete UI.
3. Existing Detail/Edit: Native Kintone Comment read-only mirror + Refresh using current record comments.

Independent verification evidence commit:
`aee5d7bc33e8c24f0d60f5a0b6865ca1f7d64766`

```text
FOCUSED_NAVIGATION_TESTS         = PASS 8/8
FOCUSED_COMMENT_TESTS            = PASS 8/8
EMPLOYEE_PART_A_REGRESSION       = PASS 73/73
FULL_NPM_TEST                    = PASS 931/931
UI_BUILD                         = PASS
MODULE_AWARE_BUILD_ONLY          = PASS / 0 Live Kintone network calls
LIVE_KINTONE_WRITE               = 0
LIVE_COMMENT_WRITE               = 0
LIVE_DEPLOY_OCCURRED             = NO
```

Post-candidate commits up to authorization pre-head `442d7f7e8961ebba4020ae2fc547b171cf6db13b` are control/evidence only; no accepted source/test/dist drift occurred.

## 4. User Deployment Authorization

Authorization ID:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`

```text
AUTHORIZATION_TYPE       = ONE-SHOT
AUTHORIZATION_STATUS     = AUTHORIZED / UNCONSUMED
AUTHORIZED_BY            = USER
AUTHORIZED_DATE          = 2026-08-29
TARGET_APP               = App794
TARGET_SCOPE             = DESKTOP CUSTOMIZATION JS/CSS ONLY
REVIEWED_CANDIDATE       = ea5254370360321d18bd768f379986609c241850
REVIEWED_JS_BLOB_SHA     = a4975fc219269268bf2a0caffd084d233fa3e29a
REVIEWED_CSS_BLOB_SHA    = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
FORWARD_DEPLOY_ATTEMPTS  = MAXIMUM 1
```

This authorization permits exactly one forward App794 Desktop customization deployment attempt of the reviewed candidate. The authorization becomes **CONSUMED immediately when the first forward deployment attempt is made**, whether the attempt succeeds, fails, or is followed by rollback. It cannot be reused for a second forward attempt.

### Authorized write
- App794 Desktop customization JS/CSS update required to deploy the exact reviewed candidate.

### Forbidden writes / changes
- no source or test change during deploy execution;
- no App794 form/schema/layout write;
- no App794 business-record write;
- no Kintone Comment POST/DELETE/reply;
- no ACL/process write;
- no mobile customization change;
- no unrelated customization entry add/remove/reorder;
- no Auth/Session behavior change;
- no Attachment behavior change;
- no Routing/Scoring/profile change;
- no App801/App795/App796 write;
- no Copy Previous MBO;
- no D2-D7 execution;
- no external service/storage.

## 5. Mandatory Deploy Safety Gates

Before first Live write, Antigravity must:
1. fetch latest canonical branch and read `AI_CONTROL_CENTER.md` + `AI_ACTIVE_TASK.md`;
2. verify this exact authorization is present and UNCONSUMED;
3. verify the source candidate remains exactly `ea5254370360321d18bd768f379986609c241850` with no production source/test/dist drift after it except control/evidence docs;
4. run deterministic preflight;
5. run focused tests only if the deploy tooling/preflight requires them; no source/test edits;
6. run `npm run ui:build` and verify generated Desktop JS/CSS identities match the reviewed candidate exactly;
7. run module-aware `--build-only` and prove 0 Live Kintone calls/writes;
8. read actual current App794 customization revision/settings/topology and current JS/CSS identities;
9. capture a rollback snapshot/reference of the exact pre-deploy customization before first write.

Expected prior known topology is Scope ALL / 1 Desktop JS / 1 Desktop CSS / 0 Mobile, but executor must trust the actual pre-deploy readback rather than assumption. Unexpected topology or candidate mismatch => STOP before deployment.

## 6. Post-Deploy Required Readback

After the single deployment attempt, executor must record:
- Kintone deployment result / SUCCESS or definitive failure;
- post-deploy App794 customization revision;
- post-deploy customization topology;
- post-deploy JS/CSS identities;
- exact candidate readback match;
- mobile customization unchanged;
- zero forbidden writes.

If deployment succeeds but readback does not exactly match the reviewed candidate and an exact safe rollback to the captured snapshot is available, rollback only to that captured pre-deploy state and STOP. A rollback does **not** restore/reopen this authorization and no second forward deployment is allowed.

## 7. Current Gate

```text
CURRENT_GATE                  = D1 COMBINED EMPLOYEE UI AUTHORIZED DEPLOY EXECUTION
CURRENT_MODE                  = ANTIGRAVITY ONE-SHOT LIVE CUSTOMIZATION DEPLOY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
AUTHORIZATION_ID              = APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01
AUTHORIZATION_STATUS          = AUTHORIZED / UNCONSUMED
REVIEWED_RELEASE_CANDIDATE    = ea5254370360321d18bd768f379986609c241850
SOURCE_REVIEW                 = PASS
VERIFICATION_REVIEW           = PASS
APP794 CUSTOMIZATION DEPLOY   = AUTHORIZED ONCE
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO WRITE
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO WRITE
COPY PREVIOUS MBO             = NOT YET
```

Maximum executor status after an attempted deployment:
`DEPLOYED_PENDING_INDEPENDENT_REVIEW`.

Antigravity must not self-PASS and must not perform User Live UAT.