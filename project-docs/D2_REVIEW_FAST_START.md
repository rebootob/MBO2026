# D2 REVIEW FAST-START — MBO2026

Updated: 2026-09-04 ICT
Repository: `rebootob/MBO2026`
Branch: `ai/antigravity-wp002c`

## Fast path
Fresh-fetch HEAD -> this file -> `AI_ACTIVE_TASK.md` -> exact current-gate source/test only. Do not reopen R2-B1/R2-B2 or accepted R5 behavior without proven regression. Do not broad-scan or auto-start Antigravity.

## Project truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
R2_A = PASS / CLOSED AFTER R1
R2_B1 = PASS / CLOSED AFTER R10
R2_B2 = PASS / CLOSED AFTER R4 RUNTIME PROOF
R2_C = REVIEWED / NOT CLOSED
R2_C_R5_IMPLEMENTATION = 383104b69b096ca9f8b12d5e2410feeaf8864b45
R2_C_R5 = REVIEWED / PARTIAL PASS / NOT CLOSED
R2_C_R5_MUTATION = PASS / FROZEN
R2_C_R5_PART_B_PROOF = PASS / FROZEN
R2_C_R6 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## Durable closed / accepted gates
R2-B1 and R2-B2 remain PASS/CLOSED/FROZEN. R5 exact `t`-token mutation and R5 Part B complete nonwritten/Rating Scale parity are accepted and must not be reopened without proven regression.

## R2-C-R5 independent review

Authorization:
`d8b49b26b37de5e01465a59859b051f71c38aab7`

Implementation:
`383104b69b096ca9f8b12d5e2410feeaf8864b45`

Scope PASS:
- exactly one corrective commit;
- only `src/services/mbo-xlsx-semantic-renderer.js` and `tests/mbo-xlsx-semantic-renderer.test.js` changed;
- no frozen-file changes.

Accepted R5 improvements:
- production exact unprefixed `t` removal now deletes only the token; trailing separator whitespace is no longer consumed by the mutation;
- post-`t` whitespace sentinel survives representative rendering;
- Part A typed exact truth/omission proof retained;
- Part B typed truth/summary omission retained;
- complete `effectiveSanitizationRanges` nonwritten blank proof is added for full + omitted variants;
- Rating Scale cells now prove raw cell-node XML parity plus typed value parity;
- static/padding/sorted-merge/sheet2/privacy/canonical/XML/formula/caller-immutability proof retained.

Remaining blockers:
- production `normalizeTargetNodesForPreservation()` still removes `t` with trailing `\s*`, uses `.trim()`, and reconstructs canonical `<c .../>` nodes, so complete-sheet preservation can hide unauthorized whitespace differences;
- the purported independent test oracle repeats the same essential `t="..."\s*` + `.trim()` + node-reconstruction normalization and is therefore not independent/byte-sensitive enough;
- no negative-control proves the oracle fails if exactly one unauthorized separator whitespace byte is changed.

GitHub has no CI/status/workflow signal for the R5 implementation. Static proof blockers prevent closure.

## Exact next proposal — D2-WP004-R2-C-R6 / NOT AUTHORIZED

```text
NAME = SECURED SEMANTIC RENDERER SOURCE-AWARE BYTE-COMPARATOR + INDEPENDENT ORACLE CLOSURE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1

PROPOSED WRITABLE ONLY:
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js

FROZEN:
  src/profiles/mbo-xlsx-template-profile.js
  src/services/mbo-xlsx-template-preparer.js
  src/services/mbo-export-service.js
  existing Profile/Preparer/Feasibility/export tests
```

R6 closes only:
- production source-aware complete-sheet comparator with no trim, no trailing-whitespace consumption and no opening-tag reconstruction;
- truly independent byte oracle using a different boundary/splice strategy;
- negative-control proving one unauthorized whitespace-byte change is detected;
- all accepted R5 matrices/security proof must remain passing without reopening.

Full authoritative R6 proposal is in `AI_ACTIVE_TASK.md`.

Recommended owner approval phrase:

`อนุมัติ D2-WP004-R2-C-R6 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Combined Excel remains later. Kintone/deploy/Live UAT remain forbidden. `D3 = HOLD` until D2 is fully PASS/CLOSED.
