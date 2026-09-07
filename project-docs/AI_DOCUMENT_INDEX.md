# MBO2026 — AI DOCUMENT INDEX

Updated: 2026-09-08 ICT.

## Fast startup

`fresh-fetch ai/antigravity-wp002c` -> `CHAT_HANDOFF.md` -> `AI_CONTROL_CENTER.md` -> `AI_ACTIVE_TASK.md` -> `control/00_MASTER_DELIVERY_CONTROL.md` -> `control/02_ACTIVE_WORK_PACKAGE.md` -> exact relevant evidence/source.

## Current canonical status

```text
D1_BASE = CLOSED / DURABLE
D1_UAT_REGRESSION = OPEN NARROWLY
D1-UAT-DEFECT-001 = SOURCE REVIEW PASS / PENDING SANDBOX DEPLOY + OWNER UAT
D1-UAT-DEFECT-002 = SOURCE REVIEW PASS / PENDING SANDBOX DEPLOY + OWNER UAT
D2_ENGINEERING = PASS / CLOSED / DURABLE
D2_OWNER_UAT = IN PROGRESS / PAUSED
D3 = HOLD
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

## Corrective commit chain

```text
D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R1
8c3fda998fe8bd0b627d62a5beb10455bde8f725
PARTIAL PASS

D1-UAT-IDENTITY-ENTRY-CORRECTIVE-R2
88ed6b7ea99ca9871190c2a913879b9e7638e3cb
PASS / CLOSED

BUILD ARTIFACT
 d9efa5a0c418ad98ca8b70965b130a8b607e81b5

D1-UAT-SANDBOX-DEPLOY-TOOL-R1
03b531383e86c643a5258a2baf6fdbd15bc9099e
PASS / CLOSED
```

Canonical deployment filenames:
- `mbo-employee-app.js`
- `mbo-employee.css`

Wrong historical `mbo-employee .css` must fail closed.

## D2 durable authority

D2 engineering remains closed and unaffected by the D1 corrective.

Durable D2 Baselines include:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

Final accepted D2 engineering evidence chain includes `0e4a9ccb1f62476f6f0fde6c0dd50f6588e6f13a` with focused export 16 PASS / 0 FAIL and frozen 5-file regression 44 PASS / 0 FAIL. Owner runtime UAT is separate and not yet globally accepted.

## Current execution authorization

```text
WORK_PACKAGE = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2
OWNER_APPROVAL = granted
AUTHORIZATION_ID = D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-20260908-02
TARGET = App794 customization only
MAX_ATTEMPTS = 1
RECORD/SCHEMA/ACL/PROCESS_WRITES = NONE
D3 = HOLD
```

Read `AI_ACTIVE_TASK.md` for exact current execution contract. If a docs-only sync commit advances HEAD, Control Plane may rebase the already-approved deploy basis only after proving zero runtime/source/test/script/dist changes.
