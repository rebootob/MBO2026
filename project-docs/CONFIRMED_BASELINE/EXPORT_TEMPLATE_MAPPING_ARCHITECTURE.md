# CONFIRMED BASELINE — EXPORT TEMPLATE MAPPING ARCHITECTURE

> Status: **CONFIRMED / MANDATORY**  
> Confirmed by Owner decision: 2026-09-02 ICT  
> Applies to: future Production XLSX Renderer and subsequent Excel/PDF export maintenance

## 1. Objective

Future MBO form/template or Kintone field changes must be maintainable without scattering workbook cell/range addresses throughout production business logic.

The export architecture must isolate template layout knowledge from secured export data and rendering orchestration.

## 2. Core rule

```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = MANDATORY
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
```

Important workbook cell/range addresses must be owned by one centralized Template Profile / Mapping layer rather than repeated throughout renderer functions.

## 3. Required conceptual separation

```text
Kintone / App794
    = business data + scoring truth

MboExportService
    = secured export-data projection

Canonical Export Model
    = semantic export fields/roles

Template Profile / Mapping
    = workbook layout addresses/ranges for one template version

Production Renderer
    = applies secured canonical data through the selected profile

Excel Template
    = visual/layout authority
```

The renderer must not become a second scoring engine and must not independently reconstruct confidential data omitted by the secured projection.

## 4. Semantic mapping requirement

Production code should bind semantic export roles, for example:

```text
EMPLOYEE_NAME
EMPLOYEE_CODE
DEPARTMENT
SECTION
POSITION
PART_B_COMPETENCY_RATING_SELF
PART_B_COMPETENCY_RATING_CHIEF
PART_B_SUMMARY_SIGNATURE
```

The Template Profile owns the concrete addresses/ranges associated with those semantic roles.

A future template revision should normally require a profile/mapping update plus focused regression tests rather than broad business-logic rewrites.

## 5. Template-version evolution

Multiple template versions may coexist when necessary, for example:

```text
MBO2026_TEMPLATE_PROFILE
MBO2027_TEMPLATE_PROFILE
MBO2028_TEMPLATE_PROFILE
```

Each profile must have:
- a deterministic template identity/version;
- centralized semantic-to-address/range mapping;
- explicit structural/privacy compatibility constraints;
- focused tests proving required mappings are complete and non-conflicting;
- fail-closed behavior when an expected template identity or mapping cannot be resolved.

## 6. Change impact policy

Typical future changes should follow:

```text
field added/renamed
  -> secured projection/canonical model review if needed
  -> centralized mapping update
  -> focused tests

small template cell/range move
  -> profile/mapping update
  -> structural/privacy regression tests

major template redesign
  -> new or revised template profile
  -> structural/privacy onboarding gate
  -> renderer reused where semantic contract remains compatible
```

A material scoring-policy change remains Kintone/App794 authority work and must not be implemented as Excel formulas or renderer-side score recalculation.

## 7. Forbidden patterns

Do not:
- scatter raw cell/range literals across production renderer/business functions;
- duplicate the same semantic mapping in multiple modules;
- silently infer a new template layout when expected mapping evidence is missing;
- hard-code template-specific addresses inside scoring/domain logic;
- weaken privacy/structural fail-closed controls merely to accept an unknown template revision;
- treat a new template file as automatically compatible with an existing profile.

## 8. Production Renderer acceptance requirement

Before Production XLSX Renderer can close, independent review must be able to prove:

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

This baseline is an architecture requirement only. It does not authorize Production Renderer implementation.
