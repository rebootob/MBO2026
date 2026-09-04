# AI ACTIVE TASK — R2-C-R6 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTION AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. This file is authoritative for the active R6 gate if fast-start still shows the immediately preceding proposal state. Read only exact R2-C renderer/test/Profile evidence required by this gate. Do not reopen closed R2-B1/R2-B2 or accepted R5 behavior without a proven regression.

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
R2_C_R5_IMPLEMENTATION = 383104b69b096ca9f8b12d5e2410feeaf8864b45
R2_C_R5_MUTATION = PASS / FROZEN / EXACT T-TOKEN SPLICE ACCEPTED
R2_C_R5_PART_B_PROOF = PASS / FROZEN / NONWRITTEN + RATING RAW XML ACCEPTED
R2_C_R5_PRESERVATION_PROOF = PARTIAL / PRODUCTION COMPARATOR DEFECT REMAINS
R2_C_R5_TEST_ORACLE = PARTIAL / NOT INDEPENDENT OR BYTE-SENSITIVE ENOUGH

ACTIVE_WORK_PACKAGE = D2-WP004-R2-C-R6
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-C-R6-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-C-R6-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-C-R6-SOURCE-TEST-CORRECTIVE-20260904-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = BOUNDED / ONE-SHOT / MAX 1 COMMIT
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R6 = AUTHORIZED / ACTIVE
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R6 authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-C-R6
NAME = SECURED SEMANTIC RENDERER SOURCE-AWARE BYTE-COMPARATOR + INDEPENDENT ORACLE CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
AUTHORIZATION_BASIS_HEAD = a6c026f77c1c0c0d7286b1728642378d91659cf8
AUTHORIZATION_TOKEN = D2-WP004-R2-C-R6-SOURCE-TEST-CORRECTIVE-20260904-01
```

Owner authorization:

`อนุมัติ D2-WP004-R2-C-R6 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use and is consumed when executor pushes the one authorized implementation commit or stops after beginning execution due to a contract blocker.

## 3. Writable scope

Writable ONLY:

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

## 4. Accepted R5 behavior — MUST PRESERVE / DO NOT REOPEN

Independent review already accepts and freezes unless a proven regression exists:
- exact unprefixed `t="..."` removal deletes only the exact token and preserves surrounding whitespace;
- exact unprefixed `t` replacement is in-place;
- `custom:r/custom:t/data-r/data-t` collision resistance and post-`t` whitespace sentinel mutation proof;
- Part A N4..N10 strict typed truth + omission;
- Part B N6/N7/N8 strict typed truth + summary omission;
- full/omitted complete `effectiveSanitizationRanges` nonwritten blank proof;
- Rating Scale exact raw cell-node XML + typed value parity;
- b1..b6 static, padding XML, sorted merge inventory and `sheet2.xml` parity;
- Employee-Self / Approver privacy;
- N7/N8 canonical alias resistance;
- XML 1.0 validity / whitespace / Unicode;
- package parity, target uniqueness, formula-zero and caller immutability.

R6 is NOT authorized to redesign those accepted semantics. It closes only the remaining preservation comparator/oracle proof gap.

## 5. R2-C-R6 exact corrective contract

### R6-A — production source-aware byte comparator ONLY

Do not change accepted R5 mutation semantics unless strictly necessary to preserve them.

Replace the current preservation normalizer/comparator so complete `sheet1.xml` equality is checked after neutralizing ONLY authorized differences.

For every Profile-derived concrete writable target:
- locate exact source target node and exact rendered target node;
- derive exact source unprefixed `t` token span if present;
- derive exact rendered unprefixed `t` token span if present;
- preserve every byte before and after those exact token spans;
- if source had `t`, replace ONLY exact source/rendered token text with the same fixed marker; do not consume separator bytes;
- if source lacked `t` and renderer inserted ` t="inlineStr"`, remove ONLY that exact known insertion from rendered side for comparison;
- neutralize ONLY authorized target body/value payload via exact node-boundary splice/fixed marker;
- compare complete `sheet1.xml` after target-local authorized masking;
- missing or duplicate source/rendered target during preservation proof => fail closed.

FORBIDDEN in production comparator:
- `.trim()` / `.trimStart()` / `.trimEnd()`;
- `t="..."\s*` deletion;
- `\s*` delimiter canonicalization;
- rebuilding the whole opening tag from parsed attributes;
- normalizing `custom:t`, `custom:r`, `data-t`, `data-r`, namespaces, attribute order, delimiter spacing or non-target whitespace.

### R6-B — truly independent test byte oracle

TEST oracle MUST NOT call production comparator/helper and MUST NOT copy its normalization implementation.

Use an independently written scanner/splice algorithm, preferably character-index based, to:
- find exact writable cell node by exact unprefixed `r`;
- identify exact unprefixed `t` token without consuming surrounding separator bytes;
- mask authorized body only;
- mask/remove only the exact authorized `t` difference;
- compare every other byte exactly.

FORBIDDEN in test oracle:
- `.trim()` / `.trimStart()` / `.trimEnd()` on opening-tag authority;
- regex deletion containing trailing `\s*` around `t`;
- reconstructing/canonicalizing `<c .../>` from attributes;
- calling the production normalizer.

Retain `custom:r/custom:t/data-r/data-t`, multiple spaces, tab, newline and post-`t` whitespace sentinels.

### R6-C — negative-control byte sensitivity

Add test-only negative control from a valid before/after oracle fixture:
- deliberately alter EXACTLY ONE unauthorized whitespace byte outside exact `t` token/body allowance, e.g. remove one post-`t` tab or one pre-existing separator space;
- independent oracle MUST report mismatch/fail;
- production preservation path must reject an unauthorized whitespace mutation if it can be exercised through the existing bounded renderer/test seam;
- do not expose a new public debug API solely for testing.

### R6-D — preserve all accepted R5 matrices/security proof

All focused R5 tests remain enabled and passing. Do not weaken/remove them. If strict proof requires any frozen-file change: STOP. Do not weaken tests or broaden scope.

## 6. Runtime / regression gate

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

All must PASS.

## 7. Executor protocol

Before modification:
- fresh-fetch canonical branch;
- HEAD MUST equal the R6 authorization commit generated by this control update;
- verify exact R6 token;
- read this exact contract;
- no broad exploration / no Git delivery rediscovery.

Before commit run `git diff --name-only`. It MUST show ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

If strict proof requires any frozen-file change: STOP. Do not weaken tests. Do not broaden scope.

If all checks PASS:
1. create EXACTLY ONE SOURCE+TEST corrective commit;
2. suggested message: `fix(d2): close source-aware byte comparator (R2-C-R6)`;
3. push `ai/antigravity-wp002c`;
4. report pushed SHA, exact changed files, focused PASS/FAIL/SKIP, production comparator proof, independent oracle proof, negative-control proof, retained R5 matrices/privacy/XML/regression, `node --check`, and `git diff --check`;
5. STOP.

Do NOT modify `project-docs/*`.
Do NOT self-declare R2-C PASS/CLOSED.
Do NOT start Combined Excel.
Do NOT perform Kintone writes/deploy/Live UAT.
Do NOT start D3.

Final executor state after successful push:

`R2-C-R6 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`
