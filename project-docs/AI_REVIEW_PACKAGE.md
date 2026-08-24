# AI Technical Review Package (Standardized Independent Review)

> **Document Standard:** Provider-Neutral Technical Review Package (`DEC-030`)  
> **Target Audience:** Independent Reviewers (ChatGPT, OpenAI Codex, Claude, Human QA)  
> **Review Policy:** Evidence-based verification (Source, Diff, Config, Test Evidence). Screenshots reserved for UI layout only.  
> **Governance Rule:** `SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST`  
> **Last Updated:** 2026-08-24T14:55:00+07:00  

---

## 1. Work Package & Review Metadata

| Attribute | Value / Evidence Pointer |
| :--- | :--- |
| **Work Package ID** | `MBO-P03-WP-001` |
| **Phase** | `Phase 3: Evaluation Profile, Competency & Scoring Engine` |
| **Work Package Name** | `EVALUATION PROFILE & COMPETENCY CONFIGURATION FOUNDATION` |
| **Claimed Status** | **`PLAN_GATE: READY_FOR_INDEPENDENT_REVIEW`** |
| **Scoring Source of Truth** | **`LIVE_KINTONE_FIRST (Live Kintone Deployed State Overrides Docs/Excel)`** |
| **Scoring Evidence Doc** | [`project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/evidence/KINTONE_SCORING_SOURCE_OF_TRUTH.md) |
| **Authoritative Repository Plan** | [`project-docs/phase-3/MBO-P03-WP-001_PLAN.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/phase-3/MBO-P03-WP-001_PLAN.md) |
| **Legacy Apps Audited** | **`8 Legacy Apps (283, 305, 307, 310, 640, 643, 715, 716) + App 794`** |
| **App 310 Live Weight** | **`60% Part A / 40% Part B (Live Kintone overrides 50/50 doc assumption)`** |
| **Weight Matrix Summary** | Staff/Japan (70/30), Asst Mgr (60/40), Sect/Snr/DGM/GM/VP (50/50) |
| **Part B Appraiser Matrix** | Apps 283/716 (2 App, N=5, Denom=10); Apps 305/307/310/643 (2 App, N=7, Denom=14); Apps 640/715 (1 App, N=7, Denom=14 via sum*2) |
| **Objective Scoring Matrix** | **`MATRIX_IDENTICAL_ACROSS_APPS`** (Verified identical Difficulty x Achievement matrix across all 8 apps) |
| **COCE Treatment** | **`VERIFIED_EXCLUDED_IN_100%_OF_APPS`** (Item 6 omitted from `sum_rating`) |
| **Kintone vs Doc Conflicts** | **`2 Recorded (App 310 60/40, GM/VP 1 Appraiser)`** |
| **Kintone Write Operations** | **`0 (Zero Writes Executed)`** |
| **Active Write Allow-List** | `WRITE_ALLOWED_APPS = []` (Default Deny) |

---

## 2. Live Kintone Scoring Lineage Summary

* **Staff & Chief / Japan Staff (App 283 / 716):** 70/30 Split, 5 Scored Competencies, Denominator 10, Final Score normalized via `((A+B)*100)/5`.
* **Assistant Manager (App 310):** **60/40 Split**, 7 Scored Competencies, Denominator 14, Final Score normalized via `((A+B)*100)/5`.
* **Section Manager / Senior Manager / DGM (App 305 / 643 / 307):** 50/50 Split, 7 Scored Competencies, Denominator 14, Final Score normalized via `((A+B)*100)/5`.
* **General Manager / Vice President (App 640 / 715):** 50/50 Split, 1 Appraiser $\times$ 7 Scored Competencies $\implies (\text{sum} \times 2) / 14$, Final Score normalized via `((A+B)*100)/5`.
