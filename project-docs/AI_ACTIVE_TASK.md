# AI ACTIVE TASK — D2-WP003-R3-R6 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / EXACT SOURCE-VS-OUTPUT TEST HARNESS COMPLETION / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R5 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R6
ACTIVE_WORK_PACKAGE_NAME = EXACT SOURCE-VS-OUTPUT TEST HARNESS COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Finish only the missing source-vs-output proof/test harness. Preserve all accepted raw OOXML mutation logic. Do not redesign mutation/sanitization architecture and do not build production export code.

R3-R6 exists only to close the remaining R3-R5 review gaps:
- source-structure-backed Part B privacy classification;
- exact address-by-address typed privacy reconciliation;
- complete header title/label/value/unrelated-header fingerprints;
- reusable source-vs-roundtrip workbook fingerprints;
- exact normalized reference-image inventory equality;
- exact Part A 4/5/10 and Part B 6/8 structural property measurements;
- worksheet-only source-vs-output formula-node/address-set comparison.

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

Keep current accepted raw OOXML mutation path:
- `xlsx-populate@1.21.0` only as already installed;
- raw worksheet/XML/package mutation for insertion;
- current raw row/cell shift, dimension rewrite, Print_Area rewrite and merge cloning remain;
- no return to high-level `sheet.row()` / `sheet.cell()` copying as structural insertion;
- no production sanitizer/renderer implementation.

R3-R6 is measurement/harness completion only. If a required property cannot be safely proved, STOP with the applicable blocker rather than inventing a substitute test.

## 5. Part B privacy classification — source-backed only

The current self-declared row/range classification is NOT sufficient.

Required proof:
1. Inspect exact owner-template Part B source structure in rows 2:34 after SHA verification.
2. Build safe per-address evidence using source structural facts only: address, merge membership, style id, blank/nonblank state, shared/inline/numeric type, and safe hash where needed.
3. Derive the dynamic/sample map from frozen known writable/value regions and source structure; explicitly enumerate protected static title/header-label/competency-description/rating-guidance addresses.
4. Every sensitive address must have a justified dynamic/sample classification.
5. Every protected static address must be absent from the sensitive set.
6. Tests must iterate ALL sensitive and ALL protected addresses, not sample 2–3 cells.
7. Any address that cannot be safely classified => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

Do not declare an address dynamic merely because it lies inside a preselected broad range.

## 6. Exact typed privacy reconciliation

For every mapped Part A and Part B address, produce exactly one metadata entry:
- address;
- normalized type: `string | number | date | boolean | blank`;
- blank/nonblank state;
- safe hash for text where useful;
- no raw source value in logs/errors.

Tests must prove:
- `metadata.length == unique mapped-address count`;
- metadata addresses are unique;
- metadata address set equals the mapped address set exactly;
- every metadata type belongs to the allowed enum;
- aggregate type counts equal metadata length;
- every nonblank source address appears exactly once;
- after sanitization/reparse, every metadata address is blank;
- numeric/date/boolean source addresses present are explicitly iterated and checked blank by address.

## 7. Complete header/value fingerprints

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

Implement a reusable cell fingerprint based on safe structural metadata (address, value hash/type, style id, merge membership) without logging raw source values.

Tests must fingerprint EVERY cell in:
- every frozen title/static-label region;
- every runtime value region;
- all unrelated cells in the bounded header rows that are outside runtime-value regions.

After mutation/reparse prove:
- all title/static-label fingerprints unchanged;
- all intended runtime value addresses changed/cleared as intended;
- all unrelated bounded-header fingerprints unchanged;
- header merge-ref set unchanged exactly.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Reusable workbook structural fingerprint — SOURCE vs ROUND-TRIP

Implement one reusable raw OOXML fingerprint helper and compare source vs round-trip directly.

For both workbooks include:
- sheet order/names;
- exact sorted merge-ref set + `<mergeCells count>` attribute;
- worksheet dimension;
- exact `<cols>` block/hash;
- row-height map;
- Print_Area;
- page setup attributes;
- horizontal centering where present;
- sheetProtection structural fingerprint where present;
- drawing relationship inventory (part + id + target);
- media inventory (filename + SHA-256);
- successful reparse.

Tests must assert direct source-vs-output equality for every invariant property. Hard-coded expected constants may be supplemental only.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. Exact reference-image inventory equality

Target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Before mutation snapshot:
- every drawing anchor with safe structural identifier + embedded rel id;
- every drawing/package relationship with part/id/target;
- every media member with filename/hash.

Remove only the rId3 anchor and relationship. Search all remaining `.rels`; delete `image3.png` only if orphaned.

Then reparse and compare:
`NORMALIZED_BEFORE_MINUS_TARGET == AFTER`
for the complete anchor, relationship and media inventories.

Any non-target difference => STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 10. Raw structural inspector — Part A 4 / 5 / 10

Implement reusable raw worksheet inspection returning at minimum:
- ordered row refs;
- per-row ordered cell refs;
- per-row cell style-id pattern;
- row height/customHeight metadata;
- sorted merge-ref set + declared merge count;
- dimension;
- Print_Area;
- page setup attributes.

Tests must directly measure:

### 4 objectives
- no insertion;
- lower section remains at row29;
- legacy source row/cell/style/height/merge geometry unchanged;
- Print_Area `A1:BJ52`;
- paperSize8 / landscape / scale58.

### 5 objectives
- row refs and cell refs unique and strictly sorted;
- old row29 structural content -> row30;
- inserted row29 reproduces source row28 height and style-id pattern;
- exact row28 merge pattern translated to row29;
- all original affected merge refs shifted exactly +1;
- declared merge count equals actual set size;
- dimension extended exactly +1;
- Print_Area `A1:BJ53`;
- paperSize8 / landscape / scale58.

### 10 objectives
Same proof with +6:
- inserted rows29:34;
- old row29 -> row35;
- row34 is objective slot10;
- each inserted row reproduces source row28 height/style pattern;
- exact translated row28 merge pattern exists for every inserted row;
- original affected merge refs shift exactly +6;
- merge count/dimension/Print_Area `A1:BJ58` exact;
- paperSize8 / landscape / scale58.

Sentinel/count-only proof is forbidden as acceptance evidence.

## 11. Raw structural inspector — Part B 6 / 8

### 6 competencies
- no insertion;
- totals/signatures start row31;
- source row/cell/style/height/merge geometry unchanged;
- Print_Area `A1:X35`;
- paperSize9 / portrait / scale75 / centerHorizontal / protection preserved.

### 8 competencies
- rows31+ shift exactly +8;
- source rows27:30 cloned to rows31:34 and 35:38;
- old row31 structural content -> row39;
- row/cell refs unique and strictly sorted;
- each inserted row matches corresponding source row height/style-id pattern;
- exact source-block merge pattern translated into both inserted blocks;
- affected original merge refs shifted exactly +8;
- declared merge count equals actual merge set size;
- dimension extended exactly +8;
- Print_Area `A1:X43`;
- paperSize9 / portrait / scale75 / centerHorizontal / protection preserved.

## 12. Exact worksheet formula-node proof

Implement worksheet-only formula extraction:
- inspect only `xl/worksheets/*.xml`;
- detect `<f(?:\s|>)` formula nodes;
- associate each formula with its cell address where possible;
- return sorted formula address/node fingerprints.

Compare source against:
- sanitized Part A output;
- sanitized Part B output;
- Part A 4/5/10 outputs;
- Part B 6/8 outputs.

Accepted source formula set is zero. Tests must prove every output formula set is also zero and zero additions occurred.

## 13. Difficulty

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not add/read/invent any application `Difficulty_*` field. Sanitized Part A proof must directly confirm mapped legacy Difficulty sample cells remain blank.

## 14. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized files may differ. After commit/push working tree must be clean.

## 15. Explicitly forbidden

Do NOT:
- modify `package.json` / `package-lock.json`;
- add dependencies;
- commit/publish XLSX/image/media/ZIP/disposable output;
- create production sanitizer/renderer;
- modify export service/normalizer/application code;
- implement PDF/UI;
- access/write Live Kintone;
- deploy;
- start another Work Package.

## 16. Completion contract

Push only the two authorized feasibility files.

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
D2-WP003-R3-R4-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R5-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R6-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
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

Authorization is consumed when the R3-R6 proof commit is pushed for independent review or invalidated by any scope/dependency change.
