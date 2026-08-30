# D1 APP800 PASSWORD RESET AUTHORITY & CUSTOMIZATION BINDING DISCOVERY EVIDENCE (R1 CORRECTIVE)

> STATUS: `PENDING_CHATGPT_REVIEW`  
> Execution Timestamp: 2026-08-30T10:56:32+07:00  
> Target App: App 800 HR Control Center ONLY  
> Work Package ID: MBO-P03-WP-002C  
> Corrective Task: D1 APP800 PASSWORD RESET AUTHORITY DISCOVERY R1 CORRECTIVE  
> Mode: **READ-ONLY DISCOVERY CORRECTIVE (GET ONLY / NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY / NO PASSWORD RESET)**

---

## 1. Superseded Claims Notice & Corrective Context

This R1 Corrective evidence document supersedes the initial discovery evidence (`b60f8912e298253e3a66612187abe124aa15b325`).

### Corrections Applied:

1. **CSS Blob Identity & Line Ending Normalization:**
   - *Prior Overclaim:* Stated deployed raw byte SHA `8ace549b91c7b02a19de05c7584402eb49ad62d1` matched canonical Git source without clarifying line-ending conversion.
   - *R1 Correction:* Canonical Git blob object SHA at `HEAD` (`git rev-parse HEAD:src/styles/hr-control-center.css`) is `3d61fdc332698902c77d60d4d60ef60b06c58db1` (LF line endings). The deployed Live/Preview file contains CRLF line endings (raw byte SHA `8ace549b91c7b...`). When normalized to standard LF line endings (`replace(/\r\n/g, '\n')`), the deployed CSS blob SHA **`3d61fdc332698902c77d60d4d60ef60b06c58db1`** is an **EXACT_MATCH** to canonical Git source `src/styles/hr-control-center.css`.
2. **`admin-form` = `CREATOR` Authority Proof:**
   - *Prior Overclaim:* Assumed `CREATOR` entity in App 800 ACL evaluated to `admin-form` without empirical proof.
   - *R1 Correction:* GET `/k/v1/app.json?id=800` explicitly returned `creator.code: "admin-form"` and `creator.name: "Admin-Form"`. Thus `APP800_CREATOR_IS_ADMIN_FORM = YES` is now empirically proven.
3. **JS Source Correspondence:**
   - *Prior Overclaim:* Stated deployed JS bundle "corresponded" to current `src/ui/hr-control-center.js`.
   - *R1 Correction:* Deployed JS is a compiled IIFE bundle (`hr-control-center-bundle.js`), whereas repository source is an unbundled ES module. Because no committed bundle or App800 build recipe exists in the repository, status is correctly marked **`UNKNOWN`** (unproven provenance).
4. **Complete Live & Preview Downloadable File Identity Audit:**
   - Captured and downloaded exact fileKeys, sizes, raw byte SHAs, and LF-normalized SHAs for both Live and Preview customization files.

---

## 2. Canonical Git Source Identities

Recorded directly from canonical repository `HEAD`:

```text
OBSERVED_BRANCH_HEAD          = 4b0e41d905607cab4bc72037adc6dbf39b56f82b
GIT_CANONICAL_CSS_BLOB_SHA    = 3d61fdc332698902c77d60d4d60ef60b06c58db1  (src/styles/hr-control-center.css, 2,014 bytes LF)
GIT_CANONICAL_JS_BLOB_SHA     = 508f132bd4c5b8a6aef6dcccd1e5ea19e05efbba  (src/ui/hr-control-center.js, 16,572 bytes)
```

---

## 3. App 800 Live & Preview Customization Audit

GET-read customization endpoints `/k/v1/app/customize.json?app=800` and `/k/v1/preview/app/customize.json?app=800`:

```text
LIVE_REVISION                 = 7
PREVIEW_REVISION              = 7
LIVE_SCOPE                    = ALL
PREVIEW_SCOPE                 = ALL
```

### Live & Preview File Details & SHA Audit Table

| Container | Type | File Name | FileKey | Raw Size | Raw Byte SHA | LF-Normalized SHA |
|---|---|---|---|---|---|---|
| Live Desktop JS | FILE | `hr-control-center-bundle.js` | `202608250502411FA7D332B9DA47E8AECD15BE71EC6C3E188` | 16,511 B | `52f59008ec23259ab553afd01a600f3df2760afc` | `a52bf345a02faf2187128f1256d75166e9b890e6` |
| Live Desktop CSS | FILE | `hr-control-center.css` | `2026082505024135DA0639E68A47CBB4DC8A3B39578D0F124` | 2,123 B | `8ace549b91c7b02a19de05c7584402eb49ad62d1` | `3d61fdc332698902c77d60d4d60ef60b06c58db1` |
| Preview Desktop JS | FILE | `hr-control-center-bundle.js` | `202608250502390AFD0F74F8654E699913E7C7415BDA47004` | 16,511 B | `52f59008ec23259ab553afd01a600f3df2760afc` | `a52bf345a02faf2187128f1256d75166e9b890e6` |
| Preview Desktop CSS | FILE | `hr-control-center.css` | `20260825050239F9713B7BD0D0401FBA6F8894807DFDCB180` | 2,123 B | `8ace549b91c7b02a19de05c7584402eb49ad62d1` | `3d61fdc332698902c77d60d4d60ef60b06c58db1` |
| Live Mobile JS/CSS | - | - | - | 0 | - | - |
| Preview Mobile JS/CSS | - | - | - | 0 | - | - |

---

## 4. Source-to-Deployed Provenance Decisions

### CSS Provenance Decision: `EXACT_MATCH` (when LF line-ending normalized)

- Deployed Live/Preview CSS file `hr-control-center.css` (2,123 bytes raw with CRLF) has raw byte SHA `8ace549b91c7b02a19de05c7584402eb49ad62d1`.
- When normalized for LF line endings (`replace(/\r\n/g, '\n')`), its blob SHA is **`3d61fdc332698902c77d60d4d60ef60b06c58db1`**.
- This **EXACTLY MATCHES** canonical Git source `HEAD:src/styles/hr-control-center.css` (`3d61fdc332698902c77d60d4d60ef60b06c58db1`).

### JS Provenance Decision: `UNKNOWN` (unproven build provenance)

- Deployed Live/Preview JS is a compiled IIFE bundle (`hr-control-center-bundle.js`, raw SHA `52f59008...`, LF SHA `a52bf345...`).
- Repository source `src/ui/hr-control-center.js` is an unbundled ES module (Git blob SHA `508f132b...`).
- No committed bundle artifact or App800 build script exists in the repository.
- **Decision:** Marked **`UNKNOWN`** because direct blob comparison between bundled IIFE and unbundled ES source module cannot establish identity without a reproducible build artifact chain.

---

## 5. App 800 Creator Identity Proof (`creator.code`)

GET-read App 800 metadata endpoint `/k/v1/app.json?id=800`:

```json
{
  "appId": "800",
  "name": "MBO HR Control Center [Sandbox]",
  "creator": {
    "code": "admin-form",
    "name": "Admin-Form"
  },
  "modifier": {
    "code": "admin-form",
    "name": "Admin-Form"
  }
}
```

```text
RETURNED_CREATOR_CODE         = admin-form
RETURNED_CREATOR_NAME         = Admin-Form
APP800_CREATOR_IS_ADMIN_FORM = YES
```

### Authority Proof:
Because App 800 ACL (`/k/v1/app/acl.json?app=800`) grants full permissions (`appEditable: true`, `recordViewable: true`, `recordAddable: true`, `recordEditable: true`) to the `CREATOR` entity, and `creator.code` is empirically verified as `admin-form`, **`admin-form` is proven to possess full App 800 authority**.

---

## 6. App 800 Rights & `HR_ADMIN_GROUP` Findings

GET-read ACL endpoint `/k/v1/app/acl.json?app=800` (Revision `7`):

```text
CREATOR_RIGHTS                = appEditable: true, recordViewable: true, recordAddable: true, recordEditable: true
EVERYONE_RIGHTS               = appEditable: false, recordViewable: false, recordAddable: false, recordEditable: false
HR_ADMIN_GROUP_IN_APP800_ACL  = NO
HR_ADMIN_GROUP_EXISTS_IN_TENANT = UNKNOWN (Cybozu User API /k/v1/groups.json returned 404 via REST token)
SHARED_PRINCIPAL_APP800_ACCESS = NO (explicitly denied via GROUP:everyone)
```

---

## 7. Repository Tooling Binding Finding

- **Build Script (`scripts/kintone/build-mbo-ui.js`):** Hardcoded for `src/main-mbo-app.js` -> `dist/mbo-employee-app.js` (App 794 UI bundle).
- **Deploy Script (`scripts/kintone/deploy-custom-ui.js`):** Enforces strict target binding guard `appId === 794`.
- **Smallest Missing Tooling Requirement:**
  1. App 800 build entrypoint (`scripts/kintone/build-hrcc-ui.js` or parameterized `buildMboUi({ entryPoints: ['src/ui/hr-control-center.js'], outfile: 'dist/hr-control-center-bundle.js' })`).
  2. App 800 deploy script/path with explicit write guard for `appId = 800`.

---

## 8. Network & Safety Operations Verification Table

| Metric | Recorded Value | Requirement | Result |
|---|---|---|---|
| GET Requests Executed | `8` | Read-only GET queries allowed | PASS |
| POST Requests Executed | `0` | Strictly 0 | PASS |
| PUT Requests Executed | `0` | Strictly 0 | PASS |
| DELETE Requests Executed | `0` | Strictly 0 | PASS |
| Source / Test / Dist / Script Edits | `0` | Strictly 0 | PASS |
| App 800 Record Writes | `0` | Strictly 0 | PASS |
| App 801 Record Writes | `0` | Strictly 0 | PASS |
| App 794 Record Writes | `0` | Strictly 0 | PASS |
| Schema / Layout / ACL / Process Writes | `0` | Strictly 0 | PASS |
| Customization Uploads | `0` | Strictly 0 | PASS |
| Deployments Executed | `0` | Strictly 0 | PASS |
| Password Resets Executed | `0` | Strictly 0 | PASS |
| Rollbacks Executed | `0` | Strictly 0 | PASS |

---

### Maximum Executor Status

`D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_R1_CORRECTED_PENDING_CHATGPT_REVIEW`

- R1 discovery corrective completed with empirical `creator.code` proof and exact LF-normalized CSS blob SHA match.
- Stopped. Pending ChatGPT Independent Review before any narrow source WP for App800 Password Reset UI.
