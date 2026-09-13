# D3-SBX-UAT-01 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-UAT-01
TITLE = REAL BROWSER UI + EXISTING M1_G1 READ-ONLY UAT
AUTHORIZATION_ID = MBO2026-D3-SBX-UAT01-20260913-OWNER-01
AUTHORIZED_BASE_HEAD = 037757065729a1a28fc75f1fbc9d155753d9f8cd
AUTHORIZED_BASE_PARENT = 22e7c788200bc05c36e2a10a971e0e15b3fe2bbe
AUTHORIZED_BASE_TREE = 683aedc17f9acb72ac16556eef0cb3a95b3a8191
AUTHORIZED_BASE_MESSAGE = docs(d3): synchronize control documents post exe2-r5 deployment acceptance
EXECUTION_HEAD = 037757065729a1a28fc75f1fbc9d155753d9f8cd
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
MODE = REAL BROWSER UI READ-ONLY UAT
STATUS = STOPPED SAFELY / BLOCKED / MISSING_AUTHENTICATED_BROWSER_SESSION / ZERO KINTONE WRITES / ZERO MUTATIONS / REVIEW REQUIRED
```

## 2. Hard Operational Accounting & Ceiling Compliance
```text
KINTONE_API_READS = 0 (CEILING: 0 GET max; API reads strictly unauthorized)
KINTONE_API_WRITES = 0 (CEILING: 0 max)
RECORD_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
ACL_WRITES = 0
CUSTOMIZATION_WRITES = 0
DEPLOYMENT_POSTS = 0
TOTAL_KINTONE_WRITES = 0 (CEILING: 0 max)

CREDENTIAL_ENTRIES = 0 (CEILING: 0 max; new login strictly forbidden)
SESSION_MUTATIONS = 0 (CEILING: 0 max)
LOCAL_STORAGE_INJECTIONS = 0 (CEILING: 0 max)
MUTATION_CLICKS = 0 (CEILING: 0 max)
TOTAL_MUTATIONS = 0 (CEILING: 0 max)

ZERO_WRITE_FAIL_CLOSED = ENFORCED
READ_ONLY_ENFORCEMENT = ENFORCED
```

## 3. Real Browser Runtime Discovery & Observation

### A. Environment Resolution
- The execution shell operates in a background Windows virtual desktop (`exebox-...`).
- The real user interactive session is located on `WinSta0\Default`.
- The executor spawned a dedicated Win32 thread attaching directly to `WinSta0\Default` via `OpenWindowStation`, `OpenDesktop("Default")`, and `SetThreadDesktop` to interact with physical desktop windows without headless mock substitution.

### B. Real Browser Discovery
- Live running browser: Google Chrome (PID `30516`).
- Detected browser windows on `WinSta0\Default`:
  - Handle `0x130EBA`
  - Handle `0x20A32`
  - Handle `0x112053C`
- Window `0x130EBA` was brought to the foreground and navigated to `https://ttmet.cybozu.com/k/794/`.

### C. Live Observation & Stop Condition
- Upon navigating to `https://ttmet.cybozu.com/k/794/`, the browser immediately redirected to:
  `https://ttmet.cybozu.com/login?redirect=https%3A%2F%2Fttmet.cybozu.com%2Fk%2F794%2F`
- Inspection of the remaining browser windows confirmed:
  - Window `0x20A32` was also on the `/login` page.
  - Window `0x112053C` was on `401 Unauthorized`.
  - While Cybozu Administration portal (`admin.cybozu.com`) was authenticated under administrative account `Admin-Form`, Kintone `/k/` requires separate authentication and had no active session cookie.
  - Under `main-mbo-app.js`, `admin-form` is hardcoded as `TECHNICAL_ADMIN`, which explicitly fails closed (`FAIL_CLOSED_TECH_ADMIN`) for Employee-Self operations in App 794. No employee user session was present in the browser.
- **Mandatory Policy Check**:
  - Instruction: *"No new login or session mutation workflow is authorized. Missing browser/session or suitable accessible record: STOP with blocker; do not substitute API/mock tests for browser UAT. Missing suitable evidence is BLOCKED/NOT TESTED, never PASS."*
  - Result: The executor halted immediately at the stop condition **`MISSING_AUTHENTICATED_BROWSER_SESSION`** with zero retries, zero credential entries, zero token injections, and zero mutations.

## 4. Test Case Outcomes

| Case ID | Description | Target | Outcome | Evidence / Rationale |
|:---:|:---|:---|:---:|:---|
| `UAT01-01` | View App 794 index / record list view in real browser | App 794 Index | **BLOCKED** | Browser navigated to `https://ttmet.cybozu.com/k/794/` but was immediately redirected to `/login`. No authenticated session exists to view the record list. |
| `UAT01-02` | Navigate to existing M1_G1 record view | App 794 M1_G1 Record | **BLOCKED** | Cannot navigate to or select an existing record without an authenticated Kintone user session. |
| `UAT01-03` | Verify process action buttons, read-only UI components, custom JS/CSS rendering | App 794 Detail View | **BLOCKED** | Record view cannot be loaded; process action buttons and custom component rendering cannot be inspected in the DOM. |
| `UAT01-04` | Verify console log (absence of uncaught errors), route snapshot integrity in DOM | Browser Console / DOM | **BLOCKED** | App 794 JavaScript payload (`mbo-employee-app.js`) is not executed on the login redirect page; console logs and DOM snapshot integrity cannot be verified. |

## 5. Visual Evidence Artifact

- **Sanitized Visual Screenshot**:
  - Path: `project-docs/evidence/D3_SBX_UAT_01/UAT01_LOGIN_REQUIRED_EVIDENCE.png`
  - Byte Length: `253764` bytes
  - SHA-256: `d99db6478000b4a58c4bb42fde68d5247ccd3a78c38622e782eb045f4ece5860`
  - Visual Details: Confirms real Chrome browser window displaying Cybozu login form with omnibox URL `https://ttmet.cybozu.com/login?redirect=https%3A%2F%2Fttmet.cybozu.com%2Fk%2F794%2F`.
  - Privacy Redaction: Tab bar (top), personal bookmark bar (below omnibox), and Windows taskbar (bottom) are completely redacted. Address bar, login form, and DevTools console remain visible for verifiable evidence.

## 6. Strict Non-Claims & Governance
```text
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED
FULL_D3_BUSINESS_UAT = NOT CLAIMED
D3_CLOSURE = NOT CLAIMED
PRODUCTION_READY = NO
```

## 7. Terminal Governance State
```text
RESULT = REVIEW REQUIRED
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
