# AI ACTIVE TASK — DELIVERY DAY SPRINT 02R3: FINAL HRCC BUNDLE SYNTAX CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `c4634cc03fe00f878afe8527217f823f073a8254`
> **Mode:** MINI-FIX ONLY — DO NOT EXPAND SCOPE

# TODAY NORTH STAR

```text
TODAY_DELIVERY_TARGET = REQUIRED MBO APPS OPERATIONAL + SECURE REAL-DATA HR DASHBOARD MVP + SMOKE TEST

M1 App 794 Transaction Core        = EXISTING / READINESS NOT YET CLOSED
M2 App 795 Routing Master          = EXISTING / REQUESTER COVERAGE 1/12
M3 App 796 Scoring Master          = LIVE VERIFIED / 23 FIELDS / RECORDS 0
M4 App 797 Hoshin Master           = PASS / 19 FIELDS / Hoshin_Status / DOC CLEANED
M5 App 798 Revision Archive        = PASS / 15-FIELD CONTRACT / FROZEN
M6 App 796 scoring baseline        = NEXT AFTER THIS MINI-FIX
M7 App 795 routing baseline        = NEXT AFTER THIS MINI-FIX
M8 App 800 HR Dashboard MVP        = BLOCKED ONLY BY CLASSIC BUNDLE BUILD DEFECT + COUNT SEMANTICS
M9 End-to-end smoke test           = AFTER M6/M7

TODAY_DONE = NO
NEXT_CRITICAL_PATH = FIX M8 MINI-DEFECT -> M6+M7 -> M9
```

# INDEPENDENT REVIEW RESULT — SPRINT 02R2

Accepted:

```text
HOSHIN_STATUS_RECONCILIATION_GATE = PASS
ARCHIVE_REQUIRED_CONTRACT_GATE = PASS
NO_ORPHAN_CURRENT_HOSHIN_DOC_GATE = PASS
HRCC_RUNTIME_FEATURE_GATE = PASS AT SOURCE/UNIT LEVEL
HRCC_FIELD_WHITELIST_GATE = PASS
HRCC_XSS_ESCAPE_GATE = PASS
HRCC_PAGINATION_SOURCE_GATE = PASS
HRCC_FILTER_SOURCE_GATE = PASS
HRCC_PIPELINE_SOURCE_GATE = PASS
PROTECTED_ZERO_WRITE_EVIDENCE = PASS
794_795_796_797_798_ZERO_WRITE_EVIDENCE = PASS
```

Sprint 02R2 is NOT CLOSED because of one critical deployment defect and one count-semantics defect.

## MUST FIX 1 — Classic bundle generator creates duplicate DEFAULT_APP_IDS declaration

Current `buildClassicHrccBundle()` prepends:

```js
const DEFAULT_APP_IDS = <registry values>;
```

Then transforms the source's existing:

```js
export const DEFAULT_APP_IDS = Object.freeze(...)
```

into another:

```js
const DEFAULT_APP_IDS = Object.freeze(...)
```

inside the same IIFE scope.

That is a duplicate lexical declaration and can cause a browser syntax error. Metadata deploy success is not runtime success.

Required correction:

- Keep ONE authoritative `DEFAULT_APP_IDS` in the generated classic bundle.
- Exact values must come from `config/sandbox-apps.json`, not hardcoded fallback when registry keys are present.
- Do not maintain a second hand-written runtime copy.
- Generated bundle MUST pass a real JavaScript syntax parse/check before upload.

Minimum test must actually compile/parse generated bundle, not only search for `import/export` strings. Use a safe Node syntax mechanism such as `new Function(bundle)` or write to ignored temp file and `node --check`. Test must fail on duplicate declarations.

## MUST FIX 2 — Health counts must represent business meaning

Current `fetchHealthCount()` counts all records. For dashboard health this is not exact enough once M6/M7 are seeded.

Required GET-only count semantics:

```text
App 795 routing coverage = count records where Active = "Active"
App 796 scoring baseline health = count records where Config_Status = "PUBLISHED"
App 797 Hoshin health = count records where Ready_For_MBO = "YES" OR, if no ready baseline yet, report total separately without calling it ready
App 798 archive = total record count
```

Implement a generic safe count helper with an explicit Kintone query argument, or extend the existing helper minimally. Do not create unnecessary files.

The dashboard label must match what is counted. Do not call total configs "published" unless query filters `Config_Status = "PUBLISHED"`.

# NO-ORPHAN RULE — STILL MANDATORY

Do not add duplicate bundle/runtime/config files.
If this correction replaces temporary or obsolete generated artifacts, remove them after safe verification.
Do not delete historical evidence or backups.

Required:

```text
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
```

# STEP 0 — SAFETY

Require branch `ai/antigravity-wp002c`, reviewed head `c4634cc...` in ancestry, clean tracked tree, local=remote before work.

No reset/rebase/force push.

# STEP 1 — CODE + TEST ONLY

Modify existing files only unless absolutely unavoidable:

```text
scripts/kintone/deploy-delivery-sprint02.js
src/ui/hr-control-center.js
tests/sprint02-delivery.test.js
```

Do not touch App 797/798 schema source.
Do not seed 795/796.

Tests must include:

```text
generated classic bundle parses successfully
exactly one DEFAULT_APP_IDS declaration in executable bundle
bundle has no import/export declarations
registry IDs are injected correctly
App795 count query includes Active = "Active"
App796 count query includes Config_Status = "PUBLISHED"
App797 ready count query includes Ready_For_MBO = "YES"
App798 count remains total
GET only
existing whitelist/XSS/pagination/filter/pipeline tests remain PASS
```

Run full `npm test`; zero failures.

Commit exactly:

```text
fix: correct hrcc classic bundle and health count semantics
```

Push before any live deploy.

# STEP 2 — NEW DURABLE APP800 PREWRITE BACKUP

Create new retained backup:

```text
backups/delivery-sprint-02r3/<UTC_TIMESTAMP>/
```

Capture App800 live/preview settings, ACL, customization metadata, and record count. SHA-256 manifest. Retain until ChatGPT review.

Do not overwrite/delete prior backups.

# STEP 3 — DEPLOY APP800 ONLY

Run the corrected committed deployment script exactly once.

Before upload, the script itself must perform real syntax validation on the generated bundle and STOP before network write if syntax invalid.

Authorized writes only:

```text
upload generated HRCC JS bundle
upload HRCC CSS
PUT preview customize App800
POST deploy App800
```

Zero writes to Apps 794/795/796/797/798 and all protected apps.
No records created.

After deploy verify:

```text
exact app name
Creator-only ACL
live customization has JS/CSS FILE entries
deploy status SUCCESS
App800 records = 0
```

Do not claim visual/browser runtime PASS unless directly observed. Metadata + syntax + runtime contract tests may be stated separately.

# STEP 4 — FINAL EVIDENCE

Run full tests again.

Update five living docs only as needed. Fix stale test totals/counters while there.

Record:

```text
SPRINT02R3 = COMPLETE / PENDING CHATGPT REVIEW
CLASSIC_BUNDLE_SYNTAX_CHECK = PASS
DEFAULT_APP_IDS_DECLARATION_COUNT = 1
HRCC_HEALTH_COUNT_SEMANTICS = ACTIVE/PUBLISHED/READY/TOTAL EXACT
App800 deploy writes = actual counts
794/795/796/797/798 writes = 0
protected writes = 0
records created = 0
backup path + manifest SHA256
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
npm test = actual total / 0 fail
NEXT_ACTION = M6 + M7 DELIVERY SEED SPRINT
```

Commit exactly:

```text
docs: record sprint02r3 final hrcc evidence
```

Push, verify local HEAD = remote HEAD, tracked tree clean, STOP.

# STRICT OUT OF SCOPE

Do not seed App795 or App796.
Do not write App794/795/796/797/798.
Do not alter scoring ratios.
Do not add apps.
Do not create duplicate HRCC runtime/bundle files.

# REVIEW EXPECTATION

```text
HRCC_CLASSIC_BUNDLE_SYNTAX_GATE = PASS/FAIL
HRCC_SINGLE_REGISTRY_DECLARATION_GATE = PASS/FAIL
HRCC_REGISTERED_ID_INJECTION_GATE = PASS/FAIL
HRCC_HEALTH_COUNT_SEMANTICS_GATE = PASS/FAIL
HRCC_GET_ONLY_GATE = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL
APP800_NATIVE_SECURITY_GATE = PASS/FAIL
PREWRITE_BACKUP_RETENTION_GATE = PASS/FAIL
794_795_796_797_798_ZERO_WRITE_GATE = PASS/FAIL
PROTECTED_ZERO_WRITE_GATE = PASS/FAIL
REGRESSION_GATE = PASS/FAIL
GIT_PUSH_SYNC_GATE = PASS/FAIL
DELIVERY_SPRINT_02_GATE = PASS/BLOCKED
```
