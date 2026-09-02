# MBO2026 — CHAT HANDOFF

> Canonical continuation document for a new ChatGPT conversation.  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

**Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.**

## 1. Operating model

```text
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT / BOUNDED execution only when necessary
Claude = READ-ONLY second reviewer only when materially useful
NO_FALSE_PASS = YES
EXECUTOR_CANNOT_SELF_CERTIFY = YES
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
NO_LIVE_KINTONE_WRITE_OR_DEPLOY_WITHOUT_EXACT_OWNER_AUTH = YES
COMPLETE_D2_FULLY_BEFORE_D3 = YES
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 17 OF 20
ROUNDS_REMAINING = 3
```

## 2. Startup order

1. fresh-fetch current HEAD;
2. `CHAT_HANDOFF.md`;
3. `AI_CONTROL_CENTER.md`;
4. `AI_ACTIVE_TASK.md`;
5. `AI_DOCUMENT_INDEX.md`;
6. `00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `EXCEL_EXPORT.md` for D2;
8. `CONFIRMED_BASELINE/README.md` and only directly relevant Baselines;
9. exact current source/tests/diff only when required.

## 3. D1–D7 scoreboard

| ID | Status | Checkpoint |
|---|---|---|
| D1 | ✅ PASS / CLOSED | Frozen unless proven regression |
| D2 | 🟠 IN PROGRESS | Preservation PASS/CLOSED; Reference-Image PASS/CLOSED; Part A R4-R2 TEST-ONLY authorized |
| D3 | ⏸ HOLD | No write authorization; complete D2 first |
| D4 | 🟠 IN PROGRESS / NOT ACTIVE | Lifecycle operations mandatory |
| D5 | 🟠 IN PROGRESS / NOT ACTIVE | Fresh route/identity required |
| D6 | 🔴 PENDING | Integrated E2E/security/lifecycle regression |
| D7 | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 4. Frozen D2 foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R30 = PASS / CLOSED
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R36 = PASS / CLOSED
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 5. Latest review — D2-WP003-R4-R1

Authorization:
`D2-WP003-R4-R1-TEST-20260902-01`

Authorization commit:
`8b0eb2ca2058c458c40286b6b2d5f55bdb34d703`

Implementation commit:
`8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6`

```text
R4-R1_SCOPE_REVIEW = PASS
R4_SOURCE_REVIEW = PASS / FROZEN
R4-R1_PROOF_REVIEW = FAIL / ACCEPTED ABSOLUTE PAGE-SETUP ASSERTIONS REGRESSED
R4-R1_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
D2_PART_A_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
```

Accepted/frozen R4-R1 progress:
- exact rowRefs sequence and uniqueness proof added;
- sheetNames and sheetStates equality added;
- main-sheet `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, `sheetRels` baseline equality added;
- all accepted R4 merge/row/sentinel/dimension/print-area/relationship/media/formula proof remains.

Remaining defect:
- R4-R1 removed previously accepted absolute per-count assertions `paperSize = 8`, `orientation = landscape`, `scale = 58` and replaced them only with baseline-relative equality. R4-R2 must restore those constants while retaining every current R4/R4-R1 assertion.

R4 source implementation `bf9ef7e82c78efc2e725614046745a3ccf394054` remains PASS/FROZEN.

## 6. Exact current gate — R4-R2 AUTHORIZED

Owner explicitly authorized `D2-WP003-R4-R2 TEST-ONLY` on 2026-09-02.

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R4-R2
ACTIVE_WORK_PACKAGE_NAME = PART A ABSOLUTE PAGE-SETUP ASSERTION RETENTION CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
OWNER_APPROVAL_BASELINE_HEAD = f566fa300818e53e78342710332573e0294d4c4b
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R2-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
ANTIGRAVITY = AUTHORIZED ONLY FOR R4-R2 / ONE BOUNDED TEST-ONLY COMMIT
CLAUDE = STOP / NOT NEEDED
D3 = HOLD
```

Allowed file only:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

Do not modify accepted R4 source. Do not remove any accepted R4/R4-R1 proof. Do not start Part B or any next work package.

## 7. D2 remaining path after Part A closure

1. Part B competency insertion structural matrix;
2. formula/no-formula authority;
3. production sanitizer/XLSX renderer;
4. combined Excel parity;
5. PDF parity;
6. export authorization/security/privacy regression;
7. final independent D2 closure.
