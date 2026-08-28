# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only when actual execution is required  
> Updated: 2026-08-28

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE PASS=128 / APP801 PROVISIONING PASS / SOURCE CORRECTIVE PASS / APP794 CORRECTIVE REDEPLOY AUTHORIZED + EXECUTION NEXT |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ PASS / CLOSED |

No AI may silently drop D1–D7.

## 2. Authorization Ledger

```text
D1_SOURCE_IMPLEMENTATION            = SOURCE CORRECTIVE ACCEPTED / PRE-DEPLOY TEST GATE REQUIRED
D1_LIVE_CUTOVER                     = IN PROGRESS / CORRECTIVE REDEPLOY AUTHORIZED
DEDICATED_MBO_ACCESS_GROUP_MODEL    = APPROVED / PASS
APP801_GROUP_ACL_MODEL              = APPROVED / PASS
D1_CREDENTIAL_CANDIDATE_RULE        = ACCEPTED / BASELINED
D1_CANDIDATE_USER_EXPORT_AUDIT      = PASS / 128 ACCEPTED CANDIDATES
APP801_CREDENTIAL_BULK_PROVISIONING = PASS / INDEPENDENTLY LIVE VERIFIED 2026-08-28
APP794_D1_CUSTOMIZATION_DEPLOY      = EXECUTED / NOT ACCEPTED
APP794_CORRECTIVE_REDEPLOY          = APPROVED 2026-08-28 / EXACT SCOPE BELOW
D2-D7 LIVE WRITES                   = NOT AUTHORIZED unless separately recorded
```

### Exact App794 Corrective Redeploy Authorization

User explicitly approved:

```text
อนุมัติ App794 Corrective Redeploy
```

Authorized only for:
1. mandatory local `npm run ui:build` + `npm test` gate;
2. read-only effective/live + Preview customization precheck;
3. rollback-ready local backup of current App794 customization and relevant FILE bytes/hash;
4. strict preflight from the accepted deploy implementation;
5. upload exactly one target JS file: `mbo-employee-app.js`;
6. Preview customization PUT preserving all non-target Preview entries/fileKeys/order/scope/mobile/URLs and exact Preview revision;
7. deploy App794 and poll to completion;
8. post-deploy read-back/hash/topology verification;
9. sanitized evidence update, commit + push, then STOP.

Not authorized:
- source edits/refactor/rebuild-logic changes beyond running the accepted build;
- CSS upload;
- App794 record write;
- App801/App53/App795/App796 writes;
- group/ACL changes;
- D2-D7 writes;
- UAT;
- `employee-part-a-ui.js` modularization;
- automatic rollback/restore write if the corrective deploy fails or mismatches. Backup must be rollback-ready, but any rollback write requires a new Control Plane decision.

The authorization is consumed once this exact redeploy attempt executes. Antigravity must not retry blindly after any remote-write failure.

## 3. Accepted D1 State That Remains Valid

```text
MBO_EMPLOYEE_ACCESS_GROUP = PASS
APP801_GROUP_ACL = PASS
CREDENTIAL_CANDIDATE_GATE = PASS / 128
APP801_PROVISIONING = PASS / 128 / independently live verified
D1_SOURCE_CORRECTIVE_PACKAGE = PASS
```

Manual final D1 UAT remains `BLOCKED / NOT STARTED` until corrective redeploy succeeds and is independently reviewed.

## 4. Accepted Corrective Source Package

Accepted executor source corrective:

```text
ed1d8e8573efeb47845cc07dcd81853842ed307e
```

Independent review accepted:
- full deterministic preflight before upload;
- explicit desktop/mobile + js/css structure;
- scope limited to `ALL | ADMIN | NONE`;
- positive Preview revision with `-1` rejected;
- exactly one Preview desktop JS target `mbo-employee-app.js`;
- exact-target-only old-fileKey exemption;
- same-named CSS/mobile FILEs remain non-target and require valid Preview fileKeys;
- non-target Preview FILE keys preserved;
- JS-only upload path; CSS upload removed;
- modular JavaScript architecture preserved.

Git comparison from accepted source commit `ed1d8e8573efeb47845cc07dcd81853842ed307e` to pre-authorization HEAD `c2c27af2463148d4997b125c420cbbcb5de62a3c` changed only Control Center and Active Task documents. No accepted source/dist file was changed after source review.

## 5. Pre-Deploy Artifact Gate

At accepted source commit:

```text
dist/mbo-employee-app.js Git blob SHA = 2a9a3c5bfe896b51f482c016f66863bffeddb679
dist/mbo-employee.css    Git blob SHA = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

Before any Kintone remote write Antigravity must run:

```text
npm run ui:build
npm test
```

Then verify:

```text
git hash-object dist/mbo-employee-app.js = 2a9a3c5bfe896b51f482c016f66863bffeddb679
git hash-object dist/mbo-employee.css    = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

If build, tests, or either artifact identity check fails:

```text
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STOP
```

No source correction is authorized during this deploy task.

## 6. Deployment Safety / Verification Requirements

Before the first remote write:
- verify target App = 794;
- GET effective/live customization;
- GET Preview/Test customization;
- create rollback-ready local backup; do not commit raw backup/file contents;
- capture pre-change topology/order/scope/revision and non-target FILE identity;
- download/hash current effective target JS and CSS where available for before/after evidence;
- run the accepted strict preflight;
- fail closed with zero writes on any drift/invalid structure.

Remote writes are limited to:

```text
1 x target JS file upload
1 x Preview customization PUT
1 x App794 deploy request
```

Polling/read-back GETs do not count as writes.

After deployment:
- effective target JS content must match accepted artifact identity;
- effective CSS content hash must equal its pre-change content hash;
- no CSS upload occurred;
- effective/Preview topology, scope, URL/mobile/non-target entries remain preserved as applicable;
- Preview retained non-target FILE keys must remain unchanged across the PUT;
- deployment status must be SUCCESS;
- do not start UAT.

If a remote write fails or post-readback mismatches:
- STOP;
- no blind retry;
- no automatic rollback write;
- preserve backup/evidence and report exact sanitized blocker.

## 7. Source Architecture Decision — Confirmed

Canonical modular source rules remain in:

```text
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

No Big-Bang refactor is allowed during D1 live stabilization. No JavaScript modularization is part of this redeploy authorization.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER = Antigravity
ANTIGRAVITY_REQUIRED = YES
DUPLICATE_WORK_RISK = NO — one exact authorized corrective redeploy packet
MAX_EXECUTOR_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Antigravity must execute only the new `project-docs/AI_ACTIVE_TASK.md`, update sanitized D1 evidence, push one concise evidence commit and STOP.

## 9. Knowledge / Baseline Maintenance

Baseline promotion:
`NONE — this authorization is operational, not a new durable architecture rule.`

Reusable Kintone skill extraction:
`No new update now; review actual redeploy evidence after execution.`
