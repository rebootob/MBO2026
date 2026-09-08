# MBO2026 — AI DOCUMENT INDEX

Updated: 2026-09-08 ICT.

## Fast startup

`fresh-fetch ai/antigravity-wp002c` -> `CHAT_HANDOFF.md` -> `AI_CONTROL_CENTER.md` -> `AI_ACTIVE_TASK.md` -> `control/00_MASTER_DELIVERY_CONTROL.md` -> `control/02_ACTIVE_WORK_PACKAGE.md` -> exact relevant evidence/source.

## Current canonical status

```text
D1 = PASS / CLOSED / DURABLE
D1_BASE = CLOSED / DURABLE
D1_UAT_REGRESSION = PASS / CLOSED
D1_FINAL_CLOSURE = PASS / CLOSED
D1-UAT-DEFECT-001 = PASS / CLOSED
D1-UAT-DEFECT-002 = PASS / CLOSED
D1-UAT-DEFECT-003 = PASS / CLOSED
ORIGINAL_OWNER_UAT = 4/4 PASS
DEFECT003_OWNER_UAT = 3/3 PASS
APP794_DEPLOYMENT = PASS / LIVE REV 70
APP794_LIVE_REVISION = 70
APP794_CSS_TARGET = CANONICAL (mbo-employee.css)
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD / NOT AUTHORIZED
PRODUCTION_READY = NO
```

## Current D1 UAT authority

- `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/ui/employee-self-index-ui.js`
- `src/main-mbo-app.js`
- focused tests for hybrid identity, login gate, employee lookup, employee-main integration and self index.

Locked behavior:
```text
Dedicated employee -> personal Kintone exact App53 mapping -> auto-bind
Shared principal -> App801 login allowed only when App53 MBO_Kintone_User.value = []
Dedicated mapping / malformed mapping / lookup error -> Shared path DENY
```

Owner-proven dedicated example:
`0113 / Ms.Papatchaya -> MBO_Kintone_User = Ms.Papatchaya`.

## Corrective, deploy & migration commit chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1
8c3fda998fe8bd0b627d62a5beb10455bde8f725
PARTIAL PASS

D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2
88ed6b7ea99ca9871190c2a913879b9e7638e3cb
PASS / CLOSED

BUILD ARTIFACT
d9efa5a0c418ad98ca8b70965b130a8b607e81b5
Candidate JS Blob: 8958634b92b35f74b58a7a0b2abd09b8b5e93758
Candidate CSS Blob: 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61

D1-UAT-SANDBOX-DEPLOY-TOOL-R1
03b531383e86c643a5258a2baf6fdbd15bc9099e
PASS / CLOSED

D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
cd74b01e6650bb04b5fbdba6c365dd9a1bf87236
PASS / CLOSED (App794 rev 67 -> 68, exact candidate blob match)

D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1
38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d
PASS / CLOSED (App794 rev 68 -> 69, CSS target canonicalized to mbo-employee.css, standard preflight PASS)

D1-UAT-DEFECT-003-BUILD-R1
2a02ab2583f53c3906674713c2e09e1757449ba8
Candidate JS Blob: 204d34db9e2eab297409a6a3d5e7f29c649779d5
Candidate CSS Blob: 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
Evidence: project-docs/D1_UAT_DEFECT_003_BUILD_R1_EVIDENCE.md
PASS / CLOSED

D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1
Evidence: project-docs/D1_UAT_DEFECT_003_SANDBOX_DEPLOY_R1_EVIDENCE.md
PASS / CLOSED (App794 rev 69 -> 70, exact candidate blob match)

D1-UAT-DEFECT-003-CLOSE-R1
Evidence: project-docs/D1_UAT_DEFECT_003_OWNER_UAT_CLOSE_R1_EVIDENCE.md
Owner Runtime UAT: 3/3 PASS
PASS / CLOSED

D1-FINAL-CLOSURE-SYNC
Evidence: project-docs/D1_FINAL_CLOSURE_CONTROL_PLANE_DECISION.md
Control Plane Decision: D1 = PASS / CLOSED
PASS / CLOSED

D3-PRE1
Evidence: project-docs/D3_PRE1_WORKFLOW_REOPEN_SCOPE_READINESS_GAP_REVIEW.md
Workflow / Reopen Scope & Readiness Gap Review
PARTIAL PASS / CORRECTIVE UNDER REVIEW

D3-PRE1-R1
Evidence: project-docs/D3_PRE1_R1_WORKFLOW_AUTHORITY_REOPEN_EVIDENCE_ACCURACY_CORRECTIVE.md
Workflow Authority & Reopen Evidence Accuracy Corrective
PARTIAL PASS / PROVENANCE CORRECTIVE REQUIRED

D3-PRE1-R2
Evidence: project-docs/D3_PRE1_R2_APP798_PROVENANCE_SCHEMA_PRECISION_CORRECTIVE.md
App798 Provenance & Schema Precision Corrective
PARTIAL PASS / FINAL PRECISION DOCFIX REQUIRED

D3-PRE1-R3
Evidence: project-docs/D3_PRE1_R3_APP798_SCHEMA_STATEMENT_EXACTNESS_FINAL_CORRECTIVE.md
App798 Schema Statement Exactness Final Corrective
PASS / CLOSED

D3-DECISION-SYNC
Evidence: project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md
D3 Owner Architecture & Self-Appraiser Decision Sync
EXECUTED / AWAITING CONTROL PLANE REVIEW
```

Canonical deployment filenames:
- `mbo-employee-app.js`
- `mbo-employee.css`

Standard deployment tool preflight restored to `PASS` (`validatePreflight = true`).

## D2 durable authority

D2 engineering remains closed and unaffected by the D1 corrective.

D2 Baselines include:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

Final accepted D2 engineering evidence chain includes `0e4a9ccb1f62476f6f0fde6c0dd50f6588e6f13a` with focused export 16 PASS / 0 FAIL and frozen 5-file regression 44 PASS / 0 FAIL. Owner runtime UAT is separate and not yet globally accepted.

## Current operational state

```text
ACTIVE_WORK_PACKAGE = D3-DECISION-SYNC
TITLE = D3 Owner Architecture & Self-Appraiser Decision Sync
TYPE = DOCS-ONLY / CONTROL-AUTHORITY SYNC
OWNER_AUTHORIZATION = APPROVED
STATUS = EXECUTED / AWAITING CONTROL PLANE REVIEW
D3_PRE1_CHAIN = PASS / CLOSED AS CORRECTED
DECISION_D3_001 = LOCKED / OWNER APPROVED
DECISION_D3_002 = LOCKED / OWNER APPROVED
DECISION_DOCUMENT = project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md
D3_READINESS = DECISIONS_RESOLVED / READY_FOR_BOUNDED_IMPLEMENTATION_PLANNING
LAST_COMPLETED_WORK_PACKAGE = D1-FINAL-CLOSURE-SYNC
LAST_COMPLETED_RESULT = CONTROL PLANE D1 FINAL DECISION RECORDED
STAGE_STATUS = D1 CLOSED / D3 ON HOLD
APP794_LIVE_REVISION = 70
ALLOWED_KINTONE_WRITES = NONE
D3 = HOLD / NOT AUTHORIZED
D3_IMPLEMENTATION_AUTHORIZED = NO
PRODUCTION_READY = NO
```

Read `AI_ACTIVE_TASK.md` and `project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md` for workflow authority, reopen evidence, and decision matrix details. Stage D1 is formally PASS / CLOSED / DURABLE. D3 remains on HOLD pending separate explicit Owner work package authorization.
