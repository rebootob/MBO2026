# AI ACTIVE TASK — DELIVERY DAY SPRINT 02R: TARGETED ARCHIVE + HRCC CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Independent review head:** `dcce0f922d932994328b737b335abf8cb2fd0877`
> **Mode:** TARGETED CORRECTION ONLY — DO NOT EXPAND SCOPE

# TODAY NORTH STAR

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD MVP + SMOKE TEST

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / REQUESTER COVERAGE 1/12
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 App 797 Hoshin Master           = LIVE SCHEMA CLAIMED / NEED EXACT Hoshin_Status RECONCILIATION
M5 App 798 Revision Archive        = MUST FIX 3 REQUIRED FLAGS
M6 App 796 scoring baseline        = RATIO CONFIRMED / NEXT AFTER SPRINT02R
M7 App 795 routing baseline        = 1/12 / NEXT AFTER SPRINT02R
M8 App 800 HR Dashboard MVP        = MUST FIX RUNTIME / REPRODUCIBLE DEPLOYMENT
M9 End-to-end smoke test           = AFTER M6/M7

TODAY_DONE = NO
NEXT_CRITICAL_PATH = CLOSE ONLY M4/M5/M8 REVIEW DEFECTS, THEN IMMEDIATELY M6+M7
```

# PROJECT-WIDE MANDATORY RULE — NO ORPHAN / CLEAN REPLACEMENT

This is a hard project rule and applies to every current and future work package. It reinforces `DEC-016` No Orphan / No Dead Artifact governance.

```text
NO_ORPHAN_ARTIFACT_GATE = MANDATORY
DEPRECATED_FIELD_RETENTION = PROHIBITED unless explicitly required for historical compatibility and documented
DEAD_FILE_RETENTION = PROHIBITED
DUPLICATE_IMPLEMENTATION_RETENTION = PROHIBITED
UNUSED_CONFIG_KEY_RETENTION = PROHIBITED
```

Whenever a field, file, function, configuration key, script, UI component, view, or other artifact is **added, removed, renamed, replaced, or superseded**, Antigravity MUST perform cleanup in the same work package:

1. Identify the exact old artifact being replaced.
2. Search the repository and Kintone target for all references to the old name/artifact.
3. Migrate every active reference to the new artifact.
4. Remove the old artifact if it is no longer used.
5. Verify no active reference points to the removed artifact.
6. Do not keep `*_old`, `*_v1`, duplicate field codes, dead scripts, unused helpers, stale config keys, duplicate views/customizations, or abandoned deployment artifacts merely "for safety".
7. Historical evidence/backups are the only exception. They must stay in the approved backup/evidence location and must NOT remain as active runtime/schema artifacts.
8. If deletion could destroy business/historical data, STOP and escalate to Control Plane before deletion. Never silently delete populated business fields or records.

For Kintone field rename/replacement specifically:

```text
PRE-BACKUP -> VERIFY NEW FIELD -> MIGRATE REFERENCES/DATA IF ANY -> REMOVE OLD UNUSED CUSTOM FIELD -> DEPLOY -> EXACT READ-BACK -> VERIFY OLD CUSTOM FIELD ABSENT
```

If the old field contains records/data, deletion is NOT automatically authorized; report the field code, record usage count, and required migration plan first.

For the current App 797 correction:

- Business label remains `Status`.
- Canonical custom field code is `Hoshin_Status`.
- Reconcile whether any deprecated **custom** field code `Status` from the attempted design exists.
- Do NOT confuse or attempt to delete Kintone's native/system Status field.
- If an unused deprecated custom field exists and contains no business data, clean it in the same correction only when the API clearly identifies it as the custom artifact and the pre-write backup exists.
- If it cannot be safely distinguished from native/system Status or contains data, STOP and report; do not delete.

Every final report must include:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED
OLD_ARTIFACTS_FOUND = <safe list/count>
OLD_ARTIFACTS_REMOVED = <safe list/count>
STALE_ACTIVE_REFERENCES = 0 required for PASS
```

ChatGPT independent review will explicitly fail a stage if a replacement leaves obsolete active fields/files/config/scripts behind without a documented compatibility reason.

# INDEPENDENT REVIEW RESULT

Sprint 02 is **BLOCKED — TARGETED MUST FIX**, not rejected wholesale.

Accepted so far:

```text
SCORING_RATIO_TRUTH_GATE = PASS
SANDBOX_REGISTRY_GUARD_GATE = PASS
PROTECTED_DEFAULT_DENY_GATE = PASS
HRCC_APP_REGISTRATION = App 800 registered
DEC-042 = PASS (70/30, 60/40, 50/50)
```

## MUST FIX 1 — App 798 exact required contract is wrong in Git source

Current `config/schema-spec.js` defines these as optional because helper defaults are `required:false`:

```text
Reason        MULTI_LINE_TEXT  -> MUST be required=true
Snapshot_JSON MULTI_LINE_TEXT  -> MUST be required=true
Archived_At   DATETIME         -> MUST be required=true
```

This violates the Sprint 02 approved exact 15-field contract and archive audit integrity.

Fix source + tests and, if live App 798 read-back confirms they are optional, update ONLY these three existing field definitions in preview and deploy App 798. RecordCount must still be 0 before write.

Prefer extending existing helpers minimally, e.g. `area(label, options={})` / `datetime(label, options={})`, only if this does not change any existing field semantics.

## MUST FIX 2 — HRCC committed source is not a working real-data runtime

Current `src/ui/hr-control-center.js` is only a renderer/query helper. Independent review finds no committed:

- `app.record.index.show` runtime registration
- exact App 800 binding at runtime
- Kintone GET orchestration for Apps 794–798
- pipeline aggregation
- FY/Department/Section/Status filters
- quick links 794–798
- health/warning calculation from live GETs
- reproducible `scripts/kintone/deploy-delivery-sprint02.js`

The task explicitly required these. A live customization that cannot be reproduced/audited from Git is not acceptable under project governance.

Implement the actual runtime in Git and commit the deployment script. Do not rely on ephemeral local-only dashboard code.

## MUST FIX 3 — dashboard field security must be whitelist-based, not incomplete blacklist-based

Current `buildHrccMonitoringQuery(fields)` accepts caller-supplied fields and rejects only a small blacklist. That can miss fields such as `Manager_Achievement_1`, numbered comments, GM ratings, etc.

Required behavior:

```text
Only fields in ALLOWED_MONITORING_FIELDS_794 may ever be requested.
Any field outside the exact allow-list = FAIL CLOSED.
```

Also HTML-escape every Kintone-derived value before inserting into markup to prevent stored/display XSS.

## MUST FIX 4 — Hoshin field-code reconciliation

The last commit changed business Status field code from `Status` to `Hoshin_Status` because Kintone reserves/system-collides with `Status`.

This technical correction is acceptable in principle, but it happened AFTER the evidence commit and there is no exact durable live evidence in the review package.

GET-reconcile App 797 live + preview and prove:

```text
19 intended user fields exist
business lifecycle field code = Hoshin_Status
Hoshin_Status type = DROP_DOWN
options = DRAFT / CURRENT_READY / SUPERSEDED
required = true
default = DRAFT
recordCount = 0
Creator-only ACL remains
```

Also apply the NO ORPHAN rule above: determine whether a deprecated custom `Status` artifact exists and whether it is safe/necessary to remove. Native/system Status must never be deleted.

If live already matches and no obsolete custom field exists: ZERO App797 writes.
If live does not match, or a deprecated artifact cannot be safely classified: STOP and report; do not invent another repair without Control Plane authorization.

Update the Hoshin architecture/schema documentation with a short technical mapping note:

```text
Business label: Status
Kintone field code: Hoshin_Status
Reason: avoid collision with Kintone system Status
```

No business-rule change.

# STEP 0 — GIT SAFETY

Require:

```text
branch = ai/antigravity-wp002c
HEAD starts from / contains dcce0f922d932994328b737b335abf8cb2fd0877
local HEAD = origin branch before execution
tracked tree clean
```

No reset/rebase/force push/history rewrite.

Read mandatory living docs, DECISIONS, Hoshin architecture, Revision architecture, security model, schema spec, sandbox guard, HRCC source/tests.

Before coding, search for stale/duplicate artifacts related to every replacement in this task. Examples:

```text
Status vs Hoshin_Status
old HRCC renderer-only runtime paths
old/temporary dashboard deployment scripts
obsolete config keys or duplicate HRCC app bindings
```

Do not delete historical backups/evidence.

# STEP 1 — CODE CORRECTION

Modify only files directly needed for the defects. Expected core files:

```text
config/schema-spec.js
src/ui/hr-control-center.js
src/styles/hr-control-center.css (only if needed)
tests/sprint02-delivery.test.js
scripts/kintone/deploy-delivery-sprint02.js (MUST exist in Git after this correction)
```

May update minimal docs later in evidence step.

Do not add a second dashboard implementation if the existing file can be corrected. Replace the existing implementation in place and remove obsolete duplicate code/routes/scripts created by the correction.

## App 798 tests MUST assert exact required flags

At minimum:

```text
Reason.required === true
Snapshot_JSON.required === true
Archived_At.required === true
Archive_Key required+unique
Source_Record_Key/Fiscal_Year/Employee_Code/Evaluation_Stage/Revision_Number/Event_Type/Snapshot_Hash/Archived_By all required as approved
field count exactly 15
```

## HRCC runtime contract

Implement a committed initializer/runtime that:

1. Executes only when `kintone.app.getId()` equals registered `hrControlCenterAppId` (800 at current registry).
2. Registers only `app.record.index.show` for HRCC.
3. Uses current Kintone session `kintone.api` GET calls only.
4. Uses exact Apps from registry; no hardcoded secret/token.
5. App 794 data requests use ONLY this exact whitelist:

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

6. Rejects any field outside whitelist before API call.
7. Escapes all displayed Kintone-derived strings.
8. Supports bounded GET pagination for App 794 if >500 records.
9. Reads safe counts/status from 795/796/797/798 without dumping confidential/raw records unnecessarily.
10. Renders:
   - KPI Total / Completed / In Progress / Need Attention
   - pipeline count by Status
   - filters FY / Department / Section / Status
   - Employee Evaluation Monitor grid
   - System Health counts
   - warnings: routing<12, scoring=0, Hoshin=0
   - quick links 794/795/796/797/798
11. Fail closed per source module if GET denied/unavailable.
12. No write/action buttons.
13. No POST/PUT/PATCH/DELETE in browser runtime.
14. No external CDN/framework.

The dashboard may show current sandbox health as warnings; do NOT fabricate records.

## Deployment script contract

`scripts/kintone/deploy-delivery-sprint02.js` must be committed and must reproduce exactly the deployed HRCC customization from committed source/CSS.

It must:

- resolve App 800 from registry, not magic unregistered target
- assert sandbox target with explicit process-local allow-list
- remove API token from execution process
- upload only HRCC JS/CSS
- PUT customize only App 800
- deploy only App 800
- bounded poll
- exact read-back of HRCC identity, ACL, and customization metadata
- never modify Apps 794/795/796/797/798 business data
- never print secrets or file upload response secrets beyond safe metadata

Do not reuse `scripts/kintone/deploy-custom-ui.js` because that targets App 794 employee UI.
Do not leave a temporary/alternate HRCC deploy script after this canonical script is committed.

Run `npm test` before any live write. Required zero failures.

Commit code/tests/script exactly:

```text
fix: complete sprint02 archive contract and hrcc runtime
```

Push before live correction.

# STEP 2 — NEW DURABLE PRE-WRITE BACKUP

Before any new write create a NEW retained backup:

```text
backups/delivery-sprint-02r/<UTC_TIMESTAMP>/
```

Never overwrite/delete prior Sprint02 backup.

Capture safe rollback state for:

```text
App 798 live/preview settings, fields, layout, ACL, record count
App 800 live/preview settings, customize metadata, ACL
App 797 GET-only reconciliation state
```

Create SHA-256 manifest and RETAIN until independent review.
Do not commit raw backups or secrets. Evidence docs must include backup path + manifest SHA256 value.

# STEP 3 — LIVE CORRECTION

## App 797

GET first. Apply NO ORPHAN inspection to `Status` vs `Hoshin_Status`.

No writes if:

```text
Hoshin_Status live/preview exact contract matches
no obsolete custom lifecycle field remains
```

If an obsolete custom field definitely exists, is not native/system Status, contains zero business data, and deletion is necessary to satisfy canonical schema, removal is permitted only after retained backup and exact classification. Otherwise STOP and report.

## App 798

Required preconditions:

```text
exact identity App 798 = MBO Revision Archive [Sandbox]
Creator-only ACL
recordCount = 0
only three required-flag defects present; no unrelated drift
```

Authorized App798 write only if required:

```text
PUT preview form fields for existing Reason / Snapshot_JSON / Archived_At required=true
POST deploy App798
bounded poll
GET live+preview exact read-back
```

No field addition/deletion/rename.
No records.
No retry after uncertain write; reconcile by GET.

## App 800 HRCC

Redeploy customization from committed canonical source/script only.
Authorized writes:

```text
file upload HRCC JS/CSS
PUT preview customize App800 only
POST deploy App800 only
bounded poll
```

No App800 business records.
No ACL weakening. Creator-only remains mandatory.
Ensure old/superseded HRCC customization file references are not retained alongside the canonical customization unless Kintone requires them; final customization read-back must reference only the intended canonical active JS/CSS files.

Absolutely ZERO writes to:

```text
53,283,305,307,310,640,643,715,716
794,795,796
```

App797 writes are restricted to the explicit orphan-cleanup case above and only if safe classification + zero business data + retained backup are all proven.

# STEP 4 — LIVE READ-ONLY SMOKE

After deployment, verify from safe GET/read-back:

```text
797 Hoshin_Status exact + canonical intended custom schema + 0 records + Creator-only
798 15 fields with three corrected required flags + 0 records + Creator-only
800 exact identity + Creator-only + customization live
HRCC can GET allowed App794 monitoring fields under current session
HRCC can GET health/count inputs from 795–798
no confidential App794 fields requested
runtime write count = 0
stale active references/artifacts = 0
```

Do not claim filters/pipeline/links passed unless committed test coverage and runtime smoke support them.

# STEP 5 — TEST + EVIDENCE CONSISTENCY

Run full `npm test` again after live correction. Record actual pass count.

Update living docs + APP_REGISTRY status rows so they match real state:

```text
App 797 = Live Deployed / canonical Hoshin schema / Hoshin_Status technical mapping
App 798 = Live Deployed / 15-field archive schema
App 800 = Live Deployed / Secure HRCC Dashboard MVP
Active Sandbox Apps = include 794,795,796,797,798,800
```

Correct stale generic counters/test totals. Do not leave `THIS_TASK_KINTONE_CALLS=0` if this correction executed live calls.

AI_REVIEW_PACKAGE must include explicit Sprint02R evidence:

```text
backup path
manifest SHA256
App797 GET count / actual write count
App798 exact before/after defect state + actual PUT/deploy count
App800 customization deploy counts
794/795/796 writes = 0
protected writes = 0
records created = 0
actual tests pass/fail
NO_ORPHAN_ARTIFACT_GATE status
old artifacts found/removed
stale active references count
exact commit SHAs
```

Preserve Stage3C historical evidence exception unchanged.

Commit exactly:

```text
docs: record sprint02 targeted correction evidence
```

Push, verify local HEAD = remote HEAD, tracked tree clean, then STOP.

# STRICT OUT OF SCOPE

Do NOT seed App796 yet.
Do NOT seed App795 yet.
Do NOT write App794.
Do NOT create Hoshin records.
Do NOT create Archive records.
Do NOT implement Hoshin supersession/reopen business writes.
Do NOT change scoring ratios.
Do NOT broaden HRCC ACL beyond Creator-only.
Do NOT retain obsolete active artifacts created or superseded by this task.

# REVIEW EXPECTATION

```text
SCORING_RATIO_TRUTH_GATE = PASS expected
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
HOSHIN_STATUS_RECONCILIATION_GATE = PASS/FAIL
ARCHIVE_REQUIRED_CONTRACT_GATE = PASS/FAIL
ARCHIVE_LIVE_REPAIR_GATE = PASS/FAIL
HRCC_REPRODUCIBLE_SOURCE_GATE = PASS/FAIL
HRCC_RUNTIME_BINDING_GATE = PASS/FAIL
HRCC_GET_ONLY_GATE = PASS/FAIL
HRCC_FIELD_WHITELIST_GATE = PASS/FAIL
HRCC_XSS_ESCAPE_GATE = PASS/FAIL
HRCC_MVP_FEATURE_GATE = PASS/FAIL
PREWRITE_BACKUP_RETENTION_GATE = PASS/FAIL
794_795_796_ZERO_WRITE_GATE = PASS/FAIL
PROTECTED_ZERO_WRITE_GATE = PASS/FAIL
REGRESSION_GATE = PASS/FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS/FAIL
GIT_PUSH_SYNC_GATE = PASS/FAIL
DELIVERY_SPRINT_02_GATE = PASS/BLOCKED
```
