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
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 18 OF 20
ROUNDS_REMAINING = 2
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
| D2 | 🟠 IN PROGRESS | Preservation PASS/CLOSED; Reference-Image PASS/CLOSED; Part A Structural PASS/CLOSED; Part B R5 proposed / not authorized |
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
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054
R4-R2_IMPLEMENTATION_COMMIT = 98da94a07259effd95dcf539de3454b1f94745a8
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Durable Part A closure authority:
`project-docs/CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`

Do not reopen preservation, reference-image or Part A without a newly proven regression.

## 5. Part B READ-ONLY planning result

Planning baseline before proposal docs:
`c67c93a7bec6d2a753855073360eb469d33859b9`

Repository inspection proves the current Part B feasibility path is incomplete for the full allowed structural range:
- owner template main sheet `(Part B) Competency` is the 6-competency baseline;
- one competency block is the complete 4-row block `27:30`;
- summary/downstream content starts at row `31`;
- `getStructuralPartBBuffers()` currently returns only `bufB6` and `bufB8`;
- the 8-competency path is hard-coded to `extraRows = 8`, clones rows `27:30` to `31:34` and `35:38`, shifts original rows/cells/merges at `>=31` by 8, changes dimension to row 43 and print area to `X43`;
- the existing structural test covers only 6 and 8 competencies and proves only merge counts plus print-area suffixes.

Therefore TEST-ONLY is insufficient for a real 6/7/8 production-path feasibility matrix. The smallest safe proposed scope is the existing feasibility source helper plus its existing test file.

## 6. Proposed next work package — NOT AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R5
PROPOSED_WORK_PACKAGE_NAME = PART B COMPETENCY INSERTION STRUCTURAL MATRIX CLOSURE
PROPOSED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
PLANNING_BASELINE_HEAD = c67c93a7bec6d2a753855073360eb469d33859b9
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
D3 = HOLD
```

Proposed writable files only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

R5 should generalize the existing Part B helper to a real 6/7/8 competency matrix using the current 4-row block algorithm, then prove exact row/block relocation, full merge-set equality, dimensions/print areas, non-target workbook invariants, auxiliary `Sheet1` stability, relationship/media preservation and zero formulas.

No Part B authorization exists yet. Do not call Antigravity until the Owner explicitly authorizes R5.

## 7. Important privacy follow-up boundary

The currently accepted Part B privacy/source classification is for the 6-block owner-template address layout. Expanded 7/8-block structures occupy rows that are summary rows in the source layout. R5 is structural-only and must NOT change privacy/sanitization logic. Before production renderer/security closure, expanded Part B role/address mapping must be resolved explicitly instead of blindly reusing source absolute row ranges.

## 8. D2 remaining path

1. Part B competency insertion structural matrix;
2. formula/no-formula authority;
3. production sanitizer/XLSX renderer, including expanded Part B privacy/address remapping;
4. combined Excel parity;
5. PDF parity;
6. export authorization/security/privacy regression;
7. final independent D2 closure.
