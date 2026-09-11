# D3 Live Business Date Owner Decision (D3-LIVE-BUSINESS-DATE-DEC1)

## 1. Executive Summary & Control Identification
- **Package:** `D3-LIVE-BUSINESS-DATE-DEC1`
- **Canonical Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Preflight Base SHA:** `e52070a677f37c0bcabe1086cd582912768e68eb`
- **Mode:** `OWNER DECISION / DOCS-ONLY / ZERO KINTONE I/O`
- **Package Purpose:** Record explicit Owner decision resolving the policy gap identified in `D3-LIVE-BUSINESS-DATE-PRE1`.

---

## 2. Locked Owner Decision

The Owner has explicitly authorized and locked the following governance decision:

```text
AUTHORITATIVE_BUSINESS_DATE_SOURCE = KINTONE SERVER TIME PROVIDER
BUSINESS_DATE_TIMEZONE = Asia/Bangkok
BUSINESS_DATE_OUTPUT = DATE ONLY / YYYY-MM-DD
LOCAL_BROWSER_CLOCK_FALLBACK = FORBIDDEN
WORKSTATION_SYSTEM_CLOCK_FALLBACK = FORBIDDEN
PROVIDER_FAILURE_BEHAVIOR = FAIL CLOSED
```

---

## 3. Authoritative Contract Specifications

### 3.1 Authoritative Source Policy
- **Primary Source Authority:** Kintone server-authoritative time.
- **Conversion Contract:** If the authoritative source returns a UTC / ISO-8601 timestamp (e.g. from server HTTP header or API timestamp), it must be deterministically converted to the `Asia/Bangkok` (UTC+07:00) timezone, and the calendar date `YYYY-MM-DD` extracted.
- **Output Representation:** `DATE ONLY` matching strict regex `/^\d{4}-\d{2}-\d{2}$/`. Full timestamps containing `T` or arbitrary hours/minutes/seconds are strictly rejected by the Model A resolver (`d3-route-version-resolver.js`).

### 3.2 Interval Boundary Semantics
- Effective route selection continues to evaluate against the invariant:
  $$\text{Effective\_From} \le T \quad\text{and}\quad (\text{Effective\_To is blank} \;\lor\; T \le \text{Effective\_To})$$
- Both bounds are **inclusive** on calendar date comparison strings (`YYYY-MM-DD`).
- Same-day active versions (`Effective_From === Effective_To === T`) are fully valid.
- Blank `Effective_To` represents an open-ended active route version ($\infty$).

### 3.3 In-Flight Route Immutability
- Preserves the locked non-reresolution rule: An already-bound active stage record with validated D3 provenance snapshots (`Frozen_Profile_Code`, `K_expected_Snapshot`, `Effective_Routing_Key`, `Effective_Route_Version_Key`, `Effective_Scorer_Slots_Snapshot`) **MUST NOT** silently re-resolve or query the business date merely because a new App 795 route version becomes effective.
- Fresh business date resolution occurs **only** at authorized initial creation binding or explicit stage transition boundaries where prior stage archive evidence is verified (`isStageBoundary === true && priorStageArchiveVerified === true`).

### 3.4 Fail-Closed & Fallback Prohibitions
- If the authoritative provider is unreachable, times out, or produces malformed output, the runtime must fail closed immediately:
  - Required error types: `BUSINESS_DATE_PROVIDER_UNAVAILABLE`, `BUSINESS_DATE_INVALID_FORMAT`, `BUSINESS_DATE_TIMEZONE_UNRESOLVED`.
- Under no circumstances may the system fall back to:
  - `Date.now()`
  - `new Date()` referencing local workstation or browser current time
  - Browser system locale or workstation time zone
  - Legacy `Active` master flag
  - Expired route version
  - Arbitrary first matching route

---

## 4. Important Implementation & Feasibility Caveat

This `DEC1` package establishes the **governance and authority policy**, not an empirical runtime API proof:
1. `DEC1` does **NOT** assert that any specific HTTP HEAD/GET request or REST endpoint for reading Kintone server time is already proven feasible across all Kintone deployment contexts.
2. The subsequent implementation/pre-implementation package must validate the exact supported runtime mechanism for obtaining authoritative Kintone/server time (e.g. evaluating lightweight Kintone API calls, response headers, or server ping capabilities).
3. Runtime code must **NOT** invent an unsupported or unverified API contract. The Owner decision defines the policy target:
   > *"Kintone/server-authoritative time, converted deterministically to Asia/Bangkok calendar date."*
4. The exact technical acquisition mechanism remains subject to implementation feasibility evidence.

---

## 5. Control & Deployment Status

- **D3-LIVE-BUSINESS-DATE-PRE1:** `PASS / REVIEWED / DECISION GAP IDENTIFIED`
- **D3-LIVE-BUSINESS-DATE-DEC1:** `OWNER DECISION LOCKED / REVIEW REQUIRED`
- **LIVE_BUSINESS_DATE_PROVIDER:**
  ```text
  LIVE_BUSINESS_DATE_PROVIDER = OWNER DECISION LOCKED / IMPLEMENTATION REQUIRED / DEPLOYMENT BLOCKER
  ```
- **Deployment Blocker Meaning:** Locking this Owner decision does **NOT** clear the deployment blocker. Production code still retains `testResolutionBusinessDate = null` and runtime deployment remains completely blocked until implementation, unit tests, runtime feasibility verification, and independent Control Plane review are complete.

```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
