# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — WP1 PASS / WP2 UI FUNCTIONAL PARTITION + RUNTIME PROOF

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 remains accepted known-good. **WP1 Atomic App794 Deployment Tooling = INDEPENDENT PASS** at candidate `035b4d1fa077907f19bf8d2ef0a4177156d0319b`. WP2 now starts for Back to My MBO + My MBO card/list + Native Comment mirror/Refresh source partition and runtime integration proof. No Live deployment is authorized. HR/admin reset and remaining security UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume after current App794 UI corrective is stable |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted Current Live / Rollback Manifest

```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
TECHNICAL_READBACK     = PASS
USER_RUNTIME_SMOKE     = PASS
CURRENT_LIVE_RUNTIME   = ACCEPTED KNOWN-GOOD
```

Rev54 remains unchanged throughout WP1. No WP1 Live write occurred.

## 3. WP1 — Independent PASS

Accepted candidate:
`035b4d1fa077907f19bf8d2ef0a4177156d0319b`

Independent review confirms:
```text
CHANGED_SCOPE                        = deploy tooling + tests + evidence only
PREBUILD_SOURCE_GATE                 = PASS
MANIFEST_BEFORE_BUILD/NETWORK        = PASS
EXACT_FULL_SOURCE_SHA                = PASS
INTERNAL_GIT_HEAD                    = PASS
DIRTY_WORKTREE_FAIL_CLOSED           = PASS
PURE_DIRTY/CLEAN TESTS               = PASS
ATOMIC_JS_CSS_PAIR                   = PASS
MANDATORY_RELEASE_MANIFEST           = PASS
BYTE_EXACT_JS_CSS_IDENTITY           = PASS
BUILD_ONLY_ZERO_NETWORK              = PASS
UI_FEATURE_SOURCE_DRIFT              = NO
LIVE_KINTONE_WRITE                   = 0
LIVE_DEPLOY                          = NO
```

Executor evidence records:
- focused deployment tests PASS 26/26;
- full suite PASS 939/939;
- UI build PASS;
- build-only PASS / network calls 0;
- post-commit clean focused test PASS 26/26.

WP1 is CLOSED. Do not reopen unless later evidence demonstrates a regression.

## 4. Permanent Deployment Contract After WP1

Future App794 customization deployment must use the hardened tooling and comply with `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`.

Before a future Live deploy:
```text
KNOWN_GOOD_ROLLBACK_MANIFEST = Rev54 / ec627852... / e04aa... + 1710d...
CANDIDATE_SOURCE_COMMIT       = exact full Git HEAD
CANDIDATE_JS_IDENTITY         = exact reviewed artifact identity
CANDIDATE_CSS_IDENTITY        = exact reviewed artifact identity
CANDIDATE_SCOPE               = exact reviewed scope
CANDIDATE_TOPOLOGY            = exact reviewed topology
WORKTREE                      = clean
JS + CSS                      = atomic pair
```

No automatic rollback. Any later Live write requires a new explicit user authorization.

## 5. WP2 — UI Functional Partition + Runtime Integration Proof

User-required UI scope remains exactly:
1. **Back to My MBO** on existing Detail/Edit only.
2. **My MBO responsive card/list** preserving Employee-Self ownership/query/status semantics and zero Delete UI.
3. **Native Kintone Comment read-only mirror + Refresh** on existing Detail/Edit only.

### Canonical feature ownership target

```text
My MBO card/list
  OWNER = src/ui/employee-self-index-ui.js
  ACTION = preserve owner; improve only if required by accepted visual design

Back navigation
  CURRENT = embedded in src/ui/employee-part-a-ui.js
  TARGET OWNER = src/ui/employee-record-navigation.js
  RULE = one canonical implementation; remove embedded duplicate from EmployeePartAUI

Native Comment mirror
  CURRENT = embedded in src/ui/employee-part-a-ui.js
  TARGET OWNER = src/ui/employee-comment-mirror.js
  RULE = one canonical implementation; remove embedded duplicate from EmployeePartAUI

CSS
  OWNER = src/styles/mbo-employee.css
  RULE = keep one stylesheet for this corrective; use clearly separated feature sections; no broad CSS refactor

Runtime orchestration
  OWNER = src/main-mbo-app.js
  RULE = orchestration/wiring only; no duplicate feature logic
```

### Runtime proof required

Back navigation must be proven through the actual Kintone record orchestration path, not renderer-only unit tests:
```text
Detail existing record -> custom UI mounted -> Back visible
Edit existing record   -> custom UI mounted -> Back visible
Create record          -> Back absent
Back href/action       -> /k/{currentAppId}/ same tab
Auth/session mutation  -> none
Record write           -> none
```

Comment mirror must preserve:
- Native right-side Comments remain source of truth and place to add/reply/delete;
- custom mirror is read-only;
- current App794 record only;
- GET `/k/v1/record/comments.json` only;
- author + timestamp + body;
- safe text rendering;
- truthful pagination with no silent truncation;
- Refresh performs an actual re-fetch;
- Create performs zero comment GET;
- zero Comment POST/DELETE/reply.

My MBO must preserve:
- exact Employee_Code ownership filter;
- `order by Fiscal_Year desc`;
- prominent Fiscal Year + Status;
- Record Key secondary;
- non-completed Open MBO;
- Completed / 16 Completed View History;
- exact record URLs;
- Create New visible;
- exactly one auth bar;
- zero Delete UI.

## 6. WP2 Boundaries

WP2 is source/test/build only.

Allowed feature/source scope:
- `src/ui/employee-self-index-ui.js` only if required for the accepted card/list visual corrective;
- `src/ui/employee-part-a-ui.js` only to remove delegated Back/Comment ownership and wire dedicated modules;
- new `src/ui/employee-record-navigation.js`;
- new `src/ui/employee-comment-mirror.js`;
- `src/main-mbo-app.js` only for minimal orchestration/wiring if integration proof requires it;
- `src/styles/mbo-employee.css` only for Back/My MBO/Comment feature styles;
- focused tests directly covering these features;
- generated `dist/mbo-employee-app.js` and `dist/mbo-employee.css` from deterministic build;
- one concise WP2 evidence file.

Forbidden:
- Auth/session behavior change;
- Attachment behavior change;
- Routing/Scoring/Profile change;
- App801/App795/App796 writes;
- App794 record/schema/layout/ACL/process write;
- Kintone Comment write;
- Copy Previous MBO;
- D2-D7 implementation;
- Live customization deploy;
- rollback/recovery;
- unrelated refactor.

## 7. WP2 Release Evidence Required Before Any Deploy Authorization

WP2 must finish with an exact candidate manifest:
```text
CANDIDATE_SOURCE_COMMIT
CANDIDATE_JS_BLOB_SHA
CANDIDATE_CSS_BLOB_SHA
CANDIDATE_SCOPE = ALL
CANDIDATE_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
FEATURE_OWNER_MAP
FOCUSED_TEST_RESULT
RUNTIME_INTEGRATION_TEST_RESULT
COMMENT_PAGINATION_REFRESH_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
SOURCE_TO_DIST_TRACEABILITY
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
```

Rollback manifest remains exact accepted Rev54 until a newer Live release passes technical readback + User runtime smoke.

## 8. Current Gate

```text
CURRENT_GATE                  = WP2 UI FUNCTIONAL PARTITION + RUNTIME INTEGRATION PROOF
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST/BUILD ONLY — NO LIVE WRITE
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
WP1                           = PASS / CLOSED
WP1_ACCEPTED_CANDIDATE        = 035b4d1fa077907f19bf8d2ef0a4177156d0319b
LIVE_APP794_CUSTOMIZATION     = REV54 ACCEPTED KNOWN-GOOD
ROLLBACK_MANIFEST             = LOCKED / ec627852 + e04aa... + 1710d...
WP2_SOURCE_CHANGE             = YES / EXACT UI SCOPE ONLY
WP2_TEST_CHANGE               = YES / EXACT UI SCOPE ONLY
APP794 CUSTOMIZATION DEPLOY   = NO / NOT AUTHORIZED
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO WRITE
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
```

Maximum executor status:
`WP2_UI_CANDIDATE_IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
