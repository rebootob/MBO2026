# AI ACTIVE TASK — D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — SOURCE-ACCEPTANCE MILESTONE VERIFICATION

Mode: **ANTIGRAVITY ONE-TIME VERIFICATION ONLY — NO SOURCE EDIT / NO LIVE KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

The Hybrid Employee-Self Runtime source logic and cleanup have passed ChatGPT review.

This task performs **one milestone verification only** before source acceptance.

Do not fix code. Do not redesign. Do not create evidence markdown. Do not scan broadly.

## 1. Allowed work only

From a clean working tree, run exactly once:

```text
npm test
npm run ui:build
```

After build verification, restore generated dist back to the current branch HEAD so build output is not committed in this source-only gate.

Then run:

```text
git diff --check
git status --short
```

Expected final working tree: clean.

Do not rerun commands unless a command itself failed to start for a tooling reason. If a real test/build failure occurs, STOP and report the first failure; do not patch it.

## 2. No source/test changes

Do not modify any source or test file.

Especially do not modify:
```text
src/**
tests/**
config/**
project-docs/**
```

Do not create evidence files.
Do not commit or push unless an unexpected tracked cleanup is required; normally this verification should produce **no commit**.

## 3. App53 Production / Live hard stop

```text
LIVE_GET = 0
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
APP53_SCHEMA_WRITE = 0
APP53_RECORD_WRITE = 0
APP53_BULK_WRITE = 0
APP794_RECORD_WRITE = 0
ACL_WRITE = 0
GROUP_WRITE = 0
DEPLOY = 0
```

Mocks/fixtures/local build only. Do not open or probe App53 or any live Kintone app.

## 4. Stop rule

If `npm test` or `npm run ui:build` reports a real failure:
- STOP at the first real failure;
- do not edit source/tests;
- report the failing command + first relevant error only.

Do not expand scope.

## 5. Finish

Final response only:
- `npm test = PASS/FAIL` with passed/total count if available;
- `npm run ui:build = PASS/FAIL`;
- `git diff --check = PASS/FAIL`;
- `FINAL_WORKTREE_CLEAN = YES/NO`;
- `SOURCE_CHANGES = 0`;
- `TEST_CHANGES = 0`;
- `LIVE_KINTONE_OPERATIONS = 0`;
- `APP53_PRODUCTION_TOUCHED = NO`.

Then STOP. Next owner = ChatGPT independent source-acceptance review.