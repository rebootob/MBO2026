# AI ACTIVE TASK — DELIVERY DAY SPRINT 02R2: FINAL HRCC + NO-ORPHAN CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `d5a13b7287ce7ca2a4b4627a9c1726652448d5a2`
> **Mode:** FINAL TARGETED CORRECTION — M4/M8 ONLY

# TODAY NORTH STAR

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD MVP + SMOKE TEST

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / REQUESTER COVERAGE 1/12
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 App 797 Hoshin Master           = LIVE SCHEMA EVIDENCE PASS / DOC-ORPHAN CLEANUP REQUIRED
M5 App 798 Revision Archive        = PASS / 15-FIELD CONTRACT REPAIRED / FREEZE
M6 App 796 scoring baseline        = RATIO CONFIRMED / NEXT IMMEDIATELY AFTER THIS
M7 App 795 routing baseline        = 1/12 / NEXT IMMEDIATELY AFTER THIS
M8 App 800 HR Dashboard MVP        = BLOCKED / FINAL RUNTIME CORRECTION REQUIRED
M9 End-to-end smoke test           = AFTER M6/M7

TODAY_DONE = NO
NEXT_CRITICAL_PATH = CLOSE M4/M8 ONLY -> M6+M7 -> M9
```

Do not revisit M5 and do not seed M6/M7 in this task.

# INDEPENDENT REVIEW — SPRINT 02R

Accepted:

```text
SCORING_RATIO_TRUTH_GATE = PASS
ARCHIVE_REQUIRED_CONTRACT_GATE = PASS
ARCHIVE_LIVE_REPAIR_EVIDENCE_GATE = PASS
APP798_RECORD_COUNT = 0
APP797_LIVE_HOSHIN_STATUS_EVIDENCE = PASS
APP797_WRITES_IN_02R = 0
DEFAULT_DENY / PROTECTED APP GUARDS = PASS
```

Sprint 02R remains BLOCKED only for the following reasons.

## MUST FIX A — HRCC runtime still does not meet approved MVP contract

Current committed `src/ui/hr-control-center.js` still lacks / mishandles:

1. No functional FY / Department / Section / Status filters.
2. No pipeline count rendering grouped by Status.
3. No bounded pagination for App 794 (>500 records).
4. Health/count GETs for 795/796/797/798 use `limit 1` record-array length, so counts are only 0/1 and Routing Coverage can never become 12/12.
5. Denied health GETs are silently converted to empty arrays, which falsely reports 0 instead of `Unavailable / Access denied`.
6. Runtime hardcodes App IDs instead of being injected from `config/sandbox-apps.json` by the reproducible build/deploy path.
7. Current tests do not prove runtime binding, pagination, filters, pipeline, health counts, denied-source behavior, or GET-only behavior end-to-end.

## MUST FIX B — deployment script uploads raw ES-module source

Current `scripts/kintone/deploy-delivery-sprint02.js` uploads `src/ui/hr-control-center.js` directly even though it contains `export` declarations. Project precedent bundles/transforms module-style source before Kintone customization deployment.

Required: build a classic browser-safe bundle from committed source and deploy THAT exact bundle. No `import` / `export` tokens may remain in the uploaded executable JS.

Also current deploy script must:

- fail if bounded deployment polling does not reach `SUCCESS`
- verify exact live app name `MBO HR Control Center [Sandbox]`
- GET live customization metadata after deploy and verify expected JS/CSS FILE entries exist
- not print `fileKey` values
- redact Kintone response bodies from errors

## MUST FIX C — NO_ORPHAN_ARTIFACT_GATE is not actually PASS

The current Hoshin architecture still contains stale active design references such as conceptual `App 799` and field code `Status`, while actual live target is App 797 and actual custom field code is `Hoshin_Status`.

The project-level user rule is mandatory:

```text
WHEN FIELD / FILE / FUNCTION / CONFIG / APP REFERENCE IS REPLACED:
BACKUP -> MIGRATE REFERENCES -> VERIFY -> REMOVE STALE ARTIFACTS -> READBACK -> STALE_ACTIVE_REFERENCES = 0
```

Historical forensic evidence may remain historical, but current architecture / registry / living docs must not preserve stale active references.

# STEP 0 — GIT / SAFETY

Require:

```text
branch = ai/antigravity-wp002c
reviewed head d5a13b7 is ancestor
local HEAD = remote HEAD before work
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Read:

```text
project-docs/AI_ACTIVE_TASK.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/APP_REGISTRY.md
project-docs/architecture-redesign/HOSHIN_MANAGEMENT_DESIGN.md
project-docs/architecture-redesign/HR_CONTROL_CENTER_ARCHITECTURE.md
project-docs/SECURITY_MODEL.md
config/sandbox-apps.json
src/ui/hr-control-center.js
src/styles/hr-control-center.css
scripts/kintone/deploy-delivery-sprint02.js
tests/sprint02-delivery.test.js
```

# STEP 1 — NO-ORPHAN AUDIT / CLEANUP

Use local repository search (`rg`) across active source/config/docs for current-design stale references.

At minimum classify and reconcile:

```text
App 799 Hoshin Master -> actual App 797
business field label Status -> canonical custom field code Hoshin_Status
APP_REGISTRY 797/798 'Container Only' -> current live schema status
CURRENT_STATE Active Sandbox Apps -> must include 794,795,796,797,798,800
stale test totals/counters -> update to actual current evidence
```

For Hoshin architecture update the conceptual schema and diagram to actual current target:

```text
App 797: MBO Hoshin Master [Sandbox]
Business label = Status
Kintone custom field code = Hoshin_Status
Reason = avoids collision with Kintone system Status
```

Do not rewrite historical forensic statements merely because they mention historical IDs/states. Only active/current design references must be zero-stale.

Required final evidence:

```text
OLD_ARTIFACTS_FOUND = exact classified list
OLD_ARTIFACTS_REMOVED_OR_RECONCILED = exact list
STALE_ACTIVE_REFERENCES = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

# STEP 2 — COMPLETE HRCC RUNTIME IN EXISTING FILE

Prefer modifying existing `src/ui/hr-control-center.js`; do not create additional runtime/helper files unless absolutely required.

Keep pure/testable exports, but runtime must be dependency-injected and buildable to classic JS.

Recommended structure:

```text
pure helpers
createHrccRuntime({ kintoneApi, appIds, getAppId, getHeaderSpaceElement })
registerHrccRuntime(dependencies)
```

Do NOT hardcode 794–800 inside business/runtime functions. `appIds` must originate from registry/build injection.

Exact App 794 whitelist remains:

```text
$id
Fiscal_Year
Employee_Code
Employee_Name
Employee_Name_TH
Employee_Department
Employee_Section
Employee_Position
Status
```

Any requested App794 field outside whitelist = fail closed before API call.

All Kintone-derived strings must be HTML escaped before insertion into markup.

## App 794 pagination

Implement bounded GET pagination:

```text
limit = 500
start offset = 0
continue while page length = 500
hard maximum page count = 20
GET only
```

If maximum is reached before completion -> explicit safe warning/failure, not silent truncation.

## Health counts

Use GET-only count requests with `totalCount: true` (and minimal `limit 1`) so actual counts are returned, not record-array length.

At minimum:

```text
App795 active routing count -> routing coverage x/12
App796 published scoring config count
App797 Hoshin record count (or current-ready count if existing schema query is deterministic)
App798 archive total count
```

If a source GET is denied/fails:

```text
available = false
count = null
UI = Access denied / unavailable
```

Do not convert denied sources into count 0.

## Dashboard MVP UI — ALL REQUIRED

Render and functionally support:

1. Header `MBO 2026 — HR Control Center`
2. KPI Total Evaluations / Completed / In Progress / Need Attention
3. Pipeline counts grouped by App794 Status
4. Functional filters:
   - Fiscal Year
   - Department
   - Section
   - Status
5. Employee monitor grid:
   - Employee Code
   - Name
   - Department
   - Section
   - Position
   - plain-language Status
   - Open Record link
6. System health:
   - App794 count
   - App795 routing coverage x/12 or Unavailable
   - App796 published config count or Unavailable
   - App797 Hoshin count or Unavailable
   - App798 archive count or Unavailable
7. Warnings:
   - routing <12
   - scoring config =0
   - Hoshin =0
   - any source unavailable
8. Quick links to registered Apps 794–798

Filters must actually update KPI/pipeline/grid on change without new privileged access.

No write/action buttons.
No POST/PUT/PATCH/DELETE in browser runtime.
No external CDN/framework.

# STEP 3 — BUILD/DEPLOY SCRIPT MUST PRODUCE CLASSIC KINTONE JS

Modify existing `scripts/kintone/deploy-delivery-sprint02.js` only.

It must read committed source + registry and build a deployable classic script in memory or an ignored temp/dist location.

Classic bundle requirements:

```text
NO import statements
NO export declarations
inject exact registered IDs from config/sandbox-apps.json
append/register runtime using actual Kintone browser globals
node --check on generated JS = PASS
```

A simple deterministic transform is acceptable if tested (e.g. remove only source-level `export` keywords from known HRCC source and append initializer with serialized registry IDs). Do not create a second hand-maintained runtime copy.

The uploaded JS must be this generated classic bundle, NOT raw `src/ui/hr-control-center.js`.

Deployment safety:

```text
delete process.env.KINTONE_API_TOKEN
resolve hrControlCenterAppId from registry
assert exact sandbox target with process-local [hrccAppId]
exact expected name = MBO HR Control Center [Sandbox]
Creator-only ACL before and after
upload only HRCC bundle + CSS
PUT customize App800 only
POST deploy App800 only
bounded poll; FAIL unless SUCCESS
GET live settings exact name
GET live ACL Creator-only
GET live app/customize metadata and verify JS/CSS FILE customization exists
no business records
```

Do not print fileKey or raw Kintone error bodies.

# STEP 4 — AUTOMATED TESTS BEFORE LIVE WRITE

Extend `tests/sprint02-delivery.test.js` (or existing most relevant test file; avoid unnecessary new files) to cover:

```text
App798 required contract regression remains PASS
Hoshin field is Hoshin_Status and not custom Status
App794 whitelist exact / outsider rejected
HTML escaping
runtime does nothing outside injected HRCC app ID
runtime uses GET only
App794 pagination: 500 + next page, bounded max behavior
health totalCount parsing returns real counts (e.g. 12,8,5,3), not records.length
health denied source => unavailable, not zero
pipeline aggregation by Status
FY filter
Department filter
Section filter
Status filter
combined filters
quick links derived from injected/registered IDs
classic deploy bundle contains no import/export and passes syntax check or equivalent deterministic assertion
PROTECTED_APP_IDS unchanged
WRITE_ALLOWED_APPS = []
```

Run full `npm test`.
Zero failures required before any live deploy.

Commit code/tests/docs-current-design cleanup exactly:

```text
fix: finish hrcc runtime and remove stale active references
```

Push before live write.

# STEP 5 — NEW DURABLE PREWRITE BACKUP FOR APP800

Create NEW retained backup:

```text
backups/delivery-sprint-02r2/<UTC_TIMESTAMP>/
```

Never delete/overwrite prior Sprint02/Sprint02R backups.

Capture App800:

```text
live+preview settings
live+preview ACL
live+preview customization metadata
record count
```

Create SHA-256 manifest. Retain until independent review. Do not commit raw backup.

App797 is GET-only reconciliation; no write authorized.
App798 is frozen; no write authorized.

# STEP 6 — DEPLOY APP800 ONLY

Run committed deployment script exactly once after tests and backup.

Authorized Kintone writes:

```text
file upload HRCC bundle + CSS
PUT preview customize App800 only
POST deploy App800 only
```

Zero writes to:

```text
53,283,305,307,310,640,643,715,716
794,795,796,797,798
```

No retries after uncertain write. Reconcile by GET and stop.

# STEP 7 — POST-DEPLOY READBACK / SAFE RUNTIME SMOKE

Verify:

```text
App800 exact identity
Creator-only ACL
live customization metadata contains expected JS/CSS FILE entries
records = 0
App797 still 19 intended fields / Hoshin_Status / records 0 / Creator-only (GET only)
App798 still exact 15-field required contract / records 0 / Creator-only (GET only)
```

Run a safe runtime smoke with fake/injected runtime tests and, if practical in current authenticated Kintone context, confirm index customization loads without JS syntax error. Do not claim browser-render PASS unless directly observed; otherwise label `DEPLOY_METADATA_VERIFIED + RUNTIME_CONTRACT_TESTED`.

# STEP 8 — EVIDENCE / DOC CONSISTENCY

Run full `npm test` again after deployment. Record actual total.

Update living docs and APP_REGISTRY to actual state. Correct stale generic task call/write counters and stale test totals.

AI_REVIEW_PACKAGE must record:

```text
SPRINT02R2
backup path
manifest SHA256
actual App800 upload/customize/deploy counts
actual GET/readback counts if tracked
App797 writes = 0
App798 writes = 0
794/795/796 writes = 0
protected writes = 0
records created = 0
classic bundle syntax validation = PASS
runtime contract test = PASS
browser-render verification = PASS or NOT_DIRECTLY_OBSERVED (never fabricate)
NO_ORPHAN_ARTIFACT_GATE = PASS
OLD_ARTIFACTS_FOUND
OLD_ARTIFACTS_REMOVED_OR_RECONCILED
STALE_ACTIVE_REFERENCES = 0
npm test = actual pass/fail
```

Preserve Stage3C evidence exception exactly.

Commit exactly:

```text
docs: record sprint02r2 final dashboard evidence
```

Push; require local HEAD = remote HEAD and clean tracked tree; STOP.

# STRICT OUT OF SCOPE

Do NOT seed 795/796.
Do NOT write 794/795/796/797/798.
Do NOT create Hoshin/Archive records.
Do NOT alter scoring ratios.
Do NOT add more apps.
Do NOT add duplicate HRCC runtime files.

# REVIEW EXPECTATION

```text
ARCHIVE_REQUIRED_CONTRACT_GATE = PASS expected
HOSHIN_STATUS_RECONCILIATION_GATE = PASS expected
NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL
HRCC_REPRODUCIBLE_SOURCE_GATE = PASS/FAIL
HRCC_CLASSIC_BUNDLE_GATE = PASS/FAIL
HRCC_RUNTIME_BINDING_GATE = PASS/FAIL
HRCC_GET_ONLY_GATE = PASS/FAIL
HRCC_FIELD_WHITELIST_GATE = PASS/FAIL
HRCC_XSS_ESCAPE_GATE = PASS/FAIL
HRCC_PAGINATION_GATE = PASS/FAIL
HRCC_REAL_COUNT_GATE = PASS/FAIL
HRCC_FILTER_GATE = PASS/FAIL
HRCC_PIPELINE_GATE = PASS/FAIL
HRCC_UNAVAILABLE_SOURCE_GATE = PASS/FAIL
HRCC_NATIVE_SECURITY_GATE = PASS/FAIL
PREWRITE_BACKUP_RETENTION_GATE = PASS/FAIL
794_795_796_797_798_ZERO_WRITE_GATE = PASS/FAIL
PROTECTED_ZERO_WRITE_GATE = PASS/FAIL
REGRESSION_GATE = PASS/FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS/FAIL
GIT_PUSH_SYNC_GATE = PASS/FAIL
DELIVERY_SPRINT_02_GATE = PASS/BLOCKED
```
