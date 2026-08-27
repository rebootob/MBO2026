# AI ACTIVE TASK — D7 ADMIN SUPPORT CENTER CORRECTIVE PACKAGE

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: LOCAL SOURCE + TEST CORRECTION ONLY
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. MANDATORY ENTRY

Read in this order before editing:
1. `project-docs/00_MASTER_JOBLIST.md`
2. `project-docs/CONFIRMED_BASELINE/README.md`
3. ALL files under `project-docs/CONFIRMED_BASELINE/`
4. `project-docs/AI_START_HERE.md`
5. `project-docs/CURRENT_STATE.md`
6. `project-docs/HANDOFF.md`
7. `project-docs/AI_REVIEW_PACKAGE.md`

Confirmed Baseline wins on conflict.

Do NOT modify Confirmed Baseline.
Do NOT call live Kintone.
Do NOT write App53, 283, 310, 305, 643, 307, 640, 715, 716.
Do NOT write/deploy App794/795/796/797/798/800/801.
Do NOT change schema, Process Management, ACL, JS customization deployment, or migration data.

## 1. INDEPENDENT REVIEW RESULT

D7 is NOT PASS.
Previous implementer PASS/self-certification is rejected.

Target status after implementation is ONLY:

`D7 = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

ChatGPT Control Plane will independently re-review source, diff, tests and Git evidence before any PASS.

## 2. REQUIRED D7 CORRECTIONS

### P0-A — Production/Preview provider boundary

Files likely involved:
- `src/admin/admin-support-center.js`
- `src/admin/admin-diagnostic-model.js`
- tests

Requirements:
- Production-intended Admin Support Center must NOT silently default to mock/preview evidence.
- Preview fixture provider must be explicit and labelled `sourceMode = PREVIEW_FIXTURE`, `isProductionEvidence = false`.
- Outside explicit preview mode, missing provider must fail closed as `PROVIDER_NOT_CONFIGURED` / `NOT_EVIDENCED`.
- Unknown employee in preview must return NOT_FOUND only. Do not fabricate Employee_Name, Requester_User, MBO key or workflow status.

### P0-B — Complete production-intended read-only evidence bundle

`KintoneAdminDiagnosticProvider` or equivalent must assemble a single READ-ONLY diagnostic evidence bundle from injected dependencies for:
- App53 employee identity/classification
- App794 exact Employee_Code + Fiscal_Year record
- App795 authoritative route
- App796 exact published scoring/profile config
- current workflow state
- audit evidence status

No live call in this task; dependencies must be injectable/testable.

Fail closed:
- App53 0 => EMPLOYEE_NOT_FOUND
- App53 >1 => EMPLOYEE_AMBIGUOUS
- App794 0 => MBO_NOT_FOUND
- App794 >1 => MBO_AMBIGUOUS
- App796 0 => SCORING_CONFIG_NOT_FOUND
- App796 >1 => SCORING_CONFIG_AMBIGUOUS
- App795 missing/duplicate => ERROR / NOT_EVIDENCED

### P0-C — App796 evidence must be exact

For authoritative profile/scoring evidence require:
- matching requested Fiscal_Year
- `Config_Status = PUBLISHED`
- exact `Profile_Code`
- exact `PartA_Weight`
- exact `PartB_Weight`

Missing/incorrect FY/status/code/weight must NEVER allow record-repair-safe PASS.

### P0-D — Workflow audit history truth boundary

Current status / expected path is NOT actual history.

Requirements:
- `ACTUAL_TRANSITION_HISTORY = NOT_AVAILABLE` or `PENDING_AUDIT_SCHEMA_AUTHORIZATION` unless a real audited history source is injected.
- arbitrary non-empty arrays must not automatically become EVIDENCED.
- validate each history entry structure before EVIDENCED, including at minimum: actor, from status, to status, action/result and timestamp.
- no fabricated history from current status, Updated_datetime or fixtures.

### P0-E — Topology-aware ordinal Appraiser 1..4

Use ONE shared normalizer for Appraiser ordinal meaning.

Required mappings:
- M1_G1: 1st = Manager L1, 2nd = GM L1
- M1_M2_G1: 1st = Manager L2/First Manager, 2nd = Manager L1, 3rd = GM L1
- M1_ONLY: 1st = executive direct destination / President route

Future G2 topologies can be modelled but MUST NOT be production-certified PASS unless baseline evidence supports them.

`buildRecordDiagnostic()`, route comparison, active-slot logic and repair diff must use this shared ordinal contract.

### P0-F — Routing_Key physical storage gate

Do not assume App794 stores `Routing_Key`.

If repository schema/source proves a physical stored field:
- compare and repair only when evidence exists.

If not proven:
- `EXPECTED_ROUTING_KEY` may be derived from App795
- `ACTUAL_STORED_ROUTING_KEY = NOT_AVAILABLE`
- `ROUTING_KEY_REPAIR_FIELD = NOT_APPLICABLE`
- do not include Routing_Key in exact repair diff.

### P0-G — Build metadata must be truthful

Remove stale hard-coded commit SHA claims.

If build process does not inject verifiable SHA:
- expose `BUILD_COMMIT = NOT_EVIDENCED`
- distinguish declared source version from verified build metadata.

Never fabricate current commit SHA before commit exists.

### P1-A — UI evidence badges and row semantics

- `NOT_EVIDENCED`, `NOT_AVAILABLE`, `INCOMPLETE_EVIDENCE`, `PENDING_*` must never render as green MATCH.
- Profile weight row must compare BOTH Part A and Part B.
- row status must derive from that row's evidence, not global status plus accidental equality.

### P1-B — Repair candidate strictness

Controlled Repair remains DISABLED.

Only produce exact Before/After fields when authoritative evidence is complete and safe.
Include only actual changed fields.
Never include objectives, ratings, comments, secrets or unrelated business data.

For blocked/uncertain/no-repair cases => exact repair diff must be empty.

## 3. REQUIRED TEST ADDITIONS

Extend `tests/admin-support-center.test.js` and/or focused tests to prove at minimum:

1. No silent Mock provider in production-intended mode.
2. Unknown preview employee does not fabricate identity/status/MBO key.
3. App53/App794 duplicate/not-found fail closed.
4. App796 FY mismatch => fail closed.
5. App796 non-PUBLISHED => fail closed.
6. Missing PartA or PartB weight => NOT_EVIDENCED / repair unsafe.
7. Arbitrary audit array => not EVIDENCED.
8. Structurally valid injected audit history => EVIDENCED.
9. M1_G1 ordinal slots correct.
10. M1_M2_G1 ordinal slots correct.
11. M1_ONLY ordinal slot correct.
12. Missing required authoritative appraiser => NOT_EVIDENCED.
13. Wrong 1st/2nd/3rd/4th appraiser => exact mismatch error.
14. Routing_Key not physically evidenced => not repairable.
15. stale hard-coded SHA is not presented as verified current build SHA.
16. non-admin-form cannot render diagnostic data.
17. admin-form remains Technical Admin only with ZERO business workflow authority.
18. Controlled Repair remains disabled and Kintone writes remain zero.

## 4. VERIFICATION COMMANDS

Run and report exact results:

```bash
npm test -- tests/admin-support-center.test.js
npm test
npm run build
git diff --check
git status --short
git log -5 --oneline
```

If repository has existing source/dist parity check, run it too.

Do not report PASS just because unit tests pass. Report remaining limitations honestly.

## 5. REQUIRED DELIVERY FORMAT

Commit the corrective implementation to branch `ai/antigravity-wp002c`.

Final Antigravity report must include:
- commit SHA
- files changed
- defect-by-defect resolution P0-A..P1-B
- tests added/changed
- exact test/build results
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- remaining blockers
- `D7_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT edit living docs to claim D7 PASS.
Do NOT mark D6 PASS.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

D1 Login + password change + strict employee data isolation
- initial username = Employee_Code
- initial password = Employee_Code
- first/default login forces password change
- employee can later change own password
- Employee A must never see/export/copy/query/direct-open Employee B unless legitimate verified role
- browser-only password verification prohibited
- Password_Hash/secrets must never be exposed to browser

D2 Excel + PDF export in original legacy format

D3 migrate ALL history from legacy PMS Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794

D4 HR Control Center / App800 must manage MBO lifecycle end-to-end

D5 employee can copy ONLY own previous MBO planning fields into a new fiscal year

D6 full integrated E2E / security / regression closure

D7 Admin Support Center complete and independently reviewed

Current Control Plane status:
- D1 = BLOCKED
- D2 = IN_PROGRESS
- D3 = IN_PROGRESS / actual write not authorized
- D4 = IN_PROGRESS
- D5 = MUST_FIX
- D6 = BLOCKED
- D7 = MUST_FIX — THIS ACTIVE TASK
