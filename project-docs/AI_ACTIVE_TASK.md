# AI ACTIVE TASK — D2-WP003-R3-R4 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / FINAL FEASIBILITY COVERAGE + SAFE PRIVACY PROOF / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R3 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R4
ACTIVE_WORK_PACKAGE_NAME = FINAL FEASIBILITY COVERAGE + SAFE PRIVACY PROOF
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R4-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Finish the existing raw-OOXML feasibility proof without redesigning the architecture and without publishing any workbook binary.

R3-R4 exists only to close the remaining acceptance gaps from independent R3-R3 review:
- complete privacy range coverage and typed-value proof;
- zero sensitive-value logging;
- complete header/value fingerprints;
- orphan-safe reference-image deletion;
- complete original-vs-roundtrip parity;
- exact structural assertions for Part A 4/5/10 and Part B 6/8;
- explicit zero-formula-introduction proof.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No other repository path may change. No dependency/package change is authorized.

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

## 5. No-binary / no-production rule

Do NOT commit or publish `.xlsx`, `.xls`, `.xlsm`, `.zip`, extracted images/media, disposable outputs or `assets/export-templates/**`.

Do NOT create/modify production sanitizer, renderer, export service, normalizer, PDF/UI or Kintone/deploy code.

Disposable workbook data may exist only in memory or ignored local temporary paths and must not appear in Git diff.

## 6. Architecture is frozen

Preserve the current R3-R3 architecture:
- `xlsx-populate@1.21.0` may load/reparse and expose ZIP package parts;
- structural insertion uses raw worksheet/XML/package mutation;
- current raw row/cell shift, dimension rewrite, Print_Area rewrite and merge-cloning direction must remain;
- do not return to high-level row/cell copying to simulate structural insertion;
- tests must inspect resulting raw OOXML directly.

If bounded mutation cannot be proven safe: STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 7. Full no-op parity — original vs round-trip

For both exact source templates, compare source package against load/output/reparse package. Do not merely compare output against hard-coded expectations.

Part A must prove:
- one sheet, exact name/order;
- Print_Area `A1:BJ52`;
- paperSize `8`, landscape, scale `58`;
- exact raw merge-ref SET and count `193` unchanged;
- worksheet dimension unchanged;
- exact `<cols>` structural fingerprint unchanged;
- explicit row-height map/fingerprint unchanged;
- drawing relationship inventory unchanged;
- media-member inventory unchanged;
- successful reparse.

Part B must prove:
- exact sheet order/names: `(Part B) Competency`, `Sheet1`;
- Print_Area `A1:X35`;
- paperSize `9`, portrait, scale `75`;
- `centerHorizontal="1"` preserved;
- sheet-protection structural fingerprint unchanged;
- exact raw merge-ref SET and count `79` unchanged;
- worksheet dimension unchanged;
- exact `<cols>` structural fingerprint unchanged;
- row-height map/fingerprint unchanged;
- drawing/media inventory unchanged;
- successful reparse.

No fallback assertion is allowed. Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

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
1. resolve every cell in every frozen title/static-label region;
2. fingerprint them using safe address + structure/content hashes without logging source text;
3. resolve every runtime value region completely, not just the merge anchor;
4. clear/mutate runtime values only;
5. reparse;
6. prove every static fingerprint unchanged;
7. prove every runtime value region cleared/changed as intended;
8. prove unrelated header cell XML unchanged.

`N6` and `G2` are merged Fiscal-Year VALUE anchors, not labels.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 9. Complete explicit privacy map

The privacy source of truth MUST be an inspectable exact address set derived from declared accepted ranges. Selected anchor sampling is forbidden.

### 9.1 Part A minimum sensitive coverage

Expand these ranges to every actual address, respecting merged cells and excluding a cell only when it is structurally proven static/non-sensitive:
- all runtime header value regions from section 8;
- `G16:AF19` Department Hoshin/sample business text;
- `AM16:BI19` Section Hoshin/sample business text;
- `B25:BI28` objective/action/target/difficulty/review/self/appraiser/result/score sample areas;
- `BC29:BI35` score/summary area;
- `B37:S42` objective approval/signature area;
- `AI37:AY42` evaluator/name/date area where source cells exist;
- `B47:N50` overall scores;
- all legacy Difficulty sample cells inside objective rows.

Tests must inspect the resolved address set and prove expected coverage. It is not acceptable to list only one anchor per merged/range area.

### 9.2 Part B exact dynamic/sample map

Explicitly resolve every dynamic/sample cell in rows 2:34 while excluding:
- frozen title/static label regions in section 8;
- static competency names/descriptions;
- static rating/scale guidance text.

The exact map must be inspectable by tests. If any cell cannot be safely classified as dynamic/sample versus required static template content, STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`; do not guess or clear the whole block.

### 9.3 Typed value collection

For every mapped source cell, collect metadata/value in memory by actual type:
- string / shared string / inline string;
- number;
- Date object and/or numeric date serial as represented by the library/template;
- boolean;
- blank/null.

Do not discard numeric/date/boolean values from proof. Tests must show mapped values of each type actually present are accounted for and cleared.

### 9.4 Sanitization proof

- clear mapped sensitive cells only;
- preserve cell styles, merged geometry and static template text;
- output/reparse;
- prove every mapped sensitive address is empty;
- prove frozen static regions are unchanged;
- for mapped collected TEXT values only, scan all XML/text parts for survival;
- if shared-string cleanup is required, it must be driven only by mapped source references/values;
- prove zero worksheet scoring formulas were introduced.

No source-sensitive value may appear in any `console`, thrown error or assertion message. Error text may contain only safe addresses, counts, part names, relationship ids or hashes.

Tests MUST NOT use `${token}` or equivalent raw sensitive value interpolation in assertion text.

Failure => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 10. Reference image — package-wide orphan-safe proof

Frozen Part A target:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Required sequence:
1. snapshot complete source drawing-anchor inventory using safe ids/anchors only;
2. snapshot complete drawing relationship inventory using ids + targets;
3. snapshot complete media member inventory using filename/hash only;
4. remove exactly the anchor/object embedding `rId3`;
5. remove exactly relationship `rId3`;
6. search ALL remaining package `.rels` parts and resolve targets to determine whether any relationship still references `image3.png`;
7. delete `xl/media/image3.png` ONLY if no remaining relationship references it;
8. otherwise STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED` rather than deleting referenced media;
9. reparse;
10. compare every non-target anchor/relationship/media item before vs after exactly.

Must preserve `rId1 -> image1.jpeg`, `rId2 -> image2.jpeg`, and every other non-target item.

## 11. Exact Part A structural proof — 4 / 5 / 10 objectives

Keep current raw insertion + merge-cloning logic, but tests must measure the property directly.

### 4 objectives
- no insertion;
- row29/lower section unchanged;
- dimension legacy;
- Print_Area `A1:BJ52`;
- A3 / paperSize8 / landscape / scale58.

### 5 objectives
- one raw clone of row28 as row29;
- all original rows29+ shift +1;
- exact row/cell refs valid, unique and sorted;
- exact source row28 style ids and row height reproduced in row29;
- exact row28 merge pattern reproduced in row29;
- affected existing merge refs shifted correctly;
- `<mergeCells count>` attribute equals actual merge-ref count;
- dimension extended exactly +1;
- Print_Area `A1:BJ53`;
- old row29 structural content at row30;
- A3 / paperSize8 / landscape / scale58 preserved.

### 10 objectives
Same proof with +6 insertion:
- inserted rows29:34;
- original row29 -> row35;
- objective slot10 row34;
- every inserted row reproduces row28 style ids, height and merge pattern;
- exact merge refs/count attribute;
- dimension +6;
- Print_Area `A1:BJ58`;
- A3/landscape/58 preserved.

Sentinel-only and count-only tests are insufficient.

## 12. Exact Part B structural proof — 6 / 8 competencies

### 6 competencies
- no insertion;
- totals/signatures row31;
- legacy dimension/Print_Area `A1:X35`;
- A4 / portrait / scale75 / centerHorizontal / protection preserved.

### 8 competencies
- shift all original rows31+ exactly +8;
- clone source rows27:30 into rows31:34 and rows35:38;
- raw row/cell refs valid, unique and sorted;
- both inserted blocks reproduce source row heights and representative style ids exactly;
- exact source-block merge pattern reproduced in both inserted blocks;
- affected existing merge refs shifted correctly;
- `<mergeCells count>` attribute equals actual merge-ref count;
- dimension extended exactly +8;
- Print_Area `A1:X43`;
- original row31 structural content at row39;
- A4 / paperSize9 / portrait / scale75 / centerHorizontal / protection preserved.

Sentinel-only and total-count-only tests are insufficient.

## 13. Difficulty decision

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not add/read/invent any application `Difficulty_*` field and do not modify normalizer/export-service. Privacy proof must directly confirm the mapped legacy Difficulty sample cells are blank after disposable sanitization.

## 14. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit, only the two authorized files may differ. After commit/push, working tree must be clean.

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
D2-WP003-R3-R2-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R3-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R4-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R4-SOURCE-20260901-01
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

Authorization is consumed when the R3-R4 proof commit is pushed for independent review or invalidated by any scope/dependency change.
