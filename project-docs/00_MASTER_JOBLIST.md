# 00 MASTER JOBLIST — MBO2026

Updated: 2026-09-02 ICT. Fast route: `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> directly relevant Baseline -> exact diff.

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D3 = HOLD UNTIL D2 PASS / CLOSED
D4 = IN PROGRESS / NOT ACTIVE
D5 = IN PROGRESS / NOT ACTIVE
D6 = PENDING
D7 = SOURCE FUNCTIONALITY CLOSED
```

D2 closed: Preservation, Reference Image, Part A Structural, Part B Structural, Formula Authority, Part B Expanded Privacy, XLSX Template Semantic Mapping Evidence.

Template Profile status:
```text
R1_R1_IMPLEMENTATION = 570a388a3f05be564c38e55431b739d3b28bf406
R1_R1_PART_B_TOPOLOGY = PASS / FREEZE
R1_R1_BASIC_INTEGRITY = PASS / FREEZE
R1_R1_PROFILE_SEMANTIC_ALIGNMENT = ACTIVE / R1-R3

R1_R2_R2_EVIDENCE = bc141f355d7714302801d5adca3d5652b83c4de1
R1_R2_R2_SEMANTIC_EVIDENCE = PASS / CLOSED
R1_R2_R2_TOKEN = CONSUMED / PASS / CLOSED / DO NOT REUSE
SEMANTIC_BASELINE = D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md
PROVEN_SAFE_TO_MAP = 18
UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE = 5
```

Active smallest gate:
```text
D2-WP004-R1-R3 = TEMPLATE PROFILE SEMANTIC ALIGNMENT
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT
STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
AUTHORIZATION = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 5e15e5491a5b3ff53d7f5dc18531cc6d418a0c0d
WRITABLE_FILES_ONLY = src/profiles/mbo-xlsx-template-profile.js + tests/mbo-xlsx-template-profile.test.js
```

R1-R3 must align the existing pure profile to exactly the closed semantic Baseline: expose only the 18 accepted safe mappings; fail closed for 22 unresolved roles; prohibit 5 no-source roles; preserve Part B K:Q self / R:X Chief authority; preserve no-workbook-I/O and zero-formula/scoring-recalculation rules.

```text
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R3
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R3 SOURCE+TEST
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
