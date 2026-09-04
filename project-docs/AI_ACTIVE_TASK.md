# AI ACTIVE TASK — R2-C-R3 REVIEWED / NOT CLOSED / R2-C-R4 EXACT CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C renderer/test/Profile/export/preparer evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 without proven regression.

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
R2_C_R3_SOURCE = PARTIAL PASS / RAW-BYTE PRESERVATION GAP REMAINS
R2_C_R3_TEST_PROOF = PARTIAL PASS / PART B COMPLETE PARITY GAPS REMAIN
R2_C_R3_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

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
R2-C-R4 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R3 review identity

```text
R2_C_R3_AUTHORIZATION_HEAD = 775219eea146b7d1cbf74846c0a781425becf1d8
R2_C_R3_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R3-SOURCE-TEST-CORRECTIVE-20260904-01
R2_C_R3_IMPLEMENTATION = 0ee456e1a78de982ba6b14c1f42f9747e40cc4e9
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close unprefixed attributes and exact truth (R2-C-R3)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R3 token is consumed. No further change is authorized by it.

## 3. Accepted R3 improvements — MUST PRESERVE

Independent review accepts:
- exact unprefixed `r` / `t` matching no longer uses the prior `\br` / `\bt` word-boundary form;
- `custom:r`, `custom:t`, `data-r`, `data-t` collision sentinels are now exercised and survive representative rendering;
- Part A N4..N10 now resolves every Profile `projectionPath` independently and checks exact path-present values;
- Part A optional average-score and summary omission proof is added;
- Part B N6/N7/N8 now resolves every Profile-derived role path independently for the path-present case;
- protected padding row exact XML parity and auxiliary `sheet2.xml` byte parity are added;
- XML 1.0 invalid C0/lone-surrogate/U+FFFE/U+FFFF rejection is implemented and valid Thai/supplementary Unicode is tested;
- prior privacy, canonical N7/N8 presentation, prepared-buffer guards, formula-zero and caller-immutability protections remain.

These are partial PASS only. R2-C remains NOT CLOSED.

## 4. Independent blockers after R3

### BLOCK A — production still rebuilds / trims target opening tags

`mutateCellInSheetXml()` still extracts attributes, applies `.trim()` / `.trimEnd()`, then reconstructs tags using forms like `<c ${newOpenAttrs.trim()}>`.

This can alter otherwise-authoritative raw whitespace around attributes even when attribute values/order survive. R3 required every non-`t` raw opening-tag byte to remain exact.

R4 must perform a narrow raw-string transform:
- locate the exact target cell by exact unprefixed `r`;
- replace/remove an existing exact unprefixed `t` in-place without touching surrounding non-authorized bytes;
- when no `t` exists, insert only the minimum authorized ` t="..."` immediately before the original closing delimiter while preserving all pre-existing bytes;
- convert self-closing to paired only as required to carry an authorized payload;
- never `.trim()` or rebuild the rest of the opening tag.

### BLOCK B — production still lacks complete prepared-before `sheet1.xml` equality

R3-B required full prepared-before sheet authority after narrowly normalizing authorized target body plus exact unprefixed `t` representation.

Current production checks package inventory, non-sheet1 bytes, cell inventory and per-target non-type attributes, but does not compare the complete normalized `sheet1.xml` before/after.

R4 must add this production fail-closed comparison. Its normalizer must preserve every non-authorized byte and must not use `.trim()` or normalize namespaced/lookalike attributes.

### BLOCK C — independent authorized-diff oracle still normalizes whitespace

The R3 test oracle uses `.trim()` when normalizing target tags. Therefore it can hide the same raw-spacing defect as production.

R4 test oracle must:
- be independently implemented;
- remove/neutralize only the exact unprefixed `t` token and authorized target body;
- preserve all other whitespace bytes;
- inject an opening tag with deliberate noncanonical spacing/newline/tab plus `custom:r/custom:t/data-r/data-t` sentinels;
- require complete normalized `sheet1.xml` equality.

### BLOCK D — Part B exact matrix is still incomplete

R3 Part B path-present role equality is accepted, but closure contract still lacks:
- a second projection for every N=6/7/8 with both Part B summaries omitted and both summary targets proven blank;
- explicit all-effective-sanitization-addresses-outside-written-set blank proof, not Chief R:X only;
- complete b1..b6 static presentation parity (current proof checks only a few representative B-column cells);
- complete Rating Scale static-range parity (current proof checks only range start labels);
- complete final merge inventory parity against prepared-before (current proof checks count only).

R4 must close all of these from prepared-before/Profile truth.

### BLOCK E — exact test scalar type proof should not coerce strings

R3 exact-value tests compare string-like values using `String(decodedVal) === String(expectedVal)`, which can hide a type mismatch.

R4 test must compare secured string truth as an actual string and numeric truth as an actual finite number, with no string coercion.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R4

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R4
NAME = SECURED SEMANTIC RENDERER RAW-BYTE PRESERVATION + PART B COMPLETE PARITY CLOSURE
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

## 6. R2-C-R4 exact corrective contract

### R4-A — raw-byte exact target mutation

Correct production mutation so:
- exact unprefixed `r="ADDRESS"` is the only target identity;
- exact unprefixed `t` is the only opening-tag attribute allowed to change;
- no `.trim()`, `.trimEnd()` or general opening-tag reconstruction;
- existing non-`t` opening-tag bytes, whitespace, order and values remain byte-identical;
- `custom:r/custom:t/data-r/data-t` and other lookalikes remain byte-identical;
- missing/duplicate target or formula => fail closed;
- self-closing-to-paired conversion is limited to the exact authorized cell payload operation.

### R4-B — production complete prepared-before sheet equality

Before return fail closed unless:
- package entry inventory unchanged;
- every non-sheet1 package entry byte-equal;
- exact cell-address inventory unchanged;
- complete rendered `sheet1.xml` equals prepared-before after a production normalization that neutralizes ONLY:
  1. exact authorized target body/value payload;
  2. exact unprefixed target `t` representation.
- no other byte, whitespace, static cell, merge, dimension, row, padding, Rating Scale or non-target XML may differ;
- existing exact value/privacy/formula/caller-immutability checks remain.

### R4-C — independent raw-byte authorized-diff test

Inject on an actual writable target:
- `custom:t="KEEP_CUSTOM_T"`
- `custom:r="KEEP_CUSTOM_R"`
- `data-t="KEEP_DATA_T"`
- `data-r="KEEP_DATA_R"`
- deliberate multiple spaces, tab and/or newline between non-authorized attributes.

The independent TEST oracle must normalize only the authorized body and exact unprefixed `t`, preserve all other bytes, then require complete `sheet1.xml` equality.

### R4-D — exact Part A scalar truth finalization

For OWNER Part A N4..N10 preserve the accepted full role/path matrix and optional omission proof, but assert:
- secured string expected => decoded value is exactly that string with no coercion;
- secured numeric expected => decoded value is exactly that number;
- omitted optional values blank;
- every nonwritten effective sanitization address blank.

### R4-E — complete Part B closure matrix

For OWNER Part B N6/N7/N8, for BOTH full-summary and summary-omitted projections:
- exact 14/17/20 Profile-derived role sets;
- every path-present target exact type + value;
- both summary cells exact when present;
- both summary cells blank when omitted;
- every effective sanitization address outside the actually-written set blank;
- FULL Chief R:X blank;
- b1..b6 static presentation exact prepared-before parity across the complete static presentation authority;
- every Rating Scale static range exact prepared-before cell/value/XML parity;
- every protected padding row exact prepared-before XML parity;
- complete merge inventory (sorted exact refs, not count only) equals prepared-before;
- `sheet2.xml` byte-equal;
- formulas zero and input immutable.

The complete normalized-sheet equality proof may serve as the stronger package-level proof, but the explicit Part B assertions above must still be present so failures are diagnosable.

## 7. Runtime / regression gate if R4 is later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
Part A N4..N10 exact typed truth + omission matrix = PASS
Part B N6/N7/N8 exact typed truth + summary omission + complete static parity = PASS
raw-byte spacing + custom:r/custom:t/data-r/data-t sentinel = PASS
independent complete sheet1 authorized-diff = PASS
production complete sheet1 prepared-before preservation = PASS
Employee-Self + Approver both Parts = PASS
N7 + N8 canonical / alias resistance = PASS
XML 1.0 validity + whitespace/Unicode = PASS
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Required regression: `FAIL = 0`.

Also:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

Before commit `git diff --name-only` must contain only the two authorized files.

If strict proof requires a frozen-file modification, executor must STOP. Do not weaken tests or broaden scope.

## 8. Owner decision

No executor is active. R2-C remains NOT CLOSED. R4 is only proposed; it is not authorized.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R4 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
