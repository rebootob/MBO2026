# AI ACTIVE TASK — ADMIN SUPPORT CENTER BASELINE CORRECTION MICRO-FIX

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `59546edafe40b9aa7cdb9dd1fb2c41899d81f362`
> Mode: **LOCAL MICRO-FIX / ADMIN SUPPORT CENTER ONLY / NO KINTONE / NO DEPLOY**
> Kintone authorization: **NONE**

## REVIEW RESULT

Independent ChatGPT review found Stage 2 direction useful but NOT ready for PASS because diagnostic rules conflict with Confirmed Baseline and could incorrectly report employee Profile/Route/Workflow as valid or invalid.

Read all files under `project-docs/CONFIRMED_BASELINE/` first. Baseline wins over current source/tests/docs.

## MUST FIX 1 — WORKFLOW STATUS NAMES MUST MATCH CANONICAL PROCESS EXACTLY

Use exact canonical App794 status names from `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`.

Canonical current M1_G1 path:

```text
01 Draft Objective
03 Manager Objective Review
04 GM Objective Review
05 Objective Approved
06 Employee Mid-Year
08 Manager Mid-Year Review
09 GM Mid-Year Review
10 Mid-Year Completed
11 Employee Self Evaluation
13 Manager Final Evaluation
14 GM Final Evaluation
15 HR Final Check
16 Completed
```

First-Manager states:

```text
02 First Manager Objective Review
07 First Manager Mid-Year Review
12 First Manager Final Evaluation
```

Current source incorrectly uses names such as `Objective Self Check`, `Approved Objective`, `First Manager Evaluation`, `Second Manager Evaluation`, etc. Remove these from production-intended diagnostic logic/tests.

Unknown/non-canonical status MUST return ERROR / FAIL_CLOSED.

Do not silently normalize invented aliases into canonical statuses unless an explicit compatibility mapping already exists and is independently evidenced.

## MUST FIX 2 — DO NOT FALL BACK TO M1_G1 WHEN TOPOLOGY IS MISSING/UNKNOWN

Current `evaluateWorkflowTrace` falls back to `M1_G1` when topology is missing/unsupported.

This is forbidden.

Required:

```text
missing topology -> NOT_EVIDENCED or ERROR / FAIL_CLOSED
unknown topology -> ERROR / FAIL_CLOSED
```

Only use an expected workflow path when topology evidence is supplied and supported.

Do not invent workflow support for future topology beyond reviewed runtime semantics.

## MUST FIX 3 — EVALUATION PROFILE CODES MUST MATCH CONFIRMED BASELINE EXACTLY

Use exact Profile Codes from `CONFIRMED_BASELINE/EVALUATION_CLASSES.md`:

```text
Staff / Chief        = PROF_STAFF_CHIEF
Japanese Staff       = PROF_JAPANESE_STAFF
Assistant Manager    = PROF_ASST_MGR
Section Manager      = PROF_SECTION_MGR
Senior Manager       = PROF_SENIOR_MGR
DGM                   = PROF_DGM
GM                    = PROF_GM
VP                    = PROF_VP
```

Current diagnostic source incorrectly uses:

```text
PROF_JP_STAFF
PROF_SEC_MGR
PROF_SR_MGR
```

These must be removed from authoritative matching logic/tests unless separately evidenced as compatibility aliases. Do not treat aliases as canonical output.

Also obey the baseline classification evidence rule: do NOT claim an Expected Profile solely from a loose/ambiguous title if authoritative classification evidence is not supplied.

The diagnostic contract should accept an authoritative expected profile/classification result from the existing profile/config resolver where possible. If only an ambiguous title is supplied, return NOT_EVIDENCED rather than guessing.

## MUST FIX 4 — EXECUTIVE ROUTING KEYS MUST MATCH CONFIRMED BASELINE

DGM/GM/VP executive direct routes use dedicated App795 routing keys:

```text
POSITION_DGM
POSITION_GM
POSITION_VP
```

Do NOT output `DIRECT_EXECUTIVE` as authoritative expected Routing_Key.

Executive validation must compare:
- exact dedicated Routing_Key;
- topology `M1_ONLY`;
- Expected_Appraiser_Count = 1;
- authoritative App795 route result / resolved President user when evidence is supplied.

If authoritative App795 route result is not supplied, do NOT declare the appraiser identity assignment PASS merely from topology/count.

## MUST FIX 5 — ROUTING KEY ALONE IS NOT ENOUGH FOR ROUTE PASS

Current logic can return PASS when `actualRoutingKey === expectedKey` even when no authoritative App795 route result exists, and can invent expected topology `M1_G1`.

Change semantics:

```text
Expected Routing_Key can be derived from confirmed Section/Team rule.
BUT
ROUTE_MATCH = PASS requires authoritative route evidence sufficient to compare:
- topology
- expected appraiser count
- 1st..4th appraiser sequence
```

If only routing key matches but App795 route evidence is absent:

```text
ROUTING_KEY_CHECK = PASS
ROUTE_ASSIGNMENT_CHECK = NOT_EVIDENCED
OVERALL ROUTE_MATCH = NOT_EVIDENCED
```

Never fabricate expected topology/appraiser count/user sequence.

TMG rules remain fail-closed:
- TMG1/TMG2 requires Section|Team exact key;
- missing Team, missing exact route, or duplicate route => ERROR / FAIL_CLOSED;
- never Section-only fallback.

## MUST FIX 6 — ACTIVE APPRAISER SLOT MUST FOLLOW CONFIRMED ORDINAL ROUTE SEMANTICS

Do not derive ordinal appraiser slot using invented Manager/GM role assumptions.

Use the reviewed route/topology-to-process contract already present in project source where practical. The same configured 1st..4th appraiser sequence belongs to the whole lifecycle.

Diagnostic must show:

```text
Expected Active Slot
Actual Active Slot
Expected Appraiser User Code
Actual/Current Actor evidence
Result
Reason
```

If mapping from a technical Process status to ordinal slot is not fully evidenced for a topology, return NOT_EVIDENCED instead of guessing.

## MUST FIX 7 — HEALTH SUMMARY MUST NOT REPORT OVERALL PASS WITH NOT_EVIDENCED ITEMS

Review `evaluateSystemHealth` overall logic.

If critical diagnostic items are `NOT_EVIDENCED`, `NOT_AVAILABLE`, `PENDING_DESIGN`, or similar, overall health must not become PASS merely because there is no ERROR/WARNING.

Use an explicit overall state such as:

```text
PASS
WARNING
ERROR
INCOMPLETE_EVIDENCE
```

or compatible existing semantics, but missing critical evidence must remain visible.

Also do not describe fallback phase calendar as production-valid config. Missing App800 evidence must remain NOT_EVIDENCED/NOT_AVAILABLE.

## MUST FIX 8 — FAST REPAIR CLASSIFICATION MUST USE ONLY PROVEN SOURCE-OF-TRUTH COMPARISONS

`FIX_THIS_RECORD` is allowed only when:
- authoritative source inputs are evidenced;
- authoritative App795/App796/config outputs are evidenced;
- App794 actual value is proven stale/mismatched;
- exact before/after is deterministic.

Otherwise return:

```text
BLOCKED_NOT_ENOUGH_EVIDENCE
```

Do not recommend master repair solely because local heuristic mapping disagrees.

Workflow inconsistency remains:

```text
ESCALATE_WORKFLOW_REPAIR
WORKFLOW_REPAIR_REQUIRES_SEPARATE_AUTHORIZED_PACKAGE
```

No direct workflow state repair.

## KEEP PASSED SECURITY HARDENING

Preserve:
- exact `admin-form` Kintone login gate;
- `administrator` denied;
- no Employee_Code/status elevation;
- HTML escaping;
- snapshot allowlist + secret redaction;
- zero business workflow authority;
- Controlled Repair / Confirm Repair disabled;
- no Kintone calls/writes/deploy.

## TESTS REQUIRED

Update/add focused tests using EXACT baseline strings/codes. At minimum prove:

```text
1. canonical M1_G1 statuses are accepted
2. 02/07/12 rejected for M1_G1
3. 04/09/14 rejected for M1_ONLY
4. invented status names fail closed
5. missing topology does not default to M1_G1
6. unknown topology fails closed
7. PROF_JAPANESE_STAFF exact code PASS
8. PROF_SECTION_MGR exact code PASS
9. PROF_SENIOR_MGR exact code PASS
10. old PROF_JP_STAFF / PROF_SEC_MGR / PROF_SR_MGR not emitted as canonical
11. DGM key = POSITION_DGM
12. GM key = POSITION_GM
13. VP key = POSITION_VP
14. routing key match without authoritative App795 evidence does NOT produce overall route PASS
15. wrong ordinal appraiser user => ERROR when authoritative route supplied
16. missing authoritative profile evidence => NOT_EVIDENCED
17. missing critical health evidence => overall not PASS
18. repair classification with incomplete source evidence => BLOCKED_NOT_ENOUGH_EVIDENCE
19. exact admin-form gate still PASS
20. Controlled Repair remains disabled
```

Run targeted tests, full `npm test`, and build.

## HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
EMPLOYEE_APPRAISER_HR_UI_REDESIGN = 0
CONFIRMED_BASELINE_CHANGE = 0
```

Allowed scope:

```text
src/admin/**
minimal admin integration wiring only if necessary
admin-focused tests
built dist bundle
living docs
```

## REQUIRED FINAL REPORT

```text
IMPLEMENTATION_HEAD = <sha>
CANONICAL_WORKFLOW_STATUS_CONTRACT = PASS|FAIL
UNKNOWN_TOPOLOGY_FAIL_CLOSED = PASS|FAIL
CANONICAL_PROFILE_CODES = PASS|FAIL
EXECUTIVE_ROUTING_KEYS = PASS|FAIL
ROUTING_KEY_VS_ROUTE_EVIDENCE_BOUNDARY = PASS|FAIL
ACTIVE_APPRAISER_ORDINAL_VALIDATION = PASS|FAIL
HEALTH_INCOMPLETE_EVIDENCE_STATE = PASS|FAIL
REPAIR_EVIDENCE_BOUNDARY = PASS|FAIL
ADMIN_FORM_EXACT_ID_GATE = PASS|FAIL
SNAPSHOT_ALLOWLIST = PASS|FAIL
HTML_OUTPUT_ESCAPING = PASS|FAIL
CONTROLLED_REPAIR = DISABLED|FAIL
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