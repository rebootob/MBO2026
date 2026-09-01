# AI ACTIVE TASK — D2-WP003-R3-R9 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / FINAL ASSERTION COVERAGE CLOSURE / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R8 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R9
ACTIVE_WORK_PACKAGE_NAME = FINAL ASSERTION COVERAGE CLOSURE
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R9-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Finish only the remaining assertion coverage after independent R3-R8 review. Preserve accepted raw OOXML mutation architecture and useful existing helpers. Do not add product features or production renderer/sanitizer code.

R3-R9 must close exactly these remaining gaps:
- actual SHA-verified source-backed Part B privacy classification or fail closed;
- exact typed metadata set/duplicate/type/nonblank + number/date/boolean output reconciliation;
- strict header normalized-type enum + complete runtime-value/merge-state proof;
- complete source-vs-roundtrip workbook invariant equality;
- target-normalized full reference-image inventory equality;
- complete exact raw structural assertions for Part A 4/5/10 and Part B 6/8;
- formula worksheet/cell/node-hash set proof for originals, sanitized outputs and every structural output.

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

Keep current accepted raw OOXML mutation path and existing `xlsx-populate@1.21.0`. Do not redesign row insertion, merge cloning, Print_Area rewriting, sanitizer architecture, or production export flow.

Critical rule:

```text
DO NOT ADD A NEW HELPER OR FIELD UNLESS THE SAME COMMIT DIRECTLY ASSERTS
THE REQUIRED RETURNED PROPERTY AGAINST ACTUAL SOURCE/OUTPUT DATA.
```

If a required fact cannot be safely proven, STOP with the matching blocker instead of weakening acceptance.

## 5. Part B privacy classification — source-backed or fail closed

The current hard-coded `SENSITIVE_RANGES_B` + row-rule classification is NOT acceptance proof.

Required:
1. Load the exact SHA-verified Part B owner template.
2. Inspect rows 2:34 and build safe source evidence per address:
   - address;
   - merge membership / merged-range identity;
   - style id;
   - normalized type `string|number|date|boolean|blank`;
   - blank/nonblank state;
   - safe value hash only where useful;
   - no raw source values in logs/errors.
3. Build the complete protected-static set from actual template roles: title, header labels, competency names/descriptions, rating/scale guidance and other proven static content.
4. Every sensitive address must carry actual source evidence and justified dynamic/sample role.
5. Tests must iterate ALL sensitive and ALL protected-static addresses.
6. Prove exact set disjointness `SENSITIVE ∩ PROTECTED_STATIC = empty`.
7. Do not accept classification merely because an address belongs to a preselected range or row rule.
8. If any address is ambiguous: STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 6. Typed metadata — exact reconciliation

For Part A and Part B tests must prove:
- `metadata.length == unique mapped-address count`;
- exact metadata address set equals mapped address set;
- no duplicate metadata addresses;
- every `normalizedType` is exactly one of `string|number|date|boolean|blank`;
- aggregate type counts equal metadata length;
- every nonblank source address appears exactly once.

After sanitization/reparse iterate EVERY metadata record and prove corresponding output cell is blank.

Also explicitly iterate and prove blank output for every metadata subset:
- number;
- date;
- boolean.

Failure => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 7. Header fingerprint contract

Per-cell fingerprint must contain:
- address;
- normalized type exactly `string|number|date|boolean|blank`;
- safe value hash;
- style id from source OOXML/cell style;
- merge membership / merged-range identity.

Frozen Part A runtime/header geometry:
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

Tests must prove:
- every title/static-label fingerprint unchanged;
- every unrelated bounded-header fingerprint unchanged;
- EVERY runtime `valueFingerprint` changed/cleared exactly as intended after reparse;
- complete header merge-ref set unchanged exactly;
- merged runtime regions remain structurally correct even when only anchor cells carry values.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Workbook source-vs-roundtrip equality

Directly assert SOURCE == ROUND-TRIP for Part A and Part B for every invariant:
- exact sheet order/names;
- exact sorted merge-ref set;
- source-vs-output `mergeCountAttr` equality;
- declared merge count equals actual merge-set size;
- exact worksheet dimension;
- exact `<cols>` structure/hash;
- explicit row-height + customHeight map;
- exact Print_Area;
- complete pageSetup element/attribute structural fingerprint;
- Part B horizontal centering source equality;
- Part B sheetProtection structural fingerprint equality, not boolean presence only;
- complete relationship inventory tuples `(part,id,target)` across relevant `.rels` parts;
- media inventory `(filename,sha256)`;
- successful reparse as an explicit measured invariant.

Hard-coded legacy constants are supplemental only and may not replace direct source equality.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. Reference image — target-normalized full inventory equality

Target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Before mutation snapshot ALL safe inventories:
- every drawing anchor with stable structural fingerprint + embedded rel id;
- every relevant relationship `(part,id,target)`;
- every media member `(filename,sha256)`.

Remove only rId3 anchor + rId3 relationship. Delete image3 only after package-wide orphan proof.

After reparse normalize only target items from BEFORE and assert exact equality:
```text
NORMALIZED_BEFORE_ANCHORS == AFTER_ANCHORS
NORMALIZED_BEFORE_RELS == AFTER_RELS
NORMALIZED_BEFORE_MEDIA == AFTER_MEDIA
```

Any non-target difference => STOP `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

## 10. Raw structural assertions — complete matrix

Use the existing raw worksheet inspector; extend only when necessary and directly assert every returned property used for acceptance.

Global checks for EVERY structural case:
- row refs valid, unique and strictly increasing;
- every row's cell refs valid, unique and strictly increasing by column;
- declared merge count equals actual merge set size;
- exact dimension;
- exact Print_Area;
- required page setup preserved.

### Part A 4
- no insertion;
- source legacy row/cell/style/height/merge geometry unchanged;
- lower section starts row29;
- `A1:BJ52`;
- paperSize8 / landscape / scale58.

### Part A 5
- old row29 structural content -> row30;
- inserted row29 height/customHeight == source row28;
- inserted row29 style-id pattern == source row28;
- exact row28 merge pattern translated to row29;
- every original affected merge shifts exactly +1;
- dimension exactly +1;
- `A1:BJ53`;
- paperSize8 / landscape / scale58.

### Part A 10
- rows29:34 inserted;
- old row29 structural content -> row35;
- row34 objective slot10;
- EVERY inserted row height/customHeight/style pattern == source row28;
- exact translated row28 merge pattern exists for every row29:34;
- every original affected merge shifts exactly +6;
- dimension exactly +6;
- `A1:BJ58`;
- paperSize8 / landscape / scale58.

### Part B 6
- no insertion;
- source legacy row/cell/style/height/merge geometry unchanged;
- totals/signatures begin row31;
- `A1:X35`;
- paperSize9 / portrait / scale75;
- centerHorizontal + structural protection fingerprint preserved from source.

### Part B 8
- source rows27:30 cloned exactly to31:34 and35:38;
- old row31 structural content -> row39;
- EVERY cloned row height/customHeight/style pattern equals corresponding source row;
- exact source-block merge pattern translated into BOTH inserted blocks;
- every original affected merge shifts exactly +8;
- dimension exactly +8;
- `A1:X43`;
- paperSize9 / portrait / scale75;
- centerHorizontal + protection preserved.

Counts/sentinels/Print_Area-only assertions are supplemental, not acceptance proof.

Failure => STOP `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 11. Formula worksheet/cell/node-hash sets

Inspect only `xl/worksheets/*.xml`; detect formula nodes with `<f(?:\s|>)`.
Return sorted safe fingerprints containing:
- worksheet part;
- containing cell address where possible;
- safe SHA-256 (or equivalent safe hash) of normalized formula node XML/structure.

Build and directly test sets for:
- original Part A;
- original Part B;
- sanitized Part A;
- sanitized Part B;
- Part A 4;
- Part A 5;
- Part A 10;
- Part B 6;
- Part B 8.

Accepted originals are formula-free. Every source/output set must be independently proven empty and zero additions proven.

## 12. Difficulty

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Do not add/read/invent application `Difficulty_*` fields. Sanitized Part A must directly prove mapped legacy Difficulty sample cells blank.

## 13. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized files may differ. After commit/push working tree must be clean.

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
D2-WP003-R3-R7-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R8-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R9-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R9-SOURCE-20260901-01
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

Authorization is consumed when the R3-R9 proof commit is pushed for independent review or invalidated by any scope/dependency change.
