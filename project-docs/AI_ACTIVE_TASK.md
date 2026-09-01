# AI ACTIVE TASK — D2-WP003-R3-R2 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / RAW OOXML FEASIBILITY PROOF / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R1 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R2
ACTIVE_WORK_PACKAGE_NAME = RAW OOXML STRUCTURE + PRIVACY FEASIBILITY PROOF
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R2-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Correct only the XLSX feasibility proof. R3-R2 must prove that bounded raw OOXML surgery can safely preserve the accepted legacy templates before any production sanitizer/renderer or sanitized workbook publication is authorized.

R3-R2 is **not** a production export package.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

`xlsx-populate@1.21.0` is already pinned. No dependency/package change is authorized.

No other repository path may change.

## 3. Source identity

Use only local originals matching exactly:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.

If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.

Never log/print/commit source employee/sample values.

## 4. Low-credit read order

Fresh-fetch canonical branch first, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
5. `tests/mbo-xlsx-ooxml-feasibility.test.js`
6. `package.json`
7. exact local owner templates after SHA verification

No whole-repo scan.

## 5. No-binary rule

Do NOT commit or publish:
- `.xlsx`, `.xls`, `.xlsm`, `.zip`;
- images/media extracted from workbooks;
- disposable outputs;
- `assets/export-templates/**`.

Disposable workbook data may exist only in memory or ignored temporary paths and must not appear in Git diff.

## 6. Mandatory architecture

For structural insertion:
- `xlsx-populate` may provide workbook loading/reparse and access to its ZIP package;
- DO NOT use `sheet.row()` / `sheet.cell()` loops to shift existing rows or emulate insertion;
- mutate the relevant raw OOXML strings/package entries directly;
- use bounded transformations against the exact accepted template structure;
- tests must inspect the resulting raw OOXML independently.

High-level worksheet value-copying is not acceptance.

If bounded raw mutation cannot be made safe with existing dependencies, STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 7. Full no-op parity proof

Before mutation, load/output/reparse each exact template and independently compare material structure before vs after.

Part A must prove:
- sheet count/order/name unchanged;
- print area `A1:BJ52`;
- Excel paperSize `8` / A3;
- landscape;
- scale `58`;
- merge count `193`, derived from raw `<mergeCell>` refs with no fallback;
- representative row heights and column widths unchanged;
- drawing relationship/media inventory unchanged;
- valid reparse.

Part B must prove:
- two-sheet count/order/name unchanged, including second `Sheet1`;
- print area `A1:X35`;
- paperSize `9` / A4;
- portrait;
- scale `75`;
- `centerHorizontal="1"` preserved;
- sheet protection presence/state preserved;
- merge count `79`, derived from raw refs with no fallback;
- representative row heights and column widths unchanged;
- drawing/media inventory unchanged;
- valid reparse.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 8. Frozen header/value geometry

Use these exact accepted ranges.

Part A:
```text
TITLE = B6:M7
FISCAL_YEAR_VALUE_MERGED = N6:Q7
DEPARTMENT_LABEL = Z6:AF6
DEPARTMENT_VALUE = Z7:AF7
SECTION_LABEL = AG6:AL6
SECTION_VALUE = AG7:AL7
START_DATE_LABEL = AM6:AP6
START_DATE_VALUE = AM7:AP7
EMP_ID_LABEL = AQ6:AS6
EMP_ID_VALUE = AQ7:AS7
EMP_NAME_LABEL = AT6:BC6
EMP_NAME_VALUE = AT7:BC7
POSITION_LABEL = BD6:BI6
POSITION_VALUE = BD7:BI7
```

Part B:
```text
TITLE = B2:F3
FISCAL_YEAR_VALUE_MERGED = G2:H3
DEPARTMENT_LABEL = J2:L2
DEPARTMENT_VALUE = J3:L3
SECTION_LABEL = M2:O2
SECTION_VALUE = M3:O3
POSITION_LABEL = P2:Q2
POSITION_VALUE = P3:Q3
EMP_ID_LABEL = R2
EMP_ID_VALUE = R3
EMP_NAME_LABEL = S2:W2
EMP_NAME_VALUE = S3:W3
```

Fiscal Year is a deliberate merged-value exception; do not treat `N6` or `G2` as ordinary static label cells.

Header proof must:
- fingerprint all listed label/title regions using addresses + non-sensitive hashes;
- mutate/clear every listed runtime value region only;
- reparse;
- prove all label/title fingerprints unchanged;
- prove every intended value region changed/cleared;
- prove no unrelated header cell changed.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 9. Range-driven privacy proof

`sharedStrings.xml` keyword heuristics are forbidden as the source of truth.

Define an explicit bounded sensitive address/range map covering at minimum:
- identity/name/employee code;
- department/section/position/start date;
- Fiscal Year sample value;
- Hoshin/sample plan/business text;
- objective/action/target/result fields;
- self evaluation;
- manager/GM/appraiser evaluation;
- evaluator/signature/name/date areas;
- scores/grades/summary values;
- legacy Difficulty sample values.

Proof steps:
1. Resolve and collect values from those designated source ranges in memory by actual cell type: shared string, inline string, numeric/date/boolean where present.
2. Do not log values; logs/errors may include only safe addresses, counts, part names and hashes.
3. Clear the designated sensitive cells/ranges on a disposable copy while preserving style ids, merges and static labels.
4. Reparse and directly prove all designated ranges are empty.
5. For collected text values, scan all OOXML XML/text parts and prove those values do not remain.
6. If shared-string cleanup is needed, it must be driven only by values/references collected from the explicit sensitive range map, never by keyword classification.
7. Prove zero worksheet scoring formulas were introduced.

If the range map or safe shared-string cleanup cannot be established, STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 10. Reference-image removal proof

Frozen target on Part A:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

The target is the historical/reference screenshot.

On a disposable package:
- find the drawing anchor/object whose `a:blip` embeds `rId3`;
- remove exactly that anchor/object;
- remove exactly `rId3` from drawing relationships;
- remove `xl/media/image3.png` if orphaned;
- update package metadata/content types only if required for valid reparse;
- preserve `rId1 -> image1.jpeg` and `rId2 -> image2.jpeg`;
- preserve every other non-target drawing relationship/anchor/media that exists in the source;
- reparse successfully.

Tests must inspect raw drawing XML, drawing rels and ZIP members directly.

If the target cannot be removed without affecting non-target graphics, STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 11. TRUE Part A raw OOXML insertion

Raw worksheet target: `xl/worksheets/sheet1.xml`.

Each scenario starts from a fresh source buffer.

### 4 objectives
- no insertion;
- lower section remains row 29;
- dimension/print area stay legacy;
- print area `A1:BJ52`.

### 5 objectives
- insert exactly one structural clone of row 28 as new row 29;
- shift every existing raw row `29+` by +1;
- rewrite every affected raw row `r` and cell `r` reference;
- shift every merge/ref/range that crosses or starts at the insertion boundary where structurally required;
- update worksheet dimension;
- update workbook Print_Area to `A1:BJ53`;
- old row-29 structural content must be present at row 30.

### 10 objectives
- insert six structural clones of row 28 at rows 29:34;
- shift every existing raw row `29+` by +6;
- rewrite affected row/cell/merge/range references;
- update dimension;
- update Print_Area to `A1:BJ58`;
- old row-29 structural content must be at row 35;
- objective slot 10 is row 34.

Inserted rows must preserve representative row-28:
- row height;
- cell population/addresses after renumbering;
- style ids;
- merge structure after shifted/cloned refs;
- border/alignment/number-format references embodied by styles.

After reparse preserve Part A paperSize8/A3, landscape, scale58.

Tests must inspect raw OOXML; sentinel movement alone is insufficient.

Failure => STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 12. TRUE Part B raw OOXML block insertion

Raw worksheet target: Part B `xl/worksheets/sheet1.xml`.

Frozen source structural block: rows `27:30`.

### 6 competencies
- no insertion;
- totals/signatures start row31;
- print area `A1:X35`.

### 8 competencies
- shift every existing raw row `31+` exactly +8;
- rewrite affected row/cell/merge/range refs;
- clone source block rows 27:30 twice into rows 31:34 and 35:38 with cell refs renumbered;
- update worksheet dimension;
- update Print_Area to `A1:X43`;
- old row31 structural content must be at row39.

Inserted blocks must preserve representative source-block:
- row heights;
- cell/style ids;
- merged ranges;
- border/alignment structure.

After reparse preserve Part B paperSize9/A4, portrait, scale75, horizontal centering and sheet protection state.

Tests must inspect raw OOXML; sentinel-only proof is insufficient.

Failure => STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 13. Difficulty

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not read/invent any application `Difficulty_*` field and do not modify normalizer/export-service.

Privacy proof must directly confirm all designated legacy Difficulty cells/ranges are blank on the disposable sanitized structure.

## 14. Mandatory commands

Run:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit, only the two authorized files may differ. After commit/push, working tree must be clean.

No GitHub CI exists; report local evidence exactly and stop for independent source review.

## 15. Forbidden

Do NOT:
- modify `package.json` / `package-lock.json`;
- add dependencies;
- commit/publish workbook/image/binary output;
- create production sanitizer/renderer;
- modify export service/normalizer/application code;
- implement Difficulty fields;
- implement PDF/UI;
- access or write Live Kintone;
- deploy;
- start another Work Package.

## 16. Completion contract

Push only the smallest changes in the two authorized proof files.

Final executor status must be exactly one of:
```text
FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_XLSX_LIBRARY_PARITY
BLOCKER_HEADER_VALUE_MAP_UNRESOLVED
BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED
BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED
BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE
```

Antigravity must not declare PASS/CLOSED.

Final report <=18 concise lines and include:
- proof commit SHA;
- exact changed filenames;
- template SHA verification;
- no-op parity result;
- header/value result;
- privacy result;
- image-removal result;
- Part A 4/5/10 raw structural result;
- Part B 6/8 raw structural result;
- Difficulty blank result;
- test pass/fail counts;
- `npm audit --omit=dev` result;
- confirmation no binary/application/Kintone/deploy changes;
- final status.

## 17. Authorization ledger

```text
D2-WP001-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP001-R1-SOURCE-20260901-01 = CONSUMED / CLOSED / DO NOT REUSE
D2-WP002 = APPROVED / READ-ONLY / CLOSED
D2-WP003-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R1-SOURCE-20260901-01 = CONSUMED / INVALIDATED / PURGED / DO NOT REUSE
D2-WP003-R2-SOURCE-20260901-01 = CONSUMED / REVIEWED / PURGED / DO NOT REUSE
D2-WP003-R3-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R1-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R2-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R2-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
```

Authorization is consumed when the R3-R2 proof commit is pushed for independent review or invalidated by any scope/dependency change.
