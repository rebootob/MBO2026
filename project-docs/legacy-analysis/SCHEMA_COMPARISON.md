# Cross-App Schema Comparison & Field Family Analysis

> **Document Status:** Complete (Discovery Phase)  
> **Scope:** All 8 Legacy Apps (283, 305, 307, 310, 640, 643, 715, 716)  
> **Last Updated:** 2026-08-23  

---

## 1. Schema Families Categorization

Inspection reveals that the 8 legacy apps belong to 3 distinct architectural schema families:

### Family A: Non-Management & Expatriate (Apps 283, 716) — 133 Fields
* **Apps:** `283` (Staff & Chief), `716` (Japanese Staff)
* **Core Characteristic:** 4 Objectives, Self-Evaluation + 1st Appraiser (Manager) + 2nd Appraiser (GM) scoring.
* **Competency Model:** Basic / Core Competencies (5 items) + COCE Compliance (non-scored or separate).
* **Weight Ratio:** Part A: 70% | Part B: 30%.

### Family B: Management & Leadership (Apps 305, 310, 643, 307) — 141 Fields
* **Apps:** `305` (Section Manager), `310` (Assistant Manager), `643` (Senior Manager), `307` (Deputy General Manager)
* **Core Characteristic:** Management Competency Set (6-8 items including Strategic Planning, Team Development, Budget Control).
* **Scoring Roles:** Primary Evaluator (GM) + Secondary Evaluator (VP / Division Head).
* **Weight Ratio:** Part A: 50% - 60% | Part B: 40% - 50%.

### Family C: Executive & Top Management (Apps 640, 715) — 106 Fields
* **Apps:** `640` (General Manager), `715` (Vice President)
* **Core Characteristic:** Simplified organizational objective tracking with direct Executive Committee / President review.
* **Streamlined Workflow:** 11 states, direct executive approval without mid-level review clutter.
* **Weight Ratio:** Part A: 50% - 70% | Part B: 30% - 50%.

---

## 2. Detailed Field Mapping & Classification Matrix

| Field Category | Common Across All Apps (Common Core) | Profile-Specific Fields | Technical Debt / Duplicate Fields |
| :--- | :--- | :--- | :--- |
| **Employee Header** | `emp_id`, `emp_name`, `emp_dept`, `emp_sect`, `emp_pos`, `fiscal_year` | `japan_emp_id`, `expat_allowance_grade` | Copy-pasted text fields with inconsistent casing (`Emp_ID` vs `emp_id`) |
| **Part A Objectives** | `obj1..4`, `act1..4`, `weight_obj1..4`, `dif_level_obj1..4` | `org_kpi_link_1..4` (Exec only) | Hardcoded fixed 4 items (`obj1` to `obj4`) in all legacy apps |
| **Part A Mid-Year** | `mid_progress_1..4`, `mid_review_1..4`, `mid_action_1..4` | `mid_attachment` (File) | Inconsistent subtable usage across older vs newer apps |
| **Part A Year-End** | `self_achieve_1..4`, `app1_achieve_1..4`, `app2_achieve_1..4` | `app3_achieve_1..4` (VP only) | Nested `IF(AND(...))` calc fields evaluating difficulty matrices |
| **Part B Competencies** | `comp_rating_1..5`, `comp_comment_1..5` | `leadership_score`, `coce_acknowledgment` | `coce_score` present in form but excluded in final calculation formula |
| **Confidential Scores** | `partA_weighted_score`, `partB_weighted_score`, `final_score` | `coce_penalty_deduction` | Exposed via client-side JavaScript hiding instead of field permissions |
| **Routing / Workflow** | `requester`, `appraiser1`, `appraiser2` | `vp_approver`, `president_approver` | Hardcoded `appraiser1_user` / `appraiser2_user` instead of generic steps |
