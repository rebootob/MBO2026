# Business Rules Reference

1. **Employee Identity**: Derived from `Employee_Code` in App 53.
2. **Deterministic Record Key**: `{Fiscal_Year}-{Employee_Code}` preserving leading zeroes (`FY2026-0149`).
3. **Objective Quantity**: 2 to 10 Objectives (Default: 4).
4. **Total Weight**: Active objectives MUST sum to 100%. Inactive slots are excluded.
5. **Rating Scales**:
   - Difficulty Level: 1 to 4.
   - Achievement Level: 1 to 5.
   - Progress %: 0 to 100%.
6. **Pending Rule**: Competency 6 (Compliance / COCE) is collected but excluded from the 50-point score formula (`BUSINESS_RULE_PENDING`).
