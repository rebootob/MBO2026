# Generic Routing & Reopen Revision Test Matrix (FROZEN)

> **Architecture Status:** **`FROZEN`**  
> **Total Architecture Scenarios Defined:** **70 Scenarios** (`RT-001` to `RT-050` Routing & Reassignment, `RT-071` to `RT-090` Reopen Revision)  
> **Current Automated Unit Tests Executed:** **32/32 Tests Passing (`npm test`)**  
> **Last Updated:** 2026-08-24  

---

## 1. Test Metrics Clarification
* **Architecture Scenarios Defined:** **70 Scenarios** (Fully specified for Phase 2 Implementation verification).
* **Automated Unit Tests Executed in Phase 1:** **32 Tests Executed & Passing (100%)**.

---

## 2. Operational Routing & Reassignment Test Scenarios (RT-001 to RT-050)

| Test ID | Test Scenario Description | Target Topology / Condition | Expected Execution Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **RT-001** to **RT-035** | Core Generic Routing, Twin Status, Slot Capacity, and Security | All 5 Families | Verified against frozen core specifications | SPECIFIED |
| **RT-036** | Manager changes while record in Draft | Master updated; record in Draft | Submit resolves new Manager automatically | SPECIFIED |
| **RT-037** | Manager changes while record Pending | Master updated; record with Manager A | Master change alone does not move pending record | SPECIFIED |
| **RT-038** | HR reassigns single Pending Record | Current Record Only scope selected | Target record updated; Master remains unchanged | SPECIFIED |
| **RT-039** | HR changes Future Routing only | Future Routing scope selected | Master updated; pending records remain unchanged | SPECIFIED |
| **RT-040** | Future Routing does not alter Pending | In-flight records inspected | In-flight records retain original assignees | SPECIFIED |
| **RT-041** | Future Routing + selected Pending | Dual scope selected | Master updated AND selected pending records reassigned | SPECIFIED |
| **RT-042** | Bulk Preview shows correct records | Bulk reassign initiated | Displays list of affected records with checkboxes | SPECIFIED |
| **RT-043** | Bulk change modifies selected only | 10 of 18 records selected | Exactly 10 records reassigned; 8 untouched | SPECIFIED |
| **RT-044** | Effective Date route selection | Effective_From date set | Cycle resolves version active on evaluation date | SPECIFIED |
| **RT-045** | Historical Completed Stage unchanged | Mid-year reassigned | Objective approved by Manager A remains Manager A | SPECIFIED |
| **RT-046** | Three-layer history audit trace | Full lifecycle trace | Reconstructs Original $	o$ Reassigned $	o$ Approved | SPECIFIED |
| **RT-047** | Employee reassignment isolation | Reassign Employee 0149 | Other section employees remain unaffected | SPECIFIED |
| **RT-048** | Unauthorized user cannot reassign | Non-HR user attempts API | Server rejects request with HTTP 403 | SPECIFIED |
| **RT-049** | Bulk reassignment partial failure | API fails on 1 record | System logs error, rolls back / reports exact failure | SPECIFIED |
| **RT-050** | Routing Master history preserved | Multiple Master updates | Version history preserved in App 795 audit | SPECIFIED |

---

## 3. Reopen & Revision Data Model Test Scenarios (RT-071 to RT-090)

| Test ID | Test Scenario Description | Target Condition | Expected Execution Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **RT-071** | Reopen uses same MBO Record | HR reopens approved record | Record ID in Kintone remains identical | SPECIFIED |
| **RT-072** | Record Key remains unchanged | `FY2027-0149` reopened | `Record_Key` remains strictly `FY2027-0149` (No `-R2`) | SPECIFIED |
| **RT-073** | New Objective Revision created | Objective reopened | `Objective_Revision` increments from `1` to `2` | SPECIFIED |
| **RT-074** | Historical revision preserved | Rev 2 opened | Rev 1 snapshot stored immutably in Archive App | SPECIFIED |
| **RT-075** | Old approval not deleted | Rev 2 created | Rev 1 approvals marked `SUPERSEDED`, never deleted | SPECIFIED |
| **RT-076** | Current approval reset correctly | Rev 2 created | Current approval status resets to `PENDING` | SPECIFIED |
| **RT-077** | Old score preserved | Rev 2 opened | Rev 1 score preserved in historical record | SPECIFIED |
| **RT-078** | Current score recalculated | Rev 2 edited | Score recalculated based on Rev 2 weights | SPECIFIED |
| **RT-079** | Historical comments preserved | Rev 2 opened | Rev 1 comments remain queryable with Rev 1 tag | SPECIFIED |
| **RT-080** | Dashboard counts one Employee/FY | Dashboard KPI query | Employee 0149 counted as exactly 1 Evaluation | SPECIFIED |
| **RT-081** | Historical revision read-only | User views Rev 1 in modal | Modal displays read-only view with watermark | SPECIFIED |
| **RT-082** | Current revision editable | User views Rev 2 | Edit controls enabled according to workflow status | SPECIFIED |
| **RT-083** | Draft correction no revision | Edit in `01 Draft Objective` | Saves within same revision (`Rev 1`) | SPECIFIED |
| **RT-084** | Return before approval no revision| Approver returns draft | Corrects within same revision (`Rev 1`) | SPECIFIED |
| **RT-085** | Reopen after approval new revision | Reopen approved stage | Creates `Rev 2` and triggers `EVALUATION_REVISION_CREATED` | SPECIFIED |
| **RT-086** | Carry Forward uses latest revision | Carry Forward from FY2026 | Pulls data strictly from FY2026 latest valid revision | SPECIFIED |
| **RT-087** | Route snapshot preserved per rev | Manager changed in Rev 2 | Rev 1 shows Manager A; Rev 2 shows Manager B | SPECIFIED |
| **RT-088** | Hoshin snapshot preserved per rev | Hoshin updated in Rev 2 | Rev 1 references Hoshin V1; Rev 2 references V2 | SPECIFIED |
| **RT-089** | Multiple reopen cycles | R1 $	o$ R2 $	o$ R3 | Full chain of revisions archived immutably | SPECIFIED |
| **RT-090** | Final calculation uses latest rev | Final evaluation score | Calculates strictly from latest valid revisions | SPECIFIED |
