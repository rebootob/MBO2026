# AI ACTIVE TASK — M10M POSITION PRIORITY + TEAM-AWARE ROUTING

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target Kintone Apps: **App794 Sandbox + App795 MBO Routing Master Sandbox only**
> Production authorization: **NONE**
> Sandbox authorization: **App794/App795 only, after backup + local validation + explicit safety gates in this task**
> Change strategy: **Surgical change / minimum blast radius / reuse existing resolver**

## 0. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Before changing anything, run and capture:

```text
git status
git branch --show-current
git log -1 --oneline
```

Read completely, in this order:
1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
3. `project-docs/BUSINESS_RULES.md`
4. `project-docs/ARCHITECTURE.md`
5. `project-docs/FIELD_DICTIONARY.md`
6. `project-docs/APP_REGISTRY.md`
7. `project-docs/AI_ACTIVE_TASK.md`
8. `project-docs/CURRENT_STATE.md`
9. `project-docs/HANDOFF.md`
10. `project-docs/AI_REVIEW_PACKAGE.md`

Confirmed Baseline is canonical unless this active task explicitly introduces the new M10M routing rule.

Do not start implementation until current routing behavior, files, field codes, and App795 schema are understood.

---

# 1. USER REQUIREMENT

The user requires App794 routing to continue reading its route from **App795 — MBO Routing Master Sandbox**, but the routing decision must be enhanced to support:

1. **Position Priority / Position Override**
2. **GM must route to President regardless of Section/Team**
3. **Team-aware routing**
4. **TMG2 must be able to split routing by Team even when Section is the same**
5. **Fail Closed** when a required route cannot be uniquely resolved
6. Existing valid routing behavior must remain unchanged unless explicitly affected by the new rules

The key defect/risk is this case:

```text
Position = GM
Section  = TMH3
```

The system must **not** select the normal TMH3 route.

Correct result:

```text
GM
↓
President
```

Likewise, if a GM belongs to TMG2 and has any Team value, the GM Position rule still wins.

---

# 2. HARD SAFETY BOUNDARY

Allowed scope:
- Local repository changes required for App794 routing logic / tests / Preview.
- App795 Sandbox field/schema additions only if confirmed missing and truly required.
- App795 Sandbox routing-rule record changes required by M10M.
- App794 Sandbox customization upload/deploy only after all required local tests pass and backup/read-back gates pass.

Forbidden:
- Production App changes.
- Any Kintone app other than App794/App795.
- App796/App797/App798/App800 writes.
- Rewrite of the entire routing architecture.
- Duplicate routing resolver alongside the existing resolver.
- Hard-coded real approver identity when App795 can represent the business rule.
- Silent fallback to an unrelated route.
- Workflow State Machine redesign.
- Unrelated UI refactor.
- Unrelated schema cleanup.

If implementation would require any forbidden change: **STOP that part and report to ChatGPT.**

---

# 3. DISCOVERY FIRST — DO NOT GUESS

Before modifying code or Kintone, identify the real current implementation.

Required discovery:

## 3.1 App794

Find and report:
- file(s) that load App795 routing records;
- function(s) that resolve route / evaluator / approver;
- function(s) that build `Route Scenario / เส้นทางผู้ประเมิน & อนุมัติ`;
- current matching dimensions: Position / Division / Department / Section / Team / other;
- current fallback logic;
- current ambiguity handling;
- current error handling;
- where employee organization data comes from;
- actual field codes used for Position, Department, Section, Team.

## 3.2 App795

Inspect actual Sandbox schema and active records.

Report:
- current routing field codes;
- whether Priority already exists;
- whether Position criterion already exists;
- whether Team criterion already exists;
- whether wildcard/blank semantics already exist;
- current active TMG2 routing records;
- current GM routing rule, if any;
- how evaluator/approver/route stages are represented.

## 3.3 Employee Source

Determine actual Team values for employees whose Section = `TMG2`.

Do **not** invent Team names.

If multiple Team values exist under TMG2, report the exact distinct values and identify which routing records are needed.

---

# 4. BACKUP / CHECKPOINT — MANDATORY BEFORE WRITE

Before modifying Kintone Sandbox:

1. Create/verify a clean Git checkpoint.
2. Export/read-back App795 schema relevant to routing.
3. Export/read-back App795 current routing records.
4. Record counts before change.
5. Record affected Rule/Record IDs before change.
6. Ensure rollback material exists.

No App795 schema/data write and no App794 deploy before this gate passes.

---

# 5. TARGET ROUTING MODEL

Routing Context should use the actual existing field codes but conceptually include:

```text
Position
Department
Section
Team
```

Do not add duplicate employee fields if the source already contains them.

Target resolution flow:

```text
Employee / MBO Record
↓
Build Routing Context
(Position + Department + Section + Team)
↓
Load active App795 routing rules
↓
Match eligible rules
↓
Apply explicit Priority / specificity rules
↓
Require exactly one winning route
↓
Return Route Scenario / Evaluator / Approver
```

Business routing rules belong in App795 as much as practical. Code should remain a deterministic resolver, not a list of named-person special cases.

---

# 6. ROUTING PRECEDENCE

Required logical precedence:

```text
1. Special Position Rule
2. Position + Department + Section + Team
3. Department + Section + Team
4. Section + Team
5. Existing normal routing rule
6. No valid winner → BLOCK
```

Prefer implementing this through existing rule matching + explicit priority/specificity rather than a long nested `if/else` chain.

If App795 already has a priority convention, reuse it.

If no priority exists and a new field is required, use an explicit deterministic convention and document it. Recommended concept:

```text
smaller number = higher priority
```

but do not create a conflicting convention if the current design already defines one.

---

# 7. GM → PRESIDENT OVERRIDE — MANDATORY

Required business rule:

```text
IF Requester Position = GM
THEN Route = GM_TO_PRESIDENT / equivalent existing scenario
AND next valid approval target = President
AND ignore normal Section/Team routing for route selection
```

Examples that must PASS:

```text
GM + TMH3                  → President
GM + TMG2 + <any Team>     → President
GM + any other Section     → President
```

Once the GM Position rule wins, normal Section/Team routing must not override it.

Do not hard-code a President email/name if App795 already supports selecting the destination by routing master data.

If no valid President target can be resolved:

```text
APPROVER_NOT_FOUND
```

and BLOCK.

---

# 8. TEAM-AWARE ROUTING — MANDATORY

Add/reuse Team as a routing criterion in App795 and in App794's routing context/resolver.

The goal is to allow two employees with the same Section to take different routes based on Team.

Concept:

```text
Section = TMG2
Team    = <Team A>
→ Route A
```

```text
Section = TMG2
Team    = <Team B>
→ Route B
```

Use actual Team values discovered from the real Sandbox/employee source.

Do not create fake Team values.

---

# 9. TMG2 STRICT TEAM RULE

For `TMG2`, if Team is required to distinguish routes, Team must be treated as a strict criterion.

Unsafe behavior that is forbidden:

```text
TMG2 + unknown/blank Team
↓
fallback to generic TMG2 route
↓
possibly wrong evaluator/approver
```

Required behavior:

### Missing Team where TMG2 requires Team

```text
TEAM_REQUIRED
BLOCK
```

### Unknown Team / no matching TMG2 Team rule

```text
ROUTE_NOT_FOUND
BLOCK
```

### Multiple equally valid TMG2 rules

```text
AMBIGUOUS_ROUTE
BLOCK
```

Principle:

> Wrong routing is worse than blocked routing.

Do not preserve a generic TMG2 fallback if it can bypass required Team separation.

---

# 10. APP795 SCHEMA / MASTER DATA

Reuse existing fields first.

Only if missing, consider the minimum required fields such as:

```text
Route_Priority
Requester_Position
Requester_Department
Requester_Section
Requester_Team
Route_Scenario
Evaluator
Approver
Active
```

These are conceptual/suggested field codes only.

**Do not assume these exact codes.**

If equivalent fields already exist, reuse them.

Do not create duplicate fields with overlapping purpose.

Required App795 master-data outcome:
- a high-priority GM → President rule;
- TMG2 Team-specific rules for the actual Teams that require separate routing;
- existing valid rules preserved;
- no unsafe duplicate rule at the same effective priority/specificity.

Before each record/schema write, show/record intended Before → After values in the execution evidence.

After each write, read back and verify.

---

# 11. APP794 ROUTING RESOLVER

Modify the **existing** routing resolver.

Do not create a second resolver unless architecture proves there is no reusable resolver.

The existing resolver should receive/derive a context conceptually like:

```javascript
{
  position,
  department,
  section,
  team
}
```

Use actual field names/codes discovered in Section 3.

Required properties:
- deterministic;
- explicit candidate-rule matching;
- explicit winner selection;
- explicit error for no winner;
- explicit error for ambiguity;
- no silent route guessing;
- preserve existing route output contract where possible.

---

# 12. ROUTE SCENARIO / เส้นทางผู้ประเมิน & อนุมัติ

Update the existing App794 route preview/debug presentation with minimal UI change so HR/Admin/testers can understand why the route was selected.

At minimum expose when technically safe/available:

```text
Position
Department
Section
Team
Matched Route Scenario
Matched Rule / Rule ID
Priority / specificity
Source = App795
Resolved Evaluator(s)
Resolved Approver(s)
```

Example concept:

```text
Position: Staff
Department: ...
Section: TMG2
Team: <actual team>

Matched Rule: <rule id>
Scenario: <scenario>
Priority: <priority>
Source: App795
```

Do not expose secrets or hidden credentials.

This is for explainability/debugging, not a replacement security boundary.

---

# 13. WORKFLOW STATE MACHINE — DO NOT REDESIGN

M10M changes **who the route resolves to**, not the overall MBO workflow lifecycle.

Do not redesign workflow states such as Submit / Review / Approval / Approved / Reject unless a tiny integration adjustment is proven necessary.

If a genuine Workflow State Machine change becomes necessary:

**STOP and report before implementing it.**

---

# 14. FAIL-CLOSED VALIDATION

Before returning/using a route, validate at minimum:

```text
Requester/employee context exists
Position is available when required
Section is available when required
Team is available when the matched route class requires Team
Matched rule is Active
Exactly one winner exists
Required evaluator exists
Required approver exists
No ambiguous equal-priority/specificity match exists
```

Error classes/messages must make the failure diagnosable.

Required errors/equivalents:

```text
ROUTE_NOT_FOUND
AMBIGUOUS_ROUTE
TEAM_REQUIRED
APPROVER_NOT_FOUND
```

Do not silently downgrade these to another unrelated route.

---

# 15. LOGGING / DIAGNOSTICS

Add/reuse structured diagnostic logging sufficient to inspect:

```text
Employee / record identifier (minimum necessary)
Position
Department
Section
Team
Candidate Rule IDs
Matched Rule ID
Priority / specificity
Route Scenario
Evaluator(s)
Approver(s)
Result / Error
```

Do not log:
- API tokens;
- auth headers;
- passwords;
- unnecessary sensitive personal data.

---

# 16. REQUIRED TEST MATRIX

Use actual discovered Team values for TMG2 tests.

## TC01 — GM in TMH3

```text
Position = GM
Section  = TMH3
```

Expected:

```text
President
PASS
```

## TC02 — GM in TMG2 with real Team

```text
Position = GM
Section  = TMG2
Team     = <actual valid TMG2 Team>
```

Expected:

```text
President
```

Must **not** enter the normal TMG2 Team route.

## TC03 — Normal employee TMG2 Team A

Use actual first distinct TMG2 Team.

Expected: its configured Team-specific route.

## TC04 — Normal employee TMG2 Team B

Use actual second distinct TMG2 Team if present.

Expected: its configured Team-specific route.

If only one actual TMG2 Team exists, document that and create the appropriate deterministic test using the real data rather than inventing a second Team.

## TC05 — Unknown TMG2 Team

Expected:

```text
ROUTE_NOT_FOUND
BLOCK
```

## TC06 — Missing TMG2 Team when Team required

Expected:

```text
TEAM_REQUIRED
BLOCK
```

## TC07 — Existing normal Section route

Select a real non-TMG2 existing route that currently works.

Expected:

```text
Before M10M route == After M10M route
```

## TC08 — Existing Manager/Appraiser route

Select a real existing manager/appraiser scenario.

Expected: no unintended routing change.

## TC09 — Ambiguous rule

Unit/fixture test with two equally valid winning rules at same effective priority/specificity.

Expected:

```text
AMBIGUOUS_ROUTE
BLOCK
```

## TC10 — Missing President destination for GM

Unit/fixture test.

Expected:

```text
APPROVER_NOT_FOUND
BLOCK
```

---

# 17. REGRESSION TEST — MANDATORY

Build a Before/After matrix for every active routing scenario materially affected by the resolver change.

Minimum evidence format:

| Scenario | Before | After | Expected | Result |
|---|---|---|---|---|
| Existing normal route A | X | X | unchanged | PASS |
| Existing normal route B | Y | Y | unchanged | PASS |
| GM special route | old/wrong or absent | President | President | PASS |
| TMG2 Team A | old | Team-specific | Team-specific | PASS |
| TMG2 Team B | old | Team-specific | Team-specific | PASS |

If an existing unrelated active route changes unexpectedly:

**STOP DEPLOYMENT.**

---

# 18. LOCAL QUALITY GATES

Run the repository's existing relevant tests plus focused M10M tests.

At minimum:

```text
npm test
```

Run the appropriate build command defined by the repository/package scripts.

If App794 has a Preview/local UI, perform a local browser smoke test for Route Scenario display.

No Sandbox deploy until local test/build gates PASS.

---

# 19. SANDBOX DEPLOYMENT GATE

Only after Sections 3–18 PASS:

1. Verify backup/checkpoint again.
2. Apply only required App795 Sandbox schema/data changes.
3. Read back App795 and verify exact values/counts.
4. Upload/deploy only required App794 Sandbox customization.
5. Reload App794 Sandbox.
6. Test required M10M routes in Sandbox without affecting Production.
7. Re-run regression checks.
8. Verify no other apps changed.

If any read-back differs from intended state:

**STOP and rollback.**

---

# 20. GIT GOVERNANCE

Before implementation:

```text
git status
git branch --show-current
git log -1 --oneline
```

During implementation:
- keep changes scoped;
- reuse existing files/functions;
- avoid new files unless separation of concerns clearly requires one;
- do not commit credentials/secrets;
- inspect `git diff` before commit.

After implementation/tests:

```text
git diff
git status
```

Commit and push the same branch only when required tests/evidence pass.

Final implementation status remains:

```text
READY FOR CHATGPT REVIEW
```

Antigravity must not self-approve the Work Package.

---

# 21. ROLLBACK — MANDATORY

Rollback must restore both code and Sandbox routing data/schema as applicable.

Record:
- base Git commit;
- changed files;
- App795 fields added/reused;
- App795 record IDs changed/created;
- App794 customization version/artifacts changed;
- exact restore steps;
- post-rollback verification.

Rollback target:

```text
Pre-M10M App794 routing implementation
+
Pre-M10M App795 routing master state
```

---

# 22. FINAL REPORT REQUIRED

Do not report only `Done`.

Return the following evidence:

## A. DISCOVERY

```text
App794 routing file(s):
Resolver function(s):
Route Scenario UI function(s):
Employee source:
Position field/code:
Department field/code:
Section field/code:
Team field/code:
App795 current matching method:
App795 priority field/code:
App795 position criterion field/code:
App795 team criterion field/code:
Actual TMG2 Team values found:
```

## B. BACKUP

```text
Git base commit:
App795 pre-change record count:
Affected rule IDs:
Schema backup/read-back:
Routing-data backup/read-back:
Rollback artifact/location:
```

## C. CHANGES — APP794

```text
Files changed:
Functions changed:
Resolver behavior changed:
Route Scenario display changed:
```

## D. CHANGES — APP795

```text
Fields added:
Fields reused:
Rules created:
Rules updated:
Rules disabled/removed if required:
Post-change record count:
```

## E. GM RULE EVIDENCE

```text
GM + TMH3 → President = PASS/FAIL
GM + TMG2 + <actual team> → President = PASS/FAIL
```

## F. TEAM ROUTING EVIDENCE

List the actual TMG2 Team values and exact matched routes.

```text
TMG2 + <Team 1> → <Route> = PASS/FAIL
TMG2 + <Team 2> → <Route> = PASS/FAIL
Unknown Team → ROUTE_NOT_FOUND = PASS/FAIL
Missing required Team → TEAM_REQUIRED = PASS/FAIL
```

## G. REGRESSION

Report TC01–TC10 and relevant existing active routing scenarios as PASS/FAIL.

## H. KINTONE CHANGE EVIDENCE

```text
Apps written: 794/795 only = PASS/FAIL
Production write count = 0
Other app write count = 0
App795 read-back = PASS/FAIL
App794 Sandbox smoke = PASS/FAIL
```

## I. GIT

```text
Branch:
Commit before:
Commit after:
Files changed:
git status:
push sync:
```

## J. RISKS / OPEN ISSUES

List all remaining risks or unresolved data questions.

## K. ROLLBACK

Provide exact rollback steps.

---

# 23. DEFINITION OF DONE

M10M is complete only when all applicable items are proven:

- [ ] Correct repo/branch verified
- [ ] Existing routing implementation inspected before change
- [ ] Actual App795 schema inspected
- [ ] Actual TMG2 Team values inspected; no Team names invented
- [ ] Backup/Git checkpoint created before Kintone write
- [ ] App795 supports/reuses Position criterion
- [ ] App795 supports/reuses Team criterion
- [ ] App795 supports deterministic Priority/specificity
- [ ] GM → President rule implemented in App795/equivalent master-driven design
- [ ] GM override wins over Section and Team
- [ ] TMG2 supports required Team-specific routing
- [ ] Unknown TMG2 Team blocks
- [ ] Missing required TMG2 Team blocks
- [ ] Ambiguous route blocks
- [ ] Missing President target blocks
- [ ] Existing App794 resolver reused rather than duplicated
- [ ] Route Scenario displays Team and matched-rule diagnostics where safe
- [ ] Workflow State Machine not redesigned
- [ ] Existing unrelated routes regression PASS
- [ ] `npm test` PASS
- [ ] relevant build PASS
- [ ] Sandbox App795 read-back PASS
- [ ] Sandbox App794 smoke PASS
- [ ] Production write count = 0
- [ ] Other-app write count = 0
- [ ] Git diff reviewed
- [ ] No secrets committed
- [ ] Rollback verified/documented
- [ ] Final report complete

Do not mark COMPLETE if any mandatory item is missing.

---

# 24. REQUIRED EVIDENCE BLOCK

Return an exact evidence block with real values filled in:

```text
M10M_POSITION_PRIORITY_TEAM_ROUTING = COMPLETE | BLOCKED
APP794_EXISTING_RESOLVER_REUSED = PASS | FAIL
APP795_SCHEMA_DISCOVERY = PASS | FAIL
APP795_BACKUP = PASS | FAIL
POSITION_PRIORITY = PASS | FAIL
GM_TO_PRESIDENT = PASS | FAIL
GM_SECTION_OVERRIDE = PASS | FAIL
GM_TEAM_OVERRIDE = PASS | FAIL
TEAM_AWARE_ROUTING = PASS | FAIL
TMG2_TEAM_VALUES_DISCOVERED = <actual values>
TMG2_TEAM_RULES = PASS | FAIL
UNKNOWN_TMG2_TEAM_BLOCKED = PASS | FAIL
MISSING_REQUIRED_TEAM_BLOCKED = PASS | FAIL
AMBIGUOUS_ROUTE_BLOCKED = PASS | FAIL
MISSING_PRESIDENT_BLOCKED = PASS | FAIL
EXISTING_ROUTE_REGRESSION = PASS | FAIL
ROUTE_SCENARIO_DIAGNOSTICS = PASS | FAIL
WORKFLOW_STATE_MACHINE_CHANGE_COUNT = 0
PRODUCTION_WRITE_COUNT = 0
OTHER_APP_WRITE_COUNT = 0
APP795_READBACK = PASS | FAIL
APP794_SANDBOX_SMOKE = PASS | FAIL
NPM_TEST = PASS | FAIL
BUILD = PASS | FAIL
SECRET_EXPOSURE_COUNT = 0
ROLLBACK_READY = PASS | FAIL
GIT_PUSH_SYNC = PASS | FAIL
FINAL_STATUS = READY FOR CHATGPT REVIEW | BLOCKED
```

---

# 25. STOP CONDITION

After implementation, tests, Sandbox read-back/smoke, evidence, commit and push:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```

STOP.

Do not self-approve.
Do not deploy Production.
Do not continue to another Work Package.
