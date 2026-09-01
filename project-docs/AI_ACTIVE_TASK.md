# AI ACTIVE TASK — D2-WP003-R3-R8 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / MANDATORY PROOF COVERAGE COMPLETION / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R7 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R8
ACTIVE_WORK_PACKAGE_NAME = MANDATORY PROOF COVERAGE COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R8-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose

Finish only the proof coverage still missing after independent R3-R7 review. Preserve the accepted raw OOXML mutation architecture and useful R3-R7 helpers. Do not redesign mutation/sanitization logic and do not build production export code.

R3-R8 must close exactly these gaps:
- source-structure-backed Part B privacy classification;
- exact typed-metadata address/type reconciliation to sanitized outputs;
- complete header normalized-type/style/merge/runtime assertions;
- complete workbook source-vs-roundtrip invariant equality;
- target-normalized full reference-image inventory equality;
- direct assertions over every required raw structural inspector property for Part A 4/5/10 and Part B 6/8;
- source/sanitized/structural worksheet formula cell/node-set proof.

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

Keep current accepted raw OOXML mutation path. `xlsx-populate@1.21.0` remains the only existing workbook library. Do not replace raw structural insertion with high-level row/cell copying. Do not create production sanitizer/renderer code.

Critical R3-R8 rule:

```text
NO NEW HELPER COUNTS AS PROOF UNLESS ITS REQUIRED RETURNED PROPERTIES
ARE DIRECTLY ASSERTED BY TESTS IN THIS SAME COMMIT.
```

If any required property cannot be safely proved, STOP with the matching documented blocker rather than weakening the test.

## 5. Part B privacy classification — actual source structure required

The existing hard-coded `SENSITIVE_RANGES_B`/row-rule classification is not acceptance proof.

Required:
1. Load exact SHA-verified Part B owner template.
2. Inspect rows 2:34 and build safe per-address source evidence containing:
   - address;
   - merge membership / merged-range identity;
   - style id;
   - normalized type `string|number|date|boolean|blank`;
   - blank/nonblank state;
   - safe value hash where useful;
   - never raw source values in logs/errors.
3. Build the complete protected-static set from actual source/frozen template roles for title, header labels, competency names/descriptions, rating/scale guidance and other proven static content.
4. Every sensitive address must have actual source evidence and justified dynamic/sample role.
5. Every protected-static address must be absent from the sensitive set.
6. Tests must iterate ALL sensitive and ALL protected addresses.
7. Prove exact `SENSITIVE ∩ PROTECTED_STATIC = empty`.
8. If any address is ambiguous => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

Do not derive acceptance merely by partitioning a helper's own hard-coded output.

## 6. Typed metadata — exact address-by-address reconciliation

For both Part A and Part B, tests must assert:
- `metadata.length == unique mapped-address count`;
- exact metadata address-set equality with mapped set;
- no duplicate metadata addresses;
- every type is one of `string|number|date|boolean|blank`;
- aggregate type counts equal metadata length;
- every nonblank source address appears exactly once.

After sanitization/reparse, iterate EVERY metadata entry and prove its output address is blank.

Additionally iterate metadata subsets for:
- `number`;
- `date`;
- `boolean`;

and prove every such output address is blank.

Failure => STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 7. Header fingerprint contract

Per-cell fingerprint must include:
- address;
- normalized type `string|number|date|boolean|blank`;
- safe value hash;
- style id from actual OOXML/cell style;
- merge membership / merged-range identity.

Frozen Part A regions:
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

Frozen Part B regions:
```text
TITLE = B2:F3
FISCAL_YEAR_VALUE = G2:H3
DEPARTMENT_LABEL/VALUE = J2:L2 / J3:L3
SECTION_LABEL/VALUE = M2:O2 / M3:O3
POSITION_LABEL/VALUE = P2:Q2 / P3:Q3
EMP_ID_LABEL/VALUE = R2 / R3
EMP_NAME_LABEL/VALUE = S2:W2 / S3:W3
```

Tests must fingerprint every frozen title/static-label/runtime-value cell and unrelated bounded-header cell.

After mutation/reparse prove:
- all title/static-label fingerprints unchanged;
- all unrelated bounded-header fingerprints unchanged;
- EVERY runtime-value address is cleared/changed exactly as intended;
- complete header merge-ref set unchanged exactly;
- merged runtime regions are correct even where only anchor cells carry values.

Failure => STOP `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 8. Workbook fingerprint — assert every invariant SOURCE == ROUND-TRIP

Extend/use one reusable fingerprint and directly assert equality for both Part A and B:
- exact sheet order/names;
- exact sorted merge-ref set;
- declared `<mergeCells count>`;
- declared merge count equals actual merge-set size;
- exact worksheet dimension;
- exact `<cols>` block/hash;
- explicit row-height + customHeight map;
- exact Print_Area;
- complete pageSetup element/attribute structural fingerprint;
- Part B horizontal centering source equality;
- Part B sheetProtection structural fingerprint source equality;
- complete relationship inventory tuples `(part,id,target)` across relevant package `.rels` parts;
- media inventory `(filename,sha256)`;
- successful reparse.

Hard-coded expected constants may be supplemental only, never substitutes for direct source equality.

Failure => STOP `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. Reference image — complete target-normalized inventory equality

Target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Before mutation snapshot complete safe inventories:
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

## 10. Raw structural inspector — tests must assert every returned property

Use the existing inspector or extend it only where required. Tests must directly measure actual output.

Global assertions for every structural case:
- row refs unique and strictly increasing;
- every row's cell refs valid, unique and strictly increasing by column;
- declared merge count equals actual merge-set size;
- expected dimension exact;
- expected Print_Area exact;
- required page setup preserved.

### Part A 4
- no insertion;
- source legacy row/cell/style/height/merge geometry unchanged;
- lower section remains row29;
- Print `A1:BJ52`;
- paperSize8 / landscape / scale58.

### Part A 5
- old row29 structural content shifts to row30;
- inserted row29 height/customHeight == source row28;
- inserted row29 style-id pattern == source row28;
- exact row28 merge pattern translated to row29;
- every original affected merge shifts exactly +1;
- dimension exactly +1;
- Print `A1:BJ53`;
- paperSize8 / landscape / scale58.

### Part A 10
- rows29:34 inserted;
- old row29 structural content shifts to row35;
- row34 is objective slot10;
- every inserted row height/customHeight + style pattern == source row28;
- exact translated row28 merge pattern exists for every row29:34;
- every original affected merge shifts exactly +6;
- dimension exactly +6;
- Print `A1:BJ58`;
- paperSize8 / landscape / scale58.

### Part B 6
- no insertion;
- source legacy row/cell/style/height/merge geometry unchanged;
- totals/signatures begin row31;
- Print `A1:X35`;
- paperSize9 / portrait / scale75;
- centerHorizontal + protection structurally preserved from source.

### Part B 8
- source rows27:30 cloned exactly to31:34 and35:38;
- old row31 structural content shifts to row39;
- every cloned row height/customHeight/style pattern equals corresponding source row;
- exact source-block merge pattern translated to BOTH inserted blocks;
- every original affected merge shifts exactly +8;
- dimension exactly +8;
- Print `A1:X43`;
- paperSize9 / portrait / scale75;
- centerHorizontal + protection preserved.

Sentinel/count/Print_Area-only assertions are supplemental only and cannot satisfy acceptance.

## 11. Worksheet formula cell/node-set proof

Inspect only `xl/worksheets/*.xml` and detect formula nodes with `<f(?:\s|>)`.

Return sorted safe fingerprints containing:
- worksheet part;
- containing cell address where possible;
- safe hash of normalized formula node XML/structure.

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

Accepted originals are formula-free. Tests must prove source sets empty, every output set empty and zero additions.

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
D2-WP003-R3-R6-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R7-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R8-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R8-SOURCE-20260901-01
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

Authorization is consumed when the R3-R8 proof commit is pushed for independent review or invalidated by any scope/dependency change.
