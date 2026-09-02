# CONFIRMED BASELINE — D2 XLSX TEMPLATE PROFILE CLOSURE

> Status: **PASS / CLOSED**  
> Independent review date: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. Closure identity

```text
D2_XLSX_TEMPLATE_PROFILE_GATE = PASS / CLOSED
FINAL_IMPLEMENTATION_COMMIT = b59815aa5e5bad09ad252a10cdd1914185170fc0
FINAL_AUTHORIZATION_COMMIT = 368dcb4890621400fd9b6fabfb979599bf453a07
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
FINAL_CHANGED_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

This closure is based on independent repository review. No CI/runtime PASS is claimed.

## 2. Durable semantic authority

Canonical semantic evidence authority remains:
`D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`

```text
PROVEN_SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
DUPLICATE_EXCLUSIVE_SAFE_TO_MAP_TARGETS = 0
SAFE_TO_MAP_WITH_NULL_OR_UNKNOWN_SECURED_PATH = 0
CHIEF_FROZEN_AUTHORITY = R:X
CHIEF_SECURED_WRITABLE_ROLE = 0
```

No semantic authority is expanded by this profile closure.

## 3. Accepted Template Profile behavior

Frozen unless a proven regression or explicitly authorized new template/semantic baseline requires change:

- pure centralized Template Profile / Mapping architecture;
- no workbook read/write, filesystem production I/O, Kintone adapter, renderer orchestration or scoring engine in the profile;
- Part A template SHA256 = `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3`;
- Part B template SHA256 = `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
- Part A objective count domain = numeric integers 4..10 only;
- Part B competency count domain = numeric integers 6/7/8 only;
- unknown profile/template/count/role/mapping fails closed with `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- canonical resolver accepts only the closed SAFE semantics; non-canonical aliases do not widen writable authority;
- every successful writable resolution has a valid approved address and non-empty secured projection path;
- `OBJECTIVE_i_COMMENT` rejects; canonical `OBJECTIVE_i_SELF_COMMENT` resolves;
- `COMPETENCY_b_RATING` rejects; canonical `COMPETENCY_b_SELF_RATING` resolves;
- Part B Self structural authority = `K:Q`;
- Part B Chief structural/privacy authority = `R:X`, but no secured Chief writable semantic exists;
- row30/34/38 protected non-dynamic topology is preserved;
- no Excel scoring/formula mapping or recalculation is introduced.

## 4. Canonical Part B competency integrity

For every accepted N=6/7/8 and competency ordinal `b`, the validator requires exactly:

```text
index = b
row = canonical expected rating row
SELF_RATING = K{canonical expected row}
projectionPath = partB.competencyItems[b-1].selfRating
```

Canonical rating rows:

```text
N6 = 9, 13, 17, 21, 25, 29
N7 = 9, 13, 17, 21, 25, 29, 33
N8 = 9, 13, 17, 21, 25, 29, 33, 37
```

Wrong index, wrong row, different-but-valid self-rating address, wrong non-empty projection path, missing mapping, duplicate safe target or protected-row exposure must fail closed.

## 5. Mapping integrity freeze

`validateMappingIntegrity()` is accepted as the profile gate for the current MBO2026 mapping authority. It validates the accepted production-safe mapping structures across supported Part A/Part B count domains, including required address presence/shape, required projection-path presence, duplicate exclusive targets, protected Part B rows and exact Part B competency identity.

Future changes must not weaken these guards merely to accept a new template or unresolved semantic.

## 6. Architecture handoff to Production Renderer

Mandatory architecture authority remains:
`EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

The future Production XLSX Renderer must consume this closed Template Profile instead of scattering workbook addresses or recreating semantic/scoring logic.

Renderer acceptance still requires independent proof of:

```text
CENTRALIZED_TEMPLATE_MAPPING = PASS
NO_SCATTERED_IMPORTANT_CELL_ADDRESS = PASS
SEMANTIC_EXPORT_MODEL_BOUNDARY = PASS
SECURED_PROJECTION_AUTHORITY_PRESERVED = PASS
STRUCTURAL_BASELINES_PRESERVED = PASS
PRIVACY_BASELINE_PRESERVED = PASS
FORMULA_INVENTORY = EXACTLY ZERO
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
```

This baseline does **not** authorize Production Renderer implementation.

## 7. Authorization ledger

```text
D2-WP004-R1-R3-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
```
