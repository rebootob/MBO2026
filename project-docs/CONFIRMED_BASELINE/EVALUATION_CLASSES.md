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

- Scoring Appraiser and Workflow Approver are separate business concepts. Never infer a scoring role title solely from a workflow title/position.
- Scoring UI terminology is neutral and ordinal: `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`, `4th Appraiser`.
- Logical scoring architecture must support **1 to 4 required appraisers**.
- The required count is configuration-driven for the annual evaluation profile; do not hardcode Manager/GM counts or role names.
- Appraiser weights derive from the configured expected count and approved weight rule. Under equal distribution: 1 = 100%; 2 = 50/50; 3 = 1/3 each; 4 = 25% each.
- Completeness remains fail-closed: a final Part A, Part B, or overall result must not be represented as complete until all required scoring-appraiser inputs are complete. Missing appraisers do not receive automatic weight redistribution.
- Existing published App796 configurations currently using 1 or 2 appraisers remain unchanged until a separately reviewed configuration change. Supporting capacity up to 4 does not itself change any profile's current published appraiser count.
- Current App794/App796 source and physical storage that only implement 1–2 appraisers are an implementation limitation to be closed under a reviewed change; they are not the long-term business maximum.

## Current Evidence Rule for Employee Classification

Priority for resolving an employee's evaluation level:

1. Verified historical membership in the prior-year legacy PMS app(s), cross-checked with current App53 data.
2. Current App53 position/hierarchy when a level change or promotion is evident.
3. Confirmed position mapping rule.
4. Never guess from an ambiguous title alone.

A historical/current conflict must be classified and reviewed (for example promotion/level change); historical membership must not blindly overwrite the current organization level.

## Data Quality

Blank/invalid current Position values remain fail-closed unless another approved authoritative rule resolves the current level. Do not fabricate a profile solely to obtain 100% coverage.