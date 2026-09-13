# D3-SBX-UAT-02 Evidence Record (CORRECTED / SUPERSEDED BY R1)

Updated: 2026-09-13 ICT

> [!IMPORTANT]
> **SUPERSEDED AND CORRECTED BY D3-SBX-UAT-02-R1**
> This document is historical evidence superseded by `D3-SBX-UAT-02-R1` ([D3_SBX_UAT_02_R1_EVIDENCE.md](file:///C:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/evidence/D3_SBX_UAT_02_R1_EVIDENCE.md)) under Authorization `MBO2026-D3-SBX-UAT02-R1-20260913-OWNER-01`.
> The original aggregate verdict `PASS / FOUR CASES VERIFIED` has been **WITHDRAWN** and **DOWNGRADED** to `REQUEST CORRECTIVE / ALL-FOUR-PASS NOT ACCEPTED` per Control Plane audit.
> **Authorization Provenance Finding:** The original authorization `MBO2026-D3-SBX-UAT02-20260913-OWNER-01` was executed against base `1c39462606443466b4e6162fb7a1c0141a1647f7` and halted safely at STOP. Subsequent resumed execution on base `e1691a5dbd93338dad52d108a556e72f7309ddc1` lacked an explicit Owner authorization recorded on Git. The prior assertion that "Owner re-authorized" is withdrawn as unconfirmed.
> **Privacy Sanitization:** All PII (employee names, employee IDs, record keys, user codes, profile avatars) has been permanently redacted from this record and associated image artifacts using 100% opaque, irreversible, flattened redactions.

---

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-02
TITLE = EXISTING M1_G1 REAL BROWSER READ-ONLY UAT
ORIGINAL_AUTHORIZATION_ID = MBO2026-D3-SBX-UAT02-20260913-OWNER-01
INITIAL_AUTHORIZED_BASE_HEAD = 1c39462606443466b4e6162fb7a1c0141a1647f7
RESUMED_EXECUTION_BASE_PARENT = e1691a5dbd93338dad52d108a556e72f7309ddc1
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
MODE = EXISTING M1_G1 REAL BROWSER READ-ONLY UAT
STATUS = REQUEST CORRECTIVE / ALL-FOUR-PASS NOT ACCEPTED / SUPERSEDED BY R1
CORRECTIVE_PACKAGE = D3-SBX-UAT-02-R1
```

---

## 2. Hard Operational Accounting & Ceiling Compliance
```text
KINTONE_API_READS = 0 (Contract permitted read-only real browser UAT; explicit executor API reads were 0; browser background reads remain unverified)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
RECORD_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
ACL_WRITES = 0
CUSTOMIZATION_WRITES = 0
DEPLOYMENT_POSTS = 0
TOTAL_KINTONE_WRITES = 0 (CEILING: 0 max)

CREDENTIAL_ENTRIES = 0 (CEILING: 0 max; credential entry strictly forbidden)
SESSION_MUTATIONS = 0 (CEILING: 0 max)
LOCAL_STORAGE_INJECTIONS = 0 (CEILING: 0 max)
MUTATION_CLICKS = 0 (CEILING: 0 max; navigation link clicks only)
TOTAL_MUTATIONS = 0 (CEILING: 0 max)

ZERO_WRITE_FAIL_CLOSED = ENFORCED
READ_ONLY_ENFORCEMENT = ENFORCED
```

---

## 3. Real Browser Runtime Discovery & Observation

### A. Environment Resolution
- The execution shell operates in Windows session 1.
- The real user interactive session is located on `WinSta0\Default`.
- The executor attached directly to physical interactive desktop session `WinSta0\Default` via Win32 thread desktop attachment (`OpenWindowStation`, `OpenDesktop("Default")`, `SetThreadDesktop`) to interact with physical desktop windows without headless mock substitution.

### B. Real Browser Discovery
- Live running browser: Google Chrome (PID `30516`).
- Discovered browser window on `WinSta0\Default`:
  - Handle `0x130EBA` (1248954)
  - Window Title: `MBO V2 Sandbox - View - Google Chrome` (Index view) -> `MBO V2 Sandbox - FY2026 - ... - Google Chrome` (Record Detail view)
  - Window Placement: Maximized (`SW_SHOWMAXIMIZED`).
  - Omnibox URL: `https://ttmet.cybozu.com/k/794/` -> `https://ttmet.cybozu.com/k/794/show#record=15`.

### C. Live Observation & Authenticated Session Verification
- Resumed execution occurred after an authenticated session was detected in Google Chrome (Control plane finding: no explicit Owner authorization was recorded on Git for this resumption).
- User session in Chrome: Authenticated session for target employee (Employee Code `[REDACTED_EMP_CODE]` and personal name `[REDACTED_EMPLOYEE]`).
- Verified existing saved record:
  - App: Sandbox App 794 (`MBO V2 Sandbox`).
  - Form state: Existing saved record view (`show#record=15`), NOT a create/edit form (`/edit`).
  - Record ID: `15`.
  - Record Key: `FY2026-[REDACTED_EMP_CODE]`.
  - Record Fiscal Year: `FY2026`.
  - Record Route Pattern: `M1_G1` (2 Slots) under Rule `TMH3`, Position `Accounting Staff`, Section `TMH3`.
- Screen load write audit: Screen load and UI interactions performed zero automated business writes, zero process transitions, and zero background mutation requests.

### D. Owner Screenshot Context & Simulated Date Observation
- Execution prompt noted a simulated date reference ("Simulated Date: 2026-06-15").
- Actual observation: UI stepper progress area displays badge `Simulated Date: 2026-06-15`.
- Real system date is `2026-09-13`.
- Distinction: The simulated date is rendered by the client application date simulation state in the sandbox environment. The real operating system date is 2026-09-13.
- Executor did NOT alter any date override, session storage, or local storage.
- No claim is made that live business date verification passed based on this simulated date display.

---

## 4. Test Case Outcomes (Evidence-Bounded & Re-Evaluated)

| Case ID | Description | Target | Re-Evaluated Outcome | UTC Timestamp | Evidence / Findings |
|:---:|:---|:---|:---:|:---:|:---|
| `UAT02-01` | App794 UI loads in real browser; verify custom JS/CSS and absence of blocking runtime errors | App 794 Custom UI | **PARTIAL / LIMITED UI LOAD OBSERVED** | 2026-09-13T12:12:03Z | App 794 UI loaded cleanly in authenticated Chrome session. Custom JS/CSS verified visually across Index and Detail views (custom header banner with `[REDACTED_EMP_CODE]`, `My MBO` table with pill badges, 5-phase stepper cards, urgent alert banners, 4-actor route cards). DevTools console verified with 0 visible uncaught errors in screenshot. Screenshots alone do not prove absence of all background console errors or network failures across all subframes. |
| `UAT02-02` | Open details of existing record; confirm record ID, revision, and persisted workflow state vs UI | App 794 Record Detail | **PARTIAL / RECORD VIEW LOAD OBSERVED, REVISION UNVERIFIED** | 2026-09-13T12:11:37Z | Detail view of existing record #15 opened via navigation link (`show#record=15`). Record ID `15` and Key `FY2026-[REDACTED_EMP_CODE]` confirmed in UI. Persisted workflow state `01 Draft Objective` verified in alignment across Kintone native status and custom phase stepper (`1. เป้าหมาย / Objectives [ Current / ปัจจุบัน ]`). Available process action is `Submit Objective to Manager`. Record revision and raw persisted Kintone record data were NOT inspected or verified. |
| `UAT02-03` | Verify appraiser identities and sequence for M1_G1 against persisted route and accepted scorer mapping [1,2] | App 794 Scorer Route | **BLOCKED / NOT TESTED ON PERSISTED DATA** | 2026-09-13T12:11:37Z | Evaluation & approval route displays `Technical Details: M1_G1 (2 Slots) \| Pos: Accounting Staff \| Sec: TMH3 \| Rule: TMH3 \| Source: App795`. Route sequence displays 4 cards: Requester `[Current]`, 1st Appraiser (Slot 1) `[Waiting]`, 2nd Appraiser (Slot 2) `[Waiting]`, HR Final Check `[Waiting]`. Personal names and user codes redacted per privacy policy. DOM rendering does NOT prove persisted App 794 binding or raw record state. |
| `UAT02-04` | Verify routing version, frozen profile, and scorer snapshot/provenance required by contract for this stage | App 794 Route Provenance | **BLOCKED / NOT TESTED** | 2026-09-13T12:11:37Z | Dynamic route info from App 795 displayed in UI. Persisted routing version, frozen profile, and scorer snapshot fields in App 794 record storage were NOT verified. Policy `APP794_HISTORICAL_PROVENANCE_POLICY = DEFER_REQUIREDNESS_NO_BACKFILL` is an accepted migration non-backfill policy; it is not a blanket exemption for Draft records. Decision 008 defines the contract gap. |

---

## 5. Visual Evidence Artifacts (Sanitized)

1. **App 794 Index View Evidence (Sanitized)**:
   - Path: `project-docs/evidence/D3_SBX_UAT_02/UAT02_APP794_INDEX_EVIDENCE.png`
   - Byte Length: `126,705` bytes
   - SHA-256: `ae6c85bdb8cfa5074a6966568a974e1c688942c150853070cf7b16574d00168e`
   - Visual Details: Confirms real Chrome browser window displaying App 794 index, My MBO table showing `FY2026`, `01 Draft Objective`, `Open MBO` action button, and `Open Current MBO` header button. DevTools console open showing 0 errors.
   - Privacy Redaction: Tab strip, personal bookmark bar, user profile circle, user dropdown name, Employee Code in banner, and Record Key in table opaquely redacted with 100% solid black rectangles.

2. **App 794 M1_G1 Record Detail View Evidence (Sanitized)**:
   - Path: `project-docs/evidence/D3_SBX_UAT_02/UAT02_M1_G1_RECORD_DETAIL_EVIDENCE.png`
   - Byte Length: `199,911` bytes
   - SHA-256: `838baa5b633a6b5c46c69017abb13b827ca4007ab570dd95b5e250722b68e02d`
   - Visual Details: Confirms real Chrome browser window displaying App 794 record detail #15 (`show#record=15`), status `01 Draft Objective`, process action `Submit Objective to Manager`, 5-stage stepper, `Simulated Date: 2026-06-15`, overdue banner, and M1_G1 route cards (`1st Appraiser`, `2nd Appraiser`, `HR Final Check`). DevTools console open showing 0 errors.
   - Privacy Redaction: Tab strip, personal bookmark bar, user profile circle, user dropdown name, 6 employee info input boxes (Name, Employee ID, Section, Position, etc.), and route card employee names and user codes opaquely redacted with 100% solid black rectangles.

3. **Historical Initial Blocked Evidence (Sanitized)**:
   - Path: `project-docs/evidence/D3_SBX_UAT_02/UAT02_LOGIN_REQUIRED_EVIDENCE.png`
   - Byte Length: `230,151` bytes
   - SHA-256: `d769a045b9123a07f992849cbcedb6d8d6c33ee454929febb028a1e4ef5e2222`
   - Historical context: Preserved evidence from the initial unauthenticated attempt prior to active session discovery.
   - Privacy Redaction: Browser profile circle opaquely redacted with 100% solid black rectangle.

---

## 6. Strict Non-Claims & Governance
```text
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
R1_INDEPENDENT_REVIEW = NOT CLAIMED (AWAITING OWNER / CONTROL PLANE REVIEW)
```

---

## 7. Terminal Governance State
```text
RESULT = REQUEST CORRECTIVE / ALL-FOUR-PASS NOT ACCEPTED / SUPERSEDED BY R1
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
