# D1 HYBRID IDENTITY CORE SOURCE R1 CORRECTIVE R2 EVIDENCE

> STATUS: `PENDING_CHATGPT_REVIEW`  
> Execution Timestamp: 2026-08-30T15:08:54+07:00  
> Target Domain: Hybrid Identity & Routing Core Service Logic  
> Work Package ID: MBO-P01-WP-HYBRID-SOURCE-R1-CORRECTIVE-R2  
> Mode: **SOURCE / FOCUSED TEST ONLY — APP53 PRODUCTION READ-ONLY (NO LIVE KINTONE GET/POST/PUT/DELETE / NO APP53 SCHEMA OR DATA WRITE / NO ACL WRITE / NO DEPLOY)**

---

## 1. Initial State & Branch Verification

```text
STARTING_HEAD                 = 6378cdaa826afffd1f421a2ade7890685f1b46b7
EVALUATED_CORRECTIVE_R1_HEAD  = 5cc5ea609a4a4c5d2d218866feb0867e573973c0
APPROVED_DESIGN_BASELINE      = project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md
APP53_ENVIRONMENT             = PRODUCTION (READ-ONLY GUARD ENFORCED)
APP53_PRODUCTION_TOUCHED      = NO
LIVE_NETWORK_OPERATIONS       = 0
NATTA_EMPLOYEE_CODE_GUESSED   = NO
ACCEPTED_APP794_REVISION      = 60 (UNTOUCHED / PRESERVED)
```

---

## 2. Exact Files Changed in Corrective R2

```text
[MODIFY] src/services/routing-service.js       (restored case-insensitive SHARED requester comparison compatibility)
[MODIFY] tests/d1-hybrid-identity-core-source.test.js  (added SHARED case-insensitive regression + explicit generic 3-slot & 4-slot tests)
[NEW]    project-docs/D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_R2_EVIDENCE.md
```

### Untouched Files Audit (Non-Contamination Proof):
- `src/services/mbo-identity-service.js`: **UNTOUCHED (0 edits in R2 / Preserved)**
- `src/main-mbo-app.js` (App 794 Transaction Core): **UNTOUCHED (0 edits)**
- `src/services/employee-service.js`: **UNTOUCHED (0 edits)**
- `src/ui/hr-control-center.js` (Reset UI Source): **UNTOUCHED (0 edits)**
- `dist/hr-control-center-bundle.js`: **UNTOUCHED (0 edits)**
- `dist/hr-control-center.css`: **UNTOUCHED (0 edits)**
- `config/schema-spec.js` / App 53 / App 795 Live: **UNTOUCHED (0 edits)**

---

## 3. Exact Corrections Applied for Findings D and E

### Finding D — SHARED Requester Behavior Compatibility (`RoutingService.resolveEffectiveRequesterUser`)
- **Restored Case-Insensitive Comparison for SHARED Mode:** Restored normalized case-insensitive comparison (`norm(uCode) === norm(cleanUser)`) for `mode === 'SHARED'`.
- **DEDICATED Mode Kept Strict:** `DEDICATED` mode remains exact, case-sensitive, and rejects whitespace.
- **Unauthorized SHARED Denied:** Unauthorized shared principals absent from App795 `Requester_User` remain strictly denied (throws Error).
- **Admin Isolation:** `admin-form`, `Administrator`, or `ADMIN` user codes remain denied in both modes.

### Finding E — Mandatory Generic 3-Slot & 4-Slot Regression Tests (`tests/d1-hybrid-identity-core-source.test.js`)
- **Generic 3 Surviving Slots Test (`M1_M2_G1`):** Proved transformation when self solely occupies Slot 2 (`M2`), leaving 3 surviving slots (`M1`, `G1`, `G2`). Verified that surviving slots shift left into `M1_M2_G1` carrying their original approval rules (`ALL`, `ANY`, `ALL`), `Routing_Topology` becomes `'M1_M2_G1'`, `Has_Manager_Level2` = `'Yes'`, `Has_GM_Level2` = `'No'`, and the input object remains unmodified.
- **Generic 4 Surviving Slots Test (`M1_M2_G1_G2`):** Proved transformation when self shares Slot 1 (`M1`) with a co-approver (`[self, co_manager]`), leaving all 4 slots nonempty after self removal. Verified that all 4 surviving slots retain their original approvers and rules (`ANY`, `ALL`, `AT_LEAST_ONE`, `ALL`), `Routing_Topology` remains `'M1_M2_G1_G2'`, `Has_Manager_Level2` = `'Yes'`, `Has_GM_Level2` = `'Yes'`, and the input object remains unmodified.

---

## 4. Test Verification Results

### Focused Hybrid Identity Test Suite (`node --test tests/d1-hybrid-identity-core-source.test.js`):

```text
✔ D1 Hybrid Identity: Vassana valid dedicated mapping resolves to canonical emp_text 0044
✔ Finding A: Account_Status without Number_0 fails closed in canonical resolver
✔ Finding A: Missing Number_0 fails closed in canonical resolver
✔ Finding A: Kintone_User_Code without MBO_Kintone_User fails closed in canonical resolver
✔ Finding A: Employee_Code without emp_text fails closed in canonical resolver
✔ Finding A: USER_SELECT item with only .value but no .code fails closed in canonical resolver
✔ Finding A: Kintone user input with leading/trailing whitespace fails closed in canonical resolver
✔ Finding A: Selected code comparison is case-sensitive and fails closed on case mismatch
✔ Finding A: Malformed/invalid canonical emp_text fails closed
✔ D1 Hybrid Identity: Natta dedicated mapping with blank emp_text fails closed without guessing Number=243
✔ D1 Hybrid Identity: admin-form technical admin identity is denied from binding Employee-Self
✔ D1 Hybrid Identity: inactive mapping (Number_0 = 0) fails closed
✔ D1 Hybrid Identity: USER_SELECT array with >1 users fails closed
✔ D1 Hybrid Identity: duplicate active mapping records for same user returns IDENTITY_MAPPING_AMBIGUOUS
✔ Finding B: resolveEffectiveRequesterUser rejects invalid or missing mode
✔ Finding B: resolveEffectiveRequesterUser rejects whitespace in DEDICATED user code
✔ Finding D: SHARED requester comparison normalizes case for compatibility while unauthorized principal remains denied
✔ D1 Hybrid Identity: resolveEffectiveRequesterUser returns dedicated user in DEDICATED mode and validates SHARED mode
✔ D1 Hybrid Identity Mandatory Natta Test: own-MBO self-appraiser elision transforms natta->uchida (M1_G1) to uchida (M1_ONLY)
✔ Finding E: generic 3 surviving slots transformation (M1_M2_G1)
✔ Finding E: generic 4 surviving slots transformation (M1_M2_G1_G2)
✔ Finding C: ownMbo=true with missing or whitespace dedicated user fails closed
✔ Finding C: self-appraiser elision uses exact case-sensitive user code comparison
✔ Finding C: multi-user slot preserves surviving users in same slot without creating extra workflow level
✔ Finding C: surviving slot carries non-ALL approval rule when shifted
✔ D1 Hybrid Identity: own-MBO with no self appraiser remains unchanged
✔ D1 Hybrid Identity: own-MBO with only self appraiser fails closed (NO_REMAINING_NON_SELF_APPROVER)

RESULT: 27 / 27 PASS (0 failed, 0 skipped)
```

### Full Repository Test Suite (`npm test`):

```text
RESULT: 1015 / 1015 PASS across all 8 test suites (0 failed, 0 skipped)
```

### Formatting & Line-Ending Check (`git diff --check`):

```text
RESULT: PASS (0 trailing whitespace / newline errors)
```

---

## 5. Network & Safety Operations Verification Table

| Metric | Recorded Value | Requirement | Result |
|---|---|---|---|
| Live GET Requests Executed | `0` | Strictly 0 | PASS |
| Live POST Requests Executed | `0` | Strictly 0 | PASS |
| Live PUT Requests Executed | `0` | Strictly 0 | PASS |
| Live DELETE Requests Executed | `0` | Strictly 0 | PASS |
| App 53 Production Touched (`APP53_PRODUCTION_TOUCHED`) | `NO` | Strictly NO | PASS |
| Live Network Operations (`LIVE_NETWORK_OPERATIONS`) | `0` | Strictly 0 | PASS |
| App 53 Schema Writes Executed | `0` | Strictly 0 | PASS |
| App 53 Record Writes Executed | `0` | Strictly 0 | PASS |
| App 53 Import / Bulk Writes Executed | `0` | Strictly 0 | PASS |
| App 794 App / Record ACL Writes | `0` | Strictly 0 | PASS |
| Kintone Group Creation / Membership Writes | `0` | Strictly 0 | PASS |
| Customization Uploads | `0` | Strictly 0 | PASS |
| Deployments Executed (`executeDeploy()`) | `0` | Strictly 0 | PASS |
| Natta Employee Code Guessed (`NATTA_EMPLOYEE_CODE_GUESSED`) | `NO` | Strictly NO | PASS |

---

### Maximum Executor Status

`D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_R2_READY_PENDING_CHATGPT_REVIEW`

- Restored case-insensitive SHARED requester comparison in `src/services/routing-service.js`.
- Added generic 3-slot (`M1_M2_G1`) and 4-slot (`M1_M2_G1_G2`) transformation tests and SHARED regression tests in `tests/d1-hybrid-identity-core-source.test.js`.
- Verified in 27 focused tests in `tests/d1-hybrid-identity-core-source.test.js`.
- 1015/1015 unit tests passed across all 8 test suites; `git diff --check` passed cleanly.
- `APP53_PRODUCTION_TOUCHED = NO`; `LIVE_NETWORK_OPERATIONS = 0`; `NATTA_EMPLOYEE_CODE_GUESSED = NO`.
- 0 live network/schema/record/ACL/deployment actions executed.
- Stopped. Pending ChatGPT Independent Review.
