# D2-WP004-R2-PRE2 — PART B EXPANDED PRESENTATION AUTHORITY READ-ONLY DESIGN

> Status: **CONTROL-PLANE READ-ONLY DESIGN COMPLETE / IMPLEMENTATION NOT AUTHORIZED**  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Design basis HEAD: `0e6fe2139578663f1c1d55e2cd6a223e389e55f9`  
> Owner authorization: `อนุมัติ D2-WP004-R2-PRE2 READ-ONLY DESIGN ตามขอบเขตที่เสนอ`  
> Updated: 2026-09-02 ICT

## 1. Objective

Close the remaining design ambiguity between the accepted PRE1/PRE1-R1 evidence and Production XLSX Renderer implementation without widening authority by intuition.

PRE2 decides only:
1. deterministic secured presentation source for expanded Part B competency Title and Description;
2. exact N7/N8 title geometry policy;
3. exact downstream impact on structural overlays, privacy/sanitization, Template Profile authority, preservation and tests;
4. smallest next implementation work package.

PRE2 does **not** authorize source, test, profile, renderer, Kintone, deployment or D3 changes.

## 2. Frozen authority consumed

PRE2 preserves the closed gates and accepted PRE1/PRE1-R1 findings:

```text
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_PRE1 = PASS / CLOSED
D2_WP004_R2_PRE1_R1 = PASS / CLOSED

OWNER_PART_B_SHA = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
COMPETENCY_6_TITLE_MERGE = B26:J27
TITLE_MERGE_CLONED_TO_N7_N8 = NO
N7_TITLE_CELL = B31 / UNMERGED
N8_TITLE_CELL = B35 / UNMERGED
RATING_SCALE = CLONE_AS_STATIC_VALID
COMPETENCY_b_SELF_RATING = EXISTING SAFE ROLE
```

Current secured projection preserves presentation-adjacent fields including:

```text
id / competencyId / code
name / title / competencyName
description
weight / weightPercent
category / group
```

Renderer-side alias selection remains forbidden.

## 3. PRE2 Decision A — scope dynamic presentation only to expanded competencies

The exact owner template is the N=6 Staff & Chief asset and already contains authoritative static presentation for competencies 1..6.

Therefore:

```text
COMPETENCY_1_TO_6_TITLE = OWNER_TEMPLATE_STATIC_AUTHORITY
COMPETENCY_1_TO_6_DESCRIPTION = OWNER_TEMPLATE_STATIC_AUTHORITY
COMPETENCY_1_TO_6_PRESENTATION_WRITE = FORBIDDEN

COMPETENCY_7_TO_8_PRESENTATION = SECURED_DYNAMIC_PRESENTATION_REQUIRED
```

This is the smallest mutation policy:
- N=6 presentation stays byte/content-preserving except already-authorized sanitizer/output operations;
- only inserted competency 7/8 presentation may become new writable semantic authority;
- renderer must not rewrite the existing six owner-template titles/descriptions from aliases.

## 4. PRE2 Decision B — canonical semantic identity is `code`, not title aliases

For expanded presentation, the stable semantic identity is the normalized competency code accepted by current competency evidence.

Exact expanded identities:

```text
b=7 -> code = COMP_LEAD
b=8 -> code = COMP_STRAT
```

Canonical English display bases:

```text
COMP_LEAD  -> Leadership & People Management
COMP_STRAT -> Strategy & Coaching
```

The future secured projection boundary must fail closed unless the expanded item ordinal and semantic code agree exactly.

Forbidden as semantic identity/source selection:

```text
name
raw title
competencyName
legacy Kintone label text
alias precedence / first-nonblank guessing
```

Reason: accepted source evidence records legacy label inconsistency for competency 7, while normalized semantic code remains the stable identity.

## 5. PRE2 Decision C — canonical secured presentation fields

`MboExportService` remains the only secured data authority presented to the renderer.

Before Production Renderer implementation, `MboExportService.projectCombinedExport()` must expose canonical expanded presentation fields:

```text
partB.competencyItems[b-1].presentationTitle
partB.competencyItems[b-1].presentationDescription
```

### 5.1 `presentationTitle`

For b=7/8 only:

```text
verify ordinal + exact semantic code
-> resolve canonical English display base from code authority
-> compose exact presentation title using ordinal
```

Target values:

```text
b=7 + COMP_LEAD  -> "7. Leadership & People Management"
b=8 + COMP_STRAT -> "8. Strategy & Coaching"
```

No fallback to `name`, `title`, `competencyName`, legacy labels or workbook stale text is allowed.

### 5.2 `presentationDescription`

For b=7/8 only:

```text
presentationDescription = exact nonblank item.description
```

Rules:
- exact semantic code/ordinal match is required first;
- `description` must be a nonblank string;
- no translation, concatenation, alias fallback or stale-template fallback;
- renderer must write the exact secured string supplied by `MboExportService`;
- missing/malformed description fails closed rather than displaying competency-6 text.

### 5.3 Proposed fail-closed error

Smallest explicit blocker family for the projection corrective:

```text
EXPORT_COMPETENCY_PRESENTATION_UNRESOLVED
```

This error is proposed for missing/wrong expanded semantic code, unsupported expanded ordinal, or missing/blank expanded description.

## 6. PRE2 Decision D — N7/N8 title geometry uses a bounded post-structural merge overlay

Keeping B31/B35 unmerged would produce a visually weaker/non-equivalent title region and would rely on text overflow behavior. Expanding the cloned block to five rows would disturb row relocation, dimensions and summary layout.

The smallest deterministic geometry is therefore one added title merge per inserted competency block:

```text
N7:
  COMPETENCY_7_TITLE = B31
  TITLE_MERGE = B31:J31
  DESCRIPTION = B32 / existing merge B32:J32
  RATING_SCALE = B33:J33 / static-valid
  PADDING = row34 / protected

N8:
  COMPETENCY_7_TITLE = B31
  TITLE_MERGE = B31:J31
  DESCRIPTION = B32 / existing merge B32:J32

  COMPETENCY_8_TITLE = B35
  TITLE_MERGE = B35:J35
  DESCRIPTION = B36 / existing merge B36:J36
  RATING_SCALE = B37:J37 / static-valid
  PADDING = row38 / protected
```

This overlay occurs **after** the frozen Part B structural transform has independently satisfied its existing baseline.

## 7. Structural impact — preserve frozen baseline as an intermediate invariant

Do not reopen or weaken the closed structural transform.

Processing authority should be layered:

```text
OWNER TEMPLATE
-> FROZEN STRUCTURAL TRANSFORM
-> VERIFY EXISTING STRUCTURAL BASELINE
-> APPLY EXPANDED PRESENTATION TITLE-MERGE OVERLAY
-> VERIFY PRESENTATION OVERLAY
```

Frozen intermediate merge counts remain:

```text
N6 = 79
N7 = 85
N8 = 91
```

Effective renderer-output merge counts after the proposed title overlay become:

```text
N6 = 79
N7 = 86  (+ B31:J31)
N8 = 93  (+ B31:J31 + B35:J35)
```

Unchanged:
- row count and row relocation;
- dimension: N6 `A1:X35`, N7 `A1:X39`, N8 `A1:X43`;
- Print_Area values;
- summary start rows;
- rating rows;
- padding rows 30/34/38;
- formula inventory = zero;
- auxiliary `Sheet1` invariants;
- reference-image authority.

The presentation overlay must fail closed if its exact target cells/merges or expected pre-overlay topology are not present.

## 8. Privacy and sanitization overlay

The closed expanded-privacy Baseline remains a mandatory **pre-overlay validation authority**.

Base dynamic-address counts remain frozen:

```text
N6 = 432
N7 = 474
N8 = 516
```

After base structural/privacy validation passes, the future renderer may apply a narrowly scoped expanded-presentation overlay.

New presentation dynamic ranges:

```text
N6: none
N7: B31:J32 = 18 cells
N8: B31:J32 + B35:J36 = 36 cells
```

Proposed effective renderer dynamic counts:

```text
N6 = 432
N7 = 492
N8 = 552
```

Required classifications:

```text
B31:J31 / B35:J35 = DYNAMIC_COMPETENCY_PRESENTATION_TITLE
B32:J32 / B36:J36 = DYNAMIC_COMPETENCY_PRESENTATION_DESCRIPTION
B33:J33 / B37:J37 = PROTECTED_STATIC_RATING_SCALE
row34 / row38 = PROTECTED_STATIC_PADDING
R:X = existing Chief structural/privacy authority only
```

Security order:

```text
frozen structural transform
-> frozen source-backed privacy validation
-> title-merge presentation overlay
-> exact presentation-overlay topology validation
-> sanitize expanded title/description ranges
-> write secured canonical presentation values
-> package/shared-string purge + final validation
```

Important: the stale competency-6 description copied into B32/B36 must first be validated as the expected frozen clone, then cleared before secured presentation write. Validation must not be weakened merely because the final role becomes dynamic.

## 9. Template Profile authority impact

Current semantic authority remains 18 SAFE until a separately authorized implementation + independent closure expands it.

PRE2 proposes two new safe role families for expanded competencies only:

```text
COMPETENCY_b_TITLE
COMPETENCY_b_DESCRIPTION
```

They must resolve only for `b=7` or `b=8` when the requested competency count contains that ordinal.

Proposed secured paths:

```text
COMPETENCY_b_TITLE
  -> partB.competencyItems[b-1].presentationTitle

COMPETENCY_b_DESCRIPTION
  -> partB.competencyItems[b-1].presentationDescription
```

Proposed exact addresses:

```text
b=7 TITLE = B31   / merge B31:J31
b=7 DESCRIPTION = B32 / merge B32:J32

b=8 TITLE = B35   / merge B35:J35
b=8 DESCRIPTION = B36 / merge B36:J36
```

For b=1..6 these new semantic roles must fail closed so owner-template static presentation cannot be overwritten.

If later independently accepted, durable safe-role family count would become:

```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
```

No Chief authority changes.

The Template Profile should centralize:
- expanded title/description addresses;
- exact presentation merge ranges;
- exact projection paths;
- presentation dynamic ranges/topology;
- existing protected padding rows;
- no scattered renderer literals.

## 10. Preservation / reference-image impact

PRE2 does not alter:
- template SHA authority;
- owner source bytes;
- reference-image removal authority;
- auxiliary sheet preservation;
- page setup, margins, orientation or print areas;
- Option-B `Sheet1 <sheetPr/>` normalization;
- formula zero authority.

The final main-sheet merge inventory intentionally gains only the exact title overlay merge(s). Therefore preservation should be proven as:

```text
closed structural/preservation baseline passes first
AND
final difference from that baseline equals only the authorized presentation overlay + sanitized/written output targets
```

Broad workbook repair or generic merge normalization remains forbidden.

## 11. Required test contracts before renderer implementation

### A. Secured projection canonicalization
Required tests:
- b7 + `COMP_LEAD` => exact canonical `presentationTitle`;
- b8 + `COMP_STRAT` => exact canonical `presentationTitle`;
- expanded `presentationDescription` is exact `description` passthrough;
- conflicting `name/title/competencyName` cannot override code-derived title;
- wrong/missing code fails closed;
- missing/blank expanded description fails closed;
- N6 remains backward-compatible and does not require dynamic presentation canonicalization;
- Employee-Self keeps only safe presentation values and no evaluator leakage;
- Approver projection produces the same canonical presentation identity.

### B. Template Profile
Required tests:
- title/description roles reject b1..6;
- exact b7/b8 addresses, merges and secured paths;
- count boundary rejects b8 under N7;
- no duplicate target overlap;
- title/description never overlap K:X rating authority;
- padding rows remain non-dynamic;
- mapping integrity preserves all existing safe roles.

### C. OOXML presentation overlay / privacy proof
Required tests:
- pre-overlay N6/N7/N8 still exactly satisfy closed structural merge counts 79/85/91;
- overlay output counts exactly 79/86/93;
- N7 has exactly B31:J31 added and N8 exactly B31:J31 + B35:J35 added;
- dimensions, Print_Area, row sequence and summary relocation unchanged;
- base privacy validation runs before overlay;
- effective presentation dynamic sets are exactly +0/+18/+36;
- effective counts exactly 432/492/552;
- Rating Scale and padding remain protected static;
- stale cloned competency-6 description is sanitized before secured write;
- caller/source bytes remain immutable;
- formula inventory remains exactly zero.

## 12. Smallest next implementation work package

The smallest dependency that should close first is the secured projection boundary. Do **not** ask Antigravity to implement geometry/profile/renderer before this is independently accepted.

### Proposed `D2-WP004-R2-PRE2-R1`

```text
NAME = EXPANDED COMPETENCY CANONICAL PRESENTATION PROJECTION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
WRITABLE_FILES =
  src/services/mbo-export-service.js
  tests/mbo-export-service.test.js

PROFILE_CHANGE = FORBIDDEN
OOXML_FEASIBILITY_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

Required R1 output:
- canonical b7/b8 code validation;
- exact `presentationTitle`;
- exact `presentationDescription`;
- fail-closed behavior;
- focused tests only;
- one implementation commit -> push -> STOP -> independent ChatGPT review.

After R1 closes, later separately authorized bounded steps should establish Template Profile authority and OOXML presentation-overlay proof before Production Renderer implementation.

## 13. PRE2 final decision

```text
D2-WP004-R2-PRE2 = READ-ONLY DESIGN COMPLETE
ANTIGRAVITY_USED = NO
SOURCE_CHANGE = 0
TEST_CHANGE = 0
PROFILE_CHANGE = 0
RENDERER_CHANGE = 0

CANONICAL_EXPANDED_IDENTITY = code
B7_CODE = COMP_LEAD
B8_CODE = COMP_STRAT
CANONICAL_TITLE_SOURCE = MboExportService code-derived presentationTitle
CANONICAL_DESCRIPTION_SOURCE = MboExportService exact item.description -> presentationDescription
ALIAS_PRECEDENCE = FORBIDDEN

N7_TITLE_OVERLAY = B31:J31
N8_TITLE_OVERLAY = B31:J31 + B35:J35
FROZEN_INTERMEDIATE_MERGES = 79 / 85 / 91
PROPOSED_EFFECTIVE_MERGES = 79 / 86 / 93
BASE_PRIVACY_DYNAMIC = 432 / 474 / 516
PROPOSED_EFFECTIVE_DYNAMIC = 432 / 492 / 552

CURRENT_SAFE_TO_MAP = 18 EXACT
PROPOSED_AFTER_FUTURE_CLOSURE = 20 EXACT
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
