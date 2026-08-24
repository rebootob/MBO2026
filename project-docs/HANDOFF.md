# AI Operational Handoff Document

- **Handoff Date**: 2026-08-24T12:50:00+07:00
- **From AI**: Antigravity
- **To AI**: Incoming AI (Antigravity / Codex / Claude / Independent Reviewer)
- **Branch**: `develop`
- **Current Phase**: Phase 2: Annual Record Foundation
- **Current Work Package**: `MBO-P02-WP-003 (Annual Record Initialization & Duplicate Prevention)`
- **Current Mode**: `PLAN ONLY (HARDENED FIRST-WRITE PLAN PREPARED FOR INDEPENDENT REVIEW — ZERO KINTONE WRITES)`
- **WP-001 Status**: `PASSED (Implementation Gate: PASS, Review Gate: PASS)`
- **WP-002 Status**: `PASSED (Implementation Gate: PASS, Review Gate: PASS)`
- **Last Safe Commit**: `31ff6ca` (WP-002 Passed Implementation & Review Gates)
- **Review Package**: [`project-docs/AI_REVIEW_PACKAGE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/AI_REVIEW_PACKAGE.md)
- **Last Backup Reference**: Baseline discovery JSONs in `info app/`

---

# MBO-P02-WP-003 — HARDENED IMPLEMENTATION PLAN FOR REVIEW
## ANNUAL RECORD INITIALIZATION & DUPLICATE PREVENTION (FIRST BUSINESS WRITE CANDIDATE)

### A. Purpose & Invariant
Establish the authoritative Annual Record Initialization service (`src/services/annual-record-service.js`) for App 794 that creates a new annual draft MBO record for an employee for a dynamically resolved Japanese Fiscal Year, strictly enforcing the **Two-Layer Duplicate Prevention Invariant (1 Employee + 1 Fiscal Year = Exactly 1 MBO Record)** via:
1. **Layer 1 (Application GET Check):** Query App 794 before writing (`Fiscal_Year = "FYXXXX" and Employee_Code = "XXXX"`).
2. **Layer 2 (Kintone Schema Unique Constraint):** Enforce `Record_Key` (`FYXXXX-XXXX`) unique constraint at the database layer.

---

### B. Approved Scope (Exact File Boundaries)
1. **[NEW] `src/services/annual-record-service.js`:**
   - Dynamically resolve Fiscal Year via `getJapaneseFiscalYear(executionDate)`.
   - Call `EmployeeService.lookupEmployee` to retrieve canonical employee identity snapshot.
   - Execute Layer 1 duplicate check on App 794.
   - Generate `Record_Key` via `generateRecordKey(fiscalYear, canonicalEmployeeCode)`.
   - Execute Live App 794 Schema Preflight check.
   - Build exact initialized payload strictly matching the `EXPLICIT_WRITE_FIELDS` manifest.
   - Execute controlled `POST /k/v1/record` against App 794 within an authorized Normal Write Window.
   - Execute Normalized Read-Back Verification diff.
2. **[NEW] `tests/annual-record-initialization.test.js`:**
   - Implement 18 automated unit and mock integration test cases (`REC-001` through `REC-018`).
3. **[UNTOUCHED] `src/services/employee-service.js`:**
   - Employee lookup concerns remain separated and untouched.

---

### C. Live App 794 Schema Preflight & Blocker Evaluation

#### 1. Preflight Verification Standard
Prior to issuing any `POST` request to App 794, the system must execute a READ-ONLY schema preflight (`GET /k/v1/app/form/fields.json?app=794`) and verify:
* `Record_Key.unique === true`
* All fields in `EXPLICIT_WRITE_FIELDS` exist with expected types.
* **Required Field Check:** Any field where `required === true` must either:
  1. Have a valid server-side `defaultValue` (e.g. `Objective_Count` default is `"2"`), OR
  2. Be explicitly included in the approved `EXPLICIT_WRITE_FIELDS` manifest.

#### 2. Critical Blocker Assessment: `Requester_User` / Legacy Routing Fields
* **Audit Finding:** Backup schema of App 794 reveals legacy fields `Requester_User`, `Manager_User`, and `GM_User` are configured as `required: true` without default values.
* **Governing Rule:** Routing resolution is Phase 5 (`MBO-P05-WP-001`) and Requester Authorization is out of scope. The system **SHALL NOT guess, auto-populate logged-in users, or inject routing logic**.
* **Gate Enforcement:** If live App 794 schema has `required: true` on `Requester_User` or other routing fields without defaults, **LIVE CREATE IS HARD BLOCKED (`LIVE_CREATE_BLOCKED`)** until the schema is formally aligned or values are explicitly governed.

---

### D. Dynamic Fiscal Year & Record Key Generation
* **Zero Hard-Coded Live Fiscal Years:** `FY2027` is strictly restricted to unit test fixtures.
* **Dynamic Resolution:**
  - Input: Execution date (e.g. `2026-08-24`).
  - Calculation: `fiscalYear = getJapaneseFiscalYear("2026-08-24")` $\implies$ `"FY2026"`.
  - Canonical Employee Code: `"0149"` (from `App53.emp_text`).
  - Generated Record Key: `generateRecordKey("FY2026", "0149")` $\implies$ `"FY2026-0149"`.

---

### E. Exact Payload Manifest

#### 1. `EXPLICIT_WRITE_FIELDS` (Only fields written by POST)
| Field Code | Source | Value Type | Required? | Confidential? | Example / Synthetic Value |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`Fiscal_Year`** | `getJapaneseFiscalYear` | `SINGLE_LINE_TEXT` | Yes | No | `"FY2026"` |
| **`Record_Key`** | `generateRecordKey` | `SINGLE_LINE_TEXT` | Yes (Unique) | No | `"FY2026-0149"` |
| **`Employee_Code`** | `App53.emp_text` | `SINGLE_LINE_TEXT` | Yes | No | `"0149"` |
| **`Employee_Name`** | `App53.Text` | `SINGLE_LINE_TEXT` | No | No | `"Test Employee"` |
| **`Employee_Name_TH`** | `App53.Text_0` | `SINGLE_LINE_TEXT` | No | No | `"พนักงานทดสอบ"` |
| **`Employee_Department`**| `App53.Drop_down_0` | `SINGLE_LINE_TEXT` | No | No | `"Eco Energy & Textile Machinery"`|
| **`Employee_Section`** | `App53.Drop_down` | `SINGLE_LINE_TEXT` | No | No | `"TME1"` |
| **`Employee_Position`** | `App53.Text_2` | `SINGLE_LINE_TEXT` | No | No | `"Test Position"` |
| **`Employee_Email`** | `App53.Text_4` | `SINGLE_LINE_TEXT` | No | No | `"pilot0149@example.invalid"` |
| **`Employee_Start_Date`**| `App53.Date` | `DATE` | No | No | `"2021-04-01"` |

#### 2. `REQUIRED_SERVER_DEFAULT_FIELDS` (Populated by Kintone defaults)
* `Objective_Count`: Server Default `"2"` (Validated during read-back).
* `Status` / `Workflow_Status`: Initial state (Validated during read-back).

---

### F. Normalized Read-Back Verification Architecture
To avoid false diffs from system metadata or server-side calculations, read-back inspection classifies fields into 5 strict tiers:
* **Tier A (Explicit Written Fields):** Exact 1-to-1 match against `EXPLICIT_WRITE_FIELDS`. Any mismatch $\implies$ **FAIL & ROLLBACK**.
* **Tier B (Approved Kintone Defaults):** Verify server populated configured default values (e.g. `Objective_Count === "2"`).
* **Tier C (System-Generated Fields):** Explicit allow-list (`$id`, `$revision`, `Created_datetime`, `Updated_datetime`, `Created_by`, `Updated_by`) $\implies$ Ignored in payload diff, verified present.
* **Tier D (Calculated Fields):** Formula fields (`Total_Weight`, `Total_Score`) evaluated against expected blank/default state.
* **Tier E (Unexpected Business Fields):** Any populated field outside Tiers A–D (e.g. unexpected objectives, approvers, scores) $\implies$ **FAIL & ROLLBACK**.

---

### G. Controlled Write Windows & Rollback Architecture

#### 1. Normal Write Window (Create Only)
* **Target App:** `794` only.
* **Allowed Operation:** `RECORD_CREATE` (`POST /k/v1/record`) only.
* **Pre-requisites:** Live schema preflight pass + Local pre-write backup verified.
* **Window Duration:** Active immediately before `POST`, **CLOSED IMMEDIATELY** after `POST` completion.

#### 2. Rollback Window (Delete Specific Record Only)
* **Trigger:** Read-back diff failure, schema mismatch, or execution abort.
* **Target App:** `794` only.
* **Allowed Operation:** `RECORD_DELETE` (`DELETE /k/v1/records`) for the **exact single record ID created during this execution only**.
* **Safety Invariant:** Never restore entire database or delete pre-existing records.
* **Window Closure:** Reset `WRITE_ALLOWED_APPS = []` immediately after deletion verification.

#### 3. Backup Privacy Governance
* Pre-write backup is stored locally under `backups/app-794/{timestamp}/records.json`.
* Path is protected by `.gitignore` and raw record data is **NEVER committed to Git or review packages**.
* Git documentation records metadata only: timestamp, record count, and sha256 checksum.

---

### H. Test Plan (`REC-001` to `REC-018`)
* `REC-001`: Dynamic Fiscal Year + canonical Employee Code produces exact `Record_Key` format.
* `REC-002`: Live schema preflight contract validation (required, unique, default metadata).
* `REC-003`: Layer 1 application duplicate check stops duplicate write before API call.
* `REC-004`: Layer 2 Kintone unique conflict (`Record_Key` collision simulated via mock) throws structured duplicate error.
* `REC-005`: Employee lookup `EMPLOYEE_NOT_FOUND` $	o$ zero create calls issued.
* `REC-006`: Employee lookup `EMPLOYEE_CODE_INVALID` $	o$ zero create calls issued.
* `REC-007`: Employee lookup `EMPLOYEE_SOURCE_AMBIGUOUS` $	o$ zero create calls issued.
* `REC-008`: Employee lookup `EMPLOYEE_SOURCE_INCOMPLETE` $	o$ zero create calls issued.
* `REC-009`: Pre-write backup gate enforced (fails closed if backup unverified).
* `REC-010`: Create attempt with closed write window (`WRITE_ALLOWED_APPS = []`) is blocked locally.
* `REC-011`: Normalized read-back verification detects unmapped field modifications.
* `REC-012`: App 53 permanent read-only protection (`POST/PUT/DELETE` blocked).
* `REC-013`: App 795 zero write protection (`POST/PUT/DELETE` blocked).
* `REC-014`: Protected apps (283..716) permanent hard denial.
* `REC-015`: Full regression test suite execution (Baseline 32 + Safety 20 + Annual 10 + Lookup 18 + Record 18 $\implies$ 98 tests).
* `REC-016`: Required App 794 field missing from manifest without default $	o$ write blocked.
* `REC-017`: `Requester_User` required on live schema without resolved value $	o$ live create blocked.
* `REC-018`: Rollback authorization only permits deletion of the exact newly-created record ID.

---

### I. Change Manifest for WP-003 Implementation
| Item | Type | Exact Target | Expected Behavior |
| :--- | :---: | :--- | :--- |
| **`src/services/annual-record-service.js`** | `CREATE` | Local Service | End-to-end initialization, preflight, duplicate check, and normalized read-back |
| **`tests/annual-record-initialization.test.js`** | `CREATE` | Unit / Mock Tests | 18 automated test cases (`REC-001`..`REC-018`) |
| **App 794 (Kintone Sandbox)** | `POST` | 1 Pilot Record (`0149`) | Controlled write only if preflight passes |
| **App 53 (Employee Master)** | `NONE` | Read-Only | 0 writes |
| **App 795 (Routing Master)** | `NONE` | Locked | 0 writes |
| **Protected Apps (283..716)** | `NONE` | Locked | 0 writes |

---

## MBO-P02-WP-003 — APP 794 SCHEMA BLOCKER RESOLUTION PLAN (FOR REVIEW)

### 1. Context & Problem Statement
Live App 794 preflight confirms that 3 `USER_SELECT` fields (`Requester_User`, `Manager_User`, `GM_User`) are configured with `required: true` and `defaultValue: []`. During Phase 2 Annual Record Initialization, creating a record with empty array triggers a Kintone validation error, while guessing or artificially populating users violates business governance.

### 2. Architecture Rationale
1. **Requester Authorization Decoupling:** `Employee_Code` identifies who the evaluation is for. `Requester_User` is the Cybozu user account submitting objectives. Making `Requester_User.required = false` at the Kintone database schema level allows automated/batch annual initialization. The Business State Model strictly enforces requester authorization before submission at Stage 01.
2. **Manager_User & GM_User Deprecation:** In MBO2026 Generic Routing (`DEC-019`), approvals use 4-stage dynamic multi-user arrays (`Manager_Level1/2_Approvers`, `GM_Level1/2_Approvers`) resolved from App 795. The single fields `Manager_User` and `GM_User` are legacy artifacts and must be non-required at schema level.

### 3. Comprehensive Live Field Audit (328 Fields Total)
* Total `required: true` fields: Exactly 7 (`Fiscal_Year`, `Record_Key`, `Employee_Code`, `Objective_Count`, `Requester_User`, `Manager_User`, `GM_User`).
* Total `USER_SELECT` fields: Exactly 18 (15 are already `required: false`).
* Total blocking unresolved fields: Exactly 3 (`Requester_User`, `Manager_User`, `GM_User`).

### 4. Proposed Change Manifest (Target: App 794 ONLY)
* `Requester_User`: `required: true` $	o$ `required: false` (Default: `[]`). Rollback: `required: true`.
* `Manager_User`: `required: true` $	o$ `required: false` (Default: `[]`). Rollback: `required: true`.
* `GM_User`: `required: true` $	o$ `required: false` (Default: `[]`). Rollback: `required: true`.

### 5. Safety Protocol (When Execution is Approved)
* App 794 ONLY (`FIELD_UPDATE` form configuration).
* App 53: Permanent Read-Only (0 writes).
* App 795: Untouched (0 writes).
* Protected Apps: Untouched (0 writes).
* Pre-write schema backup + exact read-back verification + immediate write window closure.
