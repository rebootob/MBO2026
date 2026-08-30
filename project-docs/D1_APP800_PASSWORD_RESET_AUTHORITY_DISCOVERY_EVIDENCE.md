# D1 APP800 PASSWORD RESET AUTHORITY & CUSTOMIZATION BINDING DISCOVERY EVIDENCE

> STATUS: `PENDING_CHATGPT_REVIEW`  
> Execution Timestamp: 2026-08-30T10:45:32+07:00  
> Target App: App 800 HR Control Center ONLY  
> Discovery Mode: **READ-ONLY DISCOVERY ONLY (GET ONLY / NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY / NO PASSWORD RESET)**

---

## 1. Initial State & Branch Verification

```text
OBSERVED_BRANCH_HEAD          = b1f6a96afd98f59d4eb7c74fd4f811ece38215bc
TARGET_APP                    = App 800 HR Control Center
ACCEPTED_APP794_REVISION      = 60 (UNTOUCHED / PRESERVED)
```

---

## 2. App800 Actual Live & Preview Customization State

GET-read customization endpoints `/k/v1/app/customize.json?app=800` and `/k/v1/preview/app/customize.json?app=800`:

```text
APP800_LIVE_REVISION          = 7
APP800_PREVIEW_REVISION       = 7
APP800_LIVE_SCOPE             = ALL
APP800_PREVIEW_SCOPE          = ALL

LIVE_DESKTOP_JS_FILE_NAME     = hr-control-center-bundle.js
LIVE_DESKTOP_JS_FILE_KEY      = 202608250502411FA7D332B9DA47E8AECD15BE71EC6C3E188
LIVE_DESKTOP_JS_SIZE          = 16,511 bytes
LIVE_DESKTOP_JS_GIT_BLOB      = 52f59008ec23259ab553afd01a600f3df2760afc

LIVE_DESKTOP_CSS_FILE_NAME    = hr-control-center.css
LIVE_DESKTOP_CSS_FILE_KEY     = 2026082505024135DA0639E68A47CBB4DC8A3B39578D0F124
LIVE_DESKTOP_CSS_SIZE         = 2,123 bytes
LIVE_DESKTOP_CSS_GIT_BLOB     = 8ace549b91c7b02a19de05c7584402eb49ad62d1

PREVIEW_DESKTOP_JS_FILE_NAME  = hr-control-center-bundle.js
PREVIEW_DESKTOP_CSS_FILE_NAME = hr-control-center.css
LIVE_MOBILE_JS_COUNT          = 0
LIVE_MOBILE_CSS_COUNT         = 0
```

### Source Correspondence Audit

- **CSS Match:** Deployed Live CSS `hr-control-center.css` Git blob SHA (`8ace549b91c7b02a19de05c7584402eb49ad62d1`, 2,123 bytes) **exactly matches** repository source file `src/styles/hr-control-center.css` (size: 2,123 bytes).
- **JS Match:** Deployed Live JS `hr-control-center-bundle.js` (16,511 bytes) corresponds to the bundled IIFE output compiled from repository source file `src/ui/hr-control-center.js` (size: 16,572 bytes).

---

## 3. App800 Rights & Authority Findings

GET-read ACL endpoint `/k/v1/app/acl.json?app=800` (Revision `7`):

```json
{
  "rights": [
    {
      "entity": {
        "type": "CREATOR",
        "code": null
      },
      "includeSubs": false,
      "appEditable": true,
      "recordViewable": true,
      "recordAddable": true,
      "recordEditable": true,
      "recordDeletable": true,
      "recordImportable": true,
      "recordExportable": true
    },
    {
      "entity": {
        "type": "GROUP",
        "code": "everyone"
      },
      "includeSubs": false,
      "appEditable": false,
      "recordViewable": false,
      "recordAddable": false,
      "recordEditable": false,
      "recordDeletable": false,
      "recordImportable": false,
      "recordExportable": false
    }
  ],
  "revision": "7"
}
```

### Key Authority Findings:

1. **`admin-form` Access:**
   - `admin-form` operates under `CREATOR` principal in App 800 ACL (`type: "CREATOR"`), granting full App and Record access (`recordViewable: true`, `recordAddable: true`, `recordEditable: true`).
2. **Shared Employee Principals Access:**
   - Ordinary employees and shared principals belong to `GROUP:everyone`.
   - App 800 ACL explicitly revokes all record permissions from `GROUP:everyone` (`recordViewable: false`, `recordAddable: false`, `recordEditable: false`). Therefore shared employee principals have **ZERO** native Kintone access to App 800 records.
3. **`HR_ADMIN_GROUP` Finding:**
   - `HR_ADMIN_GROUP` is **NOT** currently present in App 800 App ACL (`/k/v1/app/acl.json?app=800`).
   - Tenant-wide Cybozu User API `/k/v1/groups.json` returned HTTP 404 via REST token. Tenant group membership list is reported as `UNKNOWN`.

---

## 4. Repository Tooling Binding Inspection

Inspection of repository build & deploy scripts:

- **Build Script (`scripts/kintone/build-mbo-ui.js`):** Hardcoded for `src/main-mbo-app.js` -> `dist/mbo-employee-app.js` (App 794 UI bundle).
- **Deploy Script (`scripts/kintone/deploy-custom-ui.js`):** Enforces strict target binding guard `appId === 794` and hardcoded filenames `mbo-employee-app.js` and `mbo-employee.css`.
- **Smallest Missing Tooling Requirement:**
  1. Dedicated build entrypoint for App 800 (`scripts/kintone/build-hrcc-ui.js` or parameterized `buildMboUi({ entryPoints: ['src/ui/hr-control-center.js'], outfile: 'dist/hr-control-center-bundle.js', cssSource: 'src/styles/hr-control-center.css', cssOutfile: 'dist/hr-control-center.css' })`).
  2. Dedicated customization deploy script/path for App 800 with explicit sandbox write guard for `appId = 800`.

---

## 5. Network & Safety Operations Verification Table

| Metric | Recorded Value | Requirement | Result |
|---|---|---|---|
| GET Requests | `6` | Read-only GET queries allowed | PASS |
| POST Requests | `0` | Strictly 0 | PASS |
| PUT Requests | `0` | Strictly 0 | PASS |
| DELETE Requests | `0` | Strictly 0 | PASS |
| Source / Test / Dist Edits | `0` | Strictly 0 | PASS |
| App 800 Record Writes | `0` | Strictly 0 | PASS |
| App 801 Record Writes | `0` | Strictly 0 | PASS |
| App 794 Record Writes | `0` | Strictly 0 | PASS |
| Schema / Layout / ACL / Process Writes | `0` | Strictly 0 | PASS |
| Customization Uploads | `0` | Strictly 0 | PASS |
| Deployments Executed | `0` | Strictly 0 | PASS |
| Password Resets Executed | `0` | Strictly 0 | PASS |
| Rollbacks Executed | `0` | Strictly 0 | PASS |

---

### Executor Status

`D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_CAPTURED_PENDING_CHATGPT_REVIEW`

- Read-only discovery completed with 0 network mutations and 0 source changes.
- Stopped. Pending ChatGPT Independent Review before any narrow source WP for App800 Password Reset UI.
