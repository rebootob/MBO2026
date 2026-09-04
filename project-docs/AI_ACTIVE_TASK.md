# AI ACTIVE TASK — R2-C-R4 REVIEWED / NOT CLOSED / R2-C-R5 EXACT CORRECTIVE PROPOSAL READY

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
R2_C_R4_IMPLEMENTATION = 721413335a7fba56dedd1cc4bcf2265e9ee0d849
R2_C_R4_SOURCE = PARTIAL PASS / EXACT T-TOKEN WHITESPACE DEFECT REMAINS
R2_C_R4_TEST_PROOF = PARTIAL PASS / ORACLE + PART-B NONWRITTEN/RATING XML GAPS REMAIN
R2_C_R4_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

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
R2-C-R5 = EXACT CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R4 review identity

```text
R2_C_R4_AUTHORIZATION_HEAD = 4f379c84cb953e1dcd5448001cbec42bdee4bb3d
R2_C_R4_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R4-SOURCE-TEST-CORRECTIVE-20260904-01
R2_C_R4_IMPLEMENTATION = 721413335a7fba56dedd1cc4bcf2265e9ee0d849
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close raw-byte preservation and Part B parity (R2-C-R4)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R4 token is consumed. No further change is authorized by it.

## 3. Accepted R4 improvements — MUST PRESERVE

Independent review accepts:
- exactly one implementation commit and only the two authorized renderer files changed;
- Part A N4..N10 path-present proof now uses strict decoded type + exact value and optional omission proof remains;
- Part B N6/N7/N8 path-present proof now uses strict decoded type + exact value;
- Part B summary-omitted variant now proves both summary targets blank for every N;
- complete b1..b6 static title/description representative authority was expanded to all twelve known static title/description start cells;
- complete sorted merge-ref inventory is compared against prepared-before;
- protected padding exact row XML parity and auxiliary `sheet2.xml` byte parity remain;
- custom:r/custom:t/data-r/data-t plus deliberate spacing/tab/newline sentinels are exercised;
- XML 1.0 / privacy / canonical N7-N8 / formula-zero / caller-immutability protections remain.

These are partial PASS only. R2-C remains NOT CLOSED.

## 4. Independent blockers after R4

### BLOCK A — removing exact unprefixed `t` still consumes unauthorized following whitespace

Production `mutateOpeningTag()` removes `t` with a pattern equivalent to:

```text
t="..."\s*
```

The `\s*` is outside the attribute token. It can consume spaces, tabs or newlines that were already present after `t`, violating the R4 contract that only the exact unprefixed `t="..."` token may change and every other raw byte must remain exact.

R5 must remove/replace only the exact `t="..."` token itself. It must not consume any preceding or following separator bytes.

### BLOCK B — production complete-sheet normalizer still hides whitespace loss

`normalizeTargetNodesForPreservation()` also removes `t` with trailing `\s*` and additionally canonicalizes the closing delimiter with a pattern equivalent to `\s*/?>$`.

Therefore the supposed complete prepared-before equality can erase exactly the spacing defect it is intended to detect.

R5 production preservation must be source-aware and byte-sensitive:
- if source target had exact unprefixed `t`, neutralize only that token text on both sides while preserving all surrounding bytes;
- if source target had no `t` and renderer inserted the minimum authorized separator+`t` token, normalize only that specifically authorized insertion on rendered side;
- neutralize authorized body payload only;
- do not normalize any other spaces/tabs/newlines or closing-delimiter spacing.

### BLOCK C — test oracle is not independent and repeats the same defect

The R4 independent test oracle repeats the same `t="..."\s*` and `\s*/?>$` normalization strategy as production. It can therefore hide the same unauthorized whitespace change.

R5 TEST oracle must be separately implemented and must not copy production helper/regex strategy. It must fail if any sentinel spacing byte outside the exact authorized `t` insertion/token and body changes.

### BLOCK D — Part B all-effective-sanitization blank proof is still incomplete

R4 checks FULL Chief R:X blank, but does not explicitly prove every effective sanitization address outside the actually-written set remains blank for both full-summary and summary-omitted variants.

R5 must perform the complete effective-sanitization-set proof for both variants and every N=6/7/8.

### BLOCK E — Rating Scale explicit parity is decoded-value only, not complete XML/payload parity

R4 iterates each Rating Scale range but compares mainly decoded cell values. The R4 contract required exact prepared-before cell/value/XML structural parity across every Rating Scale static range.

R5 must compare the exact prepared-before vs rendered raw cell-node XML for every address in every `ratingScaleStaticRange`, in addition to decoded values. No coercion-based equality.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R5

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R5
NAME = SECURED SEMANTIC RENDERER EXACT T-TOKEN + INDEPENDENT BYTE-ORACLE CLOSURE
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

## 6. R2-C-R5 exact corrective contract

### R5-A — exact `t` token splice

Production mutation must:
- identify target only by exact unprefixed `r="ADDRESS"`;
- replace exact unprefixed `t="old"` with `t="inlineStr"` byte-for-byte in place;
- remove exact unprefixed `t="old"` by deleting ONLY those token characters and preserving all preceding/following whitespace bytes exactly;
- when no unprefixed `t` exists and string type is needed, insert only the authorized minimum separator + `t="inlineStr"` immediately before the original closing delimiter;
- never use `\s*` as part of deletion of existing `t`;
- never trim/rebuild/canonicalize other opening-tag bytes;
- retain all R1-R4 exact-target/formula/missing/duplicate/collision protections.

### R5-B — source-aware production full-sheet preservation

Before return fail closed unless complete `sheet1.xml` equals prepared-before after neutralizing ONLY authorized differences.

Normalization must use prepared-before target authority:
- source target has `t`: replace only the exact unprefixed `t="..."` token contents with a fixed marker on before+after; surrounding bytes remain untouched;
- source target lacks `t`: remove only the exact renderer-authorized inserted separator+`t="..."` sequence from after for comparison; do not consume any pre-existing whitespace;
- neutralize only the authorized target body/value payload;
- preserve all other raw bytes, including delimiter spacing;
- no `.trim()`, `.trimEnd()`, `\s*` delimiter canonicalization or lookalike normalization.

### R5-C — truly independent whitespace-sensitive test oracle

TEST must keep the R4 sentinel target with:
- custom:r/custom:t/data-r/data-t;
- multiple spaces;
- tab;
- newline;
- whitespace immediately after the real unprefixed `t` token before another attribute or closing delimiter.

Implement an oracle separately from production helpers. It must:
- derive before/after target node boundaries independently;
- mask exact authorized body payload;
- mask only the exact unprefixed `t` token or the exact known inserted sequence;
- compare every other byte exactly;
- explicitly assert pre-existing separator bytes after `t` survive.

### R5-D — complete Part B nonwritten + Rating Scale XML closure

For both full-summary and summary-omitted variants at N=6/7/8:
- derive actually-written addresses from Profile `projectionPath` presence;
- iterate every `effectiveSanitizationRanges` address;
- every address outside actually-written set must decode blank;
- retain FULL Chief R:X blank proof;
- for every address in every `ratingScaleStaticRange`, compare exact raw cell-node XML prepared-before vs rendered-after plus decoded value/type parity;
- retain complete b1..b6 static, padding-row, sorted merge inventory, `sheet2.xml`, formulas and input-immutability proof.

### R5-E — preserve all accepted proof

Do not weaken Part A typed truth/omission, Part B typed truth/summary omission, privacy, N7/N8 canonical alias resistance, XML 1.0 validity, package parity, target uniqueness, formula-zero or caller immutability.

If strict proof requires frozen-file change: STOP. Do not weaken tests or broaden scope.

## 7. Runtime / regression gate if R5 is later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
exact t-token whitespace preservation = PASS
production source-aware complete sheet1 equality = PASS
independent byte oracle with post-t whitespace sentinel = PASS
Part A N4..N10 exact typed truth + omission = PASS
Part B N6/N7/N8 full + omitted complete nonwritten blank proof = PASS
Part B complete Rating Scale raw-cell XML parity = PASS
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

No executor is active. R2-C remains NOT CLOSED. R5 is only proposed; it is not authorized.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R5 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`
