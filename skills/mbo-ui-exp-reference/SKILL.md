---
name: mbo-ui-exp-reference
description: Visual specifications, styling tokens, and bilingual UI rules
---

# MBO UI Visual Reference & Design Tokens

## 1. Sources of Truth Hierarchy
- **Visual Design & UX**: `exp` folder (`c:/Users/allda/Desktop/Dev/git/MBO2026/exp`)
- **Part A Form Content**: `exp/PMS_Staff & Chief_PART_A.xlsx`
- **Part B Competency Content**: `exp/PMS_Staff & Chief_PART_B.xlsx`

## 2. Bilingual UI Requirement
All user-facing elements MUST display both **Thai and English** (`ภาษาไทย / English`):
- `🟢 กรอกได้ / Editable` (Active editable fields in current stage)
- `🟡 ต้องกรอก / Required` (Mandatory fields currently empty)
- `🔵 ข้อมูลจากระบบ / System Data` (App 53 Profile, Hoshin, Read-only system data)
- `⚪ ระบบล็อก / Locked` (Read-only / Past stage locked fields)
- `🔴 ข้อมูลไม่ถูกต้อง / Invalid` (Validation error fields)

## 3. Spreadsheet Horizontal Grid Principle
- **1 Objective = 1 Horizontal Row**: Clean Excel-like tabular input.
- **Sticky Table Headers**: Stays visible when scrolling.
- **Responsive Width**: Max container width up to 1540px with generous cell textareas.
