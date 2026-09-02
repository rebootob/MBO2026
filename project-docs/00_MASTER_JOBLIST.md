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

D2 closed:
- Preservation
- Reference Image
- Part A Structural
- Part B Structural
- Formula Authority
- Part B Expanded Privacy

Latest privacy closure:
```text
R7-R2_SOURCE = PASS / FROZEN / 6975b1f076b9b3f4baa3b6cb4ca844767f513f0a
R7-R3_TEST_ONLY = PASS / CLOSED / 69891d82996f83a0442ee6dc268dd20b7ef8ee99
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED
```

Frozen privacy authority includes N6/N7/N8 counts 432/474/516, exact row30/34/38 protected-static semantics, strict source-backed style/merge/type/nonblank/static-hash-when-applicable validation, expanded package token purge, immutable caller buffers and zero formulas.

Production Renderer requirement:
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = MANDATORY
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
```
Authority: `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`.

Remaining D2:
1. Production XLSX Renderer/Sanitizer
2. Combined Excel parity
3. PDF parity
4. Export authorization/security/privacy regression
5. Final independent D2 closure
6. only then D3 may leave HOLD

```text
PROPOSED_NEXT = PRODUCTION XLSX RENDERER / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
