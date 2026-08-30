# AI ACTIVE TASK — D1 HYBRID RUNTIME — FINAL SOURCE-ACCEPTANCE MILESTONE R1

Mode: **ANTIGRAVITY ONE-TIME LOCAL VERIFICATION ONLY**
Branch: `ai/antigravity-wp002c`

## Goal
Hybrid runtime source, cleanup, and legacy Shared fixture corrections passed ChatGPT review. Perform one final local verification. No source/test edits. No live Kintone.

## Run exactly once, in this order
```text
npm run ui:build
npm test
```
Build must run first because `tests/create-handler-form-state.test.js` executes generated `dist/mbo-employee-app.js`.

If build fails: STOP and report the first relevant error. Do not run tests.
If `npm test` fails: STOP and report the first relevant failing test/error. Do not patch or rerun.

After successful build + tests:
```text
git restore --source=HEAD -- dist/
git diff --check
git status --short
```
Expected final working tree: clean.

## Forbidden
Do not modify `src/**`, `tests/**`, `config/**`, or `project-docs/**`.
Do not create evidence files.
Do not commit or push.
Do not rerun build/test.
Do not access live Kintone or App53.

```text
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
DEPLOY = 0
ACL_WRITE = 0
GROUP_WRITE = 0
```

## Final response only
- `npm run ui:build = PASS/FAIL`
- `npm test = PASS/FAIL` with passed/total count if available
- `git diff --check = PASS/FAIL`
- `FINAL_WORKTREE_CLEAN = YES/NO`
- `SOURCE_CHANGES = 0`
- `TEST_CHANGES = 0`
- `LIVE_KINTONE_OPERATIONS = 0`
- `APP53_PRODUCTION_TOUCHED = NO`

Then STOP. Next owner = ChatGPT independent source-acceptance review.