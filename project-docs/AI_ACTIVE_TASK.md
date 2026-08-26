# AI ACTIVE TASK — M10M-R1 ROUTING CORRECTION AFTER CHATGPT REVIEW

> Control Plane: ChatGPT / Project Lead / Architect / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Parent implementation under correction: `b3cb13e5ba615ad4cc0c4a8698448282d66aa4fe`
> Target Kintone Apps: App794 Sandbox + App795 MBO Routing Master Sandbox only
> App53: READ-ONLY employee-source discovery only
> Production authorization: NONE
> Final status required: `READY FOR CHATGPT REVIEW`

## 0. REVIEW RESULT

The first M10M implementation is **BLOCKED / NOT APPROVED**.

Do not deploy or self-approve commit `b3cb13e5` as complete.

This R1 task corrects the implementation using confirmed Employee Master facts and the canonical baseline.

## 1. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Run and capture:

```text
git status
git branch --show-current
git log -3 --oneline
```

Read completely before changing code:

1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
3. `project-docs/CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`
4. `project-docs/BUSINESS_RULES.md`
5. `project-docs/ARCHITECTURE.md`
6. `project-docs/AI_ACTIVE_TASK.md`
7. `project-docs/CURRENT_STATE.md`
8. `project-docs/HANDOFF.md`
9. `project-docs/AI_REVIEW_PACKAGE.md`

Confirmed Baseline is authoritative.

If code/data conflicts with Confirmed Baseline, fail closed and report.

---

## 2. CONFIRMED BUSINESS FACTS — DO NOT REDISCOVER BY GUESSING

### 2.1 Employee Master

- App53 Employee Namelist is the employee routing-input source.
- App53 access for this task is READ-ONLY.
- Use real App53 Position / Section / Team values.

### 2.2 General Manager

Confirmed raw Position variants include:

```text
General Manager
General manager
```

Normalize these to one canonical routing class conceptually:

```text
GENERAL_MANAGER
```

Confirmed real risk case exists:

```text
Position = General Manager
Section  = TMH3
```

Required route:

```text
GENERAL_MANAGER
→ dedicated GM route in App795
→ configured President destination
```

Section/Team must not override a winning GM Position rule.

### 2.3 TMG2 Teams

Confirmed active TMG2 Team values:

```text
Production
CAD
Marketing
```

Required exact routing keys:

```text
TMG2|Production
TMG2|CAD
TMG2|Marketing
```

TMG2 has no Admin route.

### 2.4 TMG2 CAD

User-confirmed:

```text
TMG2 + CAD
```

uses the **same evaluator/approver route** for CAD employees associated with both Die Casting and Injection context.

Therefore:
- keep one authoritative `TMG2|CAD` route;
- do not add Section Name as a routing dimension for CAD;
- do not create separate Die Casting CAD / Injection CAD routes.

---

## 3. MUST FIX — BLOCKER A: REMOVE HARD-CODED PRESIDENT

Current blocked implementation contains fallback behavior equivalent to:

```javascript
presidentApprover = [{ code: 'president' }];
```

This is forbidden.

Also forbidden:

```text
App795 query error
→ swallow exception
→ invent/default President target
```

Required behavior:

```text
GM Position detected
↓
resolve dedicated GM route from App795
↓
exactly one valid active route found?
    YES → use destination configured in App795
    NO  → BLOCK
```

If no valid destination exists:

```text
APPROVER_NOT_FOUND
```

If App795 query/configuration itself is invalid or unavailable, fail closed with a diagnostic error.

Do not invent a Kintone user code, email, name, or approver identity in JavaScript.

---

## 4. MUST FIX — BLOCKER B: RESTORE REQUESTER AUTHORIZATION

The blocked implementation changed authorization to allow:

```javascript
requesters.length === 0
```

as an automatic authorization condition.

This is NOT approved and must be removed.

Restore the previously reviewed behavior unless the canonical baseline explicitly says otherwise:

```text
authorized when:
- current Kintone user is in Requester_User; OR
- existing approved technical handling already present in the reviewed baseline applies.
```

Do not turn blank `Requester_User` into allow-all.

Add a regression test proving an ordinary non-admin user is NOT authorized merely because `Requester_User` is blank.

M10M is a routing change, not a requester-permission expansion.

---

## 5. APP795 — INSPECT REAL SCHEMA BEFORE QUERYING

The blocked code references possible fields such as:

```text
Requester_Position
Approver
```

without proving they exist in App795.

Before implementing the final GM lookup:

1. READ App795 Sandbox schema.
2. READ active App795 routing records.
3. Record exact real field codes.
4. Confirm current exact TMG routes.
5. Confirm whether a dedicated GM/Position route already exists.
6. Confirm how destination users are represented.

Do not issue a Kintone query against a field that does not exist.

Do not use try/catch to hide a schema mismatch.

### Preferred minimum-blast-radius design

If existing App795 architecture can represent the special GM rule safely using an existing authoritative routing key, prefer a dedicated key such as:

```text
POSITION_GM
```

or the equivalent existing convention.

App794 may select that special master key after Position normalization, but the actual evaluator/approver identity must come from App795.

Do NOT add `Requester_Position` or `Route_Priority` fields merely because the previous prompt suggested conceptual names.

Only add a new App795 field if actual schema analysis proves it is necessary and no existing field/key model can safely represent the rule.

---

## 6. ROUTING PRECEDENCE — R1 TARGET

For current M10M scope:

```text
1. Normalize Position
2. GENERAL_MANAGER?
   YES → resolve dedicated GM App795 rule → President destination configured in master
   NO  → continue normal routing
3. TMG exact Section|Team route where applicable
4. Normal existing Section route
5. No exact valid route → BLOCK
```

Important:
- Current R1 scope implements GM special routing only.
- Do not infer/implement DGM, VP, Senior Manager, or other executive routing in this correction unless already explicitly required by a separate active implementation scope.
- Existing Confirmed Baseline future-executive targets remain separate from this surgical R1 correction.

---

## 7. TMG2 STRICT BEHAVIOR

For TMG2:

### Valid

```text
TMG2|Production
TMG2|CAD
TMG2|Marketing
```

### Missing Team

```text
TEAM_REQUIRED
BLOCK
```

### Unknown Team

```text
ROUTE_NOT_FOUND
BLOCK
```

### Duplicate active exact route

```text
AMBIGUOUS_ROUTE
BLOCK
```

Never fall back to generic `TMG2`.

Do not create an Admin route for TMG2.

---

## 8. DO NOT INVENT TEST DATA AS BUSINESS EVIDENCE

Focused unit tests may use fixtures, but fixture labels must reflect confirmed business values where the test claims business coverage.

For TMG2 business tests use:

```text
CAD
Production
Marketing
```

Do not describe synthetic fixtures as live App53/App795 evidence.

For approver identities, use values read from actual App795 only in evidence that claims current Sandbox master behavior.

Unit mocks remain clearly labeled as mocks.

---

## 9. ROUTE PREVIEW / DEBUG EXPLAINABILITY

Keep the minimal route explainability addition, but ensure it shows actual resolved data rather than fabricated priority metadata.

Display when available:

```text
Position
Section
Team
Matched Rule / Routing Key
Source = App795
Resolved Appraiser route
```

Do not display a fake `Priority: 1/3/5` if no real App795 priority model exists.

If priority is not stored/configured in App795, describe precedence as resolver precedence, not master-data priority.

---

## 10. REQUIRED CODE TESTS

Add/fix tests at minimum:

### TC01 GM TMH3 with valid App795 GM rule

```text
Position = General Manager
Section = TMH3
```

Expected:
- GM special route selected;
- destination comes from mocked/configured App795 GM record;
- no TMH3 route lookup used as winner.

### TC02 GM TMG2 CAD

```text
Position = General manager
Section = TMG2
Team = CAD
```

Expected:
- Position normalized;
- GM route wins;
- `TMG2|CAD` does not become winner.

### TC03 GM route missing

Expected:

```text
APPROVER_NOT_FOUND or explicit fail-closed GM-route configuration error
```

No fallback `president` user.

### TC04 App795 GM query/schema error

Expected:
- fail closed;
- no default approver generated.

### TC05 TMG2 CAD

Expected exact `TMG2|CAD`.

### TC06 TMG2 Production

Expected exact `TMG2|Production`.

### TC07 TMG2 Marketing

Expected exact `TMG2|Marketing`.

### TC08 TMG2 missing Team

Expected `TEAM_REQUIRED`.

### TC09 TMG2 unknown Team

Expected `ROUTE_NOT_FOUND`.

### TC10 duplicate exact route

Expected `AMBIGUOUS_ROUTE`.

### TC11 requester authorization regression

```text
Requester_User = []
current user = ordinary user
```

Expected: access denied / NOT automatically authorized.

### TC12 existing normal non-TMG route regression

Expected before == after.

---

## 11. APP53 READ-ONLY VALIDATION

Use App53 only to validate routing-input assumptions if Kintone access is available under current credentials.

Required read-only confirmation:
- raw General Manager variants actually present;
- TMG2 Team values include CAD / Production / Marketing;
- no write to App53.

If App53 cannot be read safely, use `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` as canonical input and report that live read was unavailable.

Do not block code correction solely because App53 live read is unavailable when the confirmed baseline already contains the accepted facts.

---

## 12. APP795 SANDBOX DATA CHANGE GATE

Do not write App795 until:
- local code correction passes tests;
- actual App795 schema is documented;
- pre-write routing record snapshot exists;
- affected records are identified;
- rollback material exists.

If current App795 already contains valid:

```text
TMG2|CAD
TMG2|Production
TMG2|Marketing
```

do not recreate or duplicate them.

Only create/modify the minimum GM-specific master row needed by the approved design.

Before write, document Before → After.
After write, read back exact values.

---

## 13. APP794 SANDBOX DEPLOY GATE

Do not deploy App794 until:

```text
npm test = PASS
build = PASS
focused M10M-R1 tests = PASS
security regression test = PASS
App795 read-back = PASS if App795 was changed
```

Production deploy remains forbidden.

---

## 14. REQUIRED REVIEW EVIDENCE

Update `project-docs/AI_REVIEW_PACKAGE.md` or the established review evidence location with an M10M-R1 section containing:

```text
M10M_R1 = READY_FOR_REVIEW
PARENT_BLOCKED_COMMIT = b3cb13e5ba615ad4cc0c4a8698448282d66aa4fe
HARDCODED_PRESIDENT_COUNT = 0
GM_QUERY_ERROR_DEFAULT_FALLBACK_COUNT = 0
BLANK_REQUESTER_ALLOW_ALL_COUNT = 0
GENERAL_MANAGER_NORMALIZATION = PASS
GM_TMH3_TO_MASTER_PRESIDENT_ROUTE = PASS
GM_TMG2_CAD_POSITION_OVERRIDE = PASS
TMG2_CAD_ROUTE = PASS
TMG2_PRODUCTION_ROUTE = PASS
TMG2_MARKETING_ROUTE = PASS
TMG2_MISSING_TEAM_FAIL_CLOSED = PASS
TMG2_UNKNOWN_TEAM_FAIL_CLOSED = PASS
DUPLICATE_ROUTE_FAIL_CLOSED = PASS
REQUESTER_AUTH_REGRESSION = PASS
APP53_WRITE_COUNT = 0
PRODUCTION_WRITE_COUNT = 0
NPM_TEST = PASS
BUILD = PASS
```

Also report:
- actual App795 fields used;
- actual GM routing-master key/record used or created;
- App795 Before/After if changed;
- App795 read-back result;
- files changed;
- test counts;
- Git commit SHA;
- rollback procedure.

---

## 15. STOP CONDITION

When correction is complete:

1. Inspect `git diff`.
2. Confirm no secrets/tokens were added.
3. Commit and push the same `ai/antigravity-wp002c` branch.
4. Do not self-approve.
5. Stop with exactly:

```text
FINAL STATUS: READY FOR CHATGPT REVIEW
```

Do not continue to unrelated work.