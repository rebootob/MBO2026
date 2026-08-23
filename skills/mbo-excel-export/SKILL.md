---
name: mbo-excel-export
description: Guidelines for generating corporate Excel PMS workbooks from Kintone records
---

# MBO Excel Export Architecture

## 1. Deliverables
- **Single Workbooks**: `PMS_Staff & Chief_PART_A.xlsx` and `PMS_Staff & Chief_PART_B.xlsx`.
- **Combined Workbook**: Single `.xlsx` with Sheet 1 (PART A) and Sheet 2 (PART B).

## 2. Confidentiality & Security in Export
- Employee role exports MUST NEVER contain Manager/GM scores, ratings, or internal comments.
- Never write confidential data to hidden columns or hidden sheets.
- Omit confidential cell contents entirely during template rendering.

## 3. Template Expansion Design (`EXPORT_DESIGN_PENDING`)
- The original Excel template accommodates up to 4 objectives.
- For 5–10 objectives, dynamic row insertion or overflow sheets will be generated preserving cell formulas and print area boundaries.
