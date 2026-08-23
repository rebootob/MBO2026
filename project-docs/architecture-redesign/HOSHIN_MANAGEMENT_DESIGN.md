# Hoshin Governance, Versioning & Publication Architecture Blueprint

> **Document Status:** Active (Confirmed Requirement)  
> **System Scope:** MBO Hoshin Master (Conceptual App 799) & App 794 Transaction Integration  
> **Core Principle:** Strict Fiscal Year Scoping + Mandatory Human Publication (Zero Silent Fallback)  
> **Last Updated:** 2026-08-23  

---

## 1. Executive Summary & Core Principle

In MBO V2, organizational targets (**Department Hoshin** and **Section Hoshin**) are formally governed as **Versioned Strategy Artifacts** bound to a specific Japanese Fiscal Year (`1 April - 31 March`).

### The Human Confirmation Mandate
Computer systems cannot deduce human intent from string matching. Even if Hoshin content remains identical character-for-character across consecutive years (e.g. FY2026 and FY2027), the business requires an explicit **Human Confirmation / Publication Action** for each fiscal year.

```mermaid
graph TD
    PREV[App 53 / Previous FY Hoshin] -->|Copy as Preliminary Draft| DRAFT[Hoshin Master: Status DRAFT]
    
    subgraph Governance [Annual Human Confirmation & Publication]
        DRAFT --> REVIEW[Hoshin Owner / HR Review]
        REVIEW -->|Edit or Confirm| PUB_ACTION[Click: Publish Hoshin for FY2027]
        PUB_ACTION --> LIVE[Hoshin Master: Status PUBLISHED (v1)]
    end

    subgraph MBO_Core [App 794 Transaction Integration]
        LIVE --> RESOLVER[Hoshin Dynamic Resolver]
        RESOLVER --> SNAPSHOT[Inject Immutable Hoshin Snapshot into MBO Record]
        SNAPSHOT --> UI[Render Hoshin on MBO Header]
        SNAPSHOT --> SUBMIT[Unlock Objective Submission]
    end
```

---

## 2. Conceptual MBO Hoshin Master Schema (App 799)

| Field Code | Field Label | Type | Description | Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `Hoshin_ID` | Hoshin Identifier | SINGLE_LINE_TEXT | Unique Hoshin Record Key (PK) | `HOSH_FY2026_TME1_v1` |
| `Fiscal_Year` | Fiscal Year | SINGLE_LINE_TEXT | Target Fiscal Year | `FY2026`, `FY2027` |
| `Cycle_Code` | Cycle Code | SINGLE_LINE_TEXT | Linked Evaluation Cycle | `CYC_FY2026` |
| `Scope_Type` | Scope Type | DROP_DOWN | Organizational Hierarchy Level | `SECTION`, `DEPARTMENT`, `COMPANY` |
| `Scope_Key` | Scope Code / Identifier | SINGLE_LINE_TEXT | Section Code or Dept Code | `TME1`, `TMF1`, `Corporate` |
| `Scope_Name` | Scope Display Name | SINGLE_LINE_TEXT | Human-readable name | `Eco Energy Section 1` |
| `Department_Hoshin` | Department Hoshin Text | MULTI_LINE_TEXT | Strategic goals of the Department | `1. Enhance our strength...` |
| `Section_Hoshin` | Section Hoshin Text | MULTI_LINE_TEXT | Tactical goals of the Section | `1. Achieve operating profit...` |
| `Version` | Version Number | NUMBER | Incremental version | `1`, `2`, `3` |
| `Status` | Publication Status | DROP_DOWN | Governance State | `DRAFT`, `PUBLISHED`, `SUPERSEDED` |
| `Published_Date` | Published Date | DATETIME | Timestamp of publication | `2026-04-15T08:30:00Z` |
| `Published_By` | Published By User | USER_SELECT | Authorized Publisher | `somrudee` (GM) / `hr` |
| `Source_Reference` | Source Origin | SINGLE_LINE_TEXT | Heritage origin | `APP53_IMPORT`, `MANUAL_ENTRY` |
| `Remark` | Change Notes / Remarks | MULTI_LINE_TEXT | Reason for revision | `Annual baseline release` |
| `Active` | Active Flag | RADIO_BUTTON | Active indicator | `Active` |

---

## 3. The Publication & Submission Lifecycle Gate

### Rule 1: Hoshin Validity Criteria
An organizational Hoshin is valid for MBO V2 transactions **IF AND ONLY IF**:
$$\text{Current Evaluation Cycle} = \text{Hoshin Fiscal Year} \quad \text{AND} \quad \text{Hoshin Status} = \text{"PUBLISHED"}$$

### Rule 2: Objective Setting vs. Submission Gate
* **Fiscal Year Open & Hoshin in DRAFT / WAITING:**
  - Employee **CAN** open the MBO record, view profile info, execute Annual Plan Carry Forward, and prepare objective drafts.
  - Employee **CANNOT SUBMIT** objectives for Manager Review.
  - **UI Notification Banner:**  
    *🔵 รอประกาศ Hoshin สำหรับ FY2027 / Waiting for FY2027 Hoshin*  
    *คุณสามารถเตรียมร่าง Objective ได้ แต่ยังไม่สามารถส่งอนุมัติจนกว่า Hoshin FY2027 จะถูกประกาศ / You may prepare your objective draft, but submission is disabled until FY2027 Hoshin is published.*

### Rule 3: No Silent Fallback
If Current FY has no Published Hoshin, the system **NEVER falls back silently to Previous FY Hoshin**. The record enters `WAITING_FOR_HOSHIN` state to prevent employees from committing to obsolete targets.

---

## 4. Carry Forward & Post-Publication Interaction

1. **Preliminary Carry Forward Draft:**
   - An employee may carry forward previous objectives while Hoshin is pending.
   - When Hoshin is published, system displays: *"กรุณาตรวจสอบ Objective ให้สอดคล้องกับ Hoshin ของ Fiscal Year ปัจจุบันก่อน Submit"*.
2. **Strict No-Auto-Overwrite:**
   - When Hoshin is published or revised, the system **NEVER auto-overwrites** objective statements, action plans, or weights. Objective alignment remains the human responsibility of Employee and Manager.

---

## 5. Hoshin Versioning & Immutable Transaction Snapshot

### Case A: Hoshin Updated While MBO Record is DRAFT
* If Current Published Hoshin increments from `v1` to `v2`:
* Draft record prompts: *"Hoshin มีการปรับปรุง (Version 2) กรุณาตรวจสอบก่อนส่งอนุมัติ"*.
* On Submit, record captures `Hoshin_Version: 2`.

### Case B: Hoshin Updated After Objective Approval
* If Hoshin is updated to `v2` after MBO approval:
* The approved record **IS NEVER MODIFIED AUTOMATICALLY**.
* Historical snapshot retains `Hoshin_Version: 1` as proof of the governance baseline at time of approval.

---

## 6. Permissions & Publication Authority Model

* **Employees / Appraisees:** `READ ONLY` for Published Hoshin matching their Section/Department.
* **Managers / Evaluators:** `READ ONLY` for Sections under their supervision.
* **Authorized Publishers (HR / GM / Corporate Planning):** `CREATE DRAFT`, `EDIT DRAFT`, `PUBLISH`.
* **Security Boundary:** Enforced via Native Kintone App & Field Permissions.
