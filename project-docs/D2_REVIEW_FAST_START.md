# D2 REVIEW FAST-START — MBO2026

Updated: 2026-09-02 ICT  
Repository: `rebootob/MBO2026`  
Branch: `ai/antigravity-wp002c`

## Fast path
Fresh-fetch HEAD -> this file -> `AI_ACTIVE_TASK.md` -> only directly relevant Baseline -> exact diff.

## Project truth
```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D3 = HOLD UNTIL D2 PASS / CLOSED
```

Closed/frozen D2 gates: Preservation, Reference Image, Part A Structural, Part B Structural, Formula Authority, Part B Expanded Privacy.

Mandatory renderer architecture:
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = MANDATORY
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
```

## D2-WP004-R1 review
```text
R1_IMPLEMENTATION = ca6bc323117d4e2c5550774e9027d801551a792d
R1_SCOPE = PASS
R1_PURITY_SHA_CARDINALITY = PASS
R1_SOURCE_PROOF = CORRECTIVE REQUIRED
R1_TOKEN = CONSUMED / DO NOT REUSE
R1_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

## Active corrective — D2-WP004-R1-R1
```text
WORK_PACKAGE = D2-WP004-R1-R1
AUTHORIZATION = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 57b77fde38c0ef95f0ac40eb396ec386643adf03
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / EXACT TWO FILES
FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R1
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Correct only:
1. Part B exact frozen row-role topology — original rows7:29 K:X dynamic; row30/34/38 protected; N7 inserted rows31:33 dynamic; N8 rows31:33+35:37 dynamic; summary 31:34 / 35:38 / 39:42.
2. Explicit semantic/projection-path alignment with read-only `MboExportService`; no invented meanings.
3. Runtime fail-closed mapping-integrity validation for missing/conflicting/invalid/protected-writable mapping.

If exact semantic/address authority is not supported by accepted repository evidence, fail closed/report blocker rather than guess.
