# Confirmed Evaluation Classes

Status: CONFIRMED / FROZEN

These are the approved current MBO evaluation/scoring profile families. Do not create a new profile or change a weight without a new explicit business decision and review.

| Evaluation Level | Profile Code | Part A | Part B |
| :--- | :--- | ---: | ---: |
| Staff / Chief | `PROF_STAFF_CHIEF` | 70 | 30 |
| Japanese Staff | `PROF_JAPANESE_STAFF` | 70 | 30 |
| Assistant Manager | `PROF_ASST_MGR` | 60 | 40 |
| Section Manager | `PROF_SECTION_MGR` | 50 | 50 |
| Senior Manager | `PROF_SENIOR_MGR` | 50 | 50 |
| Deputy General Manager | `PROF_DGM` | 50 | 50 |
| General Manager | `PROF_GM` | 50 | 50 |
| Vice President | `PROF_VP` | 50 | 50 |

## Confirmed Scoring Appraiser Model

User-confirmed on 2026-08-26:

- Scoring Appraiser and Workflow Approver are separate business concepts/authorization concerns. Never infer an appraiser label or workflow authority solely from an organizational title.
- User-facing appraiser terminology is neutral and ordinal: `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`, `4th Appraiser`.
- Logical architecture must support **1 to 4 configured appraiser slots**. The active count is configuration/route-driven; do not hardcode a fixed count or Manager/GM role names.
- The **same configured appraiser sequence belongs to the MBO record for the whole annual lifecycle**, not only the final-scoring screen. It remains the evaluation route/context across Objectives, Mid-Year, Self Evaluation, Appraiser Evaluation, and HR Final/Completed.
- Each macro stage may expose a different action for those same appraiser slots (review, approval, scoring, read-only context, or no action), but the UI must not create a different set of appraisers for each phase.
- A person occupying Appraiser 1/2/3/4 may organizationally be a Manager, GM, VP, President, or another approved evaluator. Organizational title is data/context only and must not be used as the slot label.
- Workflow technical storage/Process status names may retain legacy Manager/GM terminology for compatibility, but user-facing UI must present the resolved sequence as ordinal appraiser/evaluator slots unless HR-specific action is explicitly shown.
- Appraiser weights derive from the configured expected count and approved weight rule. Under equal distribution: 1 = 100%; 2 = 50/50; 3 = 1/3 each; 4 = 25% each.
- Completeness remains fail-closed: a final Part A, Part B, or overall result must not be represented as complete until all required scoring-appraiser inputs are complete. Missing appraisers do not receive automatic weight redistribution.
- Existing published App796 configurations currently using 1 or 2 appraisers remain unchanged until a separately reviewed configuration change. Supporting capacity up to 4 does not itself change any profile's current published appraiser count.
- Current App794/App796 source and physical storage that only implement 1–2 scoring persistence slots are an implementation limitation to be closed under a reviewed change; they are not the long-term business maximum.
- **Evaluation profile/scoring ratio is not routing.** `70/30`, `60/40`, and `50/50` describe Part A / Part B weighting only. UI/runtime must not infer route topology, appraiser count, or specific evaluator identity from the ratio alone. Routing/profile binding must be resolved by reviewed configuration and fail closed when unresolved.

## Current Evidence Rule for Employee Classification

Priority for resolving an employee's evaluation level:

1. Verified historical membership in the prior-year legacy PMS app(s), cross-checked with current App53 data.
2. Current App53 position/hierarchy when a level change or promotion is evident.
3. Confirmed position mapping rule.
4. Never guess from an ambiguous title alone.

A historical/current conflict must be classified and reviewed (for example promotion/level change); historical membership must not blindly overwrite the current organization level.

## Data Quality

Blank/invalid current Position values remain fail-closed unless another approved authoritative rule resolves the current level. Do not fabricate a profile solely to obtain 100% coverage.