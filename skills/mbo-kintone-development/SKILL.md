---
name: mbo-kintone-development
description: Development conventions, APIs, and customization guidelines for Kintone
---

# MBO Kintone Development Guide

## 1. Naming Conventions & Schema Standards
- **Field Codes**: Upper CamelCase with underscores (`Objective_1`, `Weight_1`, `Record_Key`, `Employee_Code`).
- **No Magic Strings**: All workflow statuses and stage enums reside in `src/config/constants.js`.

## 2. Desktop Record DOM Host Resolution
- NEVER use `kintone.app.record.getHeaderSpaceElement()` (does not exist on Desktop Record pages).
- ALWAYS use `getRecordUiHost('SPACE_HEADER')` from `src/ui/host-resolver.js`:
  1. Primary: `kintone.app.record.getSpaceElement('SPACE_HEADER')`
  2. Fallback: `kintone.app.record.getHeaderMenuSpaceElement()`
  3. Null-safe return without throwing exceptions.

## 3. Sequential Approval & Multi-Approver Standards
- **Model**:
  - `Manager_Level1_Approvers` (`USER_SELECT`), `Manager_Level1_Approval_Rule` (`DROP_DOWN`, default: `ALL`)
  - `Manager_Level2_Approvers` (`USER_SELECT`), `Manager_Level2_Approval_Rule` (`DROP_DOWN`, default: `ALL`)
  - `GM_Level1_Approvers` (`USER_SELECT`), `GM_Level1_Approval_Rule` (`DROP_DOWN`, default: `ALL`)
  - `GM_Level2_Approvers` (`USER_SELECT`), `GM_Level2_Approval_Rule` (`DROP_DOWN`, default: `ALL`)
- **Key Rules**:
  - `Level != Number of Approvers`.
  - `ALL != Sequential`.
  - `Empty Level = Skip Level`.
  - NEVER create hardcoded `Manager_User_1`/`Manager_User_2` fields to solve multi-approver requirements.

## 4. Custom UI Validation Pattern (No Native Error Banner)
- **NEVER use `event.error`** for standard business/field validation in Custom UI.
- **Always `return false`**: In `app.record.create.submit` and `app.record.edit.submit`, if validation fails:
  1. Sync DOM values to record (`ui.syncFromDom()`).
  2. Run `ValidationEngine.validate(record, stage)`.
  3. Render Custom Error Summary card inside Custom UI (`ui.showValidationErrors(...)`).
  4. Highlight invalid fields with red borders (`.mbo-field-state-error`) and show bilingual messages under the cells (`.mbo-cell-tag`).
  5. Jump (`scrollIntoView`) and focus (`input.focus()`) on the first invalid field.
  6. Return `false` to cancel save cleanly without native top banner.
