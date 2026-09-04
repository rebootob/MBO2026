# D2 REVIEW FAST-START — MBO2026

Updated: 2026-09-04 ICT
Repository: `rebootob/MBO2026`
Branch: `ai/antigravity-wp002c`

## Fast path
Fresh-fetch HEAD -> this file -> `AI_ACTIVE_TASK.md` -> exact R2-D1 files only. Do not reopen frozen gates without proven regression.

## Project truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
R2_A = PASS / CLOSED
R2_B1 = PASS / CLOSED / FROZEN
R2_B2 = PASS / CLOSED / FROZEN
R2_C = PASS / CLOSED / FROZEN
R2_D_PRE1 = PASS / CLOSED / FROZEN
R2_D_PRE1_R1 = PASS / CLOSED / FROZEN
R2_D_PRE1_R2 = PASS / CLOSED / FROZEN
R2_D1 = AUTHORIZED / ACTIVE
ACTIVE_WORK_PACKAGE = D2-WP004-R2-D1
ANTIGRAVITY = AUTHORIZED / BOUNDED SOURCE+TEST ONLY / MAX 1 COMMIT
CLAUDE = STOP
EXPORT_SERVICE_INTEGRATION = NOT AUTHORIZED
D3 = HOLD
```

## R2-D1 authority

Owner authorization:
`อนุมัติ D2-WP004-R2-D1 SOURCE+TEST ตามขอบเขตที่เสนอ`

Token:
`D2-WP004-R2-D1-SOURCE-TEST-20260904-01`

Writable scope is exactly two NEW files:
```text
src/services/mbo-xlsx-combined-composer.js
tests/mbo-xlsx-combined-composer.test.js
```

Composer inputs are already-rendered Part A/Part B bytes. Mapping for styles/shared strings must be derived from actual rendered packages; no fixed owner-template offsets. Final workbook must contain exactly `MBO Staff & Chief` then `(Part B) Competency`, excluding Part B auxiliary `Sheet1`.

The composer must preserve rendered Print_Areas, privacy, secured values, formula inventory zero, Part A package authority, and remap Part B styles/SST/drawing/printerSettings/workbook metadata using source-derived collision-safe paths/IDs.

No existing source/test/Profile/export-service/control/template/package/UI file may be changed by executor.

Required focused + frozen tests and full contract are in `AI_ACTIVE_TASK.md`.

After exactly one implementation commit is pushed, Antigravity must STOP for independent ChatGPT review.
