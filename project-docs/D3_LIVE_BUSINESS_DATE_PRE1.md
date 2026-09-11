# D3 Live Business Date Decision & Gap Review (D3-LIVE-BUSINESS-DATE-PRE1)

## 1. Executive Summary & Blocker Status
- **Package:** `D3-LIVE-BUSINESS-DATE-PRE1`
- **Canonical Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Preflight Base SHA:** `f9dd1b8be13b5dd74fb81cb07e5ab4f3861d06b4`
- **Mode:** `EVIDENCE / DECISION / GAP-REVIEW ONLY` (ZERO KINTONE I/O, ZERO SOURCE CHANGE, ZERO TEST CHANGE, ZERO DEPLOYMENT)
- **Current Blocker Status:**
  ```text
  LIVE_BUSINESS_DATE_PROVIDER = DECISION REQUIRED / DEPLOYMENT BLOCKER
  ```
- **Readiness Meaning:** Resolving this analysis package does **NOT** clear the deployment blocker. Live runtime code still defaults `testResolutionBusinessDate = null` and throws `RESOLUTION_BUSINESS_DATE_REQUIRED` fail-closed in client browser runtime. Implementation, testing, and independent review are mandatory before clearance.

---

## 2. Current Code & Repository Truth Behavior

### 2.1 The Existing Execution Path
1. **Entry Point (`src/main-mbo-app.js`):**
   - Lines 67–82: `let testResolutionBusinessDate = null;` exported with `setResolutionBusinessDateForTests(value)`.
   - Lines 705–710: During `onLookupEmployee` (Step 5: D3 Model A Route Resolution):
     ```javascript
     const resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;
     if (!resolutionBusinessDate || typeof resolutionBusinessDate !== 'string') {
       throw new Error('Explicit resolution business date (YYYY-MM-DD) is required for D3 Model A resolution (RESOLUTION_BUSINESS_DATE_REQUIRED). Live business date provider is unresolved and blocks deployment.');
     }
     ```
   - Lines 1004–1007: `setupRecordUiWithAuth` receives `{ resolutionBusinessDate: testResolutionBusinessDate }` which is `null` in production.
2. **Pure Version Resolver (`src/services/d3-route-version-resolver.js`):**
   - Strictly enforces ISO calendar date `YYYY-MM-DD` via `/^\d{4}-\d{2}-\d{2}$/`.
   - **Rejects any timestamp input** containing `T` or timezone offsets (`INVALID_RESOLUTION_DATE`) to avoid client-local clock drift or timezone-dependent route calculation.
   - Evaluates:
     $$\text{Effective\_From} \le T \quad\text{and}\quad (\text{Effective\_To is blank} \;\lor\; T \le \text{Effective\_To})$$
     Both interval bounds are inclusive on calendar date strings (`'YYYY-MM-DD'`).
3. **Bound Snapshot Immutability Guard (`src/services/routing-service.js` lines 180–221):**
   - When an existing record already has any of the 5 D3 provenance fields populated (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`):
     - If `!isStageBoundary`: extracts and reuses existing bound snapshot without re-running version resolution!
     - If `isStageBoundary`: strictly requires `priorStageArchiveVerified === true` before allowing fresh version binding.

---

## 3. Core Questions & Answers

### Question 1: What event requires the routing business date?
- **Classification:** **`REPOSITORY-DEFINED`**
- **Repository Evidence:**
  1. `app.record.create.show` / initial employee lookup: When creating a new MBO record for an employee, `onLookupEmployee` resolves and displays the active route and scorers.
  2. `Stage Transition Boundary` (when moving between stages): If and only if a stage boundary is reached and the prior stage archive is verified (`priorStageArchiveVerified === true`), the system binds the route for the new stage.
- **Rule on In-flight records:**
  - Standard view/edit of an already-bound record (`!isStageBoundary`) **MUST NOT** re-resolve or query the business date. It reuses the validated provenance snapshot.

### Question 2: What is the authoritative date/time source?
- **Classification:** **`OWNER DECISION REQUIRED`** (with concrete technical trade-offs below)
- **Candidate Evaluation:**

| Option | Source Description | Determinism & Security | Implementation Complexity | Drift / Offline Risk |
|---|---|---|---|---|
| **Option 1 (Recommended): Kintone Server/API Time Header Provider** | Obtain Kintone server timestamp via HTTP HEAD/GET request or lightweight ping, converted to Asia/Bangkok calendar date | High; immune to client workstation clock manipulation | Low; standard Kintone fetch in browser | Requires 1 lightweight network call at lookup/bind time |
| **Option 2: Explicit Japanese Fiscal Year / Period Calendar Master** | Dedicated App or configuration mapping dates/periods to official business dates | Highest governance control; explicit corporate calendar | Medium-High; requires schema/master management | Over-engineering if standard calendar day in Bangkok suffices |
| **Option 3: Kintone Record System Field (`$id` / `Created_datetime` / `Updated_datetime`)** | Derive date from Kintone record timestamps | High on edit/transition, but **unavailable on create** before record is submitted | Medium | Cannot determine date prior to initial record submission |
| **Option 4 (Forbidden): Workstation System Clock (`new Date()`)** | Using user's local machine clock | **REJECTED**: Subject to client machine time drift, malicious skew, and local timezone mismatch | Lowest | Violates fail-closed governance |

### Question 3: DATE or DATETIME?
- **Classification:** **`REPOSITORY-DEFINED`**
- **Answer:** **`DATE ONLY (YYYY-MM-DD)`**.
- **Evidence:**
  - `d3-route-version-resolver.js` lines 21–25: `if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new D3RouteVersionResolutionError('INVALID_RESOLUTION_DATE', ...)`
  - App 795 master schema fields `Effective_From` and `Effective_To` are Kintone field type `DATE` (`YYYY-MM-DD`).
  - HR routing master revisions take effect on corporate calendar boundaries (e.g. `2026-04-01`), not arbitrary seconds.

### Question 4: TIMEZONE Contract
- **Classification:** **`DERIVABLE WITHOUT OWNER DECISION`**
- **Answer:** **`Asia/Bangkok (UTC+07:00)`**.
- **Evidence:**
  - MBO2026 runs in Thailand operations under UTC+07:00.
  - When the authoritative source provides a UTC/ISO timestamp (e.g., Kintone server ISO string or HTTP Date header), it must be deterministically transformed to the calendar date in `Asia/Bangkok` before extracting `YYYY-MM-DD`.
  - Machine-local time zone (`toLocaleString` / system local) is strictly prohibited.

### Question 5: Effective Interval Boundary Semantics
- **Classification:** **`REPOSITORY-DEFINED`**
- **Answer:**
  - Formula:
    $$\text{Effective\_From} \le T \quad\text{and}\quad (\text{Effective\_To is blank} \;\lor\; T \le \text{Effective\_To})$$
  - **Inclusive bounds:** Both `Effective_From` and `Effective_To` are inclusive.
  - **Blank `Effective_To`:** Represents an open-ended active version ($\infty$).
  - **Single-day versions:** `Effective_From === Effective_To === T` is valid.
  - **Overlap / Gaps:** Handled fail-closed by `d3-route-version-resolver.js` (`AMBIGUOUS_EFFECTIVE_ROUTE` and `NO_EFFECTIVE_ROUTE`).

### Question 6: In-Flight Route Behavior (Preservation of Locked Rules)
- **Classification:** **`REPOSITORY-DEFINED`**
- **Answer:**
  - An already-bound active stage **MUST NOT** silently re-resolve merely because a new App 795 version becomes effective.
  - Re-evaluation only occurs when an explicit stage boundary transition occurs with verified archive evidence (`isStageBoundary === true` and `priorStageArchiveVerified === true`).

### Question 7: Fail-Closed & Error Taxonomy
- **Classification:** **`DERIVABLE WITHOUT OWNER DECISION`**
- **Answer:** If the live provider fails or yields invalid input:
  - Error codes:
    - `BUSINESS_DATE_PROVIDER_UNAVAILABLE`
    - `BUSINESS_DATE_INVALID_FORMAT`
    - `BUSINESS_DATE_TIMEZONE_UNRESOLVED`
  - **Forbidden fallbacks:** Never fall back to `Date.now()`, local browser clock, legacy `Active` flag, or arbitrary first match.

### Question 8: Testability Contract
- **Classification:** **`REPOSITORY-DEFINED`**
- **Answer:**
  - The provider must accept an injectable strategy/seam (e.g. `BusinessDateProvider.setResolverForTests(fn)` or options parameter).
  - Production runtime uses the live provider.
  - Unit/integration tests inject frozen date strings (`'2026-06-15'`), ensuring 100% deterministic test execution without touching network or wall clock.

---

## 4. Implementation Gap in Repository

To resolve the blocker in the subsequent implementation package, the minimal required code changes are:
1. **`src/services/business-date-provider.js` (NEW):**
   - Implements the selected authoritative source (e.g., Kintone server time converted to `Asia/Bangkok` calendar date `YYYY-MM-DD`).
   - Includes test injection hooks and fail-closed error handling.
2. **`src/main-mbo-app.js`:**
   - In `setupRecordUiWithAuth` (line 1006) and `onLookupEmployee` (line 707): Replace the `testResolutionBusinessDate` mock with `await BusinessDateProvider.getEffectiveBusinessDate()`.
3. **Tests:**
   - Add unit tests for `BusinessDateProvider` verifying timezone conversion, network error fail-closed handling, and format assertion.
   - Retain existing regression tests (`TC44`, `TC45`, `create-handler-form-state.test.js`).

---

## 5. Owner Decisions Required

Before scheduling the implementation package, Owner authorization is required for the following specific decision:

> **Decision Point: Authoritative Source Selection**
> - **Option 1 (Recommended): Kintone Server Time Provider**
>   - *Mechanism:* Client UI queries Kintone server time via lightweight REST/HEAD call, converts to `Asia/Bangkok`, outputs `YYYY-MM-DD`.
>   - *Pros:* Zero manual maintenance; tamper-proof from client PC clock; uses existing authenticated session.
>   - *Cons:* Adds 1 asynchronous call during initial employee lookup.
> - **Option 2: Fixed Fiscal Year Anchor Date Provider**
>   - *Mechanism:* Derives business date as the opening date of the MBO's `Fiscal_Year` (e.g. `2026-04-01` for `FY2026`).
>   - *Pros:* Fully static and synchronous.
>   - *Cons:* Cannot handle mid-year routing policy revisions scheduled for specific calendar dates.

---

## 6. Recommended Next Bounded Package

Upon Owner selection of the authoritative source option:
- **Package Name:** `D3-LIVE-BUSINESS-DATE-IMP1`
- **Scope:**
  - Create `src/services/business-date-provider.js`
  - Wire into `src/main-mbo-app.js`
  - Add comprehensive unit tests in `tests/business-date-provider.test.js`
  - Verify zero regression across the 78 test suites
- **Blocker Transition:**
  - `DECISION REQUIRED / DEPLOYMENT BLOCKER` $\rightarrow$ `IMPLEMENTATION REQUIRED` $\rightarrow$ `CLOSED` (after review).
