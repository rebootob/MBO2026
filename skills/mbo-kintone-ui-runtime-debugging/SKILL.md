---
name: mbo-kintone-ui-runtime-debugging
description: Reusable diagnostic, CSS parser, Kintone Comment API, atomic customization deploy, and UAT rules learned from the App794 WP2 incident
---

# MBO Kintone UI Runtime Debugging & Safe Deployment Skill

## 1. Purpose
Use this skill whenever a Kintone custom UI appears partially styled, visually broken, missing controls, or behaves differently in Live even though source/tests/build appear correct.

This skill is mandatory before making another speculative UI fix when any of these symptoms appear:
- DOM element exists but looks unstyled.
- A button/link exists in source but appears missing in Live.
- JS behavior works but CSS presentation does not.
- Kintone Comment API returns `Missing or invalid input`.
- Technical deploy/readback passes but user-facing UAT still fails.
- Candidate JS/CSS or source commit identities are unclear.

## 2. Proven App794 Incident Lessons

### 2.1 DOM exists + computed style is default => diagnose CSS before JS
Rev56 browser probes showed:
- My MBO elements existed, but computed `display=block`, `padding=0px`, border absent.
- Back element existed with the correct text, but button/bar styling was absent.
- Comment mirror existed and loaded data, but its section padding/border styling was absent.

Conclusion: when DOM exists but computed styles are defaults, do NOT rewrite the renderer first. Investigate stylesheet load, parser validity, scope, cascade, media/conditional blocks, build output, and runtime customization attachment.

### 2.2 One unclosed CSS selector can invalidate a large later section
Proven root cause in `src/styles/mbo-employee.css`:

```css
.mbo-progress-bar-fill {
.mbo-wide-card-header {
```

The stray unclosed `.mbo-progress-bar-fill {` caused later WP2 selectors to fall into an invalid/nested parser context. The browser therefore did not apply Back, My MBO, and Comment feature rules even though those selectors were present in source/dist.

Permanent rule:
- CSS brace balance must be tested automatically.
- Critical runtime feature selectors must be proven to open at top-level scope unless intentionally inside a documented conditional block.
- Never accept "selector exists in file" as proof that browser runtime can apply it.

Required regression pattern:
- overall brace depth returns to `0`;
- `.mbo-back-nav-bar` top-level;
- `.mbo-btn-back-home` top-level;
- My MBO table selector top-level;
- `.mbo-native-comment-mirror` top-level;
- Comment table selector top-level.

### 2.3 Back navigation must be mounted before fail-closed early returns
A record Detail/Edit may fail later configuration/snapshot/status validation. If Back navigation is mounted only after those checks, an early return can make Back disappear.

Permanent rule:
- For existing Detail/Edit, mount Back immediately after the feature root/container is created.
- Create must not show Back.
- Never weaken fail-closed validation just to keep navigation visible.
- Same-tab target remains `/k/{currentAppId}/`.
- Back must not mutate auth/session or record/workflow state.

### 2.4 Kintone Comment GET contract must respect `limit <= 10`
The Live `Missing or invalid input` comment failure was caused by requesting too large a page size. The accepted contract is:

```text
Endpoint = /k/v1/record/comments.json
Method   = GET
limit    = 10
order    = asc
offset   = progressive
```

Permanent rules:
- Detail/Edit only.
- Create GET count = 0.
- Read-only mirror only.
- Refresh must perform a real refetch.
- Continue pagination when `newer=true`, even for a short page.
- Stop on truthful end (`newer=false` or equivalent proven end condition).
- No silent truncation.
- Add no-progress/safety protection that throws explicitly rather than returning partial data.
- Comment body, author, timestamp, errors, and empty states must render with `textContent`/text nodes; no dynamic HTML injection.
- Comment writes = 0 from the mirror.

### 2.5 JS + CSS customization is one atomic release candidate
A Kintone UI feature may depend on both JavaScript and CSS. Deploying new JS with old CSS can produce a technically reachable but visually broken UI.

Permanent deployment contract:
- Candidate source commit must be exact full Git SHA.
- Worktree must be clean.
- Candidate JS and CSS identities must be exact-byte identities.
- Desktop JS 1 + Desktop CSS 1 are reviewed as one atomic pair.
- Build-only must make zero network calls.
- A clean rebuild from the exact candidate commit must produce zero tracked dist diff.
- Pre-deploy Live baseline must match the expected revision/topology/identities.
- Any unexpected drift => STOP before Live write.
- One authorization = one deploy attempt.
- No automatic second deploy and no automatic rollback.
- Post-deploy readback must hash the actual Live JS/CSS and match the reviewed pair.

### 2.6 Git evidence must name the real candidate commit
Do not confuse:
- prior Live baseline commit,
- implementation candidate commit,
- later docs/evidence-only branch HEAD.

Permanent rule:
`CANDIDATE_SOURCE_COMMIT` must identify the exact immutable source/test/dist commit used to build the deployed artifacts. If an evidence file names the wrong commit, reject that field and derive the release manifest from Git directly.

### 2.7 Technical readback PASS is not User UAT PASS
Exact deployed JS/CSS hashes can match perfectly while the UI still fails user expectations or browser runtime behavior.

Acceptance order:
1. Source review PASS.
2. Tests/build PASS.
3. Exact candidate manifest locked.
4. Explicit one-shot Live authorization.
5. Technical readback PASS.
6. User runtime UAT PASS.
7. Only then mark the revision accepted known-good.

Never describe WP2/UI work as complete before user-facing UAT passes.

## 3. Runtime Diagnosis Matrix

| Runtime observation | Primary hypothesis | First action |
|---|---|---|
| DOM missing | JS/event/wiring/early-return problem | Trace actual Kintone event -> auth gate -> renderer path |
| DOM exists, computed style is default | CSS load/parser/scope/cascade problem | Inspect `getComputedStyle`, brace/scope/build/runtime CSS |
| DOM + expected computed style exists, UX still rejected | Visual design problem | Redesign presentation without changing semantics |
| API returns `Missing or invalid input` | Request contract/parameter problem | Capture exact endpoint/body and verify documented limits/types |
| Build/tests pass but Live differs | deployment pairing/cache/runtime issue | Verify Live resource identities and topology |
| Technical hash readback passes but user reports failure | runtime/UX issue remains | User UAT + browser DOM/computed-style evidence |

## 4. Mandatory Troubleshooting Sequence

1. Re-fetch canonical Git branch and exact Live/candidate state.
2. Do not change source until symptom class is identified.
3. Probe DOM existence for the failing feature.
4. Probe computed style for critical properties (`display`, padding, border, background).
5. If DOM exists but style is default, inspect CSS parser/scope before touching JS.
6. Verify generated `dist` contains the expected top-level selectors.
7. Run CSS structure/scope regression.
8. For API issues, capture exact request endpoint/body and test the production `globalThis.kintone.api` path.
9. Run real runtime integration tests through `main-mbo-app.js`, not renderer-only tests.
10. Run focused tests + relevant auth/attachment regressions + full suite.
11. Build from exact candidate commit; clean rebuild must produce zero dist diff.
12. Lock exact source/JS/CSS/topology manifest.
13. Require new explicit Live authorization.
14. Preflight current Live baseline.
15. Execute exactly one guarded atomic deploy.
16. Perform byte-level Live readback.
17. Perform user runtime UAT.
18. Only after UAT PASS update accepted known-good baseline.

## 5. App794 WP2 Incident Reference

Accepted corrective source candidate:
```text
SOURCE = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
JS     = ac22a56cb9d78001384241fe12745f7a2da3da84
CSS    = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

Deployment result:
```text
LIVE REVISION = 57
TECHNICAL READBACK = PASS / exact JS+CSS pair
USER UAT = PASS
```

R3 accepted UI result:
- My MBO = structured table (`Fiscal Year | Status | Record Key | Action`).
- Back to My MBO = prominent visible blue navigation on Detail/Edit; absent on Create.
- Native Comment Mirror = structured read-only table (`# | Author | Date & Time | Comment`), Refresh enabled, GET `limit=10`.

## 6. Do Not Repeat These Mistakes
- Do not assume CSS is loaded because the file exists in source/dist.
- Do not keep tweaking colors/spacing when computed style proves the selector is not applying.
- Do not rewrite JS when DOM already exists.
- Do not deploy JS and CSS as independent feature versions.
- Do not reuse consumed authorization.
- Do not silently tolerate Live drift.
- Do not use scratch snapshots as known-good recovery targets.
- Do not silently truncate Comment pagination.
- Do not put dynamic error/comment text into `innerHTML`.
- Do not call a technical deploy PASS a user-facing PASS.

## 7. Required Reading Rule
Before any future App794 UI runtime corrective, Kintone custom UI deployment, or "UI exists but looks wrong" investigation, read this skill together with:
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
- `project-docs/CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`
- current `project-docs/AI_CONTROL_CENTER.md`
- current `project-docs/AI_ACTIVE_TASK.md`
