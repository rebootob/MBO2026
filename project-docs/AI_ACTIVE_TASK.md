# AI ACTIVE TASK — ADMIN SUPPORT CENTER FINAL EVIDENCE-BOUNDARY MICRO-FIX

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `34e6f4d1bdb0b5f278b8d098932a5e5205bd9765`
> Mode: **LOCAL MICRO-FIX / ADMIN SUPPORT CENTER ONLY / NO KINTONE / NO DEPLOY**
> Kintone authorization: **NONE**

## ENTRY REVIEW RESULT

Read `project-docs/CONFIRMED_BASELINE/` first.

The previous baseline-correction pass successfully fixed:

```text
CANONICAL_WORKFLOW_STATUS_NAMES = PASS
CANONICAL_PROFILE_CODES = PASS
EXECUTIVE_ROUTING_KEYS = PASS
UNKNOWN_TOPOLOGY_FAIL_CLOSED = PASS
ADMIN_FORM_EXACT_ID_GATE = PASS
```

However independent review still found three evidence-boundary defects that can make Admin Support Center report a false PASS or prepare the wrong repair source.

Do not change Employee/Appraiser/HR UI.
Do not contact Kintone.
Do not deploy.

## MUST FIX 1 — ROUTING HEALTH MUST NOT PASS FROM ROUTING KEY ALONE

Current `evaluateSystemHealth()` can mark `routing_resolution = PASS` when only `routingKey` exists.

This is not enough.

Required semantics:

```text
routingKey only
→ NOT_EVIDENCED / INCOMPLETE_EVIDENCE

routingResult.status = PASS from authoritative resolver/App795 evidence
→ PASS

routingResult FAIL_CLOSED / duplicate / missing exact route
→ ERROR
```

A Routing Key proves lookup input only. It does NOT prove topology, expected appraiser count, or 1st..4th assignments.

Add tests proving Routing Key alone cannot produce Routing PASS or overall PASS.

## MUST FIX 2 — REPAIR CLASSIFICATION MUST REQUIRE DOMAIN-SPECIFIC MASTER EVIDENCE

Current repair logic effectively treats:

```javascript
authoritativeProfile || authoritativeRoute
```

as enough master evidence for `FIX_THIS_RECORD`.

This is unsafe because Profile and Routing are separate concerns.

Required rules:

```text
Profile mismatch
+ authoritativeProfile proven correct
→ profile portion may qualify for FIX_THIS_RECORD

Profile mismatch
+ only authoritativeRoute exists
→ BLOCKED_NOT_ENOUGH_EVIDENCE

Route mismatch
+ authoritativeRoute proven correct
→ route portion may qualify for FIX_THIS_RECORD

Route mismatch
+ only authoritativeProfile exists
→ BLOCKED_NOT_ENOUGH_EVIDENCE

Profile mismatch + Route mismatch
→ FIX_THIS_RECORD only if BOTH authoritativeProfile AND authoritativeRoute are proven correct

Workflow error
→ ESCALATE_WORKFLOW_REPAIR regardless of profile/route evidence
```

Do not let evidence from one domain authorize repair of another domain.

If practical, expose separate booleans/reasons such as:

```text
PROFILE_MASTER_EVIDENCED
ROUTE_MASTER_EVIDENCED
PROFILE_RECORD_REPAIR_SAFE
ROUTE_RECORD_REPAIR_SAFE
```

Repair preview must include only fields for domains proven safe to repair. Do not include Profile fields in a route-only candidate, and do not include Route fields in a profile-only candidate.

Add focused tests for cross-domain false-authority prevention.

## MUST FIX 3 — REMOVE REMAINING FABRICATED RECORD-DIAGNOSTIC DEFAULTS

Current `buildRecordDiagnostic()` / snapshot logic still contains values that can appear as real evidence when missing, including examples such as:

```text
Fiscal Year -> 2026
loggedInUserCode -> admin-form
phaseCalendarStatus -> PASS
```

Missing production evidence must not silently become a real-looking value.

Required:

```text
missing Fiscal Year -> NOT_EVIDENCED / N/A
missing logged-in user -> NOT_EVIDENCED / N/A
missing phase calendar evidence -> NOT_EVIDENCED
missing profile/routing/appraiser evidence -> NOT_EVIDENCED / N/A
```

Do not default identity to `admin-form` merely because the screen is an admin screen.
Do not default App800/phase state to PASS.
Do not default current fiscal year to 2026.

Snapshot must preserve these uncertainty states.

## KEEP VERIFIED FIXES

Do not regress:

```text
Exact admin-form identity gate
Canonical 16 App794 status names
M1_G1 / M1_ONLY workflow validation
Canonical Profile Codes:
  PROF_STAFF_CHIEF
  PROF_JAPANESE_STAFF
  PROF_ASST_MGR
  PROF_SECTION_MGR
  PROF_SENIOR_MGR
  PROF_DGM
  PROF_GM
  PROF_VP
Executive keys:
  POSITION_DGM
  POSITION_GM
  POSITION_VP
TMG exact Section|Team fail-closed
Authoritative App795 required for full Route PASS
Actual workflow history remains PENDING_AUDIT_DESIGN when no real audit source
Snapshot allowlist + secret redaction
HTML escaping
CONFIRM REPAIR disabled
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
```

## TEST REQUIREMENTS

Add/update targeted tests proving at minimum:

```text
1. Routing Key alone != Routing PASS
2. Routing Key alone prevents overall health PASS
3. Authoritative App795 PASS can produce Routing PASS
4. Profile mismatch + route evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE
5. Route mismatch + profile evidence only -> BLOCKED_NOT_ENOUGH_EVIDENCE
6. Profile-only mismatch + authoritativeProfile -> safe record candidate only for profile fields
7. Route-only mismatch + authoritativeRoute -> safe record candidate only for routing fields
8. Profile+Route mismatch requires both master evidences for FIX_THIS_RECORD
9. Missing Fiscal Year not defaulted to 2026
10. Missing login user not defaulted to admin-form
11. Missing phase calendar not defaulted to PASS
12. Existing canonical workflow/profile/routing tests remain PASS
13. CONFIRM_REPAIR remains disabled
14. Kintone calls/writes/deploys = 0
```

Run targeted admin tests, full `npm test`, and normal build.

## HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
EMPLOYEE_APPRAISER_HR_UI_CHANGE = 0
CONFIRM_REPAIR_ENABLED = NO
```

Allowed files:

```text
src/admin/**
minimal admin integration wiring only if required
admin-focused tests
dist bundle via normal build
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do not modify Confirmed Baseline.

## REQUIRED FINAL REPORT

```text
IMPLEMENTATION_HEAD = <sha>
ROUTING_KEY_ONLY_PASS_BUG = FIXED|FAIL
DOMAIN_SPECIFIC_REPAIR_EVIDENCE = PASS|FAIL
CROSS_DOMAIN_FALSE_REPAIR_GUARD = PASS|FAIL
RECORD_DIAGNOSTIC_DEFAULTS_REMOVED = PASS|FAIL
CANONICAL_WORKFLOW_STATUS_NAMES = PASS|FAIL
CANONICAL_PROFILE_CODES = PASS|FAIL
EXECUTIVE_ROUTING_KEYS = PASS|FAIL
ROUTE_ASSIGNMENT_EVIDENCE_BOUNDARY = PASS|FAIL
CONFIRM_REPAIR = DISABLED|FAIL
ADMIN_FORM_BUSINESS_AUTHORITY = NONE|CONFLICT
TARGETED_TESTS = <result>
NPM_TEST = <result>
BUILD = <result>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
DEFECTS_REMAINING = <exact list or NONE>
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

Commit and push once, then STOP for ChatGPT review.
