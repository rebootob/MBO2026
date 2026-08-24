# Project Governance & Durable Architectural Decisions (MBO V2)

> **Document Status:** Active (Durable Architecture Log)  
> **Last Updated:** 2026-08-24  
> **Governance Invariant:** Decisions logged here represent frozen project standards (`DEC-001` through `DEC-037`).  

---

## Summary of Core Decisions

| Decision ID | Topic | Status | Primary Principle / Standard |
| :---: | :--- | :---: | :--- |
| **DEC-035** | **Scoring Calibration & Source-of-Truth Policy** | **FROZEN** | `SCORING_SOURCE_OF_TRUTH = LIVE_KINTONE_FIRST` |
| **DEC-036** | **Appraiser Weight & Completeness Governance** | **FROZEN** | Universal $1/K_{\text{expected}}$ appraiser weighting & fail-closed completeness gates |
| **DEC-037** | **Profile Configuration Storage Architecture** | **FROZEN** | `PROFILE_CONFIGURATION_STORAGE = HYBRID_OPTION_C` |

---

## DEC-035 — Scoring Calibration & Source-of-Truth Policy
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Governance Rule)
- **Decision**:
  1. **Scoring Calibration Source:** For SCORING FORMULAS, WEIGHTS, and LINEAGE, **Live Kintone Deployed Configuration is the Primary Source of Truth**.
  2. **Priority Hierarchy:**
     - Priority 1: Live Kintone Deployed Configuration (CALC expressions, active field codes, JS scoring logic, active process/status usage).
     - Priority 2: Recent Kintone discovery JSON snapshots.
     - Priority 3: Frozen project decisions and documentation.
     - Priority 4: Excel business artifacts (Secondary Reference for labels and Thai/English wording; MUST NOT override live Kintone calculation behavior).
  3. **Three System Sources Defined:**
     - `LEGACY_SCORING_EVIDENCE_SOURCE`: Existing deployed Kintone PMS applications (Apps 283, 716, 310, 305, 643, 307, 640, 715).
     - `V2_RUNTIME_CONFIGURATION_SOURCE`: Kintone Profile / Scoring Configuration Master App (Standalone Kintone App for HR runtime administration).
     - `V2_BACKUP_AUDIT_RECOVERY_SOURCE`: Git Repository immutable configuration snapshots (controlled versioned repository path).

---

## DEC-036 — Appraiser Weight & Completeness Governance (Part A & Part B)
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Core Governance Rule)
- **Decision**:
  1. **Universal Part A & Part B Scope:** Appraiser Weight Governance applies to all scoring calculations combining evaluations from multiple scoring appraisers, including Part A (Objectives) and Part B (Competencies).
  2. **Two Distinct Weight Layers:**
     - **Weight Layer 1 (Appraiser Weight):** Weight distribution across multiple scoring appraisers ($1/K_{\text{expected}}$).
     - **Weight Layer 2 (Part A / Part B Weight):** Weight distribution between MBO objectives (Part A) and Competencies (Part B) (70/30, 60/40, or 50/50).
  3. **Appraiser Weight Formulation:** Derived dynamically from $K_{\text{expected}}$ ($K=1 \implies 100\%$, $K=2 \implies 50\% / 50\%$).
  4. **Strict Completeness Gates (Fail-Closed):** Part A and Part B completeness gates ($K_{\text{valid}} == K_{\text{expected}}$) must pass before final score calculation. Partial ratings fail closed returning `APPRAISER_RATING_INCOMPLETE`.
  5. **No Automatic Weight Redistribution:** A single completed appraiser in a 2-appraiser profile never inherits 100% weight.

---

## DEC-037 — Profile Configuration Storage Architecture
- **Date**: 2026-08-24
- **Status**: FROZEN (User-Confirmed Architectural Choice)
- **Decision**:
  1. **Selected Architecture:** **`Option C: Hybrid Architecture`**.
  2. **Runtime Source:** Kintone Master App serves as `V2_RUNTIME_CONFIGURATION_SOURCE` for HR runtime profile/scoring administration.
  3. **Backup & Recovery Source:** Git repository serves as `V2_BACKUP_AUDIT_RECOVERY_SOURCE` via controlled versioned repository path.
  4. **Fail-Closed Runtime Rule:** Git backup is NOT an automatic runtime fallback. If runtime Kintone configuration is missing or inconsistent, the system must **FAIL CLOSED**.
