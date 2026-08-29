# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — REV56 USER UAT FAIL / WP2 R3 CSS RUNTIME ROOT-CAUSE PROVEN / TABLE UI CORRECTIVE OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🔴 App794 Live Revision 56 technical transport/readback passed, but **USER UAT FAILED**. Comment data loading is now PASS. User runtime Console proves My MBO, Back, and Comment DOM elements exist, but the feature CSS rules are not being applied at runtime. WP2 R3 source/test/dist corrective is open. User also clarified the desired presentation: My MBO must be a structured table, and Comment Mirror must use a compact structured table matching the supplied reference style. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume only after WP2 Live UAT is accepted |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Live App794 Truth

```text
LIVE_REVISION             = 56
DEPLOYED_SOURCE_COMMIT    = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
LIVE_SCOPE                = ALL
LIVE_TOPOLOGY             = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY          = 79787f75a1edf0721d7d6ac71216a1366599f3e0
LIVE_CSS_IDENTITY         = b6f77930256378cbe1e190932103dfecea174fbc
EXECUTOR_TECH_READBACK    = PASS / EXACT PAIR
USER_RUNTIME_UAT          = FAIL
```

Rev56 is not accepted known-good. No Live authorization is active.

## 3. Runtime Diagnostic — PROVEN BY USER CONSOLE

### My MBO index
```text
CARD_LIST_EXISTS     = true
CARD_EXISTS          = true
CARD_LIST_DISPLAY    = block      # expected grid from source CSS
CARD_PADDING         = 0px        # expected ~18px
CARD_BORDER_TOP      = 0px none   # expected visible blue top border
```

Meaning: JS DOM/class hooks exist. The new feature CSS is not active in browser computed style.

### Existing Detail
```text
MBO_ROOT_EXISTS      = true
BACK_EXISTS          = true
BACK_TEXT            = ← กลับหน้า My MBO / Back to My MBO
BACK_BACKGROUND      = transparent/default instead of navy button style
COMMENT_EXISTS       = true
COMMENT_PADDING      = 0px
COMMENT_BORDER       = 0px / none
```

Meaning: Back is not missing from JS. Comment container is not missing. Both are present but unstyled because their CSS rules are not being applied.

This changes the diagnosis:
- DO NOT rewrite Back wiring unless a regression test proves it is broken.
- DO NOT solve by copying all feature CSS into inline styles.
- Fix the stylesheet parse/scope/cascade/runtime applicability problem at its source.

## 4. User-Accepted Presentation Direction

### My MBO
User explicitly wants a **table**, not the current card/loose-text presentation.
Required columns:
1. Fiscal Year
2. Status
3. Record Key
4. Action

Preserve Create New MBO above the table, Employee_Code self filter, Fiscal_Year desc, exact record URLs, Completed -> View History, non-completed -> Open MBO, one auth bar, zero Delete.

### Back to My MBO
Existing DOM behavior is correct. After CSS is fixed, it must visibly render as a prominent blue Back button/bar at the top of Detail/Edit. Create remains absent.

### Comment Mirror
Comment DATA is PASS and must not regress. Presentation must become a compact read-only table aligned with the Workflow Action Timeline visual language.
Required columns:
1. #
2. ผู้แสดงความคิดเห็น / Author
3. วัน-เวลา / Date & Time
4. ความคิดเห็น / Comment

Header must keep bilingual title/read-only notice and compact Refresh action. Empty state must be a clean full-width table row. No write/reply/delete controls.

## 5. Deployment Authorization Ledger

```text
APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01 = CONSUMED / CLOSED
SECOND_DEPLOY                                  = NOT AUTHORIZED
ROLLBACK                                       = NOT AUTHORIZED
```

## 6. Current Gate

```text
CURRENT_GATE                  = WP2 R3 CSS RUNTIME FIX + TABLE UI CORRECTIVE
CURRENT_MODE                  = SOURCE / TEST / DIST ONLY — NO LIVE WRITE
LIVE_APP794_REVISION          = 56 / USER UAT FAIL
COMMENT_DATA_LOAD             = PASS
CSS_FEATURE_RULE_APPLICATION  = FAIL / RUNTIME PROVEN
MY_MBO_TABLE_UI               = REQUIRED
BACK_DOM                      = PASS / STYLE FAIL
COMMENT_TABLE_UI              = REQUIRED
LIVE_DEPLOY_AUTHORIZED        = NO
APP794_RECORD_WRITE           = NO
APP794_FORM_SCHEMA_LAYOUT     = NO
APP794_ACL_PROCESS            = NO
KINTONE_COMMENT_WRITE         = NO
APP801_APP795_APP796          = NO WRITE
COPY_PREVIOUS_MBO             = NO
D2_D7_EXECUTION               = NO
```

Do not create another Live deploy task until the R3 candidate is independently reviewed and a fresh explicit user authorization is given.