# CONFIRMED BASELINE — SOURCE CODE ARCHITECTURE

> Status: **CONFIRMED / MANDATORY**  
> Confirmed by user decision: 2026-08-28; strengthened by user decision: 2026-08-29  
> Scope: MBO2026 maintainable JavaScript source organization and controlled modularization

---

## 1. Objective

MBO2026 source code must be organized so that a defect can be traced to a small, clearly owned module instead of requiring inspection of one large catch-all JavaScript file.

The architecture must optimize for:
- easy review;
- easy debugging;
- small diffs;
- safe rollback;
- low regression risk;
- low Antigravity credit usage;
- clear ownership by feature/menu/responsibility.

This document refines the mandatory Source-Code Modularity rule in `AI_OPERATING_GOVERNANCE.md`.

---

## 2. Core Rule — Separate by Feature / Menu / Responsibility

A JavaScript source file should own one cohesive responsibility.

Examples of responsibilities that should normally be separate modules:
- MBO Login / authentication adapter;
- Login gate / login UI;
- Password change;
- My MBO list;
- Create MBO;
- Detail view;
- Edit MBO;
- Copy Previous MBO;
- Excel export;
- PDF export;
- workflow/routing UI;
- HR Control Center UI;
- reusable Kintone data services;
- pure domain/business calculations;
- shared UI helpers used by more than one feature.

Do not put unrelated menus, business rules, auth logic, export logic, routing logic, admin logic and UI rendering into one catch-all source file.

Do not create one file per tiny helper merely to increase file count. The separation boundary is a meaningful feature/responsibility boundary.

---

## 3. Main Entry Point Rule

`src/main-mbo-app.js` is an application entry/orchestration module.

Its normal responsibilities are limited to:
- importing modules;
- constructing dependencies;
- registering Kintone events;
- selecting the correct feature handler for the current view/event;
- top-level fail-closed orchestration;
- minimal shared bootstrap state.

It must not become the implementation home for:
- authentication internals;
- password hashing/password-change workflow;
- employee lookup/routing/scoring business rules;
- export implementations;
- copy-previous implementation;
- large UI renderer bodies;
- feature-specific data transformation.

When a feature becomes large enough to contain its own UI state/handlers/business flow, move that behavior to the feature module instead of extending `main-mbo-app.js`.

---

## 4. Layer Direction

Use this dependency direction unless a reviewed exception is necessary:

```text
main-mbo-app.js
    -> feature/menu modules
        -> services / validation / domain-core
        -> shared UI helpers

services
    -> Kintone API adapter / data access

core / evaluation / profiles
    -> pure or near-pure business/domain logic
```

Rules:
- `core` must not depend on large UI modules;
- service modules must not import feature UI merely to call a helper;
- shared UI helpers must not become a hidden business-rule layer;
- avoid circular dependencies;
- do not duplicate a business rule in multiple feature modules.

---

## 5. Target Organizational Pattern

The existing repository does not need a Big-Bang directory rename. Migration is incremental.

The target conceptual pattern is:

```text
src/
  main-mbo-app.js

  features/
    auth/
      auth-adapter.js
      login-gate.js
      password-change.js

    employee-self/
      my-mbo-list.js
      mbo-create.js
      mbo-detail.js
      mbo-edit.js
      copy-previous-mbo.js
      export-excel.js
      export-pdf.js

    workflow/
      workflow-ui.js

  services/
    employee-service.js
    routing-service.js
    ...

  core/
    fiscal-year-engine.js
    ...

  validation/
    ...

  ui/
    shared/
      host-resolver.js
      visibility.js
      ...
```

This is a responsibility map, not an instruction to rename every existing file immediately.

Existing dedicated modules may remain in their current path until a controlled migration requires movement. Do not rename stable files only for cosmetic consistency during an active defect fix.

---

## 6. Existing Catch-All Files — Controlled Decomposition

Existing large/catch-all modules must be decomposed incrementally, not rewritten all at once.

Required method:

```text
1. Identify one cohesive feature inside the large file.
2. Lock current behavior with focused tests/evidence.
3. Extract that feature into one dedicated module.
4. Keep public behavior unchanged.
5. Update imports/build manifest.
6. Run focused regression + full required tests.
7. Independent ChatGPT review.
8. Only then choose the next feature to extract.
```

Do not combine multiple unrelated extractions in one work package merely because they live in the same large file.

A structural extraction must not silently change:
- field semantics;
- routing behavior;
- scoring behavior;
- authorization behavior;
- workflow stages;
- UI acceptance rules;
- Kintone write scope.

If behavior needs to change, that behavior change must be reviewed as a separate requirement or explicitly included in the exact work package.

---

## 7. Do Not Mix Refactor with Production Corrective Work

When a production/live blocker is being corrected:
- fix the proven blocker with the smallest safe source change;
- do not simultaneously perform a broad module decomposition;
- do not rename/move many unrelated files;
- do not use the corrective deploy as an opportunity to clean the whole source tree.

Broad modularization starts only after the current corrective gate is stable enough that source movement will not obscure the root cause or complicate rollback.

Exception: a small module separation is allowed when it is directly necessary to correct the defect and preserves the confirmed architecture.

---

## 8. Generated `dist/` Rule

`dist/mbo-employee-app.js` may be one generated classic-script bundle because Kintone deployment may require that form.

But:
- `dist/` is generated deployment output;
- `dist/mbo-employee-app.js` is not the maintainable source of truth;
- never manually implement/fix business logic directly in the bundle;
- changes must originate from source modules;
- build/test must prove required modules are included exactly once and in dependency-safe order;
- source-to-dist exactness must be testable.

A single deployment bundle does **not** justify a single giant source file.

---

## 9. Naming / Public API Rules

Use clear responsibility-oriented filenames, preferably kebab-case.

Examples:
- `mbo-kintone-auth-adapter.js`
- `mbo-kintone-login-gate.js`
- `copy-previous-mbo.js`
- `mbo-export-excel.js`

Each module should expose the smallest public API needed by its caller.

Do not export internal helpers by default merely so another unrelated module can reach into implementation details.

If two features need the same rule/helper, first determine whether it belongs in:
- `core` for pure domain logic;
- `services` for data access/business service;
- shared UI helper for genuinely reusable presentation behavior.

---

## 10. Review Triggers for Splitting a File

A file must be evaluated for splitting when one or more are true:
- it implements several unrelated menus/features;
- a small feature change requires reviewing a very large unrelated diff;
- UI, Kintone data access and business/domain logic are mixed together;
- the same file owns unrelated security/auth/export/routing concerns;
- developers repeatedly struggle to locate the correct function;
- bug fixes commonly cause regressions in unrelated sections of the same file;
- the module has become a general dumping ground for new functions.

No fixed line-count threshold is mandatory. Responsibility cohesion is the primary criterion.

---

## 11. Antigravity Usage for Modularization — Mandatory Low-Credit Pattern

ChatGPT remains architect/reviewer. Antigravity is only the executor for exact source changes that require local implementation/testing.

Before invoking Antigravity for modularization, ChatGPT must define:
- exact feature to extract;
- source file(s) to read;
- target module/file;
- functions/classes/constants that belong to that feature;
- behavior that must remain identical;
- tests/evidence required;
- files explicitly forbidden from unrelated changes.

Antigravity must **not** be asked to:
- "refactor the whole UI";
- scan the whole repository for architecture ideas;
- decide the final module architecture itself;
- split multiple unrelated menus in one broad task;
- combine refactor + production deploy in the same work package;
- self-review or self-certify PASS.

Preferred execution unit:

```text
one feature/menu extraction
+ focused tests
+ one concise commit
+ STOP
+ ChatGPT independent review
```

Only after PASS may the next extraction start.

---

## 12. Safe Migration Sequence for Current MBO2026 Source

The controlled sequence is:

### Stage A — Stabilize the active blocker first
Do not start broad structural migration while a live corrective/root-cause gate is still under review.

### Stage B — ChatGPT module inventory
ChatGPT inspects only the relevant large source file(s) and maps functions/classes/constants to responsibilities.

Output is a module map, not code changes.

### Stage C — Extract low-coupling responsibilities first
Prefer extraction order:
1. pure constants/config/profile helpers;
2. pure calculations/formatters;
3. data/service boundaries;
4. independent UI components;
5. large menu/view controllers;
6. highly coupled orchestration last.

### Stage D — One menu/feature at a time
Each extraction gets its own exact Active Task and independent review.

### Stage E — Build manifest/runtime dependency verification
After every extraction:
- update the build source order/manifest;
- verify module included exactly once;
- verify no missing runtime dependency;
- verify no duplicate implementation;
- verify source-to-dist exactness.

### Stage F — Live deployment only after source acceptance
A structural source change and its production deployment are separate gates unless explicitly authorized otherwise.

---

## 13. Current Architectural Hotspots — Review Priority

Repository inspection on 2026-08-28 shows:
- `src/ui/employee-part-a-ui.js` is a large multi-responsibility UI module and is a high-priority candidate for incremental decomposition;
- `src/main-mbo-app.js` is also substantial and must be protected from becoming a catch-all implementation file;
- dedicated authentication modules already demonstrate the preferred separation pattern.

These observations identify refactor priority only. They do not authorize immediate source movement or production deployment.

---

## 14. Acceptance Gate for Every Structural Extraction

A module extraction can be accepted only when all applicable checks pass:

```text
FEATURE_BEHAVIOR_PARITY = PASS
NO_UNRELATED_BUSINESS_RULE_CHANGE = PASS
NO_DUPLICATE_IMPLEMENTATION = PASS
NO_CIRCULAR_DEPENDENCY = PASS
SOURCE_MODULE_OWNERSHIP_CLEAR = PASS
BUILD_DEPENDENCY_ORDER = PASS
SOURCE_DIST_EXACTNESS = PASS
FOCUSED_TESTS = PASS
REQUIRED_REGRESSION_TESTS = PASS
KINTONE_LIVE_WRITE = 0 unless separately authorized
```

ChatGPT performs the independent acceptance decision.

---

## 15. Change Rule

Changing this architecture policy requires an explicit user/Control Plane decision and Baseline update.

Routine implementation must conform to this document without rediscovering the modularization strategy each time.

---

## 16. One Feature = One Canonical Owner — Mandatory

Every user-visible or business function must have one clearly identifiable canonical source owner.

Examples:

```text
Login / session gate        -> auth/login modules
My MBO list                 -> employee-self My MBO module
Create MBO                  -> create module
Detail / Edit UI            -> detail/edit modules
Comments mirror             -> comments/read-only module or clearly owned detail submodule
Attachments                 -> attachment module/service
Copy Previous MBO           -> copy-previous module
Routing                     -> routing service/module
Scoring                     -> scoring/core module
Excel/PDF export            -> dedicated export modules
HR Control Center           -> HR feature module
```

Rules:
- the same feature must not have parallel implementations in multiple files;
- if legacy duplicate logic exists, choose one canonical owner before further feature work;
- another module may call the owner through a small public API, but must not copy its internal implementation;
- a reviewer must be able to answer “where does this feature live?” with one primary module/path.

If ownership is ambiguous, the change is not ready for Live deployment.

---

## 17. Feature Boundary Rule — UI / Service / Domain / Adapter

Within a larger feature, separate responsibilities when they become meaningful:

```text
Feature Controller / View
    -> rendering, user events, view state

Service
    -> use-case flow, orchestration across data sources

Domain/Core
    -> pure business rules/calculations/validation

Kintone Adapter / Repository
    -> REST/API calls, record/file transport, Kintone-specific payloads
```

Do not embed large Kintone REST request construction directly throughout UI renderers.
Do not hide business rules inside CSS/DOM manipulation helpers.
Do not make data-access modules responsible for visual rendering.

Small features may combine layers when still cohesive, but must split once mixed responsibilities make debugging/review difficult.

---

## 18. Change Locality Rule — Keep Diffs Inside the Function Being Changed

Every work package must identify:
- target feature;
- canonical owner module(s);
- expected supporting service/core module(s);
- exact tests;
- generated artifact affected.

Default expectation:
**a feature change should modify only its owner module and the minimum shared dependencies/tests necessary.**

If one small feature request requires touching many unrelated modules, Control Plane must stop and determine whether:
- ownership is wrong;
- responsibilities are coupled;
- work should be split;
- a shared service should own the common rule.

Broad cross-feature changes require explicit architecture justification before implementation.

---

## 19. No Copy-Paste Architecture

Never fix dependency, bundling, import, runtime-order, or visibility problems by copying an existing function/class into another feature file.

Forbidden patterns:
- duplicate auth/session implementation;
- duplicate attachment upload/download logic;
- duplicate routing/scoring rules;
- duplicate status formatting/business mapping maintained separately;
- copied feature renderer with minor edits instead of a shared component or separate canonical feature owner.

When functionality is reused:
1. call the canonical owner/service; or
2. extract a genuinely shared helper/service; or
3. create an adapter/interface when dependencies differ.

`NO_DUPLICATE_IMPLEMENTATION = PASS` is a mandatory review gate.

---

## 20. Feature-Level Tests and Upgrade Traceability

Tests must mirror functional ownership closely enough that a future maintainer can locate the safety net for the feature being changed.

For each important feature, maintain focused coverage for its key contracts.
Examples:
- My MBO query/sort/action/navigation tests;
- Comment pagination/refresh/read-only tests;
- Attachment persistence/retrieval tests;
- Auth/session rotation/isolation tests;
- Routing/scoring tests;
- Copy Previous MBO mapping/exclusion tests;
- Export-format compatibility tests.

Every future implementation task should state:

```text
FEATURE
CANONICAL_SOURCE_OWNER
SUPPORTING_MODULES
FOCUSED_TESTS
GENERATED_DIST_OUTPUT
LIVE_RESOURCE_IF_ANY
```

This map makes upgrades, defects, review and rollback traceable without broad repository scanning.

---

## 21. Deployment Bundling Does Not Remove Feature Ownership

Kintone may receive one generated JS bundle and one generated CSS file, but every change inside that release must still be traceable back to its source feature module and focused tests.

Before approving a release, reviewer must be able to map:

```text
User-requested change
    -> source feature module(s)
    -> focused tests
    -> generated dist identity
    -> deployment manifest
```

If this chain is unclear, the release is not ready for Live.

---

## 22. Future Refactor Priority After Live Stabilization

Once the current production recovery/UI corrective is fully stable, Control Plane should prioritize incremental decomposition of large multi-responsibility modules, especially `src/ui/employee-part-a-ui.js`, by extracting one feature at a time.

Likely extraction candidates include:
- Back/navigation shell;
- Native Comment mirror;
- attachment presentation/actions;
- workflow timeline presentation;
- objective grid/editor;
- route display;
- shared field-state UI helpers.

This priority is architectural guidance only. It does not authorize refactoring during an active production incident.