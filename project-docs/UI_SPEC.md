# UI Specification & Design Tokens

## 1. Visual Language
- **Source of Truth**: `exp` folder (`c:/Users/allda/Desktop/Dev/git/MBO2026/exp`).
- **Layout**: Horizontal Spreadsheet Grid (1 Objective = 1 Row).
- **Language**: Bilingual (**ภาษาไทย / English**) across all headers, labels, helper text, and validation messages.

## 2. Field State Highlights & Legend
- `🟢 กรอกได้ / Editable`: `#f0fdf4`, border `#22c55e`
- `🟡 ต้องกรอก / Required`: `#fefce8`, border `#eab308`
- `🔵 ข้อมูลจากระบบ / System Data`: `#f0f9ff`, border `#0ea5e9`
- `⚪ ระบบล็อก / Locked`: `#f8fafc`, border `#cbd5e1`
- `🔴 ข้อมูลไม่ถูกต้อง / Invalid`: `#fef2f2`, border `#ef4444`

## 3. Inline Validation & Error Summary UX
- **No Native Top Banner**: Validation cancels save via `return false` in Kintone submit event.
- **Custom Error Summary Card**: Placed above the grid, lists all invalid fields with numbered bilingual descriptions.
- **Clickable Errors**: Clicking any error item in the summary automatically jumps (`scrollIntoView`) and focuses on the invalid cell.
- **Instant Resolution**: Typing into or correcting an invalid field removes the red error state immediately in real time.
