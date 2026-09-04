# AI ACTIVE TASK — R2-D1 COMBINED XLSX COMPOSER AUTHORIZED

Mode: **CONTROL PLANE / BOUNDED SOURCE+TEST / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

## Current truth

```text
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
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-D1-SOURCE-TEST-20260904-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-D1-SOURCE-TEST-20260904-01
ACTIVE_D2_EVIDENCE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED / BOUNDED SOURCE+TEST ONLY / MAX 1 COMMIT
CLAUDE = STOP
EXPORT_SERVICE_INTEGRATION = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization: `อนุมัติ D2-WP004-R2-D1 SOURCE+TEST ตามขอบเขตที่เสนอ`

Authorization basis HEAD: `89b72531b91597b24d5847ff1047bbd274a0593a`

Single-use token: `D2-WP004-R2-D1-SOURCE-TEST-20260904-01`

## Frozen Combined XLSX authority

Target output is one `.xlsx` with exactly:
1. `MBO Staff & Chief`
2. `(Part B) Competency`

Part B auxiliary `Sheet1` is excluded.

Accepted PRE1 chain:
```text
OWNER_COMBINED_TEMPLATE = NOT_FOUND
DIRECT_COPY = DIRECT_COPY_UNSAFE_REMAP_REQUIRED
DYNAMIC_PRINT_AREA_PRESERVATION = EXACT
PRINTER_SETTINGS_PART_GRAPH = EXACT
RELATIONSHIP_NAMESPACE_MODEL = EXACT
DEFAULT_STYLE0_PARITY = REMAP_REQUIRED
APP_PROPERTIES = UPDATE_REQUIRED
GLOBAL_REMAP_DEPENDENCIES = EXACT
NEXT_STRATEGY = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP
```

Composer inputs are already-rendered Part A and Part B bytes. Style and shared-string maps MUST be derived from the actual rendered packages; owner-template counts/offsets are evidence only and cannot be fixed production offsets.

## Authorized writable scope

Exactly two NEW files only:

```text
src/services/mbo-xlsx-combined-composer.js
tests/mbo-xlsx-combined-composer.test.js
```

All existing source/tests/Profile/export-service/control docs/package files/template binaries/UI are read-only.

## Source contract

The composer must:
- use rendered Part A as base package;
- validate rendered business-sheet/package authority;
- add only Part B business sheet and exclude auxiliary `Sheet1`;
- derive/check unique workbook rId, sheetId, worksheet/drawing/printerSettings and colliding media paths;
- preserve exact already-rendered Print_Areas and bind final localSheetId 0/1;
- derive and recursively remap actual rendered Part B style references/dependencies, including any cell/row/column/default style class actually present; fail closed on unsupported classes;
- derive actual shared-string references from rendered Part B; no fixed SST offset; preserve inline strings;
- preserve Part A drawing/media/printerSettings authority and copy/retarget Part B dependencies without overwriting Part A parts;
- update workbook.xml, workbook.xml.rels, content types, defined names and docProps/app.xml for exactly two business sheets;
- preserve formula inventory zero, rendered secured scalar values, privacy/sanitization, and caller-byte immutability;
- fail closed on malformed/missing/duplicate/unexpected OOXML authority.

No export-service integration in D1.

## Test contract

Focused test must prove:
- final sheet count/order exactly 2 and no auxiliary sheet;
- exhaustive Part A counts 4..10 x Part B counts 6/7/8 or equivalent exhaustive deterministic matrix;
- exact dynamic Print_Areas and frozen layout/page/protection/merge authority;
- rendered-source-derived style/SST remap with negative control against fixed offsets;
- relevant explicit/default/row/column style handling and fail-closed unsupported topology;
- valid drawing/media/printerSettings relationships and no orphan/duplicate part paths;
- correct app.xml/content types;
- formula inventory zero;
- secured values exact, sanitized/nonwritten cells blank, stale sensitive tokens not reintroduced;
- input bytes immutable;
- fail-closed negative controls for occupied paths/IDs and malformed authority.

Required checks before commit:
```text
node --test tests/mbo-xlsx-combined-composer.test.js
node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-xlsx-semantic-renderer.test.js tests/mbo-export-service.test.js
node --check src/services/mbo-xlsx-combined-composer.js
git diff --check
git diff --name-only
```

Focused test requires FAIL=0 and SKIP=0. Frozen regression requires FAIL=0. `git diff --name-only` must show only the two authorized new files.

## Stop boundary

Maximum one implementation commit. Suggested message: `feat(d2): add isolated combined xlsx composer foundation (R2-D1)`.

After push, STOP for independent ChatGPT review. Export-service integration, generated artifact publication, Kintone writes/deploy/Live UAT, PDF and D3 remain unauthorized.
