# AI ACTIVE TASK — APP794 EVALUATION UI V2 R4 DIFFICULTY EMPTY-STATE CORRECTION — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Current candidate: `8818477e4c5ad8d36804eb0bb68550eea019febb`
> User-reported defect date: 2026-08-26
> Kintone write/deploy authorization: **NONE**

## 1. CURRENT GATE

Core workflow remains frozen. R3 implementation exists locally/Git only and the User Visual Preview gate remains blocked by one newly reported Objective-entry UX defect.

Critical path:
`App794 Evaluation UI V2 -> R4 Difficulty Empty-State Fix -> ChatGPT Review -> User Visual Preview -> Scoring Runtime/Persistence Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

Do NOT deploy App794 in this task.

## 2. USER-REPORTED DEFECT — DIFFICULTY LOOKS SELECTED WHEN RECORD IS ACTUALLY BLANK

Observed behavior when creating a new MBO after Employee ID verification:
- `Difficulty_i` physical record value is still blank/unselected.
- UI nevertheless displays `3 : Difficult (ยาก)`.
- UI colors the field green as if it already contains a valid editable value.
- On Save, validation correctly reports that Difficulty was not selected.

This is misleading because the visual state and saved record state disagree.

Confirmed source cause in `src/ui/employee-part-a-ui.js`:
- Objective renderer uses `const diffVal = this._getVal(`Difficulty_${i}`) || '3';`
- editable Difficulty `<select>` has no explicit blank/placeholder option;
- editable Difficulty `<select>` does not declare `data-required="true"`;
- therefore `_refreshSingleFieldHighlight()` cannot present blank Difficulty as Required/Yellow.

## 3. REQUIRED BEHAVIOR

For every active Objective row:

### Blank record value
If `Difficulty_i` is blank/null/undefined:
- do NOT substitute Level 3 or any other business value;
- editable select must show a blank placeholder such as:
  `-- กรุณาเลือกระดับความยาก / Please select --`
- placeholder value must be exactly empty string `""`;
- field must have `data-required="true"`;
- field state must render Yellow / `ต้องกรอก / Required` before Save;
- no green Editable state while value is blank.

### Selected record value
If actual record value is `1`, `2`, `3`, or `4`:
- display the exact stored value;
- field may display Green / Editable when editable;
- no change to existing Difficulty validation/business scale.

### Read-only/review statuses
If Difficulty is blank on a locked/read-only Objective screen:
- do NOT display `Level 3`;
- show a neutral missing value such as `ยังไม่ได้ระบุ / Not selected`;
- preserve locked/read-only styling.

### Persistence
- UI display must always reflect the actual record value.
- Do not write default `3` into the record merely by rendering.
- User selection 1–4 must continue to sync through the existing field-change path.

## 4. SCOPE

Prefer modifying only:
- `src/ui/employee-part-a-ui.js`
- `tests/objective-save-validation.test.js`
- generated `dist/mbo-employee-app.js`
- concise living evidence docs

Do not change:
- Difficulty scale 1–4;
- ValidationEngine business requirements except only if a focused test exposes an existing mismatch;
- workflow/routing/Record_Key;
- scoring formulas;
- App796;
- schema;
- Process Management;
- attachments;
- Appraiser logic.

Preserve all R1/R2/R3 accepted UI work.

## 5. REQUIRED TESTS

Add focused coverage proving:
1. blank `Difficulty_1` renders an empty placeholder, not Level 3;
2. blank editable Difficulty has `data-required="true"` and Required/Yellow state;
3. actual stored `Difficulty_1 = 3` renders `3 : Difficult` normally;
4. blank read-only Difficulty does not render `Level 3` and instead shows missing/not-selected state;
5. render does not mutate blank record Difficulty to `3`;
6. existing Objective Save validation still blocks blank Difficulty;
7. existing 1–4 Difficulty values remain valid;
8. R3 regression tests remain passing.

Execution budget after implementation:
- `npm test` once;
- `npm run ui:build` once;
- no Kintone browser/UAT;
- Preview Lab local smoke only if needed to visually confirm blank vs selected Difficulty.

## 6. SAFETY

- Kintone calls required: 0
- Kintone writes: 0
- App794 deploy: NO
- workflow actions: 0
- schema/process/ACL/notification changes: 0
- other app writes: 0
- real-user workflow/notification: prohibited

## 7. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R4_DIFFICULTY_EMPTY_STATE = COMPLETE / BLOCKED
R4_EXECUTION_STARTING_HEAD = exact parent after pulling this task
DIFFICULTY_BLANK_UI_DEFAULT_REMOVED = PASS/FAIL
DIFFICULTY_BLANK_PLACEHOLDER = PASS/FAIL
DIFFICULTY_REQUIRED_YELLOW_STATE = PASS/FAIL
DIFFICULTY_STORED_3_DISPLAYS_3 = PASS/FAIL
DIFFICULTY_READONLY_BLANK_NOT_LEVEL3 = PASS/FAIL
RENDER_DOES_NOT_MUTATE_BLANK_DIFFICULTY = PASS/FAIL
BLANK_DIFFICULTY_SAVE_VALIDATION = PASS/FAIL
DIFFICULTY_1_TO_4_REGRESSION = PASS/FAIL
R3_REGRESSION = PASS/FAIL
APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS USER VISUAL PREVIEW; NO DEPLOY
```

## 8. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

**What:** remove the fake Difficulty Level 3 visual default and make blank Difficulty visibly required.

**Where:** existing Objective renderer and focused tests only.

**How:** use the actual `Difficulty_i` record value without `|| '3'`; add explicit empty select option and required metadata; render blank locked state truthfully.

**Why:** the current UI falsely tells the user that Difficulty 3 is selected while Save validation correctly treats the record as blank.

**Impact:** local candidate only; improves consistency between screen state and saved data.

**Risk:** accidentally changing existing valid Difficulty values or validation. Mitigate with blank + 1..4 regression tests.

**Test:** section 5.

**Rollback:** revert only the R4 implementation commit to candidate `8818477e4c5ad8d36804eb0bb68550eea019febb`; no Kintone rollback applies.

## 9. STOP CONDITION

Commit, push the same branch, and STOP.

Do not deploy.
Do not continue to Dashboard/Hoshin.
Next gate is ChatGPT review, then User Visual Preview if PASS.
