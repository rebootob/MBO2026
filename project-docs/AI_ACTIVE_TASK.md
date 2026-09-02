# AI ACTIVE TASK — D2-WP004-R2-PRE1 EVIDENCE-ONLY AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / EVIDENCE-ONLY / NO SOURCE AUTH / NO TEST AUTH / NO PROFILE AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only exact PRE1 inputs listed below.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE1
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = D2-WP004-R2-PRE1-EVIDENCE-20260902-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED EVIDENCE-ONLY / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE1 EVIDENCE-ONLY ตามขอบเขตที่เสนอ`

## 2. R2 frozen design authority
Design document:
`project-docs/phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`

Frozen semantic/profile authority remains:
```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED_KEEP_UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / STRUCTURAL-PRIVACY ONLY
CHIEF_SECURED_WRITABLE_ROLE = 0
```

Production renderer remains blocked until PRE1 is independently reviewed and any required follow-up semantic/projection/profile authority is separately authorized.

## 3. Why PRE1 exists
The exact owner Part B template is N=6. Closed structural expansion for N7/N8 clones source rows 27:30.

Current closed Template Profile proves only:
```text
COMPETENCY_b_SELF_RATING -> partB.competencyItems[b-1].selfRating
```

Current competency evidence proves management competency sets include actual additional competency items 7/8 rather than another copy of competency 6.

Repository evidence does not yet prove:
1. exact workbook target ownership for visible per-competency presentation content in the cloned block; and
2. one deterministic secured projection path/source-selection rule for candidate presentation aliases.

`MboExportService.projectCombinedExport()` currently preserves candidate keys such as:
```text
id / competencyId / code
name / title / competencyName
description
weight / weightPercent
category / group
```
without a renderer-side canonical alias-precedence authority.

No guessing is allowed.

## 4. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE1
```text
WORK_PACKAGE = D2-WP004-R2-PRE1
NAME = PART B EXPANDED COMPETENCY PRESENTATION SEMANTIC EVIDENCE
AUTHORIZATION = D2-WP004-R2-PRE1-EVIDENCE-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = EVIDENCE-ONLY / READ-ONLY OWNER-TEMPLATE INSPECTION / BOUNDED / ONE-SHOT / LOW-CREDIT
EXPECTED_WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md
SOURCE_CHANGE = FORBIDDEN
TEST_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
BASELINE_CHANGE = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

## 5. Exact allowed READ-ONLY inputs
Antigravity may inspect ONLY:
1. exact owner Part B template with SHA256 `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`;
2. `project-docs/CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`;
3. `project-docs/CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`;
4. `project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`;
5. `project-docs/phase-3/evidence/COMPETENCY_SOURCE_EVIDENCE.md` only for current competency-set meaning/count/source context;
6. `src/services/mbo-export-service.js` only for secured projection availability;
7. `src/profiles/mbo-xlsx-template-profile.js` only to avoid colliding with already-frozen roles.

No broad repository scan. Do not inspect unrelated apps/source/docs.

## 6. Exact PRE1 evidence contract

### A. Workbook presentation inventory
Inspect the main Part B sheet only and record static/structural presentation ownership for competency blocks 1..6, with special focus on source block rows 27:30 that is cloned for N7/N8.

For each genuinely visible per-competency candidate presentation element found in the workbook, record only non-personal/static evidence:
- workbook text/label meaning where non-personal/static;
- exact cell/range;
- exact merge relationship;
- source row role;
- whether cloned block 7/8 would inherit stale competency-6 presentation if not rewritten.

Candidate concepts may include name/title, description/criteria, weight/percentage, ordinal/number or other genuinely per-competency presentation content found in the workbook. Do not invent categories that are not present.

### B. Secured projection compatibility
For each candidate presentation concept, compare only to secured `MboExportService` projection availability.

A candidate may become `PROVEN / SAFE_CANDIDATE` only if BOTH are proven:
1. deterministic workbook target ownership; and
2. deterministic secured projection path or an already-authoritative source-selection rule.

If the service exposes multiple aliases without an accepted deterministic source-selection rule, record:
`UNRESOLVED / CANONICAL_PROJECTION_PATH_NOT_PROVEN`

Do not select alias precedence by intuition.

### C. N7/N8 truthfulness decision
Explicitly state for each cloned presentation field whether:
- clone-as-static is valid for all competency sets; OR
- competency 7/8 must be rewritten from secured projection; OR
- authority remains unresolved and Production Renderer stays blocked for N7/N8 presentation.

Do not use old legacy-analysis names to override newer secured/source evidence or exact owner-template evidence.

### D. Privacy/integrity constraints
- zero personal employee values copied into evidence;
- zero workbook mutation/save;
- no Chief writable rating mapping;
- no change to accepted 18/22/5 authority during executor work;
- no formula/scoring inference;
- protected row30/34/38 remains non-dynamic;
- no overlap/duplicate target with existing safe semantic ownership.

### E. Required evidence outputs
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

Antigravity must NOT self-declare Baseline/PASS/CLOSED.

## 7. Executor restrictions
Antigravity must NOT modify:
- source;
- tests;
- Template Profile;
- feasibility source/tests;
- Baselines;
- this control file or other control docs;
- package/package-lock;
- dist;
- owner XLSX;
- Kintone;
- deployment;
- D3.

Exactly one evidence file may be created/edited.

Execution protocol:
```text
fresh-fetch authorized HEAD
-> read exact allowed inputs only
-> inspect owner Part B template READ-ONLY
-> create evidence file only
-> verify git diff contains exactly one allowed file
-> commit once
-> push canonical branch
-> report commit SHA + changed file + concise findings
-> STOP
```

If exact target + exact deterministic secured source cannot both be proven, fail closed and record the blocker. Do not spend credits exploring unrelated repository areas.

## 8. Low-credit rule
- ChatGPT performs repository discovery/design/review.
- Antigravity performs only this exact local owner-template inspection/evidence write.
- No broad scan.
- No architecture redesign by executor.
- No implementation speculation.
- Claude remains STOP.

## 9. Authorization ledger / next action
```text
D2-WP004-R1-R3-R2-SOURCE-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2 = READ-ONLY DESIGN COMPLETE / IMPLEMENTATION NOT AUTHORIZED
D2-WP004-R2-PRE1-EVIDENCE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE EVIDENCE COMMIT
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE1 EVIDENCE CONTRACT EXACTLY, PUSH, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
