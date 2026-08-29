# AI ACTIVE TASK — D1 APP794 REV47 ATTACHMENT EXECUTION-CONTEXT DIAGNOSTIC

Mode: **ANTIGRAVITY READ-ONLY DIAGNOSTIC — NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Accepted State

```text
APP794_LIVE_REVISION                  = 47
SOURCE_TEST_REVIEW                    = PASS
DEPLOYMENT_PROVENANCE_REVIEW          = PASS
PRIOR_DEPLOY_AUTHORIZATION            = CONSUMED / CLOSED
UAT_SAVE_WITH_NO_ATTACHMENT           = PASS
UAT_ADD_ONE_OBJECTIVE_ATTACHMENT      = FAIL
BASE_RECORD_SAVE_WITH_SELECTED_FILE   = PASS
OLD_FILE_FIELD_TYPE_INVALID_ERROR     = NOT OBSERVED
POST_SAVE_ATTACHMENT_PRESENT          = NO
VISIBLE_PENDING_FILE_BEFORE_SAVE      = YES
```

Additional user browser evidence:
- selected Objective file is visibly shown as Pending in Edit UI;
- Console diagnostic using `getActiveUiInstance()` did not expose a usable active UI instance (`PENDING`, `PREPARED`, `FIELD` printed `undefined` through optional access).

Treat this as a diagnostic clue only. Do not patch from assumption.

## Read ONLY

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `src/main-mbo-app.js` — only active UI + show/submit/submit.success lifecycle
4. `src/ui/employee-part-a-ui.js` — only attachment selection/preparation/finalization methods
5. `src/services/mbo-attachment-service.js`
6. `tests/timeline-truthfulness-and-attachment.test.js` — only relevant handler tests
7. `scripts/kintone/deploy-custom-ui.js` only if needed to interpret customization topology

No broad repository scan.

## Required Live Kintone READ-ONLY Diagnostic

Use only GET/read operations against App794.

1. Read current Live App794 customization configuration.
2. Read current Preview App794 customization configuration.
3. Record:
   - revision;
   - scope;
   - `desktop.js` exact entry count/order/type/name-or-URL;
   - `desktop.css` exact entry count/order/type/name-or-URL;
   - mobile entry counts if present.
4. Determine whether:
   - there is exactly one `mbo-employee-app.js` executable FILE entry;
   - another FILE or URL loads another MBO/custom bundle;
   - duplicate/legacy JS could render one UI instance while another bundle/context owns `globalThis.getActiveUiInstance`;
   - Live and Preview topology differ unexpectedly.
5. GET only. Do not upload/download replacement assets, do not PUT customization, do not deploy.

Do not expose secrets/tokens in evidence.

## Required Local Source/Test Diagnostic

Without changing source:
1. Confirm all declarations/assignments of `activeUiInstance` and `getActiveUiInstance` in current source/bundle.
2. Determine whether `activeUiInstance` can be reset/overwritten after visible UI render and before edit.submit.
3. Inspect current handler tests and state whether they actually reproduce:
   - registered `edit.show`;
   - real attachment input `change` handler;
   - visible Pending state;
   - registered `edit.submit`;
   - registered `edit.submit.success`;
   - same runtime instance/context throughout.
4. Identify the smallest **evidence-backed** root-cause branch:

```text
A. DUPLICATE / MULTIPLE CUSTOMIZATION EXECUTION
B. ACTIVE_UI_INSTANCE LIFECYCLE/CONTEXT LOSS
C. FILE INPUT STATE DOES NOT REACH THE SUBMIT-HANDLER INSTANCE
D. OTHER — specify exact evidence
```

If evidence is insufficient, say exactly what is still unknown. Do not invent a fix.

## Evidence

Append a concise `Rev47 Execution-Context Diagnostic` section to the existing:
`project-docs/D1_ATTACHMENT_PERSISTENCE_CORRECTIVE_EVIDENCE.md`

Include:
- START_HEAD;
- Live/Preview revision;
- exact customization JS/CSS topology summary;
- duplicate MBO bundle YES/NO/UNKNOWN;
- source declaration/reset findings;
- test lifecycle gap findings;
- root-cause classification A/B/C/D or UNKNOWN;
- `LIVE_KINTONE_READS_ONLY = YES`;
- `LIVE_KINTONE_WRITE = 0`;
- `SOURCE_CHANGED = NO`;
- `LIVE_DEPLOY_OCCURRED = NO`;
- final evidence commit SHA.

Commit + push **evidence only**.
STOP for ChatGPT Independent Review.

## Strict Boundary

```text
SOURCE / REFACTOR CHANGE       = NO
APP794 DEPLOY                  = NO
APP794 RECORD WRITE            = NO
APP794 ACL/SCHEMA/PROCESS      = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
ROUTING/SCORING/AUTH/RESET     = NO
D2-D7 EXECUTION                = NO
EXTERNAL SERVICE               = NO
KINTONE POST/PUT/DELETE        = NO
```

Maximum executor status:
`DIAGNOSTIC_EVIDENCE_PENDING_INDEPENDENT_REVIEW`

Do not Self-PASS.
