---
name: kintone-sandbox-safety
description: Safety rules and write-guard policies for TTMET MBO V2 Kintone sandbox development
---

# Kintone Sandbox Safety Guard Policy

## 1. App Environment Categorization

### Protected Production Apps (STRICTLY READ ONLY)
- **App 53**: Employee Namelist / Employee Master (`https://ttmet.cybozu.com/k/53/`)
- **App 283**: PMS Staff & Chief Legacy (`https://ttmet.cybozu.com/k/283/`)
- **RULES**: NEVER send `POST`, `PUT`, or `DELETE` requests to App 53 or App 283 under ANY circumstance.

### Writable Sandbox Development Apps
- **App 794**: TTMET MBO / PMS V2 Sandbox (Main transaction app)
- **App 795**: MBO Routing Master Sandbox (Section-to-approver mapping)

## 2. Safety Guard Implementation
All scripts modifying Kintone schemas, processes, layouts, customizations, or records MUST import and invoke `assertSandboxWriteTarget(appId)` from `src/core/sandbox-write-guard.js`.
- **Default Policy**: DENY all write operations unless explicitly whitelisted in `config/sandbox-apps.json`.
- **Pre-modification Requirement**: Always run `npm run sandbox:backup` before modifying App 794 / 795 schemas or customizations.

## 3. Credential & Secrets Hygiene
- Never commit credentials, passwords, or API tokens to Git.
- Local configuration resides strictly in `.env.local` (ignored by Git).
- Environment variables: `KINTONE_BASE_URL`, `KINTONE_USERNAME`, `KINTONE_PASSWORD`, `KINTONE_API_TOKEN`.
