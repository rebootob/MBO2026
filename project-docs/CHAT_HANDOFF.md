# MBO2026 — CHAT HANDOFF

> Canonical continuation document for a new ChatGPT conversation.  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

**Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.**

## 1. Operating model

```text
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT / BOUNDED execution only when necessary
Claude = READ-ONLY second reviewer only when materially useful
NO_FALSE_PASS = YES
EXECUTOR_CANNOT_SELF_CERTIFY = YES
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
NO_LIVE_KINTONE_WRITE_OR_DEPLOY_WITHOUT_EXACT_OWNER_AUTH = YES
COMPLETE_D2_FULLY_BEFORE_D3 = YES
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 12 OF 20
ROUNDS_REMAINING = 8
```

## 2. Startup order

1. fresh-fetch current HEAD;
2. `CHAT_HANDOFF.md`;
3. `AI_CONTROL_CENTER.md`;
4. `AI_ACTIVE_TASK.md`;
5. `AI_DOCUMENT_INDEX.md`;
6. `00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `EXCEL_EXPORT.md` for D2;
8. `CONFIRMED_BASELINE/README.md` and only directly relevant Baselines;
9. exact current source/tests/diff only when required.

## 3. D1–D7 scoreboard

| ID | Status | Checkpoint |
|---|---|---|
| D1 | ✅ PASS / CLOSED | Frozen unless proven regression |
| D2 | 🟠 IN PROGRESS | Preservation PASS/CLOSED; reference-image source PASS/FROZEN; R3-R34 TEST-ONLY proposed |
| D3 | ⏸ HOLD | No write authorization; complete D2 first |
| D4 | 🟠 IN PROGRESS / NOT ACTIVE | Lifecycle operations mandatory |
| D5 | 🟠 IN PROGRESS / NOT ACTIVE | Fresh route/identity required |
| D6 | 🔴 PENDING | Integrated E2E/security/lifecycle regression |
| D7 | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 4. Frozen D2 foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R30 = PASS / CLOSED
D2_PRESERVATION_GATE = PASS / CLOSED
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 5. Latest review — R3-R33

Authorization `D2-WP003-R3-R33-TEST-20260902-01` was consumed by implementation `adc974704898686efffd7ac121b4b58820581461`.

```text
R3-R33_SCOPE_REVIEW = PASS
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
R3-R33_PROOF_REVIEW = FAIL / NCNAME + ATTRIBUTE COVERAGE FAIL-CLOSED INCOMPLETE
D2_REFERENCE_IMAGE_GATE = CORRECTIVE REQUIRED / NOT CLOSED
```

Accepted R3-R33 progress: exact case-sensitive local names, start-tag-only Relationship attribute extraction, duplicate required-attribute rejection, target-mode tuple inequality, and positive hyphen/dot/Unicode prefix examples.

Remaining TEST-ONLY blockers:
- prefix matcher `[^\s/>:]+` is not NCName-aware and accepts XML-invalid prefixes such as names beginning with a digit;
- Relationship attribute scanning is not coverage-complete and can silently ignore malformed/unquoted extra attributes while required attributes still parse;
- adversarial proof does not yet reject invalid NCName prefixes or malformed/unquoted attribute syntax.

GitHub exposes no CI/status/workflow runtime signal for the implementation commit. No independent runtime PASS is claimed.

## 6. Exact current gate

```text
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R34
PROPOSED_WORK_PACKAGE_NAME = REFERENCE-IMAGE NCNAME + ATTRIBUTE TOKEN COVERAGE CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
REFERENCE_IMAGE_SOURCE_BASELINE = FROZEN / DO NOT MODIFY
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED
D3 = HOLD
```

R3-R34 is proposed only. Do not auto-start it.

## 7. D2 remaining path

After reference-image closure:
1. Part A objective insertion matrix;
2. Part B competency insertion matrix;
3. formula/no-formula authority;
4. production sanitizer/XLSX renderer;
5. combined Excel parity;
6. PDF parity;
7. export security/privacy regression;
8. final independent D2 closure.
