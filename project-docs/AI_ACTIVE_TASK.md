# AI ACTIVE TASK — D2-WP004-R2-PRE2 DESIGN COMPLETE

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO SOURCE AUTH / NO TEST AUTH / NO PROFILE AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> only exact files needed for the next gate.

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

## 2. PRE2 design authority

Design document:
`project-docs/phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`

Design basis HEAD:
`0e6fe2139578663f1c1d55e2cd6a223e389e55f9`

Design commit:
`152abf44e6ecae27db6f3acd4aab43bf06f769c9`

Owner authorization:
`อนุมัติ D2-WP004-R2-PRE2 READ-ONLY DESIGN ตามขอบเขตที่เสนอ`

PRE2 was performed by ChatGPT Control Plane only. Antigravity was not used.

## 3. PRE2 decisions

### 3.1 Existing six competency presentations remain static owner-template authority

```text
COMPETENCY_1_TO_6_TITLE = OWNER_TEMPLATE_STATIC_AUTHORITY
COMPETENCY_1_TO_6_DESCRIPTION = OWNER_TEMPLATE_STATIC_AUTHORITY
COMPETENCY_1_TO_6_PRESENTATION_WRITE = FORBIDDEN
```

Only inserted competencies 7/8 require dynamic presentation authority.

### 3.2 Canonical expanded semantic identity and secured fields

```text
b=7 -> COMP_LEAD
b=8 -> COMP_STRAT

CANONICAL_IDENTITY = code
ALIAS_PRECEDENCE = FORBIDDEN
```

Future secured projection must expose:

```text
partB.competencyItems[b-1].presentationTitle
partB.competencyItems[b-1].presentationDescription
```

Title policy:

```text
b7 + COMP_LEAD  -> 7. Leadership & People Management
b8 + COMP_STRAT -> 8. Strategy & Coaching
```

Description policy:

```text
presentationDescription = exact nonblank item.description
```

No fallback to `name`, raw `title`, `competencyName`, legacy label, stale workbook text or translation is allowed.

### 3.3 N7/N8 bounded title-merge overlay

The closed structural transform remains an intermediate invariant.

After it passes:

```text
N7 add B31:J31
N8 add B31:J31 and B35:J35
```

Existing description/rating/padding geometry remains:

```text
N7 description B32:J32 / rating scale B33:J33 / padding row34
N8 descriptions B32:J32 + B36:J36 / rating scale B33:J33 + B37:J37 / padding rows34/38
```

Intermediate frozen merge counts remain:

```text
79 / 85 / 91
```

Proposed effective renderer merge counts after the presentation overlay:

```text
79 / 86 / 93
```

No row relocation, dimension, Print_Area, scoring or formula change is proposed.

### 3.4 Privacy/sanitization overlay

Closed base privacy validation remains mandatory first:

```text
BASE_DYNAMIC = 432 / 474 / 516
```

Proposed new dynamic presentation ranges:

```text
N6 = none
N7 = B31:J32 (+18)
N8 = B31:J32 + B35:J36 (+36)
```

Proposed effective renderer dynamic counts:

```text
432 / 492 / 552
```

Rating Scale and protected padding remain static. Chief R:X authority remains unchanged and not secured writable.

### 3.5 Future semantic/profile authority

Current frozen authority remains until separately implemented and independently closed:

```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
```

PRE2 proposes two future expanded-only safe role families:

```text
COMPETENCY_b_TITLE
COMPETENCY_b_DESCRIPTION
```

Only b7/b8 may resolve. b1..6 must reject these writes.

If later independently closed:

```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
```

## 4. Proposed smallest next implementation — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-PRE2-R1
NAME = EXPANDED COMPETENCY CANONICAL PRESENTATION PROJECTION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
WRITABLE_FILES =
  src/services/mbo-export-service.js
  tests/mbo-export-service.test.js

PROFILE_CHANGE = FORBIDDEN
OOXML_FEASIBILITY_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

Required R1 behavior:
- canonical b7/b8 code validation;
- code-derived `presentationTitle`;
- exact `description` -> `presentationDescription`;
- aliases cannot override canonical title;
- wrong/missing code fails closed;
- missing/blank expanded description fails closed;
- N6 remains backward-compatible;
- Employee-Self privacy remains intact;
- focused tests only.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R2-PRE2-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

## 5. Planned later sequence — NOT AUTHORIZED

After PRE2-R1 independently closes:
1. bounded Template Profile semantic/presentation topology authority;
2. bounded OOXML title-merge + effective privacy overlay proof;
3. Production XLSX Renderer/Sanitizer implementation;
4. renderer independent closure;
5. Combined Excel parity;
6. D2 final closure;
7. only then consider D3.

Do not auto-start any step.

## 6. Authorization ledger

```text
D2-WP004-R2-PRE1-EVIDENCE-20260902-01 = CONSUMED / CORRECTED / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE1-R1-EVIDENCE-CORRECTIVE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2 = READ-ONLY DESIGN COMPLETE
D2-WP004-R2-PRE2-R1 = PROPOSED / NOT AUTHORIZED

NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE PRE2-R1 SOURCE+TEST
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
