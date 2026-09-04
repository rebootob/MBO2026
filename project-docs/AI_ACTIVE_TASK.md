# AI ACTIVE TASK — R2-C-R5 REVIEWED / NOT CLOSED / R2-C-R6 EXACT CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C renderer/test/Profile evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 or accepted R5 behavior without a proven regression.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10
D2_WP004_R2_B2 = PASS / CLOSED AFTER R4 RUNTIME PROOF

R2-C = REVIEWED / NOT CLOSED
R2_C_IMPLEMENTATION = d9af2feb5fb2af1834675123fcd83f27a62fceb2
R2_C_R1_IMPLEMENTATION = aee75a8f01c681766ac6258cb02c267469ae97ff
R2_C_R2_IMPLEMENTATION = cdc68c35f7b110bf3a80ed6026b1d14ed89ffd52
R2_C_R3_IMPLEMENTATION = 0ee456e1a78de982ba6b14c1f42f9747e40cc4e9
R2_C_R4_IMPLEMENTATION = 721413335a7fba56dedd1cc4bcf2265e9ee0d849
R2_C_R5_IMPLEMENTATION = 383104b69b096ca9f8b12d5e2410feeaf8864b45
R2_C_R5_MUTATION = PASS / EXACT T-TOKEN SPLICE ACCEPTED
R2_C_R5_PART_B_PROOF = PASS / NONWRITTEN + RATING RAW XML ACCEPTED
R2_C_R5_PRESERVATION_PROOF = PARTIAL / PRODUCTION COMPARATOR DEFECT REMAINS
R2_C_R5_TEST_ORACLE = PARTIAL / NOT INDEPENDENT OR BYTE-SENSITIVE ENOUGH
R2_C_R5_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R6 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R5 review identity

```text
R2_C_R5_AUTHORIZATION_HEAD = d8b49b26b37de5e01465a59859b051f71c38aab7
R2_C_R5_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R5-SOURCE-TEST-CORRECTIVE-20260904-01
R2_C_R5_IMPLEMENTATION = 383104b69b096ca9f8b12d5e2410feeaf8864b45
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close exact t-token and independent byte oracle (R2-C-R5)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R5 token is consumed. No further change is authorized by it.

## 3. Accepted R5 improvements — MUST PRESERVE / DO NOT REOPEN

Independent review accepts:
- exact unprefixed `t="..."` removal now deletes only the exact token and no longer consumes following whitespace;
- exact unprefixed `t` replacement remains in-place;
- `custom:r/custom:t/data-r/data-t` collision resistance remains;
- deliberate post-`t` whitespace sentinel is present and mutation preserves it in the representative case;
- Part A N4..N10 strict typed truth + omission proof remains accepted;
- Part B N6/N7/N8 strict typed truth + summary omission remains accepted;
- Part B now iterates the complete `effectiveSanitizationRanges` set for full and omitted variants and proves all nonwritten addresses blank;
- every Rating Scale static-range cell now has exact raw cell-node XML parity plus typed decoded-value parity;
- b1..b6 static, protected-padding XML, sorted merge inventory and `sheet2.xml` byte parity remain accepted;
- privacy, N7/N8 canonical alias resistance, XML 1.0 validity, formula-zero and caller immutability remain accepted.

These accepted items are frozen for R6 unless a proven regression is found.

## 4. Independent blockers after R5

### BLOCK A — production preservation comparator still canonicalizes unauthorized bytes

`normalizeTargetNodesForPreservation()` still reconstructs target nodes by extracting attributes and using operations equivalent to:

```text
.replace(/t="..."\s*/, '')
.trim()
<c ${attrs}/>
```

This violates the R5 requirement for a source-aware byte-sensitive comparator. It can erase separator whitespace after `t`, leading/trailing spacing inside the opening tag, and delimiter-spacing differences before comparing the complete sheet.

The production renderer mutation itself is accepted; this blocker is specifically the fail-closed preservation comparator.

### BLOCK B — test oracle is still not independent enough and repeats the same normalization defect

`oracleNormalizeXml()` locates nodes differently, but then uses the same essential normalization strategy:

```text
remove t with trailing \s*
trim attributes
reconstruct <c .../>
```

Therefore it can hide the same unauthorized byte loss as production and does not satisfy the R5 independent byte-oracle contract.

### BLOCK C — no negative-control proves the oracle detects one unauthorized whitespace-byte mutation

R5 asserts sentinel bytes survive the actual renderer output, which is useful and accepted, but closure also needs a proof that the preservation oracle itself fails when a non-authorized separator byte is deliberately changed.

R6 must add this negative-control.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R6

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R6
NAME = SECURED SEMANTIC RENDERER SOURCE-AWARE BYTE-COMPARATOR + INDEPENDENT ORACLE CLOSURE
STATE = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
```

Proposed writable files ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

Frozen / forbidden:

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN
src/services/mbo-xlsx-template-preparer.js = FROZEN
src/services/mbo-export-service.js = FROZEN
existing Profile/Preparer/Feasibility/export tests = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
Combined Excel parity = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 6. R2-C-R6 exact corrective contract

### R6-A — production source-aware byte comparator ONLY

Do not change accepted mutation semantics unless strictly required to preserve R5 behavior.

Replace the current preservation normalizer/comparator so complete `sheet1.xml` equality is checked after neutralizing only authorized differences.

For every Profile-derived concrete writable target:
- locate exact source target node and rendered target node;
- derive source exact unprefixed `t` token span, if present;
- derive rendered exact unprefixed `t` token span, if present;
- preserve every byte before and after those exact token spans;
- if source had a `t`, compare the source/rendered opening tags after replacing only the exact token text with the same fixed marker; do not consume separator bytes;
- if source lacked a `t` and renderer inserted ` t="inlineStr"`, remove only that exact known insertion from rendered side for comparison; preserve every pre-existing source byte around the insertion point;
- neutralize only the authorized target body/value payload, using a fixed marker or exact node-boundary splice;
- compare complete `sheet1.xml` after target-local authorized masking.

FORBIDDEN in production comparator:
- `.trim()` / `.trimStart()` / `.trimEnd()`;
- `t="..."\s*` deletion;
- `\s*` delimiter canonicalization;
- rebuilding the whole opening tag from parsed attributes;
- normalizing `custom:t`, `custom:r`, `data-t`, `data-r`, namespaces, attribute order or non-target whitespace.

Missing/duplicate source/rendered target during preservation proof => fail closed.

### R6-B — truly independent test byte oracle

The TEST oracle must not call the production comparator/helper and must not copy its normalization implementation.

Use an independently written scanner/splice algorithm, for example character-index based boundaries, to:
- find the exact writable cell node by unprefixed `r`;
- identify the exact unprefixed `t` token without consuming surrounding separator bytes;
- mask the authorized body only;
- mask/remove only the exact authorized `t` difference;
- compare every other byte exactly.

FORBIDDEN in test oracle:
- `.trim()` / `.trimStart()` / `.trimEnd()` on opening-tag authority;
- regex deletion containing trailing `\s*` around `t`;
- reconstructing/canonicalizing `<c .../>` from attributes;
- calling the production normalizer.

Retain `custom:r/custom:t/data-r/data-t`, multiple-space, tab, newline and post-`t` whitespace sentinels.

### R6-C — negative-control byte sensitivity

Add a test-only negative control from a valid before/after oracle fixture:
- deliberately alter exactly ONE unauthorized whitespace byte outside the exact `t` token/body allowance, e.g. remove one post-`t` tab or change one pre-existing double-space separator;
- the independent oracle MUST report mismatch / fail;
- similarly, production preservation comparator must reject a prepared/rendered comparison containing an unauthorized non-target/target-opening whitespace change if reachable through a bounded test seam without exposing new production API.

Do not add a public debug API solely for testing.

### R6-D — preserve all accepted R5 matrices and security proof

All focused tests from R5 must remain enabled and passing, including:
- Part A N4..N10 typed truth + omission;
- Part B N6/N7/N8 typed truth + summary omission;
- full/omitted complete nonwritten effective-sanitization proof;
- Rating Scale exact raw cell XML parity;
- static/padding/merge/sheet2 parity;
- Employee-Self + Approver privacy;
- N7/N8 canonical alias resistance;
- XML 1.0 validity / whitespace / Unicode;
- package parity, target uniqueness, formula-zero and caller immutability.

If strict proof requires a frozen-file change: STOP. Do not weaken tests or broaden scope.

## 7. Runtime / regression gate if R6 is later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
R5 exact t-token mutation proof = PASS / retained
production source-aware no-trim complete sheet1 comparator = PASS
independent no-trim byte oracle = PASS
negative-control unauthorized whitespace mutation detection = PASS
Part A N4..N10 exact typed truth + omission = PASS
Part B N6/N7/N8 full + omitted complete nonwritten proof = PASS
Part B Rating Scale raw-cell XML parity = PASS
complete static/padding/merge/sheet2 parity = PASS
Employee-Self + Approver both Parts = PASS
N7 + N8 canonical / alias resistance = PASS
XML 1.0 validity + whitespace/Unicode = PASS
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Required: `FAIL = 0`.

Also:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

Before commit, `git diff --name-only` must show ONLY the two authorized files.

## 8. Owner decision

No executor is active. R2-C remains NOT CLOSED. R6 is proposed only; it is not authorized.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R6 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Combined Excel remains later. Kintone/deploy/Live UAT remain forbidden. `D3 = HOLD` until D2 is fully PASS/CLOSED.
