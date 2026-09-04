# AI ACTIVE TASK — R2-D PRE1 EVIDENCE PASS / CLOSED / D1 COMPOSER PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file. Do not reopen R2-B1/R2-B2/R2-C or the R2-D PRE1 evidence chain without a proven regression.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED
D2_WP004_R2_B1 = PASS / CLOSED / FROZEN
D2_WP004_R2_B2 = PASS / CLOSED / FROZEN
D2_WP004_R2_C = PASS / CLOSED / FROZEN
R2_C_RUNTIME_EVIDENCE = PASS / OWNER WORKSTATION

D2_WP004_R2_D_PRE1 = PASS / CLOSED / FROZEN
D2_WP004_R2_D_PRE1_R1 = PASS / CLOSED / FROZEN
D2_WP004_R2_D_PRE1_R2 = PASS / CLOSED / FROZEN
R2_D_COMBINED_XLSX_EVIDENCE = PASS / CLOSED

D2_WP004_R2_D1 = PROPOSED / NOT AUTHORIZED

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_EVIDENCE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
COMBINED_EXCEL_PARITY = IMPLEMENTATION PLANNING / NOT AUTHORIZED
D3 = HOLD
```

## 2. Reviewed PRE1 evidence chain

Evidence commits:

```text
PRE1    = a77cbf6317b5744e0b9a0d696ab293878563c89d
PRE1-R1 = 4b2cea2ecaecbb9438d476b0ce5bf7f40088aab2
PRE1-R2 = a5ffbe8440a5236ba040c8f5fc06af6b8a233c76
```

R2 authorization basis:
`526ac796d976ec06427d0fecd0c076f640ffab98`

R2 scope review:

```text
AHEAD_BY = 1
BEHIND_BY = 0
CHANGED_FILES = 1
ONLY_CHANGED_FILE = project-docs/phase-3/evidence/XLSX_COMBINED_WORKBOOK_COMPOSITION_EVIDENCE.md
SOURCE_CHANGE = 0
TEST_CHANGE = 0
TEMPLATE_BINARY_CHANGE = 0
```

Authorization token `D2-WP004-R2-D-PRE1-R2-EVIDENCE-ONLY-20260904-01` is CONSUMED.

## 3. Frozen Combined XLSX evidence authority

```text
OWNER_COMBINED_TEMPLATE = NOT_FOUND
PART_B_AUXILIARY = AUXILIARY_NOT_REQUIRED_FOR_COMBINED
DIRECT_COPY = DIRECT_COPY_UNSAFE_REMAP_REQUIRED
DYNAMIC_PRINT_AREA_PRESERVATION = EXACT
PRINTER_SETTINGS_PART_GRAPH = EXACT
RELATIONSHIP_NAMESPACE_MODEL = EXACT
DEFAULT_STYLE0_PARITY = REMAP_REQUIRED
APP_PROPERTIES = UPDATE_REQUIRED
GLOBAL_REMAP_DEPENDENCIES = EXACT
NEXT_STRATEGY = POST_RENDER_OOXML_COMPOSITION_WITH_EXACT_REMAP
```

Combined target remains exactly:

```text
ONE .xlsx
Sheet 1 = MBO Staff & Chief
Sheet 2 = (Part B) Competency
```

Part B auxiliary `Sheet1` is excluded from final Combined output.

Frozen owner SHAs:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
THEME_SHA256_BOTH = e6029ab4958414b8bb862b17ffed3a708d1513e61a07d88e966071cca31d1bd4
```

Print_Area acceptance authority remains dynamic:

```text
Part A objectiveCount 4..10:
'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58

Part B:
N=6 -> '(Part B) Competency'!$A$1:$X$35
N=7 -> '(Part B) Competency'!$A$1:$X$39
N=8 -> '(Part B) Competency'!$A$1:$X$43
```

The future composer must read and preserve the exact already-rendered Print_Area values; it must not derive them from count.

## 4. Important implementation authority added by independent review

The composer consumes **already-rendered** Part A and Part B bytes, not raw owner templates.

Production renderer truth:
- semantic renderer mutates `xl/worksheets/sheet1.xml` only;
- all other rendered package entries are required byte-equal to prepared input.

Preparer truth:
- preparer may sanitize/purge sensitive text inside `xl/sharedStrings.xml` before rendering while preserving package structure.

Therefore the future composer MUST derive style and shared-string mapping from the **actual rendered input packages**. Owner-template counts/indices from PRE1/R1 are evidence/acceptance authority only and MUST NOT be used as unconditional production offsets such as fixed `429 + n` or `127 + n`.

All style-bearing references in the actual rendered Part B worksheet/package must be enumerated before composition, including cell style references and any row/column/default style references that are present. The implementation must fail closed on an unhandled style reference class.

## 5. Exact next proposal — D2-WP004-R2-D1

```text
WORK_PACKAGE = D2-WP004-R2-D1
NAME = ISOLATED POST-RENDER COMBINED XLSX COMPOSER FOUNDATION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / LOW-CREDIT / NO EXPORT-SERVICE INTEGRATION
MAX_EXECUTOR_COMMITS = 1
PROPOSED_NEW_SOURCE = src/services/mbo-xlsx-combined-composer.js
PROPOSED_NEW_TEST = tests/mbo-xlsx-combined-composer.test.js
```

If later authorized, writable scope is ONLY the two NEW files above. Existing preparer, renderer, Profile, export service, tests, control docs and template binaries remain read-only.

### D1 proposed source contract

Input:
- already-rendered Part A `Uint8Array`;
- already-rendered Part B `Uint8Array`.

Output:
- one new Combined XLSX `Uint8Array` containing exactly the two business sheets.

Required behavior:
1. Use rendered Part A package as base authority.
2. Validate rendered Part A/Part B business-sheet identities and exact expected package authority before composition.
3. Exclude Part B auxiliary `Sheet1`.
4. Derive/check free workbook relationship ID, unique workbook sheetId, worksheet part path, drawing part path, printerSettings part path and any genuinely colliding media path. Never hard-code evidence candidates without checking availability.
5. Preserve each already-rendered Print_Area value and rebind final localSheetId 0/1.
6. Derive actual rendered Part B style-reference set, recursively map every referenced cellXf dependency into the combined style tables, and fail closed on any unhandled style-bearing reference or dependency.
7. Derive actual rendered shared-string references and actual source `sharedStrings.xml`; build a source-derived translation map. No fixed SST offsets.
8. Preserve inline-string cells emitted by the secured renderer without converting them back to shared strings.
9. Preserve Part A drawing/media authority. Copy Part B drawing to a derived free drawing part and retarget sheet relationships. Rename media only on an actual full-OPC-path collision or if a derived defensive path is explicitly used.
10. Preserve Part A printer settings; copy Part B printer settings to a derived free path and retarget Part B worksheet relationship.
11. Update workbook.xml, workbook.xml.rels, `[Content_Types].xml`, defined names and `docProps/app.xml` exactly as required for the final two-sheet package.
12. Content-type handling must be source-derived: reuse a valid existing Default content type when it already covers a new extension; add/adjust Override/Default only when required by actual package authority.
13. Preserve formula inventory = 0.
14. Preserve privacy guarantees: composer operates only on rendered/sanitized bytes and must not reintroduce purged sensitive values from owner-template evidence.
15. Caller input bytes remain immutable.
16. Fail closed on malformed/duplicate/missing OOXML authority or unexpected relationship/style/SST topology.

### D1 proposed test contract

Tests must independently prove at minimum:
- exactly two final business sheets in correct order;
- no auxiliary Part B `Sheet1`;
- all Part A objective counts 4..10 and Part B competency counts 6/7/8 (full 7 x 3 matrix or an equivalently exhaustive deterministic matrix);
- exact preserved dynamic Print_Areas;
- exact sheet dimensions/page setup/protection/merge authority from frozen Part A/Part B baselines;
- style/SST translation derived from rendered package truth, including a guard that rejects fixed-offset assumptions;
- explicit and implicit/default style reference handling;
- drawing/media/printerSettings relationships resolve to existing unique parts;
- no orphan/duplicate package relationships or part paths;
- `docProps/app.xml` two-sheet/two-named-range authority;
- content types cover every added part without conflicting declarations;
- formula inventory zero;
- secured rendered scalar values remain exact after composition;
- privacy-sensitive sanitized/nonwritten cells remain blank and stale sensitive tokens are not reintroduced;
- caller Part A/Part B bytes are unchanged;
- negative controls for occupied candidate IDs/paths and malformed dependency topology fail closed.

## 6. Stop boundary

D2-WP004-R2-D1 is only a proposal. No source/test implementation is authorized yet.

Antigravity = STOP.
Claude = STOP.
Combined XLSX export-service integration, generated artifact publication, Kintone writes, deploy, Live UAT, PDF and D3 remain forbidden until separately authorized.

Recommended owner approval phrase:

`อนุมัติ D2-WP004-R2-D1 SOURCE+TEST ตามขอบเขตที่เสนอ`
