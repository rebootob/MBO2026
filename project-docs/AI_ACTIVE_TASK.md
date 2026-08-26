# AI ACTIVE TASK — M10L-D-R7 REVIEW PACKAGE INTEGRITY CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R6 runtime candidate: `19977543dd8572aa8138a79bd351ff6ccf473696`
> Live App794 remains Revision `29`
> Mode: DOCUMENTATION / EVIDENCE INTEGRITY ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R6 runtime correction is substantively PASS. Close only the accidental review-package corruption introduced by the R6 evidence edit before requesting any live App794 schema/customization authorization.

# INDEPENDENT REVIEW DECISION

`M10L-D-R6 RUNTIME = PASS`
`M10L-D-R6 REVIEW GATE = MUST FIX (EVIDENCE INTEGRITY / NO-ORPHAN)`

R6 correctly:
- restored `return event;` on the valid `app.record.detail.process.proceed` path;
- preserved invalid workflow -> `false`;
- added direct registered-hook success/failure regression tests;
- reported 550/550 tests PASS;
- preserved R5 global-hook/API-unavailable closures;
- executed 0 Kintone writes/deploys.

However `project-docs/AI_REVIEW_PACKAGE.md` was accidentally corrupted during R6 documentation editing:
- the App794 future controlled-change plan is interrupted after step 6;
- unrelated M6/M7 gate rows are inserted in the middle of that plan;
- forensic/history blocks and the M10L-D/R4 evidence section are duplicated;
- a second intact R4 section appears later.

This violates standardized review-package integrity and NO_ORPHAN_ARTIFACT_GATE. Do not request live authorization until the file is reconciled to one clean source of truth.

# CHANGE GOVERNANCE

## What
Repair `project-docs/AI_REVIEW_PACKAGE.md` in place so it contains one coherent copy of each living evidence section and one complete future App794 controlled-change plan, while retaining factual R6 evidence.

## Where
Prefer ONLY:
- `project-docs/AI_REVIEW_PACKAGE.md`
- living status docs only if a factual R7 status update is necessary

Do NOT modify production source, tests, dist, config, or Kintone.

## How
1. Use commit `1793b8a7355cab2450a2f989cea5d1c30342330e` (R5) as the pre-corruption documentation baseline.
2. Preserve the reviewed R5 future App794 change plan exactly in substance:
   - six missing fields;
   - Add Fields = `POST /k/v1/preview/app/form/fields.json`;
   - file upload = `POST /k/v1/file.json`;
   - customization update = `PUT /k/v1/preview/app/customize.json`;
   - deploy = `POST /k/v1/preview/app/deploy.json` with `{ "apps": [{ "app": 794 }] }`;
   - current missing-field permission evidence = `UNVERIFIABLE`;
   - fresh drift gate/backup/readback/browser smoke/rollback.
3. Add/retain R6 gate/evidence once, including:
   - workflow success returns exact event;
   - invalid workflow returns false;
   - 550/550 tests PASS;
   - source/dist exactness PASS;
   - 0 Kintone writes/deploy.
4. Remove the accidentally inserted duplicate M6/M7/forensic/M10L-D/R4 blocks from the middle of the future plan.
5. Ensure each major heading/evidence block appears only once where it is intended.
6. Do not delete unique historical evidence; deduplicate/reconcile only identical or accidental repeated content.

# HARD SOURCE LOCK

The reviewed runtime candidate is `19977543dd8572aa8138a79bd351ff6ccf473696`.

R7 must have:
- `src/**` changes = 0
- `dist/**` changes = 0
- `tests/**` changes = 0
- `config/**` changes = 0
- Kintone calls/writes/deploys = 0

If any runtime/source change appears necessary, STOP and report instead of changing it.

# REQUIRED VERIFICATION

1. Compare R7 working diff against R6 commit.
2. Confirm only intended documentation files changed.
3. Confirm `src/main-mbo-app.js` still contains valid workflow `return event;` and invalid path `return false` without modification.
4. Confirm AI_REVIEW_PACKAGE contains one coherent M10L-D-R4/R5 future-change evidence area and one R6 closure record; no accidental duplicate history blocks.
5. Run `git diff --check`.
6. No need to rerun full tests if source/dist/tests are byte-identical to R6; if run, record factual result only.
7. Push same branch and stop.

# REQUIRED FINAL EVIDENCE

`M10L_D_R7 = COMPLETE / PARTIAL / BLOCKED`
`R6_RUNTIME_CANDIDATE_PRESERVED = YES/NO`
`SRC_CHANGE_COUNT = 0 / actual`
`DIST_CHANGE_COUNT = 0 / actual`
`TEST_CHANGE_COUNT = 0 / actual`
`AI_REVIEW_PACKAGE_DUPLICATE_BLOCKS_REMOVED = YES/NO`
`FUTURE_APP794_CHANGE_PLAN_COHERENT = PASS/FAIL`
`R6_WORKFLOW_EVIDENCE_PRESENT_ONCE = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`GIT_DIFF_CHECK = PASS/FAIL`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES`
`GIT_PUSH_SYNC = PASS/FAIL`

# NEXT ACTION

`NEXT_ACTION = CHATGPT REVIEW; IF R7 PASS, CONTROL PLANE MAY REQUEST NEW EXPLICIT USER AUTHORIZATION FOR THE EXACT APP794 SIX-FIELD SCHEMA + REVIEWED CUSTOMIZATION REPAIR`

Commit/push same branch and STOP.