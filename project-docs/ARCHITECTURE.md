# System Architecture

## 1. Multi-App Architecture
- **App 53 (Employee Namelist)**: Source of truth for employee master data, department, section, start date, and Hoshin.
- **App 795 (MBO Routing Master)**: Section-to-approver mapping (Requester, 1st Manager, Manager, GM).
- **App 794 (MBO V2 Sandbox)**: Main transactional appraisal records.

## 2. Code Structure
- `src/config/`: System constants, statuses, confidential fields, `buildRecordKey`.
- `src/core/`: Kintone REST client, safety write guard, workflow validators.
- `src/services/`: Employee master lookup, routing validator, duplicate check.
- `src/ui/`: DOM host resolver, spreadsheet grid UI component.
- `src/validation/`: Business rule validation engine.
- `dist/`: Bundled browser customization scripts (`mbo-employee-app.js`, `mbo-employee.css`).
