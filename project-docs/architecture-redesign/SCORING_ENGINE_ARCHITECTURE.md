# Scoring Engine & Formula Algorithm Blueprint

> **Document Status:** Complete (Ready for User Freeze Review)  
> **Core Algorithm:** Standardized Weighted Dual-Stage Score Engine (`WEIGHTED_PART_A_B`)  
> **Last Updated:** 2026-08-24  

---

## 1. Unified Scoring Algorithm (`WEIGHTED_PART_A_B`)

All evaluation profiles execute the identical mathematical algorithm parameterized by configuration:

```mermaid
graph TD
    subgraph Part_A_Calculation [Part A: Objective Performance (Scale: 0 - 5)]
        OBJ["Active Objectives (2 to 10)"] --> MAP["Matrix Mapping: Diff (1-4) x Ach (1-5) -> Points (1-5)"]
        MAP --> AVG_OBJ["Avg Points per Obj = (App1 + App2) / 2"]
        AVG_OBJ --> W_OBJ["Obj Weighted Points = (Avg Points / 5) * Weight"]
        W_OBJ --> SUM_A["Total Part A Score (0 - 100) = Sum(Obj Weighted Points)"]
        SUM_A --> PART_A_FINAL["Part A Final Weighted = ROUND((Total Part A * Part_A_Weight) / 100, 2)"]
    end

    subgraph Part_B_Calculation [Part B: Competency Performance (Scale: 0 - 5)]
        RATINGS["Appraiser Ratings on Included Items (Excluding COCE)"] --> SUM_B["Sum of Included Ratings"]
        SUM_B --> DENOM["Denominator = Included Competency Count x Appraiser Count"]
        DENOM --> AVG_B["Part B Raw Average (1 - 5) = ROUND(Sum / Denominator, 2)"]
        AVG_B --> PART_B_FINAL["Part B Final Weighted = ROUND(AVG_B * (Part_B_Weight / 5), 2)"]
    end

    PART_A_FINAL --> TOTAL_SCORE["Total MBO Score (Scale: 0 - 100) = ROUND(Part A Final + (Part B Final * 20), 2)"]
    PART_B_FINAL --> TOTAL_SCORE
```

---

## 2. Difficulty x Achievement Mapping Matrix (Universal Standard)

The 4-level Difficulty x 5-level Achievement mapping extracted from legacy Kintone formulas is mathematically invariant across all profiles:

$$\begin{array}{|c|c|c|c|c|c|}
\hline
\textbf{Difficulty Level} & \textbf{Ach = 1} & \textbf{Ach = 2} & \textbf{Ach = 3} & \textbf{Ach = 4} & \textbf{Ach = 5} \\
\hline
\textbf{Level 4 (Highest)} & 2 & 3 & 4 & 4 & 5 \\
\textbf{Level 3 (High)} & 2 & 2 & 3 & 4 & 4 \\
\textbf{Level 2 (Normal)} & 1 & 1 & 2 & 3 & 3 \\
\textbf{Level 1 (Basic)} & 1 & 1 & 2 & 2 & 2 \\
\hline
\end{array}$$

---

## 3. Dynamic Denominator Derivation (No Fixed /10 or /14 Constants)

The Part B average score denominator is derived dynamically:
$$\text{Denominator} = N_{\text{included}} \times K_{\text{appraisers}}$$
* **Staff with 2 Appraisers:** $5 \times 2 = 10$
* **Management with 2 Appraisers:** $7 \times 2 = 14$
* **Executive with 1 Appraiser:** $7 \times 1 = 7$
* In all cases, COCE ($N_{\text{excluded}} = 1$) is omitted from the denominator.

---

## 4. Standard Rounding Rules
* **Rounding Method:** Standard Half-Up (`ROUND_HALF_UP`).
* **Intermediate Step Rounding:** 2 Decimal Places (`0.01`).
* **Final Score:** 2 Decimal Places (`0.01`), Range: `0.00` to `100.00`.
