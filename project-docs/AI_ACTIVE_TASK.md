# AI ACTIVE TASK — R2-B2 REVIEWED / NOT CLOSED / R2-B2-R1 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`, `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`, `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`, `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`, and only exact source/profile/test evidence required for the next authorized gate.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10
D2_WP004_R2_B2 = REVIEWED / SOURCE+TEST DEFECTS / NOT CLOSED

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2-B2-R1 = PROPOSED / NOT AUTHORIZED
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B2 implementation identity and scope review

```text
R2_B2_AUTHORIZATION_BASIS = 11c7e88eb8a516448e682f32e5a1ce755e7a79a3
R2_B2_AUTHORIZATION_COMMIT = 0037436d0c90ab84fdcb744cb2d1b8e5e8a0b685
R2_B2_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-SOURCE-TEST-20260903-01
R2_B2_IMPLEMENTATION_COMMIT = 0b4bac862aa2906d1ac11071431dbb268c7b7b5e
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

The implementation remains inside the authorized file boundary. Part A test/Profile/export-service/project-docs/package/UI/Kintone/D3 were not modified by the executor.

## 3. Accepted portions of R2-B2 implementation

The following design directions are accepted and should be preserved through corrective work:
- `preparePartBTemplate(templateBytes, { competencyCount, profile })` production entry point exists;
- competency domain is fail-closed to 6/7/8;
- exact Part B SHA gate is present;
- caller bytes are copied before working mutation;
- production remains browser-safe with no Node fs/path/crypto imports;
- raw OOXML value-payload sanitization reuses the accepted R10 approach rather than XlsxPopulate worksheet write/re-serialization;
- rows/cell references at downstream rows are relocated and SOURCE rows27:30 are cloned for N7/N8;
- dimension and Print_Area are emitted count-dependently;
- presentation title merges are added only for B31:J31 / B35:J35;
- Profile effective sanitization ranges are used;
- no semantic projection/Kintone/scoring/recalculation source was added;
- the new Part B test is fail-closed on missing/wrong owner template and uses direct owner SOURCE OOXML for row structural authority.

These accepted directions do NOT close B2 because exact structural/package/privacy proof has material gaps below.

## 4. BLOCKER A — production merge relocation corrupts frozen SOURCE topology

Current production merge transform applies different relocation thresholds to merge start and end rows:

```text
if (r1 >= 31) r1 += extraRows;
if (r2 >= 29) r2 += extraRows;
```

This violates the frozen Part B structural authority that rows1:30 and the original source block remain structurally stable.

Concrete consequence for N7/N8:
- SOURCE `B29:J29` becomes `B29:J33` / `B29:J37`;
- SOURCE `K29:Q29` becomes `K29:Q33` / `K29:Q37`;
- SOURCE `R29:W29` becomes `R29:W33` / `R29:W37`;
- cloned rating-scale merges `B33:J33` / `B37:J37` are then also added;
- title overlays such as `B31:J31` can sit inside an incorrectly stretched SOURCE merge.

This is a production structural defect, not a cosmetic test issue.

Frozen authority requires:
- original rows1:30 merge topology preserved exactly;
- exactly six source-block merges cloned with +4/+8 offsets;
- only downstream merge references at/after the row31 threshold relocated exactly;
- complete intermediate merge inventory exact, not count-only.

R2-B2 remains NOT CLOSED until production transform is corrected.

## 5. BLOCKER B — test claims exact merge proof but checks count/presence only

The focused test labels section G as complete merge-set deep equality, but it currently proves only:
- declared count equals actual count;
- final count equals 79/86/93;
- B31:J31 / B35:J35 title merges are present.

It does NOT derive the complete expected intermediate/final merge inventory directly from SOURCE and `deepEqual` it.

Therefore the production corruption in Blocker A can escape the test while merge counts remain green.

Required corrective proof:
1. parse and sort the exact SOURCE merge inventory;
2. derive expected N6/N7/N8 intermediate inventory directly from SOURCE using only authorized relocation/cloning rules;
3. deepEqual actual intermediate sorted inventory to expected;
4. derive expected final inventory as intermediate + exact authorized title overlays only;
5. deepEqual actual final sorted inventory to expected;
6. verify no duplicate/overlapping stale SOURCE identity and declared count = actual.

No count-only substitute is acceptable.

## 6. BLOCKER C — raw SOURCE guard is incomplete

The authorized contract required SOURCE rows27:30 to contain exactly the frozen six source-block merge ranges. Current production only checks global merge count 79 and row existence; it does not validate the exact six source-block merge refs before mutation.

Corrective production guard must derive SOURCE merge refs and require exactly:

```text
B28:J28
K28:Q28
R28:W28
B29:J29
K29:Q29
R29:W29
```

It must also fail closed if an unexpected merge crosses the downstream row31 boundary unless that exact crossing is independently present in the frozen SOURCE authority and has a defined deterministic transform.

## 7. BLOCKER D — source-backed post-structural protected/static guard is not implemented

`validateMappingIntegrity(profile)` correctly validates Profile topology/counts and zero overlap with protected padding/Rating Scale ranges. It does not prove that the transformed worksheet actually matches SOURCE-derived merge/style/protected topology.

Before presentation overlay/sanitization, production B2 must fail closed on material divergence in at least:
- SOURCE-derived row/source-row relocation;
- exact normalized merge identity;
- protected Rating Scale topology;
- protected padding rows;
- style identity needed to distinguish dynamic vs protected/static cells;
- exact Profile effective sanitization set/count;
- zero effective-sanitization overlap with protected static addresses.

Do not import/call the Node feasibility harness. Implement only browser-safe bounded checks inside the preparer.

## 8. BLOCKER E — Part B proof matrix is still weaker than the authorized contract

Additional proof gaps to correct in the same bounded test file:

### Auxiliary Sheet1
Current package authority stores only auxiliary dimension. Contract requires exact auxiliary `Sheet1` fingerprint preservation. Add deterministic full SOURCE-derived auxiliary worksheet fingerprint (raw XML hash or exact normalized authority) and deepEqual every N6/N7/N8 output.

### Non-target defined names
Capture all non-Print_Area defined names deterministically and prove SOURCE equality. Print_Area is the only authorized defined-name change.

### Protected static preservation
Current test proves padding row existence and Rating Scale values are merely non-null. Replace/extend this with SOURCE-derived exact structural/style/merge/value preservation for:

```text
N6: B29:J29 + padding row30
N7: B29:J29 + B33:J33 + padding rows30/34
N8: B29:J29 + B33:J33 + B37:J37 + padding rows30/34/38
```

For cloned protected rows/ranges, expected authority must derive from exact SOURCE rows27:30 with row-number normalization only.

### No semantic writes
Retain zero semantic-write proof and align address assertions with frozen Part B mappings; do not use unrelated cells as a proxy for competency self-rating/title/description/summary targets.

## 9. Correct merge transformation contract for R2-B2-R1

Build a deterministic SOURCE merge inventory before mutation.

For N7/N8:

1. Preserve every SOURCE merge whose endpoints are entirely before row31 exactly unchanged.
2. Relocate every SOURCE merge whose endpoints are entirely at/after row31 by `extraRows` on BOTH endpoints.
3. If any SOURCE merge crosses row31, fail closed unless an exact separately documented frozen transformation exists. Do not invent generic repair.
4. Clone exactly the six SOURCE block merges for each inserted 4-row block using +4 / +8 offset on BOTH endpoints.
5. Sort/deduplicate and verify exact intermediate inventory before overlay:
   - N6 = 79
   - N7 = 85
   - N8 = 91
6. Add only exact presentation title overlays:
   - N7: B31:J31
   - N8: B31:J31 + B35:J35
7. Verify exact final inventory after overlay:
   - N6 = 79
   - N7 = 86
   - N8 = 93
8. Preserve existing description merges B32:J32 and B36:J36 exactly as required by SOURCE-derived overlay authority.

## 10. Exact next proposed gate — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B2-R1
NAME = PART B EXACT MERGE TOPOLOGY + SOURCE-BACKED STATIC PROOF CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js

PROFILE_CHANGE_AUTH = NONE
EXPORT_SERVICE_CHANGE_AUTH = NONE
PART_A_CHANGE_AUTH = NONE
SEMANTIC_RENDERER_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R1 must correct only Blocks A-E above. Preserve all accepted B2 and R2-B1 behavior.

## 11. Required R1 focused runtime gate

Exact command:

`node --test tests/mbo-xlsx-template-preparer-part-b.test.js`

Closure candidate requires:

```text
FAIL = 0
SKIP = 0
real owner Part B template = EXECUTED / NOT SKIPPED
N6/N7/N8 matrix = PASS
SOURCE-derived intermediate merge inventory deep equality = PASS
SOURCE-derived final merge inventory deep equality = PASS
protected Rating Scale/padding exact parity = PASS
auxiliary Sheet1 full fingerprint parity = PASS
non-target defined-name parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

If a stricter exact proof exposes another production defect, do not weaken tests. Report evidence and STOP.

## 12. Forbidden until further owner authorization

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
existing feasibility tests = FORBIDDEN
existing Part A preparer test = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 13. Owner decision

No executor is active.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-B2-R1 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
