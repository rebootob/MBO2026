# AI ACTIVE TASK — M10G-R1 EMERGENCY APP794 ROLLBACK + CLASSIC BUNDLE REPAIR

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `cc80ddee36de00121efbffea969ba0c9b35cd5fa`
> Mode: EMERGENCY ROLLBACK UNDER EXISTING M10G ROLLBACK AUTHORIZATION + REPOSITORY FIX ONLY

# NORTH STAR

```text
App794 Revision 24 deployment is LIVE but browser runtime is BROKEN.
User supplied browser evidence:
Uncaught SyntaxError: Unexpected identifier 'from'

Independent GitHub inspection confirmed deployed dist/mbo-employee-app.js contains broken ES-module residue near line ~884:

  PROFILE_CODES,
  computeConfigurationHash,
  validateScoringMasterConfig
} from './scoring-config-master.js';

This is incompatible with Kintone classic-script customization and prevents all App794 JavaScript initialization.
```

# AUTHORIZATION / ROLLBACK BASIS

The original explicitly authorized M10G task included mandatory immediate rollback on:

```text
page initialization failure attributable to deployment
unexpected JS/CSS payload
critical runtime regression
```

This condition is now proven.
Use that already-approved rollback authority ONLY to restore the exact pre-write App794 customization from the durable backup created immediately before Revision 24 deployment.

Do NOT use this authorization for redeploying a newly fixed bundle.

# PHASE A — IMMEDIATE APP794 ROLLBACK

Target = App794 customization only.

Required:

1. Read current live App794 state and confirm current revision/customization still corresponds to failed Revision 24 deployment.
2. Load the exact pre-write backup from:
   `backups/m10g-app794-deployment/2026-08-25T15-04-32-590Z`
3. Restore the exact pre-write desktop customization state from Revision 23 evidence.
4. Preserve mobile customization exactly.
5. Trigger Kintone deployment for App794 only.
6. Poll until deployment SUCCESS.
7. Read back live customization and revision.
8. Verify restored JS/CSS references/content correspond to the pre-write backup state.
9. Verify no schema/process/ACL/record writes and no non-target app writes occurred.

Hard boundaries:

```text
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP53_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
APP800_WRITE = 0
APP801_WRITE = 0
OTHER_APP_WRITE = 0
```

If exact backup restore is impossible, STOP immediately and report BLOCKED. Do not improvise another live payload.

# PHASE B — ROOT CAUSE / BUILD PIPELINE REPAIR IN REPOSITORY ONLY

After rollback succeeds, fix the repository build so the future App794 bundle is a valid browser classic script.

Known defect to remove:

```js
PROFILE_CODES,
computeConfigurationHash,
validateScoringMasterConfig
} from './scoring-config-master.js';
```

Requirements:

1. Find the exact build script/tool that produced `dist/mbo-employee-app.js`.
2. Identify why ES module import/export syntax was partially stripped or concatenated incorrectly.
3. Fix the EXISTING build mechanism; do not create a duplicate build pipeline unless technically unavoidable.
4. Rebuild `dist/mbo-employee-app.js`.
5. The resulting bundle must contain ZERO active ES module statements/residue:
   - no `import ... from`
   - no bare `} from '...'`
   - no `export ` statements
6. The output must parse successfully as a classic browser script.
7. Preserve M10F/M10F-R1 runtime logic:
   - App53 employee lookup
   - App795 strict team-aware routing
   - App796 published scoring resolution
   - fail-closed rules
8. Do NOT deploy the fixed bundle in this task.

# REQUIRED BUILD VALIDATION

Add a durable regression gate so this class of deployment failure cannot pass again.

At minimum verify:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
```

Use a real parser/runtime syntax check appropriate for classic-script output (for example Node syntax parsing where compatible), not grep alone.
Grep/static checks may be additional gates.

Add/update automated tests or build verification so `npm test`/build validation fails if ES module residue reappears.

# PHASE C — VERIFY / EVIDENCE

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
ROLLBACK_STATUS = PASS
APP794_PAGE_RUNTIME_EXPECTED = RESTORED_TO_PREWRITE_STATE
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
APP794_FIXED_BUNDLE_DEPLOYED = NO
NO_ORPHAN_ARTIFACT_GATE = PASS
```

Update living docs with factual incident status. Record that the earlier M10G deployment review is superseded by this browser-runtime defect discovery.
Do not falsely state App794 Revision 24 runtime is healthy.

# FINAL REQUIRED SUMMARY

```text
M10G_R1_EMERGENCY_RECOVERY = COMPLETE / BLOCKED

INCIDENT = APP794_REV24_CLASSIC_SCRIPT_PARSE_FAILURE
CONFIRMED_BROWSER_ERROR = Unexpected identifier 'from'
ROOT_CAUSE = exact

ROLLBACK_EXECUTED = YES/NO
ROLLBACK_TARGET = exact
POST_ROLLBACK_REVISION = actual
ROLLBACK_READBACK = PASS/FAIL
APP794_SCHEMA_WRITES = 0
APP794_PROCESS_WRITES = 0
APP794_RECORD_WRITES = 0
APP794_ACL_WRITES = 0
NON_TARGET_APP_WRITES = 0

BUILD_PIPELINE_FIXED = YES/NO
FIXED_BUNDLE_PATH = exact
CLASSIC_BUNDLE_PARSE = PASS/FAIL
ES_MODULE_IMPORT_COUNT = actual
ES_MODULE_EXPORT_COUNT = actual
BROKEN_FROM_RESIDUE_COUNT = actual
FIXED_BUNDLE_DEPLOYED = NO

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW BEFORE ANY REDEPLOY
```

Commit and push same branch, then STOP.

Do NOT redeploy the fixed bundle.
Do NOT broaden Kintone write scope beyond the exact rollback already authorized by M10G.
