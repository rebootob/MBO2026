# XLSX PART B COMPETENCY PRESENTATION SEMANTIC EVIDENCE

Status: **EVIDENCE CANDIDATE / AWAITING INDEPENDENT REVIEW**  
Work Package: **D2-WP004-R2-PRE1-R1**  
Authorization Token: **D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01**  
Date: **2026-09-02 ICT**  
Canonical Branch: **ai/antigravity-wp002c**  
Mode: **EVIDENCE-ONLY / BOUNDED / ONE-SHOT / LOW-CREDIT**  

---

## 1. Summary Metrics Ledger

```text
OWNER_PART_B_SHA = EXACT MATCH / BLOCKER
PRESENTATION_CANDIDATE_COUNT = 2
EXISTING_SAFE_COLLISION_CHECK = PASS
PROVEN_SAFE_PRESENTATION_CANDIDATES = 0
UNRESOLVED_PRESENTATION_CANDIDATES = 2
NO_WORKBOOK_TARGET_CONCEPTS = 3
CLONED_PRESENTATION_CLASSIFICATION = Rating Scale (CLONE_AS_STATIC_VALID), Description (MUST_REWRITE_FROM_SECURED_PROJECTION / UNRESOLVED), Title (UNRESOLVED / BLOCKED)
N7_TITLE_GEOMETRY = UNRESOLVED
N8_TITLE_GEOMETRY = UNRESOLVED
N7_PRESENTATION_TRUTHFULNESS = BLOCKED
N8_PRESENTATION_TRUTHFULNESS = BLOCKED
DUPLICATE_EXISTING_SAFE_TARGETS = 0
SOURCE_TEST_PROFILE_RENDERER_CHANGE = 0
```

---

## 2. Owner-Template Identity & SHA-256 Verification

Inspection of local owner template asset `app info/data/PMS_Staff & Chief_PART_B.xlsx`:

```text
FILE_PATH = app info/data/PMS_Staff & Chief_PART_B.xlsx
EXPECTED_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
ACTUAL_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
SHA_MATCH = EXACT MATCH
```

---

## 3. Mechanical Reconciliation of N=6 Geometry and N7/N8 Structural Transform

### 3.1 Owner N=6 Template Geometry
In the owner Part B template, competency blocks 1..6 occupy rows 7:29:

| Block `b` | Row Range | Title / Category Cell & Merge | Description Cell & Merge | Rating Scale Label Cell & Merge | Self Rating Cell & Merge (SAFE) | Chief Rating Cell & Merge (UNRESOLVED) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Rows 7..9 | `B7` (`B7:J7`, 1 row) | `B8` (`B8:J8`, 1 row) | `B9` (`B9:J9`, 1 row) | `K9` (`K9:Q9`) | `R9` (`R9:W9`) |
| **2** | Rows 10..13 | `B10` (`B10:J11`, 2 rows) | `B12` (`B12:J12`, 1 row) | `B13` (`B13:J13`, 1 row) | `K13` (`K13:Q13`) | `R13` (`R13:W13`) |
| **3** | Rows 14..17 | `B14` (`B14:J15`, 2 rows) | `B16` (`B16:J16`, 1 row) | `B17` (`B17:J17`, 1 row) | `K17` (`K17:Q17`) | `R17` (`R17:W17`) |
| **4** | Rows 18..21 | `B18` (`B18:J19`, 2 rows) | `B20` (`B20:J20`, 1 row) | `B21` (`B21:J21`, 1 row) | `K21` (`K21:Q21`) | `R21` (`R21:W21`) |
| **5** | Rows 22..25 | `B22` (`B22:J23`, 2 rows) | `B24` (`B24:J24`, 1 row) | `B25` (`B25:J25`, 1 row) | `K25` (`K25:Q25`) | `R25` (`R25:W25`) |
| **6** | Rows 26..29 | `B26` (`B26:J27`, 2 rows) | `B28` (`B28:J28`, 1 row) | `B29` (`B29:J29`, 1 row) | `K29` (`K29:Q29`) | `R29` (`R29:W29`) |
| **Padding** | Row 30 | `(Protected Padding)` | `(Protected Padding)` | `(Protected Padding)` | `(Protected Padding)` | `(Protected Padding)` |

### 3.2 Frozen Merge Cloning Rule vs Competency 6 Title Merge
- The frozen Part B structural transformation in `scripts/export/mbo-xlsx-ooxml-feasibility.js` clones source block rows 27:30.
- The merge cloning condition extracts source merges that satisfy: `r1 >= 27 && r2 <= 30`.
- The exact title merge for Competency 6 in the owner template is **`B26:J27`** (`r1 = 26, r2 = 27`).
- Because `r1 = 26` is less than 27, `B26:J27` fails the cloning condition `r1 >= 27` and is **NOT** cloned during the N7/N8 structural transform.

### 3.3 Proven Cloned Merge Inventory for Source Block 27:30
The source block rows 27:30 contain exactly 6 mergeCell definitions satisfying `r1 >= 27 && r2 <= 30`:
1. `B28:J28` -> Cloned to `B32:J32` (N=7) and `B36:J36` (N=8) [Description merge]
2. `K28:Q28` -> Cloned to `K32:Q32` (N=7) and `K36:Q36` (N=8) [Self rating header merge]
3. `R28:W28` -> Cloned to `R32:W32` (N=7) and `R36:W36` (N=8) [Chief rating header merge]
4. `B29:J29` -> Cloned to `B33:J33` (N=7) and `B37:J37` (N=8) [Rating Scale label merge]
5. `K29:Q29` -> Cloned to `K33:Q33` (N=7) and `K37:Q37` (N=8) [Self Rating value merge]
6. `R29:W29` -> Cloned to `R33:W33` (N=7) and `R37:W37` (N=8) [Chief Rating value merge]

### 3.4 Mechanical Title Geometry Determination
- For Competency 7 (row 31 in N=7) and Competency 8 (row 35 in N=8):
  - Row 31 (cloned from row 27) has **NO** cloned title mergeCell in the transformed worksheet XML.
  - Cell `B31` (and `B35`) remains an unmerged single cell `B31` / `B35`.
- **Determination**:
  - `N7_TITLE_GEOMETRY = UNRESOLVED` (No cloned title merge exists).
  - `N8_TITLE_GEOMETRY = UNRESOLVED` (No cloned title merge exists).

---

## 4. Existing Safe Authority Collision & Candidate Classification

### 4.1 Existing Safe Authority Collision Check (`EXISTING_SAFE_COLLISION_CHECK`)
- `COMPETENCY_b_SELF_RATING` is already one of the 18 accepted production safe roles (`partB.competencyItems[b-1].selfRating` at `K9`, `K13`, `K17`, `K21`, `K25`, `K29` for N=6; `K33` for N=7; `K37` for N=8).
- It is NOT counted as a new presentation candidate.
- Verification: `EXISTING_SAFE_COLLISION_CHECK = PASS` (Zero target collision between existing safe roles and presentation candidates).

### 4.2 Genuinely Visible Presentation Candidates (`PRESENTATION_CANDIDATE_COUNT = 2`)

Only genuinely visible workbook presentation targets in the Part B template are counted:

1. **Competency Title / Category (`COMPETENCY_b_TITLE`)**:
   - **Visible Workbook Target**: `B7`, `B10`, `B14`, `B18`, `B22`, `B26`.
   - **Secured Projection Analysis**: `MboExportService.projectCombinedExport()` preserves candidate keys `id`, `competencyId`, `code`, `name`, `title`, `competencyName` in `projectedCompetencyItems` without an independently accepted deterministic source-selection or alias-precedence rule.
   - **Classification**: **`UNRESOLVED_PRESENTATION_CANDIDATE`** (`UNRESOLVED / CANONICAL_PROJECTION_PATH_NOT_PROVEN`).

2. **Competency Description / Criteria (`COMPETENCY_b_DESCRIPTION`)**:
   - **Visible Workbook Target**: `B8`, `B12`, `B16`, `B20`, `B24`, `B28`.
   - **Secured Projection Analysis**: `MboExportService.projectCombinedExport()` exposes `description`, but static bilingual Thai/Japanese text is embedded in the workbook template asset. No fallback/selection rule between static asset text and service projection text is proven.
   - **Classification**: **`UNRESOLVED_PRESENTATION_CANDIDATE`** (`UNRESOLVED / CANONICAL_PROJECTION_PATH_NOT_PROVEN`).

### 4.3 Concepts Without Workbook Target (`NO_WORKBOOK_TARGET_CONCEPTS = 3`)

Concepts exposed in service projection or schema that possess NO visible cell target in the Part B template:
1. **Weight / Weight Percent** (`weight` / `weightPercent`): 0 weight cells exist in Part B competency blocks. (`NO_WORKBOOK_TARGET`)
2. **Category / Group** (`category` / `group`): No category cell target exists in Part B. (`NO_WORKBOOK_TARGET`)
3. **Identifier / Code** (`id` / `competencyId` / `code`): No ID/code cell target exists in Part B competency blocks. (`NO_WORKBOOK_TARGET`)

---

## 5. Cloned Presentation Classification (Source Block 27:30)

For each genuinely cloned presentation element in rows 27:30 (cloned to rows 31:34 for N=7 and rows 35:38 for N=8):

1. **Rating Scale Label (`B33` for N=7 / `B37` for N=8, cloned from `B29`)**:
   - **Static Content**: `"Rating Scale"`.
   - **Classification**: **`CLONE_AS_STATIC_VALID`** (The static label `"Rating Scale"` is identical across all competency blocks 1..6 and remains valid and truthful for blocks 7 and 8).

2. **Competency Description (`B32` for N=7 / `B36` for N=8, cloned from `B28`)**:
   - **Static Content**: `"6.นโยบายจรรยาบรรณและจริยธรรม (10 ประการ)伦理・道徳方針（10項目）"`.
   - **Classification**: **`MUST_REWRITE_FROM_SECURED_PROJECTION`** (Leaving this static produces stale Competency 6 text for Competency 7/8).
   - **Resolution Status**: **`UNRESOLVED / BLOCKED`** (No deterministic canonical projection path or fallback rule is proven).

3. **Competency Title Cell (`B31` for N=7 / `B35` for N=8, cloned from `B27`)**:
   - **Geometry Status**: `B27` is unmerged in cloned block; no cloned title mergeCell exists.
   - **Classification**: **`UNRESOLVED / BLOCKED`** (No cloned title merge geometry exists; no deterministic canonical projection path is proven).

---

## 6. Preserved Durable Semantic Authority & N7/N8 Decision

### 6.1 Preserved Semantic & Privacy Invariants
```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / STRUCTURAL-PRIVACY ONLY
CHIEF_SECURED_WRITABLE_ROLE = 0
```

### 6.2 N7/N8 Presentation Truthfulness Decision
- **N7 Decision**: **`N7_PRESENTATION_TRUTHFULNESS = BLOCKED`**
- **N8 Decision**: **`N8_PRESENTATION_TRUTHFULNESS = BLOCKED`**
- **Reason**: Both exact workbook target geometry for cloned title cells and deterministic secured projection paths for title/description remain unresolved. Production Renderer implementation for N7/N8 presentation remains **BLOCKED**.

---

## 7. Downstream Renderer Boundary & Status

```text
D2_WP004_R2_PRE1_R1_STATUS = EVIDENCE CANDIDATE / AWAITING INDEPENDENT REVIEW
PRODUCTION_RENDERER_STATUS = BLOCKED
AUTONOMOUS_PASS_CLOSED_DECLARATION = FORBIDDEN
EXPECTED_REMAINING_ACTION = CHATGPT CONTROL PLANE INDEPENDENT REVIEW
```

This evidence corrective package concludes PRE1-R1 inspection. No source code, tests, profile, feasibility code, or baseline files were modified.
