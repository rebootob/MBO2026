# D2 REVIEW FAST-START — MBO2026

Updated: 2026-09-03 ICT
Repository: `rebootob/MBO2026`
Branch: `ai/antigravity-wp002c`

## Fast path
Fresh-fetch HEAD -> this file -> `AI_ACTIVE_TASK.md` -> exact next-gate source/test/design only. Do not reopen R2-B1/R2-B2 without a proven regression. Do not broad-scan or auto-start Antigravity.

## Project truth
```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
PRE1/PRE2 BASELINES = CLOSED AS DOCUMENTED
R2_A = PASS / CLOSED AFTER R1
R2_B1 = PASS / CLOSED AFTER R10
R2_B2 = PASS / CLOSED AFTER R4 RUNTIME PROOF
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME = PASS 3 / FAIL 0 / SKIP 0
R2_C = REVIEWED / NOT CLOSED
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
R2_C_R1_IMPLEMENTATION = aee75a8f01c681766ac6258cb02c267469ae97ff
R2_C_R1 = REVIEWED / PARTIAL PASS / NOT CLOSED
R2_C_R2 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## Durable closed gates
R2-B1 and R2-B2 remain PASS/CLOSED/FROZEN. Do not reopen without proven regression.

## R2-C-R1 independent review

Authorization:
`0bd15f14918751b2cda2c2acc66ea3ab6d40f61f`

Implementation:
`aee75a8f01c681766ac6258cb02c267469ae97ff`

Scope PASS:
- exactly one corrective commit;
- only `src/services/mbo-xlsx-semantic-renderer.js` and `tests/mbo-xlsx-semantic-renderer.test.js` changed;
- no frozen-file changes.

Accepted R1 improvements:
- exact main-sheet relation / exact Print_Area / dimension guards;
- target cell EXACTLY-ONCE pre-write guard;
- stronger Part A image3 and Part B merge/rating/padding/aux guards;
- caller-byte content immutability;
- whitespace-only strings preserved and `xml:space="preserve"` added;
- representative BOTH-Part privacy and authorized-diff tests improved.

Remaining material blockers:
- production still parses/rebuilds target opening attributes instead of preserving exact raw non-`t` authority;
- production final post-write preservation does not yet explicitly compare all required prepared-before package/topology/cell-inventory invariants;
- Part A N4..N10 test remains spot-check based rather than every Profile-derived SAFE role + exact role counts + full sanitization blank proof;
- Part B N6/N7/N8 remains spot-check based (`K9`/`R31`/`B29` examples) rather than full Profile-derived matrix, full Chief R:X, summaries, static/padding/rating/aux parity and nonwritten-sensitive proof;
- fail-closed perturbation matrix still misses malformed Part B count, duplicate Print_Area, sheet-name identity, independent forbidden image relationship, actual merge corruption, padding/aux corruption, full invalid-scalar set and Part B caller-immutability cases;
- authorized-diff normalizer uses the same parser/rebuilder pattern as production and can normalize away the defect it should detect;
- real canonical privacy/presentation proof still needs N8 `COMP_STRAT` + alias-resistance closure.

Repository CI/status/workflow evidence for R1 is unavailable, but static blockers already prevent closure.

## Exact next proposal — D2-WP004-R2-C-R2 / NOT AUTHORIZED

```text
NAME = SECURED SEMANTIC RENDERER EXACT ATTRIBUTE + FULL MATRIX CLOSURE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1

PROPOSED WRITABLE ONLY:
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js

FROZEN:
  src/profiles/mbo-xlsx-template-profile.js
  src/services/mbo-xlsx-template-preparer.js
  src/services/mbo-export-service.js
  existing Profile/Preparer/Feasibility/export tests
```

R2 must close only:
- exact raw opening-tag preservation except authorized `t`/payload change;
- exact production post-write package/topology/cell-inventory preservation;
- full Part A N4..N10 Profile-derived role matrix;
- full Part B N6/N7/N8 Profile-derived role/privacy/static matrix;
- complete fail-closed perturbations;
- independent authorized-diff oracle with sentinel non-type attributes;
- N7 + N8 real canonical presentation and alias-resistance privacy proof.

Full authoritative R2 proposal is in `AI_ACTIVE_TASK.md`.

Recommended owner approval phrase:

`อนุมัติ D2-WP004-R2-C-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Combined Excel remains later. Kintone/deploy/Live UAT remain forbidden. `D3 = HOLD` until D2 is fully PASS/CLOSED.
