# AI ACTIVE TASK — R2-A CLOSED / R2-B1 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only directly relevant frozen Baselines/profile/source/tests for the exact next gate.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION = PASS / CLOSED
D2_REFERENCE_IMAGE = PASS / CLOSED
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED
D2_FORMULA_AUTHORITY = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
R2_READ_ONLY_DESIGN = COMPLETE
D2_WP004_R2_PRE1 = PASS / CLOSED
D2_WP004_R2_PRE1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2 = READ-ONLY DESIGN COMPLETE
D2_WP004_R2_PRE2_R1 = PASS / CLOSED AFTER CORRECTIVE
D2_WP004_R2_PRE2_R1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2_R2 = PASS / CLOSED
D2_WP004_R2_PRE2_R3 = PASS / CLOSED AFTER CORRECTIVE CHAIN THROUGH R4
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_A_R1 = PASS / CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. R2-A / R2-A-R1 closure identity

```text
R2_A_AUTHORIZATION = D2-WP004-R2-A-PROFILE-TEST-20260902-01
R2_A_AUTHORIZATION_COMMIT = 3a629e00466b82bee65dcfb146d81577e7c319d5
R2_A_IMPLEMENTATION_COMMIT = 6dcfba1277462f230a5cd9379aacb96193253ac1
R2_A_REVIEW = NEEDS CORRECTIVE

R2_A_R1_AUTHORIZATION = D2-WP004-R2-A-R1-PROFILE-TEST-CORRECTIVE-20260902-01
R2_A_R1_AUTHORIZATION_COMMIT = e70c90049af0aed4a33851b98c226d5c86bb9c39
R2_A_R1_IMPLEMENTATION_COMMIT = 9a93adf69a0d029fc810b6121f3f8dfe228f0c42
R2_A_R1_AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
R2_A_R1_CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
R2_A_R1_SCOPE_REVIEW = PASS
R2_A_R1_CONTENT_REVIEW = PASS
R2_A_R1_TOKEN_STATE = CONSUMED / DO NOT REUSE
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

## 3. Closed production layout + sanitization profile authority

The centralized Template Profile remains pure/browser-safe and contains no workbook I/O, Node fs/path/crypto dependency, Kintone/network access, local-template discovery or proof sentinel behavior.

### Part A N=4..10

```text
BASE_OBJECTIVE_COUNT = 4
SOURCE_CLONE_ROW = 28
DOWNSTREAM_THRESHOLD_ROW = 29
EXTRA_ROWS = N - 4
MAIN_SHEET = MBO Staff & Chief
DIMENSION = A1:BL52 .. A1:BL58
PRINT_AREA = 'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58
PAPER_SIZE = 8
ORIENTATION = landscape
SCALE = 58
FORMULA_AUTHORITY = 0
PART_A_TEMPLATE_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
```

Base and count-aware effective sanitization range authority is centralized in the Profile. Production `validateMappingIntegrity()` validates exact topology, deterministic expansion and duplicate-free effective address authority.

### Part B N=6/7/8 — CLOSED AUTHORITY, NOT IN B1 IMPLEMENTATION

Part B structural/privacy/presentation authority remains closed and unchanged, but production Part B preparation is intentionally deferred to a later bounded B2 gate. B1 must contain no Part B transform or sanitization implementation.

No semantic authority is widened and no secured semantic values are written in B1.

## 4. Why full R2-B is split

The repository currently has no production XLSX preparer/renderer source. The accepted feasibility harness is Node-only proof code with local `fs`/path/crypto discovery and proof sentinels and therefore cannot be imported wholesale into the browser production bundle.

Implementing Part A + Part B + package cleanup + privacy + presentation overlay in one first production commit would be unnecessarily large and difficult to independently review. Therefore R2-B is split into bounded production layers:

```text
R2-B1 = PART A SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER FOUNDATION
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C  = SECURED SEMANTIC VALUE RENDERER
```

This split does not reduce final R2-B requirements; it only narrows implementation/review scope.

## 5. Exact next proposed gate — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1
NAME = PART A SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER FOUNDATION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / PRODUCTION CORE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js        [NEW]
  tests/mbo-xlsx-template-preparer.test.js          [NEW]

MAX_EXECUTOR_COMMITS = 1
```

Read-only authorities/dependencies:
- `src/profiles/mbo-xlsx-template-profile.js`
- `project-docs/phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- accepted D2 Reference Image proof in the feasibility source/tests
- exact Part A feasibility algorithms only as implementation reference/oracle
- existing `xlsx-populate@1.21.0`; no dependency change is required

## 6. B1 production contract

The new production module must be browser-compatible and provide a bounded asynchronous bytes-in -> new-bytes-out Part A preparation path.

Required behavior:
1. accept owner-template bytes plus objective count N=4..10; do not discover local files;
2. copy/normalize caller input before any mutation and never mutate caller/source bytes in place;
3. validate `MboXlsxTemplateProfile` integrity before template-dependent mutation;
4. compute/validate exact Part A SHA-256 before mutation using browser-compatible capability (`globalThis.crypto.subtle` or an equivalently browser-safe injected digest path); production code must not import `node:crypto`;
5. reject wrong template bytes/hash, invalid objective count, malformed profile/topology or unavailable required crypto capability before template-dependent mutation;
6. perform the accepted Part A row/merge relocation for N4..N10 without `SENTINEL_ROW_29` or any proof marker;
7. preserve accepted structural invariants: rows 1:28, inserted clone rows, downstream relocation, merge topology, dimension, Print_Area and page setup;
8. sanitize exactly the count-aware `effectiveSanitizationRanges` supplied by the production Template Profile before any later semantic writer exists;
9. collect stale/sensitive pre-sanitize values and purge their stale package/shared-string remnants according to accepted privacy proof, without broad unrelated string mutation;
10. remove ONLY the accepted Part A reference image after proving exact target identity:
    - drawing anchor embeds `rId3` exactly once before removal;
    - relationship tuple targets `../media/image3.png` with image relationship type;
    - `xl/media/image3.png` exists exactly as the accepted target;
    - remove only that exact anchor/relationship/media target;
    - preserve non-target branding relationships/media including accepted `rId1` and `rId2` topology;
    - if target identity/cardinality is unresolved or the media remains referenced elsewhere, fail closed;
11. preserve all unrelated package relationships/media/drawing topology after normalizing only the accepted reference-image removal;
12. output formula inventory exactly zero;
13. perform NO semantic/user-value writes, NO scoring/recalculation and NO Part B mutation;
14. return new browser-usable bytes (`Uint8Array`/ArrayBuffer-compatible) and no filesystem side effects.

Production source MUST NOT import/use:
```text
node:fs
node:path
node:crypto
fs
path-based template discovery
process cwd/env for template lookup
scripts/export/mbo-xlsx-ooxml-feasibility.js
proof sentinels
Kintone APIs
raw App794 records
```

Test-only Node helpers/local template discovery remain allowed only inside the test file when needed to obtain the exact local owner template or inspect OOXML. Production source must remain independent of them.

## 7. Proposed focused B1 test contract

Focused command:
`node --test tests/mbo-xlsx-template-preparer.test.js`

At minimum prove:
1. production source is browser-safe and contains no Node filesystem/path/crypto/template-discovery dependency;
2. production source does not import the feasibility harness and contains no sentinel strategy/string;
3. production API accepts byte input and returns new byte output;
4. caller/source bytes remain byte-identical after success and failure paths;
5. exact Part A owner-template SHA is accepted and wrong/tampered identity rejects before transform;
6. N=4..10 accepted; <4, >10, non-integer reject;
7. malformed/overridden production Profile topology rejects through real production validation;
8. rows 1:28 preserve accepted structural identity;
9. each inserted objective row is the accepted normalized clone of source row 28;
10. original rows >=29 relocate exactly by `N-4`;
11. merge inventory/count equals accepted Part A structural authority for all N4..N10;
12. dimension equals `A1:BL52` .. `A1:BL58` exactly;
13. Print_Area equals `'MBO Staff & Chief'!$A$1:$BJ$52` .. `$BJ$58` exactly;
14. page setup remains paperSize 8 / landscape / scale 58;
15. every address in Profile `effectiveSanitizationRanges` is sanitized before any semantic write layer;
16. stale sensitive tokens collected pre-sanitize are absent from final cell/package/shared-string content where frozen proof requires purge;
17. same-count sanitization topology substitution or unexpected protected/static mutation fails closed;
18. exact reference image target `rId3 -> ../media/image3.png -> xl/media/image3.png` is absent after preparation;
19. branding/non-target relationships/media including `rId1` and `rId2` remain present and unrelated relationship/media inventory is unchanged after accepted normalization;
20. synthetic wrong reference-image tuple/cardinality/orphan condition rejects fail closed;
21. formula inventory remains exactly zero for N4..N10;
22. no secured semantic/user values are written and no scoring/calculation logic is introduced;
23. no Part B worksheet/topology is modified by B1;
24. tests call the new production preparer; feasibility helpers may be used only as test-side oracle/inspection support, never as the production implementation.

Real owner-template integration tests may use existing local template discovery in TEST ONLY. If exact local owner template is unavailable, that integration portion may skip explicitly, but always-runnable synthetic/browser-safety/fail-closed tests must still run; an environment skip is not sufficient evidence to close B1 by itself. Independent review must see an accepted real-template execution result before B1 closure.

## 8. Forbidden B1 scope

```text
src/services/mbo-export-service.js = FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
package.json / package-lock.json = FORBIDDEN
UI/main/export-button integration = FORBIDDEN
dist = FORBIDDEN
Part B production transform/sanitizer = FORBIDDEN
R2-C semantic value writing = FORBIDDEN
Combined Excel parity = FORBIDDEN
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

B1 must not create a broad generic framework beyond what Part A production preparation needs.

## 9. What remains after B1 — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
  Part B N6/N7/N8 structural transform
  presentation overlay
  Option-B Sheet1 normalization
  exact privacy/sanitization + package purge
  protected Rating Scale/padding preservation
  package/reference-image preservation/removal authority as applicable

R2-C = SECURED SEMANTIC VALUE RENDERER
  consume sanitized prepared bytes + secured MboExportService projection + Template Profile
  write only SAFE roles whose exact secured paths are present
  no raw Kintone / aliases / scoring

COMBINED_EXCEL_PARITY = later D2 gate
D2_FINAL_CLOSURE = after production preparer + semantic renderer + parity closure
D3 = HOLD UNTIL D2 PASS / CLOSED
```

## 10. Owner decision

No executor permission is created by this proposal.

```text
D2-WP004-R2-B1 = PROPOSED / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = NOT AUTHORIZED
KINTONE_WRITE = NONE
DEPLOY = NONE
D3 = HOLD
```

Owner approval phrase, if accepted:
`อนุมัติ D2-WP004-R2-B1 SOURCE+TEST ตามขอบเขตที่เสนอ`
