# D2-WP004-R2 — PRODUCTION XLSX RENDERER + SANITIZER READ-ONLY DESIGN

> Status: **CONTROL-PLANE READ-ONLY DESIGN COMPLETE / IMPLEMENTATION NOT AUTHORIZED**  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Design basis HEAD: `483307f9bb97ee3e728dcd7b5b58db43da3d5eeb`  
> Updated: 2026-09-02 ICT

## 1. Objective

Design the smallest maintainable path from the closed XLSX Template Profile to a production XLSX renderer/sanitizer without widening semantic authority, rebuilding scoring in Excel, weakening privacy, or wasting Antigravity credit on repository discovery.

## 2. Closed authority consumed by R2

R2 must preserve all closed gates:
- D2 Preservation / accepted Part B Option-B `Sheet1 <sheetPr/>` normalization only;
- D2 Reference Image removal authority;
- D2 Part A Structural N=4..10;
- D2 Part B Structural N=6/7/8;
- D2 Formula Authority / production formula inventory exactly zero;
- D2 Expanded Part B Privacy;
- D2 XLSX Semantic Mapping 18 SAFE / 22 UNRESOLVED / 5 NO SOURCE;
- D2 XLSX Template Profile PASS/CLOSED;
- centralized Template Profile mapping and no scattered important workbook addresses.

## 3. Repository integration findings

### 3.1 Secured projection boundary
`src/services/mbo-export-service.js` is the export-data authority. The renderer must consume its secured projection only and must not accept raw App794 records as a renderer input.

Employee-Self projection deliberately omits confidential evaluator/summary/final values. Therefore a role being globally SAFE_TO_MAP does not mean that value is present for every export context.

Production write rule:
```text
WRITE = role is SAFE_TO_MAP
        AND exact secured projection path is present for this request/context
```

If an otherwise-safe path is absent because `MboExportService` omitted it:
- clear/sanitize the target;
- do not reconstruct it;
- do not read raw Kintone data;
- do not calculate a replacement.

### 3.2 Dependency/runtime boundary
`xlsx-populate@1.21.0` already exists in `package.json`; no package change is needed.

The Kintone UI bundle is built with esbuild `platform: browser`. Production XLSX core therefore must not depend on Node `fs`/path-based template discovery.

Preferred core contract:
```text
OWNER TEMPLATE BYTES / PREPARED BYTES IN
  -> BUFFER/UINT8ARRAY-STYLE PROCESSING
  -> NEW OUTPUT BYTES OUT
```

Template loading/download belongs to a later adapter/integration layer.

### 3.3 Feasibility source is authority, not production code
`scripts/export/mbo-xlsx-ooxml-feasibility.js` contains accepted proof algorithms for:
- structural row/block expansion;
- dimension repair/preservation;
- Option-B Part B `Sheet1 <sheetPr/>` normalization;
- reference-image removal;
- Part B privacy-role validation/sanitization;
- package/shared-string token purge;
- parity/formula inspection.

Do **not** import this file wholesale into browser production code because it is a proof harness with Node `fs`/path/crypto behavior and local template discovery.

Do **not** call its structural buffer builders directly in production because they inject proof-only sentinels:
```text
Part A: SENTINEL_ROW_29
Part B: SENTINEL_ROW_31
```
Production transforms must be sentinel-free while preserving the accepted algorithms/invariants.

### 3.4 Sanitization is broader than the 18 writable roles
Feasibility privacy ranges include unresolved/no-source regions and broad dynamic regions. A renderer that clears only the 18 SAFE write targets can leave stale/template sample/confidential values behind.

Therefore sanitization topology must be centralized in the Template Profile/layout authority and must execute before secured values are written.

## 4. Proven pre-render blocker — Part B N7/N8 competency presentation

The current Part B owner template is the Staff & Chief N=6 template. Closed structural feasibility expands N7/N8 by cloning source rows 27:30.

Current semantic/profile writable authority for competency items contains only:
```text
COMPETENCY_b_SELF_RATING -> partB.competencyItems[b-1].selfRating
```

There is no proven writable semantic target today for competency presentation fields such as name/title/description/weight.

Current competency evidence proves management profiles have additional competency items 7 and 8 rather than a duplicate of item 6. Therefore cloning the sixth competency block without a proven presentation rewrite can produce a workbook whose structure is correct but whose visible competency 7/8 content is duplicated, blank, or otherwise untruthful.

This is a production correctness blocker and must be resolved before renderer implementation.

## 5. Projection-shape ambiguity for competency presentation

`MboExportService.projectCombinedExport()` preserves multiple candidate presentation keys for Employee-Self, including:
```text
id / competencyId / code
name / title / competencyName
description
weight / weightPercent
category / group
```

It does not currently establish one deterministic canonical presentation path equivalent to the already-proven `selfRating` path.

R2 must not invent alias precedence inside the renderer. Exact presentation cell ownership and exact secured source-selection/canonical path must be proven first. If no deterministic source path is established, the presentation role stays unresolved/fail-closed.

## 6. Required prerequisite — evidence before implementation

### Proposed `D2-WP004-R2-PRE1`
```text
NAME = PART B EXPANDED COMPETENCY PRESENTATION SEMANTIC EVIDENCE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / READ-ONLY INSPECTION / ONE-SHOT / LOW-CREDIT
EXPECTED_WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md
SOURCE_CHANGE = NOT AUTHORIZED
TEST_CHANGE = NOT AUTHORIZED
PROFILE_CHANGE = NOT AUTHORIZED
RENDERER_CHANGE = NOT AUTHORIZED
```

The evidence pass must inspect only the exact owner Part B template and directly relevant secured projection/source evidence needed to answer:
1. exact static presentation cells/merged ranges in each 4-row competency block, especially source block rows 27:30;
2. exact presentation fields that must change when block 6 is cloned to competency 7/8;
3. whether workbook targets for competency name/title/description/weight/other presentation fields can be proven from labels/geometry rather than proximity;
4. exact secured projection path or deterministic source-selection authority for each candidate role;
5. whether each candidate becomes SAFE_TO_MAP, stays UNRESOLVED, or has NO_SECURED_PROJECTION_SOURCE;
6. zero overlap with `SELF_RATING` / Chief authority and protected padding rows;
7. no personal values copied to evidence.

If exact target + exact secured source cannot both be proven, mark the role unresolved. Do not infer.

## 7. Planned R2 implementation sequence after PRE1 closes

Do not authorize these until PRE1 is independently reviewed.

### R2-A — centralized template geometry + sanitization topology
Likely bounded profile/test extension. Goal: keep structural/sensitive ranges, relocation geometry, protected rows, reference-image/preservation metadata and sanitization topology in the centralized Template Profile layer. Semantic 18/22/5 authority may expand only if PRE1 independently proves new safe roles.

### R2-B — sentinel-free production template preparation/sanitizer engine
Buffer-in/buffer-out production engine. It must:
- validate exact template identity;
- perform Part A N4..10 and Part B N6..8 structural transforms without proof sentinels;
- preserve/repair accepted OOXML invariants;
- remove the accepted reference image only;
- validate Part B privacy topology before mutation;
- clear all sensitive/dynamic/unresolved/no-source output areas required by the profile;
- purge sensitive shared-string/package remnants;
- preserve protected static cells;
- output formula inventory exactly zero;
- never mutate caller/source bytes in place.

### R2-C — secured semantic value renderer
Consumes only sanitized prepared buffers + secured `MboExportService` projection + Template Profile. It writes only proven SAFE roles whose exact secured paths are present. No raw Kintone input, no scoring calculation, no semantic aliases, no scattered cell literals.

Combined Excel parity remains a later D2 gate after the production renderer/sanitizer closes.

## 8. Low-credit policy

For R2:
- ChatGPT Control Plane performs repository discovery/design/review;
- Antigravity is used only when exact local owner-template inspection or bounded source implementation is necessary;
- no broad repository scan by Antigravity;
- Claude remains STOP unless a later material high-risk ambiguity cannot be resolved independently;
- each executor authorization is one-shot with an exact writable-file list.

## 9. Current decision

```text
D2-WP004-R2 = READ-ONLY DESIGN COMPLETE / IMPLEMENTATION BLOCKED ON PRE1 EVIDENCE
D2-WP004-R2-PRE1 = PROPOSED / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
