# AI ACTIVE TASK — D2-WP004-R2 DESIGN COMPLETE / R2-PRE1 EVIDENCE PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / READ-ONLY NEXT / NO SOURCE AUTH / NO TEST AUTH / NO EVIDENCE AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only directly relevant Baseline/source/evidence needed for the exact next decision.

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
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. R2 READ-ONLY design authority
Design document:
`project-docs/phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`

Durable dependencies:
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

Frozen semantic/profile authority remains:
```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / STRUCTURAL-PRIVACY ONLY
CHIEF_SECURED_WRITABLE_ROLE = 0
```

## 3. R2 architecture decisions already proven from repository truth
1. `MboExportService` secured projection is the only renderer data authority. Renderer must not accept/read raw App794/Kintone data.
2. Employee-Self intentionally omits confidential evaluator/summary/final values. Globally SAFE role != mandatory role in every request. Only write a safe role when its exact secured path is present in that request projection; otherwise leave/force target sanitized blank.
3. `xlsx-populate@1.21.0` already exists; package changes are not required.
4. Kintone UI is browser-bundled. Production XLSX core must not depend on Node `fs`/path template discovery.
5. Production processing should be bytes/buffer-like input -> new output bytes, preserving caller input bytes.
6. `scripts/export/mbo-xlsx-ooxml-feasibility.js` is accepted proof authority but must not be imported wholesale into production. Its structural builders contain proof-only `SENTINEL_ROW_29` / `SENTINEL_ROW_31` mutation and local filesystem assumptions.
7. Sanitization is broader than the 18 writable targets; unresolved/no-source/confidential/template-sample regions must also be cleared as required by the privacy authority before secured writes.
8. Important cell/range/layout/sanitization geometry must remain centralized in the Template Profile/mapping layer, not scattered in renderer functions.
9. Excel scoring/recalculation/formulas remain forbidden. Output formula inventory must be exactly zero.

## 4. Proven pre-render blocker
The exact owner Part B template is N=6. Closed structural expansion for N7/N8 clones source rows 27:30.

Current closed Template Profile proves only:
```text
COMPETENCY_b_SELF_RATING -> partB.competencyItems[b-1].selfRating
```

Current competency source evidence proves management competency sets include actual additional competency items 7/8 rather than another copy of competency 6.

However repository evidence does NOT currently prove the writable cell/range ownership for visible presentation content in a competency block (candidate name/title/description/weight/etc.) and does NOT establish one deterministic secured projection path/source-selection rule for those presentation aliases.

`MboExportService.projectCombinedExport()` currently preserves candidate keys including:
```text
id / competencyId / code
name / title / competencyName
description
weight / weightPercent
category / group
```
without defining renderer-side alias precedence.

If renderer implementation starts now, N7/N8 can become structurally valid but visibly incorrect/duplicated or can require unproven alias inference. That is forbidden.

## 5. Proposed prerequisite — D2-WP004-R2-PRE1 / NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE1
NAME = PART B EXPANDED COMPETENCY PRESENTATION SEMANTIC EVIDENCE
STATE = PROPOSED / NOT AUTHORIZED
MODE = EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / BOUNDED / ONE-SHOT IF AUTHORIZED / LOW-CREDIT
EXPECTED_WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md
SOURCE_CHANGE = NOT AUTHORIZED
TEST_CHANGE = NOT AUTHORIZED
PROFILE_CHANGE = NOT AUTHORIZED
RENDERER_CHANGE = NOT AUTHORIZED
```

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE1 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`

## 6. Exact proposed PRE1 contract
If later authorized, Antigravity may create/edit ONLY:
`project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md`

READ-ONLY inputs allowed:
1. exact owner Part B template with SHA `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
2. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`;
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`;
4. `project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
5. `project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md` only for current competency-set meaning/count/source context;
6. `src/services/mbo-export-service.js` only for secured projection availability;
7. `src/profiles/mbo-xlsx-template-profile.js` only to avoid colliding with already-frozen roles.

No broad repository scan. Do not inspect unrelated apps/source/docs.

### A. Workbook presentation inventory
Inspect the main Part B sheet only and record static/structural presentation ownership for competency blocks 1..6, with special focus on source block rows 27:30 that is cloned for N7/N8.

For each visible per-competency candidate presentation element, record only static label/geometry evidence:
- workbook text/label meaning where non-personal/static;
- exact cell/range;
- exact merge relationship;
- source row role;
- whether cloned block 7/8 would inherit stale competency-6 presentation if not rewritten.

Candidate concepts may include name/title, description/criteria, weight/percentage, ordinal/number or other genuinely per-competency presentation content found in the workbook. Do not invent categories that are not present.

### B. Secured projection compatibility
For each candidate presentation concept, compare only to secured `MboExportService` projection availability.

A candidate may become `PROVEN / SAFE_CANDIDATE` only if BOTH are proven:
1. deterministic workbook target ownership;
2. deterministic secured projection path or an already-authoritative source-selection rule.

If the service merely exposes multiple aliases without an accepted deterministic source-selection rule, record:
`UNRESOLVED / CANONICAL_PROJECTION_PATH_NOT_PROVEN`

Do not select alias precedence by intuition.

### C. N7/N8 truthfulness decision
Explicitly state for each cloned presentation field whether:
- clone-as-static is valid for all competency sets; OR
- competency 7/8 must be rewritten from secured projection; OR
- authority remains unresolved and Production Renderer stays blocked for N7/N8 presentation.

Do not use old legacy-analysis names to override newer source evidence or exact owner-template evidence.

### D. Privacy/integrity constraints
- zero personal employee values copied into evidence;
- zero workbook mutation/save;
- no Chief writable rating mapping;
- no change to the accepted 18/22/5 Baseline during executor work;
- no formula/scoring inference;
- protected row30/34/38 remains non-dynamic;
- no overlap/duplicate target with existing safe semantic ownership.

### E. Final evidence outputs
Evidence must include:
```text
OWNER_PART_B_SHA = EXACT MATCH / BLOCKER
PRESENTATION_CANDIDATE_COUNT = <mechanical count>
PROVEN_SAFE_CANDIDATES = <count + roles>
UNRESOLVED_CANDIDATES = <count + roles/reasons>
DUPLICATE_EXISTING_SAFE_TARGETS = 0
N7_PRESENTATION_TRUTHFULNESS = PROVEN / BLOCKED
N8_PRESENTATION_TRUTHFULNESS = PROVEN / BLOCKED
SOURCE_TEST_PROFILE_RENDERER_CHANGE = 0
```

Evidence status must be neutral:
`EVIDENCE CANDIDATE / AWAITING INDEPENDENT REVIEW`

Do not self-declare Baseline/PASS/CLOSED.

### F. Executor restrictions
Do NOT modify source, tests, Template Profile, feasibility source/tests, Baselines/control docs, packages, dist, owner XLSX, Kintone, deployment or D3.

Exactly one evidence or blocker commit, push, report, STOP.

## 7. R2 planned sequence after PRE1
Not authorized yet:
1. `R2-PRE1` exact presentation evidence;
2. if needed, smallest semantic/projection/profile corrective to establish only independently proven presentation roles;
3. centralized template geometry + sanitization topology;
4. sentinel-free production template preparation/sanitizer engine;
5. secured semantic value renderer;
6. independent renderer closure;
7. Combined Excel parity remains a later D2 gate.

## 8. Low-credit rule
- ChatGPT performs repository discovery/design/review.
- Antigravity is used only for exact local owner-template inspection or bounded implementation that ChatGPT cannot perform from repository truth.
- PRE1, if authorized, reads only the exact files listed above and the one owner template; no whole-repo scan.
- Claude remains STOP unless later explicitly justified/authorized.

## 9. Authorization ledger / exact next action
```text
D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2 = READ-ONLY DESIGN COMPLETE / IMPLEMENTATION NOT AUTHORIZED
D2-WP004-R2-PRE1 = PROPOSED / NOT AUTHORIZED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP004-R2-PRE1 EVIDENCE-ONLY
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
