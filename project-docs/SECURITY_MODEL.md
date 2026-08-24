# MBO V2 Enterprise Security & Privacy Model

> **Governance Authority:** `DEC-039 (STRICT EMPLOYEE RECORD DATA ISOLATION)`  
> **Status:** `FROZEN / SECURITY CRITICAL`  
> **Last Updated:** 2026-08-24T18:40:00+07:00  

---

## 1. Core Security Principle & Record Data Isolation (`DEC-039`)

Each employee must ONLY be able to access their own MBO and evaluation records (e.g. Employee Code `0149` may access only `0149` records).

Employee A must **NEVER** be able to view, read, edit, or export:
- Employee B objectives & action plans
- Employee B ratings & achievement scores
- Employee B manager/GM comments
- Employee B final scores & grades
- Employee B evaluation history & audit logs
- Employee B attached files & documents
- Employee B routing & approver details

unless the authenticated user possesses an explicit authorized business role (such as assigned appraiser, assigned approver, or HR).

---

## 2. Authenticated Identity Binding (`DEC-039`)

* `Employee_Code` alone MUST NOT be treated as authentication.
* System MUST NOT trust an input or URL `Employee_Code` without verifying authenticated identity.
* Security access control MUST be strictly bound to verified **Authenticated Identity**:
  $$\text{Authenticated Identity} \xrightarrow{\text{Verified Binding}} \text{Employee\_Code} \xrightarrow{\text{Access Control}} \text{Authorized Record(s)}$$

---

## 3. Shared Kintone Account Security Conflict (`SECURITY_ARCHITECTURE_DEPENDENCY`)

* **Architectural Vulnerability:** If multiple employees log into Kintone using a shared/common Kintone account, native Kintone permissions view those employees as the **SAME** authenticated user.
* **Security Limitation:** Native Kintone record permissions cannot distinguish individual employees behind a shared login.
* **Mandatory Dependency Gate:** Prior to Employee Self-Service go-live, a deterministic, secure binding mechanism must be established and verified to resolve `SECURITY_ARCHITECTURE_DEPENDENCY`.

---

## 4. Security Boundary Rule (Native Permission vs UX)

* **Native Kintone App & Field Permissions** or approved server-side access control mechanisms constitute the system security boundary.
* **Client-Side UX Customization:** JavaScript and CSS (hiding fields, hiding buttons, hiding records, view redirects, JavaScript table filters) are **UX ENHANCEMENTS ONLY**.
* **Rule:** Client-side JavaScript/CSS MUST NOT be relied upon as a security boundary to prevent unauthorized data access.

---

## 5. Least-Privilege Role Access Matrix

| Role / User Category | Access Scope | Confidential Field Rights |
| :--- | :--- | :--- |
| **Employee (Self)** | Own active & historical MBO records only | Read own objectives; BLOCKED from confidential rating fields |
| **Authorized Appraiser** | Records explicitly assigned for evaluation | Read/Write assigned evaluation fields during evaluation stage |
| **Authorized Approver** | Records explicitly routed to approver in active workflow | Read/Approve routed records during active approval stage |
| **HR Specialist / Operations** | Enterprise evaluation records according to HR policy | Full business evaluation read/write access |
| **HR Manager / System Admin** | Administrative access according to approved security policy | Full administrative & audit log access |

---

## 6. Direct URL / API Security & Release Blocker Test

Access control security testing MUST include adversarial attempts to access cross-employee data via:
- Direct Record URL tampering (`/k/794/show#record=XYZ`)
- Record ID sequential manipulation
- Kintone REST API direct queries (`/k/v1/records.json`)
- Custom list views and saved queries
- Kintone search engine queries
- File export (CSV/Excel)
- Attachment direct file download links
- Mobile view URLs

> **MANDATORY RELEASE BLOCKER TEST:**  
> The automated & manual security test **`EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B`** must pass 100% prior to production release.

---

## 7. Security Continuity for Historical Migrated Data (`DEC-040`)

* `DEC-039` strict record data isolation applies equally to historical migrated records (`Record_Origin = LEGACY_MIGRATED`).
* Migration of historical data from the 8 legacy PMS apps MUST NOT weaken or bypass record-level data isolation.

---

## 8. Hardened Confidentiality Field Policy

All appraisal competency rating fields belonging to the resolved competency set are **CONFIDENTIAL BY DEFAULT**.

Security access control MUST NOT rely on a fixed 1..6 list, but dynamically enforce privacy over all active competency rating indexes (including 1..8 for Management sets).

Specifically, Employees / Shared accounts MUST NEVER view:
- `Manager_Achievement_1..10`, `GM_Achievement_1..10`
- `Manager_Comment_1..10`, `GM_Comment_1..10`
- `PartA_Raw_Score`, `PartA_Weighted_Score`
- `Manager_Competency_Rating_1..8`, `GM_Competency_Rating_1..8` (All active competency items 1..8)
- `PartB_Raw_Score`, `PartB_Weighted_Score`
- `Final_Confidential_Score`, `Final_Grade`
## 9. App 794 Full Test Sandbox Environment Governance (`DEC-041`)

* **Sandbox Designation:** App 794 (`MBO V2 Sandbox App`) is designated as `APP_794_ENVIRONMENT = SANDBOX` and `APP_794_PRODUCTION = FALSE`. Its explicit purpose is `APP_794_PURPOSE = MBO_V2_DEVELOPMENT_AND_FULL_TESTING`. It is NOT a production application and MUST NOT be treated as permanently read-only.
* **Controlled Write Permission:** App 794 controlled write operations (POST, PUT, DELETE, schema modifications, Process Management, security testing) are permitted ONLY when explicitly planned and authorized by an approved Work Package (`WRITE_ALLOWED_APPS = [794]`).
* **Default-Deny Security Guard:** The default safety harness remains `WRITE_ALLOWED_APPS = []`. Protected apps (Apps 53, 283, 305, 307, 310, 640, 643, 715, 716) remain permanently READ ONLY.
* **Primary Security Sandbox:** App 794 is the primary sandbox for proving `DEC-039` security isolation requirements and executing adversarial `EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B` release blocker tests prior to production cutover.
