# AI ACTIVE TASK — APP794 PRE-DEPLOY EVIDENCE MICRO-CORRECTIVE R2 / READ-ONLY

Mode: **ANTIGRAVITY EVIDENCE-ONLY EXECUTION — NO SOURCE EDIT / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Review Result

ChatGPT independent review of evidence commit:

`ddf5de0c0e02e4d8a7b8542a67067d6fe7230f28`

Decision:

`CORRECTIVE — ONE REMAINING EVIDENCE COMMAND ONLY`

Source candidate remains accepted. No source defect or Live drift was found.

## 2. Exact Remaining Gap

The evidence now contains the requested command/exit-status audit trail, but the dist-reproduction proof still does not use the exact mandatory command.

Evidence currently records:

```text
git diff --ignore-space-at-eol -- dist/mbo-employee-app.js dist/mbo-employee.css
```

The required gate is exactly:

```text
git diff --exit-code -- dist/mbo-employee-app.js dist/mbo-employee.css
```

Why this matters: plain `git diff` can return exit code 0 even when differences exist. `--exit-code` is the required fail-closed proof.

## 3. Allowed Action

Update exactly one file only:

`project-docs/APP794_PREDEPLOY_VERIFICATION_EVIDENCE.md`

Create a temporary detached worktree pinned exactly to:

`98108e9e387d01b6d3c3a35cce5baf13324be50e`

If needed, run the already-approved build-only command first so the dist artifacts are reproduced from that candidate. Then run exactly:

```text
git diff --exit-code -- dist/mbo-employee-app.js dist/mbo-employee.css
```

Record:
- exact command;
- output (`<empty>` if no diff);
- exact exit status;
- candidate worktree HEAD;
- final `git status --porcelain` output.

Expected PASS:

```text
OUTPUT = <empty>
EXIT_STATUS = 0
```

Any nonzero exit or any diff => STOP and report truthfully.

## 4. Strict Safety Boundary

Do NOT:
- edit source/tests/scripts/config/package/dist on canonical branch;
- run Live-mode deploy tooling;
- make any Kintone GET/POST/PUT/DELETE call in this micro-corrective;
- upload customization;
- deploy;
- rollback;
- modify AI_CONTROL_CENTER.md or AI_ACTIVE_TASK.md as executor;
- change previously recorded hashes/Live values.

No Live readback rerun is needed.

## 5. Delivery Contract

Commit and push only the updated:

`project-docs/APP794_PREDEPLOY_VERIFICATION_EVIDENCE.md`

Evidence status remains:

`PENDING_CHATGPT_REVIEW`

Report commit SHA and STOP.

Maximum executor status:

`APP794_PREDEPLOY_DIST_EXITCODE_PROOF_CAPTURED_PENDING_CHATGPT_REVIEW`
