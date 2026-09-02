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
R1_R3_IMPLEMENTATION = 7b9e0279b03043ec9a5cceb7e3814a688f7ea3b8
R1_R3_SCOPE = PASS
R1_R3_OVERALL = CORRECTIVE REQUIRED / TOKEN CONSUMED
SEMANTIC_BASELINE = D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md
SAFE_TO_MAP = 18
UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE = 5
```

Next proposed smallest gate:
```text
D2-WP004-R1-R3-R1 = TEMPLATE PROFILE STRICT ALLOWLIST + INTEGRITY CORRECTIVE
MODE = SOURCE+TEST / NOT AUTHORIZED
EXPECTED_FILES = src/profiles/mbo-xlsx-template-profile.js + tests/mbo-xlsx-template-profile.test.js
```

Corrective focus only: remove unauthorized writable aliases; reject every writable resolution with null/unknown secured path; complete validator coverage for actual Part A/Part B safe mappings, duplicate/malformed/null path faults and canonical role authority. Preserve all accepted SHA/count/topology/purity behavior.

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
