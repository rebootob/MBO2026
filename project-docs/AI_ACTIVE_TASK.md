# AI ACTIVE TASK — D2-WP003-R3-R3 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / RAW OOXML MERGE + PRIVACY PROOF COMPLETION / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R2 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R3
ACTIVE_WORK_PACKAGE_NAME = RAW OOXML MERGE + PRIVACY PROOF COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R3-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Complete the existing R3-R2 raw-OOXML feasibility proof. Do not redesign the architecture and do not build production export code.

R3-R3 must close only the remaining proof gaps:
- cloned merge structures;
- complete raw structural assertions;
- explicit range-driven privacy with no sensitive logging;
- complete header/value proof;
- orphan-safe reference-image removal;
- complete original-vs-roundtrip parity.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No dependency/package change is authorized. No other repository path may change.

## 3. Source identity

Use only local originals matching exactly:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit source employee/sample values.

## 4. Low-credit read order

Fresh-fetch canonical branch first, then read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/EXCEL_EXPORT.md`
4. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
5. `tests/mbo-xlsx-ooxml-feasibility.test.js`
6. `package.json`
7. exact owner templates after SHA verification

No whole-repo scan.

## 5. No-binary rule

Do NOT commit or publish `.xlsx`, `.xls`, `.xlsm`, `.zip`, extracted images/media, disposable outputs, or `assets/export-templates/**`.

Disposable workbook data may exist only in memory or ignored local temporary paths and must not appear in Git diff.

## 6. Architecture is frozen

Preserve the R3-R2 raw-OOXML approach:
- `xlsx-populate@1.21.0` may load/reparse and expose ZIP package parts;
- raw worksheet/XML/package entries are the mutation surface;
- do NOT return to high-level `sheet.row()` / `sheet.cell()` loops to shift structural rows;
- tests inspect resulting raw OOXML directly.

If bounded raw mutation cannot be made safe, STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 7. Full no-op parity — complete before/after proof

For both exact source templates, compare original package vs load/output/reparse package.

Part A must prove:
- one sheet; exact name/order;
- Print_Area `A1:BJ52`;
- paperSize `8`, landscape, scale `58`;
- exact raw merge-ref set/count = 193;
- exact `<cols>` structural fingerprint unchanged;
- explicit row-height map/fingerprint unchanged;
- worksheet dimension unchanged;
- drawing relationship inventory and media member inventory unchanged;
- successful reparse.

Part B must prove:
- two sheets in exact order: `(Part B) Competency`, `Sheet1`;
- Print_Area `A1:X35`;
- paperSize `9`, portrait, scale `75`, `centerHorizontal="1"`;
- sheet-protection structural fingerprint unchanged;
- exact raw merge-ref set/count = 79;
- exact `<cols>` structural fingerprint unchanged;
- explicit row-height map/fingerprint unchanged;
- worksheet dimension unchanged;
- drawing/media inventory unchanged;
- successful reparse.

No expected-value fallback is allowed when metadata is missing.
Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 8. Frozen header/value geometry

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

Header proof must:
1. fingerprint every frozen title/static-label region by safe structural/content hash;
2. mutate/clear every listed runtime value region only;
3. reparse;
4. prove every static fingerprint unchanged;
5. prove every runtime value region changed/cleared;
6. prove no unrelated header cell XML changed.

Do not treat `N6` or `G2` as labels; they are merged Fiscal-Year value anchors.
Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 9. Explicit privacy range map — shared-string heuristic authority is forbidden

The script must declare an explicit bounded sensitive map as the source of truth. It may be represented as named exact cells/ranges but MUST be inspectable by the test.

At minimum the Part A map must cover:
- all runtime header values in section 8;
- Department Hoshin `G16:AF19`;
- Section Hoshin `AM16:BI19`;
- objective/evaluation rows `B25:BI28`;
- score/summary area `BC29:BI35`;
- objective approval/signature area `B37:S42`;
- evaluator/name/date area `AI37:AY42` where source cells exist;
- overall score areas `B47:N50`;
- legacy Difficulty sample values inside objective rows.

The Part B map must explicitly enumerate the dynamic/sample cells/ranges in rows 2:34 while excluding frozen title/label regions and static competency/rating description text. If an exact dynamic range cannot be distinguished safely from static content, STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` rather than clearing the whole block.

Proof requirements:
1. resolve values only from the explicit mapped cells/ranges;
2. collect actual source values in memory by type: shared string, inline string, numeric/date, boolean where present;
3. do not log values; errors may include only safe address, count, part name, relationship id, or hash;
4. clear mapped sensitive cells while preserving styles/merges/static labels;
5. output/reparse and independently prove all mapped sensitive cells are empty;
6. for mapped collected text only, scan all XML/text parts and prove it no longer survives;
7. any shared-string cleanup must be driven only by mapped source references/values, never keyword classification;
8. remove or stop using `extractSensitiveTokensFromBinary()` as privacy authority;
9. introduce zero worksheet scoring formulas.

Tests MUST NOT interpolate source-sensitive values in assertion messages.

## 10. Reference-image removal — orphan-safe and complete inventory proof

Frozen Part A target:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Required sequence:
1. snapshot complete drawing-anchor, drawing-rel and media-member inventory using safe ids/targets/hashes;
2. remove only the anchor/object embedding `rId3`;
3. remove only `rId3` relationship;
4. search remaining package relationships for references to `image3.png`;
5. remove `xl/media/image3.png` only if proven orphaned;
6. preserve `rId1 -> image1.jpeg`, `rId2 -> image2.jpeg`, and every other non-target anchor/relationship/media entry;
7. reparse;
8. compare non-target inventory before/after exactly.

Failure => STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 11. Part A merge-complete raw insertion proof

Raw target: `xl/worksheets/sheet1.xml`.

### 4 objectives
- no insertion;
- row29 remains row29;
- dimension and Print_Area remain legacy `A1:BJ52`.

### 5 objectives
- insert one raw clone of row28 as row29;
- shift all original rows29+ by +1;
- rewrite raw row/cell refs;
- enumerate all source merge refs structurally belonging to row28 and clone them to row29;
- shift all affected existing merge refs at/crossing insertion boundary correctly;
- update `<mergeCells count>` if present;
- update dimension and Print_Area to `A1:BJ53`;
- old row29 structural content is row30.

### 10 objectives
- clone row28 to rows29:34;
- shift all original rows29+ by +6;
- clone row28 merge pattern independently for every inserted row29:34;
- shift affected existing merge refs;
- update `<mergeCells count>` if present;
- update dimension and Print_Area to `A1:BJ58`;
- old row29 structural content is row35; objective slot10 is row34.

Tests must independently inspect:
- unique/sorted raw row refs and cell refs;
- representative row28 height and style ids vs inserted rows;
- exact expected cloned merge-ref patterns;
- merge count consistency;
- dimension;
- Print_Area;
- paperSize8/landscape/scale58 after reparse.

If an existing merge crosses the insertion boundary and cannot be transformed unambiguously, STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 12. Part B merge-complete raw block insertion proof

Raw target: Part B `xl/worksheets/sheet1.xml`.
Frozen source block: rows27:30.

### 6 competencies
- no insertion;
- totals/signatures start row31;
- print area `A1:X35`.

### 8 competencies
- shift every original row31+ by +8;
- clone source rows27:30 into rows31:34 and rows35:38;
- rewrite row/cell refs;
- enumerate merge refs structurally belonging to source block27:30 and clone the pattern into both new blocks;
- shift affected existing merge refs at/crossing row31 boundary;
- update `<mergeCells count>` if present;
- update dimension and Print_Area `A1:X43`;
- old row31 structural content is row39.

Tests must independently inspect:
- unique/sorted raw row/cell refs;
- representative source-block row heights and style ids vs both inserted blocks;
- exact cloned merge-ref patterns/count;
- dimension and Print_Area;
- paperSize9/portrait/scale75/centerHorizontal/protection after reparse.

If a merge crossing the boundary is ambiguous, STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 13. Difficulty decision

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not read/invent any application `Difficulty_*` field. Do not modify normalizer/export-service. Privacy proof must directly confirm mapped legacy Difficulty sample cells are blank after disposable sanitization.

## 14. Mandatory commands

Run:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit, only the two authorized files may differ. After push, working tree must be clean.
No GitHub CI exists; local results remain subject to independent source review.

## 15. Explicitly forbidden

Do NOT:
- modify `package.json` / `package-lock.json`;
- add dependencies;
- commit/publish workbook/image/binary output;
- create production sanitizer/renderer;
- modify export service/normalizer/application code;
- implement Difficulty fields;
- implement PDF/UI;
- access/write Live Kintone;
- deploy;
- start another Work Package.

## 16. Completion contract

Push only the two authorized proof files.

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

Final report <=18 concise lines and include commit SHA, exact files, SHA verification, parity/header/privacy/image/PartA/PartB/Difficulty results, test counts, audit result, no-binary/no-Kintone confirmation, and final status.

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
D2-WP003-R3-R2-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R3-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R3-SOURCE-20260901-01
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

Authorization is consumed when the R3-R3 proof commit is pushed for independent review or invalidated by any scope/dependency change.