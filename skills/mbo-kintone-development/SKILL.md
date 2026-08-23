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

## 3. Render Lifecycle Sequence
1. Resolve UI host element.
2. Render Custom UI component.
3. Bind event listeners and dynamic state calculation.
4. Synchronize values with Kintone internal record state via `kintone.app.record.set(...)`.
5. Only hide native custom fields AFTER custom UI renders successfully (Fail-Safe).
