# 00 MASTER JOBLIST — MBO2026

Updated: 2026-09-02 ICT. Fast route: `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> relevant Baseline -> exact diff.

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

D2 closed: Preservation, Reference Image, Part A Structural, Part B Structural, Formula Authority.

Current D2 gate:
```text
D2_PART_B_EXPANDED_PRIVACY = CORRECTIVE REQUIRED / NOT CLOSED
R7-R2_IMPLEMENTATION = 6975b1f076b9b3f4baa3b6cb4ca844767f513f0a
R7-R2_SOURCE = PASS / FROZEN
R7-R2_PROOF = CORRECTIVE REQUIRED / DIRECT NEGATIVE ISOLATION ONLY
R7-R2_TOKEN = CONSUMED / DO NOT REUSE
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R3
R7-R3 = AUTHORIZED / TEST-ONLY / ONE FILE
R7-R3_AUTHORIZATION = D2-WP003-R7-R3-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 93f373c6321f94cc45700e15506769583eb48b21
```

Accepted/frozen privacy authority: N6/N7/N8 counts 432/474/516; row30/34/38 protected non-dynamic; strict style/merge/type/nonblank source backing; source-applicable static valHash enforcement; expanded package token purge; caller-buffer immutability; formula inventory zero.

R7-R3 may modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` to isolate direct row30/clone normalizedType, nonblank, and source-applicable valHash blocker proof. No source modification.

Remaining D2 after privacy closure: Production XLSX renderer/sanitizer -> Combined Excel -> PDF -> export security/privacy regression -> final independent D2 review.

```text
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R3 / ONE-SHOT / STOP AFTER PUSH+REPORT
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
