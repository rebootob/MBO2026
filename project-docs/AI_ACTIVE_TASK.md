# AI ACTIVE TASK — ADMIN SUPPORT CENTER RESIDUAL CLOSURE / FINAL LOCAL GATE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation HEAD: `5c63d887bad435a9b12628ea35a191146a7e013b`
> Mode: **FINAL LOCAL CLOSURE / ADMIN SUPPORT + REQUIRED SHARED LOGIC ONLY / NO LIVE KINTONE / NO DEPLOY**
> Kintone write/deploy authorization: **NONE**

## 0. MANDATORY ENTRY

Read every file under `project-docs/CONFIRMED_BASELINE/` first. Baseline wins over source, tests, fixtures, living docs and this task if conflict exists.

Do NOT modify Confirmed Baseline in this package.

Confirmed invariants:

```text
ADMIN_FORM_KINTONE_USER = admin-form
ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY
ADMIN_FORM_BUSINESS_AUTHORITY = NONE
APP53 = EMPLOYEE MASTER INPUT
APP795 = ROUTING MASTER
APP796 = PUBLISHED PROFILE/SCORING MASTER
APP794 = MBO RECORD / SNAPSHOT / PROCESS STATE
PROCESS = 16 STATES / 28 ACTIONS
CURRENT_STANDARD_ROUTE = M1_G1
EXECUTIVE_DIRECT = M1_ONLY
PROFILE != ROUTING
CONFIRM_REPAIR = DISABLED
LIVE_KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOY = 0
```

## 1. INDEPENDENT REVIEW RESULT AT HEAD 5c63d887...

Accepted improvements:

```text
ROUTING_SERVICE_ADMIN_BYPASS_REMOVED = YES
ADMIN_UI_EVENT_WIRING = PRESENT
UNCERTAINTY_BADGE_FALSE_GREEN = FIXED
REPAIR_DIFF_INCLUDES_APPRAISER_FIELDS = PARTIALLY IMPLEMENTED
EXECUTIVE_APPRAISER1_CHECK = PRESENT
CONTROLLED_REPAIR = DISABLED
```

However Admin Support Center is **NOT CLOSED**. The following residual defects are proven by source at reviewed HEAD and MUST be fixed.

---

# P0-1 — ADMIN PROFILE DIAGNOSTIC STILL DUPLICATES PRODUCTION POLICY

`src/admin/admin-diagnostic-model.js::evaluateProfileMatch()` still contains its own small hard-coded `positionMap`.

This directly violates the previous closure requirement and can disagree with `src/profiles/profile-scoring-resolver.js`, which already owns the broader normalized title policy.

Examples supported by production resolver but missing from Admin map include titles such as Senior Staff, Assistant Section Manager, Manager, Factory Manager, Advisor, Expatriate, Interpreter, engineering variants, etc.

### REQUIRED FIX

There must be ONE reusable position/classification -> expected profile policy.

Preferred minimal approach:

1. Extract/reuse a pure shared function from `profile-scoring-resolver.js`, e.g. `resolveProfileCodeFromPosition(rawPosition)` or equivalent.
2. Keep `resolveProfileCode(employeeSnapshot)` as the verified-snapshot production wrapper.
3. Admin diagnostic must call the same shared pure policy after its provider has supplied verified App53 employee evidence.
4. Remove the second position map from `src/admin/admin-diagnostic-model.js`.

Do not weaken production verification. Do not invent historical-membership evidence. If historical classification conflict cannot be proven in the local provider, expose:

```text
CLASSIFICATION_HISTORY_EVIDENCE = NOT_AVAILABLE
```

and use current verified App53 position policy only with that limitation clearly labeled.

Required tests:

```text
Admin and production shared policy return same code for every canonical mapped title.
Senior Staff -> PROF_STAFF_CHIEF
Assistant Section Manager -> PROF_ASST_MGR
Manager -> PROF_SECTION_MGR
Factory Manager -> PROF_GM
Advisor/Expatriate -> PROF_JAPANESE_STAFF
blank/unknown -> fail closed
No independent admin position map remains.
```

---

# P0-2 — AUTHORITATIVE ROUTE EVIDENCE IS STILL INCOMPLETE BUT CAN PASS

Current `evaluateRouteMatch()` still uses permissive conditions equivalent to:

```javascript
!authoritativeRoute.appraiserN || actualMatches
```

Therefore a route claiming `appraiserCount = 2` may omit Appraiser 2 and still be treated as evidenced/PASS or safe enough for `FIX_THIS_RECORD`.

The current tests also encode this unsafe assumption; e.g. a route with count 2 but only appraiser1 can qualify in repair scenarios.

### REQUIRED FIX

Create one function, e.g. `normalizeAuthoritativeRouteEvidence()` / `validateAuthoritativeRouteEvidence()`.

For expected count N (1..4), authoritative route MUST contain:

```text
Routing_Key (or the exact derived key supplied separately and proven against App795 result)
Routing_Topology
Expected_Appraiser_Count = N
exact Appraiser1..AppraiserN user codes
```

Required slots must be non-empty and normalize to exactly one Kintone user code each.

Missing required authoritative slot:

```text
ROUTE_MASTER_EVIDENCE = NOT_EVIDENCED
ROUTE_MATCH = NOT_EVIDENCED
ROUTE_RECORD_REPAIR_SAFE = false
```

Actual mismatch in a required slot:

```text
1ST_APPRAISER_MISMATCH
2ND_APPRAISER_MISMATCH
3RD_APPRAISER_MISMATCH
4TH_APPRAISER_MISMATCH
```

Unexpected actual extra appraiser beyond expected count => ERROR.

Executive DGM/GM/VP remains strict count=1 + exact App795 Appraiser1.

Required tests MUST include:

```text
M1_G1 count=2 + authoritative appraiser1 only -> NOT_EVIDENCED
M1_G1 count=2 + both authoritative slots + both actual match -> PASS
M1_G1 wrong 2nd user -> ERROR 2ND_APPRAISER_MISMATCH
M1_ONLY count=1 exact slot -> PASS
extra actual slot beyond count -> ERROR
```

Remove/update any current test that accepts incomplete authoritative route evidence.

---

# P0-3 — ROUTE RESOLUTION AND REQUESTER AUTHORIZATION WERE NOT ACTUALLY SEPARATED

`RoutingService.validateRequesterAccess()` no longer contains the `admin-form` bypass, which is good, but the architecture remains one combined method that performs App795 resolution AND Requester_User authorization.

That means Technical Admin cannot safely reuse the authoritative runtime resolver for diagnostics without pretending to be a business requester.

### REQUIRED FIX

Refactor minimally:

```text
RoutingService.resolveRoutingProfile(...)
  - App795 read-only resolution only
  - Position priority / Section-Team semantics
  - duplicate/missing/approver fail closed
  - NO requester authorization

RoutingService.assertRequesterAuthorized(route, loginUserCode)
  - Requester_User exact membership only
  - admin-form no bypass
  - Administrator no bypass

RoutingService.validateRequesterAccess(...)
  - calls resolveRoutingProfile(...)
  - calls assertRequesterAuthorized(...)
  - returns same public result for existing employee create flow
```

Preserve current business behavior for legitimate Requester_User members.

Admin diagnostic provider may reuse `resolveRoutingProfile()` only, never `validateRequesterAccess()`.

Tests:

```text
admin-form can use resolver in read-only diagnostic test
admin-form fails assertRequesterAuthorized unless baseline Requester_User literally contains it (do not add such fixture as authority)
Administrator fails bypass
normal Requester_User member passes
non-member fails
existing TMG exact-team and executive direct behavior preserved
```

---

# P0-4 — CHECK EMPLOYEE DEFAULT PROVIDER FABRICATES DATA AND IS NOT A PRODUCTION-INTENDED EVIDENCE PROVIDER

`AdminSupportCenterUI.defaultEmployeeProvider()` currently contains a hard-coded mock catalog and, for unknown codes, fabricates values such as employee name, MBO key and current status.

A Preview fixture is acceptable, but it MUST NOT look like production evidence and MUST NOT become the default production-intended provider.

### REQUIRED FIX

Separate providers explicitly:

```text
createAdminPreviewFixtureProvider()       // deterministic local Preview only
createAdminDiagnosticProvider(deps)       // production-intended READ-ONLY provider contract
```

`AdminSupportCenterUI` must require/inject a provider. If no provider exists outside explicit Preview mode:

```text
PROVIDER_NOT_CONFIGURED / NOT_EVIDENCED
```

Never fabricate employee identity for unknown Employee Code.

Preview provider responses MUST carry:

```text
sourceMode = PREVIEW_FIXTURE
isProductionEvidence = false
```

Unknown Preview code => NOT_FOUND fixture result, not fake employee name/status.

Production-intended provider contract must be async and assemble a single evidence bundle from injected read-only dependencies. Do not execute Kintone in this task.

Required bundle contract:

```text
employeeEvidence      // App53 exact/verified
mboEvidence           // App794 Employee_Code + FY exact record
profileEvidence       // shared policy + App796 exactly one published config
routeEvidence         // App795 resolver output
workflowEvidence      // App794 current state
auditEvidenceStatus   // NOT_AVAILABLE/PENDING unless real source injected
phaseEvidence         // only if supplied
sourceMode
sourceIdentifiers
```

Provider fail-closed cases:

```text
blank employee -> VALIDATION_ERROR
invalid FY -> VALIDATION_ERROR
App53 0 -> EMPLOYEE_NOT_FOUND
App53 >1 -> EMPLOYEE_AMBIGUOUS
App794 0 -> MBO_NOT_FOUND
App794 >1 -> MBO_AMBIGUOUS
App796 0 -> SCORING_CONFIG_NOT_FOUND
App796 >1 -> SCORING_CONFIG_AMBIGUOUS
App795 missing/duplicate -> fail closed
provider exception -> ERROR
```

No current form mutation, no `kintone.app.record.set`, no Process action.

---

# P0-5 — ADMIN UI ACCESS GATE MUST BE ENFORCED AT THE COMPONENT ENTRY POINT

`AdminDiagnosticModel.isTechnicalAdmin()` exists, but `AdminSupportCenterUI.renderHtml()` currently renders the full diagnostic panel from any supplied non-admin context unless an outer caller happens to protect it.

Defense in depth is required.

### REQUIRED FIX

At Admin Support Center mount/render entry:

```text
normalize(loginUserCode) === admin-form -> render/mount panel
anything else -> DO NOT render diagnostic data; return blocked/empty safe result
missing -> blocked
```

Do not rely only on caller behavior.

Tests:

```text
admin-form -> full panel
ADMIN-FORM whitespace/case normalization -> allowed if retained
hr -> panel content not rendered
administrator -> panel content not rendered
employee user -> panel content not rendered
missing user -> panel content not rendered
```

This does not grant business workflow authority.

---

# P0-6 — WORKFLOW FUTURE TOPOLOGIES ARE STILL OVER-CERTIFIED

`evaluateWorkflowTrace()` still has expected-path arrays for `M1_M2_G1`, `M1_G1_G2`, `M1_M2_G1_G2` and can return PASS solely from local semantics.

Baseline explicitly says current 17 active routes are M1_G1 and future M2/G2 activation requires separately reviewed App795 data + compatible Process support/UAT. Executive M1_ONLY is separately confirmed sandbox context.

### REQUIRED FIX

Add capability classification:

```text
M1_G1 -> CURRENT_CONFIRMED
M1_ONLY -> EXECUTIVE_DIRECT_CONFIRMED_CONTEXT (retain sandbox/review qualification from baseline)
M1_M2_G1 -> FUTURE_NOT_CERTIFIED
M1_G1_G2 -> FUTURE_NOT_CERTIFIED
M1_M2_G1_G2 -> FUTURE_NOT_CERTIFIED
unknown -> ERROR / FAIL_CLOSED
```

For future-not-certified topology in production-intended diagnostic mode:

```text
status = NOT_EVIDENCED or PENDING_CERTIFICATION
consistency != PASS
```

Preview can show deterministic path capacity only when explicitly labeled PREVIEW/FUTURE, never production-certified PASS.

Also correct any future-path arrays if retained for Preview so First-Manager states 02/07/12 are represented consistently with topology semantics; do not treat those arrays as certification.

---

# P0-7 — WORKFLOW ACTUAL HISTORY MUST REMAIN EXPLICITLY INCOMPLETE

Expected path/current-state checking is useful, but user requires admin-form to track whether workflow actually ran incorrectly.

No confirmed production action-history persistence source currently exists.

Keep:

```text
EXPECTED_WORKFLOW_PATH = AVAILABLE
CURRENT_STATE_VALIDATION = AVAILABLE
ACTUAL_TRANSITION_HISTORY = PENDING_AUDIT_DESIGN / NOT_AVAILABLE
```

Never derive history from Updated_datetime, current status, Date.now(), or Preview fixtures.

Add an explicit `workflowAuditSourceStatus` contract and UI row. If a real audited history array is injected, validate its structure before labeling EVIDENCED; do not assume any arbitrary array is audited truth.

Future audit candidate fields may be documented only, no schema changes:

```text
Phase, Action, Appraiser_Slot, Actor_Code, Action_At,
From_Status, To_Status, Result, Reason/Comment_Ref, Record_Key
```

`WORKFLOW_AUDIT_HISTORY_KINTONE_AUTHORIZATION_REQUIRED` remains an honest residual production blocker after local closure.

---

# P0-8 — PROFILE MASTER EVIDENCE MUST BE COMPLETE, NOT OPTIONAL WEIGHTS

Repair authorization must require exact complete authoritative App796 evidence.

For profile record repair safety require at minimum:

```text
Profile_Code
PartA_Weight
PartB_Weight
```

If provider marks evidence as App796 published config, also require:

```text
Config_Status = PUBLISHED
Fiscal_Year matching requested FY
```

and surface config identifier/version/hash when available.

Missing either weight => NOT_EVIDENCED, never safe.
Wrong code/weight/FY/status => MASTER_CONFLICT / ERROR, never safe.

Do not use `undefined => acceptable` semantics.

---

# P1-1 — ORDINAL APPRAISER NORMALIZATION MUST BE ONE SHARED CONTRACT

Verify `buildRecordDiagnostic()` and all Admin contexts use topology-aware ordinal mapping, not fixed field fallbacks.

Required storage -> ordinal semantics:

```text
M1_G1:
  1st = Manager_User / Manager_Level1
  2nd = GM_User / GM_Level1

M1_M2_G1:
  1st = First_Manager_User / Manager_Level2
  2nd = Manager_User / Manager_Level1
  3rd = GM_User / GM_Level1

M1_ONLY:
  1st = Manager_User / resolved executive single destination
```

G2/future mappings may be modeled but remain future-not-certified.

Prefer one pure normalizer in routing/evaluation shared logic and reuse it in Admin diagnostic, active-slot logic, repair diff and Preview where practical.

Do not label slots Manager/GM in user-facing Admin comparison; use 1st..4th Appraiser with technical source field in details.

---

# P1-2 — REPAIR DIFF MUST LIST ONLY ACTUAL CHANGES AND ALL CHANGED APPRAISERS

For safe route repair, compare before vs after and include only differing values:

```text
Routing_Key (only if actual stored field evidence exists)
Routing_Topology
Expected_Appraiser_Count
1st_Appraiser
2nd_Appraiser
3rd_Appraiser
4th_Appraiser
```

Do not list unchanged appraisers.
Do not claim exact stored Routing_Key repair if App794 physical field is not evidenced.

For BLOCKED / NOT_EVIDENCED / NO_REPAIR_NEEDED => no exact repair diff.

No objectives, ratings, comments, HR decisions or secrets.

---

# P1-3 — ROUTING_KEY STORAGE EVIDENCE

Inspect repository schema/source evidence for App794 physical `Routing_Key`.

At reviewed source, normal lookup resolves `routing.Routing_Key` but the reviewed `fieldsToSync` section does not visibly persist Routing_Key.

Do not invent schema.

Required outcome:

```text
if physical App794 Routing_Key proven:
  wire source consistently locally; no deploy
else:
  EXPECTED_ROUTING_KEY = derived/resolved App795 key
  ACTUAL_STORED_ROUTING_KEY = NOT_AVAILABLE
  ROUTING_KEY_REPAIR_FIELD = NOT_APPLICABLE
  PENDING_SCHEMA_REVIEW documented if needed
```

---

# P1-4 — BUILD VERSION EVIDENCE IS STALE

`BUILD_VERSION_INFO.commitSha` at reviewed HEAD is hard-coded to an older SHA (`9070bd...`) while implementation HEAD is `5c63d887...`.

Do not present stale SHA as the current built bundle identifier.

Use deterministic build metadata generated/injected by build process if existing tooling supports it, or downgrade UI wording to clearly distinguish:

```text
SOURCE_DECLARED_VERSION
BUILD_METADATA_SOURCE
BUILD_COMMIT = NOT_EVIDENCED
```

Do not fabricate current commit SHA inside source before commit exists.

Add test that stale hard-coded parent/control SHA is not represented as independently verified current build SHA.

---

# P1-5 — UI SEMANTIC ROW STATUS

Keep the good uncertainty styling fix, and complete it:

- `INCOMPLETE_EVIDENCE`, `PENDING_*`, `NOT_EVIDENCED`, `NOT_AVAILABLE` never green.
- table row indicator must be derived from row-specific evidence, not global route/profile status plus raw equality.
- Profile weight row must compare BOTH Part A and Part B, not just Part A.
- Route table must visibly include expected/actual 1st..4th Appraisers for required slots.
- Missing required slot must visibly show NOT_EVIDENCED.
- Do not put literal `NOT_EVIDENCED` into editable Employee/FY input values; use blank input + placeholder/status.

---

# P1-6 — TEST QUALITY / FALSE POSITIVE REMOVAL

Current tests prove useful cases but still contain false-safe route fixtures.

Update tests so test data itself follows the authoritative evidence contract.

Must add/retain at minimum:

```text
SECURITY
1 admin-form component entry allowed
2 hr/administrator/employee component entry blocked
3 admin-form has no requester bypass
4 legitimate Requester_User passes business auth

PROFILE
5 every shared title-policy mapping parity test
6 unknown/blank fail closed
7 incomplete authoritative profile missing A/B blocked
8 wrong published status/FY blocked when provider marks App796 evidence

ROUTING
9 M1_G1 complete 2-slot evidence PASS
10 M1_G1 missing authoritative slot2 NOT_EVIDENCED
11 wrong slot1 exact reason
12 wrong slot2 exact reason
13 extra actual slot ERROR
14 M1_ONLY exact President-resolved slot PASS
15 TMG missing Team fail closed
16 duplicate/missing route fail closed through resolver tests
17 route resolver usable without requester auth

ORDINAL
18 M1_G1 maps Manager_User -> 1st, GM_User -> 2nd
19 M1_M2_G1 maps First_Manager -> 1st, Manager -> 2nd, GM -> 3rd
20 M1_ONLY maps single destination -> 1st

WORKFLOW
21 M1_G1 current path validation
22 M1_G1 First-Manager states fail closed
23 M1_ONLY GM states fail closed
24 future M2/G2 never production PASS without certification evidence
25 missing actual audit source stays PENDING/NOT_AVAILABLE

CHECK UI/PROVIDER
26 blank emp/fy validation
27 async provider success re-render
28 provider NOT_FOUND
29 ambiguous record
30 provider error fail closed
31 Preview fixture explicitly labeled non-production
32 unknown fixture does not fabricate employee identity
33 no current-record mutation / no write method invoked

REPAIR
34 profile-only safe diff contains only changed profile fields
35 route-only safe diff contains only changed routing/appraiser fields
36 incomplete route/profile evidence cannot FIX_THIS_RECORD
37 blocked/no-repair has no exact diff
38 CONFIRM REPAIR disabled

UI
39 no false green for uncertainty
40 no equality-based MATCH for NOT_EVIDENCED
41 both A and B weights determine profile weight row result

BUILD/DOC
42 build metadata does not falsely claim stale commit
43 living docs match actual implementation status
```

Run all relevant existing routing/profile/security tests in addition to admin tests.

---

# 2. PROHIBITED ACTIONS

```text
NO live Kintone GET
NO Kintone POST/PUT/DELETE
NO kintone.app.record.set from Admin CHECK
NO Process transition
NO schema/process/ACL/customization deploy
NO business impersonation
NO enabling Confirm Repair
NO modification of confirmed baseline
NO broad Employee/Appraiser/HR UI redesign
```

Existing normal employee business code may be minimally refactored only to extract shared pure/read-only policy and resolver responsibilities. Preserve its accepted behavior with regression tests.

---

# 3. REQUIRED EXECUTION ORDER

1. Read baseline.
2. Inspect changed source and relevant profile/routing/UI integration.
3. Write failing targeted tests for every residual defect above.
4. Implement shared profile policy reuse.
5. Split routing resolution from requester authorization.
6. Implement strict authoritative route evidence + ordinal normalizer.
7. Implement strict authoritative profile evidence.
8. Separate Preview fixture provider from production-intended async read-only diagnostic provider.
9. Enforce Admin component entry gate.
10. Correct workflow capability certification + audit-source status.
11. Correct repair diff and UI semantic evidence display.
12. Resolve Routing_Key storage evidence without schema invention.
13. Correct build metadata semantics.
14. Run targeted admin tests.
15. Run routing/profile/security related tests.
16. Run full `npm test`.
17. Run normal build.
18. Verify source/dist parity.
19. Update only living docs (`AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, `HANDOFF.md`) truthfully.
20. Commit and push ONCE, then STOP for ChatGPT review.

---

# 4. REQUIRED FINAL REPORT

Return exact evidence:

```text
IMPLEMENTATION_HEAD = <sha>
ADMIN_COMPONENT_ID_GATE = PASS|FAIL
ADMIN_FORM_BUSINESS_AUTHORITY = NONE|CONFLICT
ROUTE_RESOLUTION_AUTH_SEPARATION = PASS|FAIL
SHARED_PROFILE_POLICY = PASS|FAIL
PROFILE_MASTER_EVIDENCE_STRICT = PASS|FAIL
ROUTE_MASTER_EVIDENCE_STRICT = PASS|FAIL
ORDINAL_APPRAISER_NORMALIZER = PASS|FAIL
CHECK_EMPLOYEE_CONTROLLER = PASS|FAIL
PREVIEW_FIXTURE_SEPARATION = PASS|FAIL
PRODUCTION_DIAGNOSTIC_PROVIDER_CONTRACT = PASS|FAIL
CURRENT_RECORD_MUTATION_FROM_ADMIN_CHECK = 0|FAIL
M1_G1_WORKFLOW_VALIDATION = PASS|FAIL
M1_ONLY_WORKFLOW_VALIDATION = PASS|FAIL
FUTURE_TOPOLOGY_CERTIFICATION_GUARD = PASS|FAIL
ACTUAL_WORKFLOW_HISTORY = PENDING_AUDIT_DESIGN|EVIDENCED
ROUTING_KEY_STORAGE = STORED_PROVEN|NOT_AVAILABLE|PENDING_SCHEMA_REVIEW
REPAIR_DIFF_EXACT_CHANGES_ONLY = PASS|FAIL
CONFIRM_REPAIR = DISABLED|FAIL
UNCERTAINTY_UI = PASS|FAIL
BUILD_METADATA_TRUTH = PASS|FAIL
TARGETED_TESTS = <exact result>
ROUTING_PROFILE_SECURITY_TESTS = <exact result>
NPM_TEST = <exact result>
BUILD = <exact result>
SOURCE_DIST_PARITY = PASS|FAIL
LIVE_KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
DEFECTS_REMAINING = <exact list; expected production audit/auth blockers may remain>
FINAL_LOCAL_ADMIN_SUPPORT_GATE = PASS|FAIL
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED
```

Do not report `DEFECTS_REMAINING = NONE` because actual production workflow audit persistence, production auth architecture, App800 readiness and go-live authorization remain separate gates unless independently evidenced later.
