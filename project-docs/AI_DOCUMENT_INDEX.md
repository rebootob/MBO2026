# MBO2026 — AI DOCUMENT INDEX

Updated: 2026-09-08 ICT.

## Fast startup

`fresh-fetch ai/antigravity-wp002c` -> `CHAT_HANDOFF.md` -> `AI_CONTROL_CENTER.md` -> `AI_ACTIVE_TASK.md` -> `control/00_MASTER_DELIVERY_CONTROL.md` -> `control/02_ACTIVE_WORK_PACKAGE.md` -> exact relevant evidence/source.

## Current canonical status

```text
D1_BASE = CLOSED / DURABLE
D1_UAT_REGRESSION = TECHNICALLY RESOLVED & DEPLOYED (REV 69) / OWNER UAT PENDING
D1-UAT-DEFECT-001 = SOURCE REVIEW PASS / DEPLOYED / OWNER UAT PENDING
D1-UAT-DEFECT-002 = SOURCE REVIEW PASS / DEPLOYED / OWNER UAT PENDING
APP794_DEPLOYMENT = TECHNICAL PASS (Live rev 69)
APP794_CSS_TARGET = CANONICAL (mbo-employee.css)
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
```

Canonical deployment filenames:
- `mbo-employee-app.js`
- `mbo-employee.css`

Standard deployment tool preflight restored to `PASS` (`validatePreflight = true`).

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

## Current operational state

```text
ACTIVE_WORK_PACKAGE = D1-UAT-OWNER-RUNTIME-UAT-READINESS
STATUS = READY FOR OWNER RUNTIME UAT
APP794_LIVE_REVISION = 69
ALLOWED_KINTONE_WRITES = NONE
D3 = HOLD
```

Read `AI_ACTIVE_TASK.md` for runtime UAT test case verification details. Owner execution and ChatGPT independent review are required before advancing to any subsequent milestone.
