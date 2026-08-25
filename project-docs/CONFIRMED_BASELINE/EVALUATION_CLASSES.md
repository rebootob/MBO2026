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

## Current Evidence Rule for Employee Classification

Priority for resolving an employee's evaluation level:

1. Verified historical membership in the prior-year legacy PMS app(s), cross-checked with current App53 data.
2. Current App53 position/hierarchy when a level change or promotion is evident.
3. Confirmed position mapping rule.
4. Never guess from an ambiguous title alone.

A historical/current conflict must be classified and reviewed (for example promotion/level change); historical membership must not blindly overwrite the current organization level.

## Data Quality

Blank/invalid current Position values remain fail-closed unless another approved authoritative rule resolves the current level. Do not fabricate a profile solely to obtain 100% coverage.