# AI ACTIVE TASK — D2-WP003-R3-R5 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / EXACT ACCEPTANCE MEASUREMENT COMPLETION / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R4 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R5
ACTIVE_WORK_PACKAGE_NAME = EXACT ACCEPTANCE MEASUREMENT COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R5-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Complete the missing acceptance measurements only. Preserve the accepted raw-OOXML architecture from R3-R4. Do not redesign the mutation logic and do not build production export code.

R3-R5 exists only to close these remaining proof gaps:
- exact Part B privacy classification;
- per-address typed privacy accounting;
- complete header/value/unrelated-header fingerprints;
- complete source-vs-roundtrip structural fingerprints;
- exact non-target drawing/relationship/media equality;
- exact Part A 4/5/10 and Part B 6/8 structural assertions;
- exact source-vs-output worksheet formula-node comparison.

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

## 4. Architecture frozen

Keep current raw OOXML architecture:
- `xlsx-populate@1.21.0` only as already installed;
- raw worksheet/XML/package mutation for insertion;
- current row/cell shift, dimension rewrite, Print_Area rewrite and merge cloning remain;
- do not return to high-level row/cell copy as structural proof;
- do not redesign sanitization/renderer architecture.

If the existing approach cannot be proved safe within this scope: STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 5. Exact Part B privacy classification

R3-R5 must not accept broad ranges merely because they contain dynamic cells.

Build an inspectable classification from exact owner-template structure for rows 2:34:
- every mapped sensitive address must have a safe classification/reason such as `HEADER_VALUE`, `APPRAISER_INPUT`, `SCORE_VALUE`, `SIGNATURE_VALUE`, or equivalent;
- static title cells, frozen header labels, competency names/descriptions, rating guidance and other template text must be explicitly excluded/protected;
- tests must prove all mapped addresses are classified dynamic/sample and all protected static addresses are absent from the sensitive set;
- no source text may be logged in the classification evidence.

If any ambiguous cell cannot be safely classified: STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` instead of widening a range.

## 6. Per-address typed privacy accounting

For every mapped Part A and Part B address return inspectable metadata keyed by safe address, including:
- address;
- normalized type: `string`, `number`, `date`, `boolean`, `blank`;
- nonblank/blank state;
- safe content hash for text where useful, never raw source value.

Requirements:
- metadata count must equal unique mapped-address count exactly;
- every mapped address appears exactly once;
- aggregate type counts must reconcile exactly to metadata count;
- every nonblank source address must be represented exactly once;
- after sanitization every mapped address is empty after reparse;
- numeric/date/boolean addresses present in source must be directly asserted empty using their metadata addresses;
- mapped text survival scan may use source values in memory only; assertion/error text must not contain raw values.

Failure => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 7. Complete header/value proof

Frozen Part A:
```text
TITLE = B6:M7
FISCAL_YEAR_VALUE = N6:Q7
DEPARTMENT_LABEL/VALUE = Z6:AF6 / Z7:AF7
SECTION_LABEL/VALUE = AG6:AL6 / AG7:AL7
START_DATE_LABEL/VALUE = AM6:AP6 / AM7:AP7
EMP_ID_LABEL/VALUE = AQ6:AS6 / AQ7:AS7
EMP_NAME_LABEL/VALUE = AT6:BC6 / AT7:BC7
POSITION_LABEL/VALUE = BD6:BI6 / BD7:BI7
```

Frozen Part B:
```text
TITLE = B2:F3
FISCAL_YEAR_VALUE = G2:H3
DEPARTMENT_LABEL/VALUE = J2:L2 / J3:L3
SECTION_LABEL/VALUE = M2:O2 / M3:O3
POSITION_LABEL/VALUE = P2:Q2 / P3:Q3
EMP_ID_LABEL/VALUE = R2 / R3
EMP_NAME_LABEL/VALUE = S2:W2 / S3:W3
```

Build before/after safe fingerprints for EVERY cell in:
- all title/static-label regions;
- every runtime value region;
- all unrelated header cells in the bounded header rows.

Tests must prove:
- every static/title/label fingerprint unchanged;
- every intended runtime value address changed/cleared as intended;
- unrelated header cell fingerprints unchanged;
- merged geometry unchanged;
- no raw source value appears in logs/errors.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Full no-op source-vs-roundtrip fingerprints

Create reusable raw fingerprints and compare SOURCE vs ROUND-TRIP directly.

For Part A and Part B include:
- exact sheet order/names;
- exact merge-ref SET and count;
- worksheet dimension;
- exact `<cols>` structure/hash;
- explicit row-height map;
- Print_Area;
- page setup attributes;
- Part B `centerHorizontal`;
- Part B sheet-protection structural fingerprint;
- drawing relationship inventory;
- media-member inventory with filename/hash;
- successful reparse.

Hard-coded expected values may be additional checks, but cannot replace source-vs-output equality.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. Reference-image exact inventory proof

Target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Before mutation snapshot using safe metadata:
- complete drawing-anchor inventory;
- complete relationship inventory with ids/targets;
- complete media inventory with filenames/hashes.

After removing exactly rId3 anchor + rId3 relationship:
- search all remaining `.rels` parts and delete `image3.png` only if orphaned;
- reparse;
- normalize away only the target anchor/relationship/media from the BEFORE inventory;
- assert the complete remaining anchor/relationship/media inventories equal AFTER exactly.

Preserve every non-target item, including rId1/image1.jpeg and rId2/image2.jpeg.

Failure => STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 10. Exact Part A 4 / 5 / 10 measurements

Tests must directly measure raw OOXML, not helper success booleans.

For all variants assert:
- row refs are unique and strictly sorted;
- cell refs within rows are valid/unique/sorted;
- `<mergeCells count>` attribute equals actual merge-ref count;
- worksheet dimension is exact;
- Print_Area is exact;
- paperSize8 / landscape / scale58 preserved.

5-objective case:
- old row29 -> row30;
- inserted row29 reproduces row28 row-height and cell-style-id pattern;
- exact row28 merge pattern translated to row29;
- affected existing merge refs shifted correctly;
- dimension +1;
- Print_Area A1:BJ53.

10-objective case:
- inserted rows29:34;
- old row29 -> row35;
- objective slot10 = row34;
- every inserted row reproduces row28 row-height/style-id pattern;
- exact row28 merge pattern translated to every inserted row;
- affected existing merge refs shifted correctly;
- dimension +6;
- Print_Area A1:BJ58.

4-objective case must prove unchanged legacy lower-section geometry and A1:BJ52.

## 11. Exact Part B 6 / 8 measurements

For both variants assert:
- row/cell refs valid, unique, sorted;
- `<mergeCells count>` attribute equals actual merge count;
- exact dimension/Print_Area;
- paperSize9 / portrait / scale75 / centerHorizontal / protection preserved.

8-competency case:
- source structural block rows27:30;
- rows31+ shift +8;
- cloned blocks rows31:34 and 35:38;
- old row31 -> row39;
- each cloned row reproduces corresponding source row height and cell-style-id pattern;
- exact source-block merge pattern translated into both inserted blocks;
- affected existing merge refs shifted correctly;
- dimension +8;
- Print_Area A1:X43.

6-competency case must prove unchanged legacy totals/signature start row31 and A1:X35.

## 12. Exact formula-node proof

The accepted source has zero worksheet formulas.

For every source, sanitized disposable output and structural output:
- inspect worksheet XML parts only;
- detect formula nodes with a raw pattern equivalent to `<f(?:\s|>)`, not literal `<f>` only;
- compare formula-node/address sets source vs output;
- prove zero additions;
- if source set is zero, every output worksheet formula set must also be zero.

Do not scan non-worksheet XML and call that scoring-formula proof.

## 13. Difficulty

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not add/read/invent any application `Difficulty_*` field. Directly prove legacy Difficulty sample cells in the sanitized Part A mapping are blank.

## 14. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized files may differ. After commit/push working tree must be clean.

## 15. Forbidden

Do NOT:
- modify package files or add dependencies;
- commit/publish XLSX/image/media/ZIP/disposable output;
- create production sanitizer/renderer;
- modify export service/normalizer/application code;
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

## 17. Authorization ledger

```text
D2-WP003-R3-R3-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R4-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R5-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R5-SOURCE-20260901-01
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

Authorization is consumed when the R3-R5 proof commit is pushed for independent review or invalidated by any scope/dependency change.
