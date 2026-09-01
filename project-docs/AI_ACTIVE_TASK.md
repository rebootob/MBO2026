# AI ACTIVE TASK — D2-WP003-R3-R7 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / EXACT ASSERTION HARNESS COMPLETION / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R6 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R7
ACTIVE_WORK_PACKAGE_NAME = EXACT ASSERTION HARNESS COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R7-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Finish only the remaining exact assertions identified by the independent R3-R6 review. Preserve the accepted raw OOXML mutation architecture and all useful R3-R6 helpers. Do not redesign mutation/sanitization logic and do not build production export code.

R3-R7 exists only to close these remaining gaps:
- source-structure-backed Part B privacy classification;
- exact typed-metadata address reconciliation;
- complete header value/type/style/merge fingerprints;
- complete direct source-vs-roundtrip workbook invariant equality;
- target-normalized full reference-image inventory equality;
- reusable raw structural inspector with exact Part A 4/5/10 and Part B 6/8 assertions;
- worksheet formula address/node-set comparison for source, sanitized and every structural output.

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
Never print/log/commit raw employee/sample values.

## 4. Architecture frozen

Keep the current accepted raw OOXML mutation path:
- `xlsx-populate@1.21.0` only as already installed;
- raw worksheet/XML/package mutation for insertion;
- current row/cell shift, dimension rewrite, Print_Area rewrite and merge cloning remain;
- do not replace raw insertion with high-level sheet row/cell copying;
- do not create production sanitizer/renderer code.

R3-R7 is assertion/test-harness completion only. If any required property cannot be proved safely, STOP with the matching blocker instead of weakening the test.

## 5. Part B privacy classification — source structure is the evidence

The existing hard-coded classification is NOT acceptance proof.

Required:
1. Load the exact SHA-verified Part B owner template.
2. Inspect rows 2:34 and build safe per-address structural evidence using actual source facts:
   - address;
   - merge membership / merged-range identity;
   - style id;
   - normalized source type;
   - blank/nonblank state;
   - safe content hash only where needed;
   - never raw source value in logs/errors.
3. Use frozen known writable/value regions plus actual source structure to derive or validate the sensitive map.
4. Explicitly build the complete protected-static set for:
   - title cells;
   - header-label cells;
   - competency names/descriptions;
   - rating/scale guidance;
   - any other proven static template content in rows 2:34.
5. Tests must iterate every sensitive address and every protected-static address.
6. Prove exact set disjointness:
   `SENSITIVE ∩ PROTECTED_STATIC = empty`.
7. Every sensitive address must carry inspectable source-backed evidence/classification.
8. Any unresolved/ambiguous address => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

Do not mark an address dynamic solely because it falls inside a preselected broad range.

## 6. Exact typed privacy reconciliation

For every mapped Part A and Part B address return exactly one metadata record:
- `address`;
- `normalizedType = string | number | date | boolean | blank`;
- blank/nonblank state;
- safe hash for text where useful.

Tests must prove:
- `metadata.length == unique mapped-address count`;
- metadata address set equals mapped address set exactly;
- no duplicate metadata addresses;
- every normalized type belongs to the accepted enum;
- aggregate type counts equal metadata length;
- every nonblank source address appears exactly once;
- after sanitization/reparse, every metadata address is blank;
- numeric source addresses are iterated directly from metadata and proved blank;
- date source addresses are iterated directly from metadata and proved blank;
- boolean source addresses are iterated directly from metadata and proved blank.

Failure => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 7. Complete header fingerprints

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

Implement reusable per-cell safe fingerprints containing at minimum:
- address;
- normalized type;
- safe value hash;
- style id;
- merge membership / merged-range identity.

Fingerprint EVERY cell in:
- every frozen title/static-label region;
- every runtime-value region;
- every unrelated bounded-header cell outside those regions.

Tests must prove after mutation/reparse:
- every title/static-label fingerprint unchanged;
- every unrelated bounded-header fingerprint unchanged;
- every runtime-value address is cleared/changed exactly as intended;
- complete header merge-ref set unchanged exactly;
- merged runtime-region state is correct even when only anchor cells are mutated.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Complete workbook source-vs-roundtrip equality

Extend the reusable workbook fingerprint to include and directly compare SOURCE vs ROUND-TRIP for both Part A and Part B:
- exact sheet order/names;
- exact sorted merge-ref set;
- declared `<mergeCells count>`;
- declared merge count equals actual merge-set size;
- exact worksheet dimension;
- exact `<cols>` structure/hash;
- explicit row-height/customHeight map;
- exact Print_Area;
- complete page-setup structural attributes, not only selected constants;
- Part B centerHorizontal source equality;
- Part B sheetProtection structural fingerprint source equality;
- complete drawing/package relationship inventory as safe tuples `(part, id, target)`;
- media inventory `(filename, sha256)`;
- successful reparse.

Hard-coded expected constants may be supplemental only. They may not replace direct source-vs-output equality.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. Reference-image target-normalized inventory equality

Target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Before mutation snapshot complete safe inventories:
- every drawing anchor with structural identifier + embedded rel id;
- every relevant relationship as `(part, id, target)`;
- every media member as `(filename, sha256)`.

Remove only:
- target rId3 anchor;
- target rId3 relationship;
- `image3.png` only after package-wide orphan proof.

After reparse:
- normalize only those target items out of BEFORE;
- require exact equality with AFTER for anchors, relationships and media.

Any non-target difference => STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 10. Reusable raw structural inspector

Implement one raw worksheet inspector returning at minimum:
- ordered row refs;
- ordered cell refs per row;
- style-id pattern per row;
- row height/customHeight metadata;
- sorted merge-ref set;
- declared merge count;
- dimension;
- Print_Area;
- complete relevant page setup;
- centerHorizontal/protection where applicable.

Tests must use the inspector to measure the actual output, not helper booleans.

### Part A — 4 objectives
- no insertion;
- lower section starts at row29;
- legacy source row/cell/style/height/merge geometry unchanged;
- row refs unique/strictly sorted;
- cell refs valid/unique/strictly sorted;
- declared merge count equals actual set size;
- dimension exact;
- Print_Area `A1:BJ52`;
- paperSize8 / landscape / scale58 preserved from source.

### Part A — 5 objectives
- old row29 structural content -> row30;
- inserted row29 matches source row28 row-height/customHeight and style-id pattern;
- exact row28 merge pattern translated to row29;
- every original affected merge shifts exactly +1;
- row/cell refs unique and sorted;
- declared merge count equals actual set size;
- dimension exactly +1;
- Print_Area `A1:BJ53`;
- paperSize8 / landscape / scale58 preserved.

### Part A — 10 objectives
- rows29:34 inserted;
- old row29 structural content -> row35;
- row34 is objective slot10;
- each inserted row matches source row28 row-height/customHeight and style-id pattern;
- exact translated row28 merge pattern exists for every inserted row29:34;
- every original affected merge shifts exactly +6;
- row/cell refs unique and sorted;
- declared merge count equals actual set size;
- dimension exactly +6;
- Print_Area `A1:BJ58`;
- paperSize8 / landscape / scale58 preserved.

### Part B — 6 competencies
- no insertion;
- totals/signatures start at row31;
- source row/cell/style/height/merge geometry unchanged;
- row/cell refs unique and sorted;
- declared merge count equals actual set size;
- dimension exact;
- Print_Area `A1:X35`;
- paperSize9 / portrait / scale75 / centerHorizontal / protection preserved from source.

### Part B — 8 competencies
- source rows27:30 cloned to rows31:34 and rows35:38;
- all original rows31+ shift exactly +8;
- old row31 structural content -> row39;
- each cloned row matches corresponding source row height/customHeight and style-id pattern;
- exact source-block merge pattern translated into BOTH inserted blocks;
- every original affected merge shifts exactly +8;
- row/cell refs unique and sorted;
- declared merge count equals actual set size;
- dimension exactly +8;
- Print_Area `A1:X43`;
- paperSize9 / portrait / scale75 / centerHorizontal / protection preserved.

Sentinel movement/count-only/Print_Area-only assertions may remain only as supplemental evidence, never as acceptance proof.

## 11. Exact worksheet formula address/node-set proof

Inspect only `xl/worksheets/*.xml`.

Detect formula nodes with `<f(?:\s|>)` and associate with the containing cell address where possible.
Return sorted safe formula fingerprints containing at minimum:
- worksheet part;
- cell address;
- safe node hash or equivalent safe structural representation.

Build formula sets for:
- original Part A;
- original Part B;
- sanitized Part A;
- sanitized Part B;
- Part A 4;
- Part A 5;
- Part A 10;
- Part B 6;
- Part B 8.

Accepted originals have zero formulas.
Tests must prove:
- source formula sets are exactly empty;
- every output formula set is exactly empty;
- zero additions occurred.

Count-only proof is not sufficient.

## 12. Difficulty

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not add/read/invent application `Difficulty_*` fields. Sanitized Part A must directly prove the mapped legacy Difficulty sample cells blank.

## 13. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized files may differ. After commit/push the working tree must be clean.

## 14. Explicitly forbidden

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

## 15. Completion contract

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

## 16. Authorization ledger

```text
D2-WP003-R3-R5-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R6-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R7-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R7-SOURCE-20260901-01
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

Authorization is consumed when the R3-R7 proof commit is pushed for independent review or invalidated by any scope/dependency change.
