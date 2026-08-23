# Security Model

## Protected apps

Apps 53 and 283 are permanently blocked by `assertSandboxWriteTarget` and must never be supplied to a write API.

## Sandbox write policy

The default is deny. A write is allowed only after the app ID is registered in `config/sandbox-apps.json`; no bypass exists.

## Role model

- Shared requester accounts: limited to their assigned routing records and employee-stage fields.
- Manager and GM: assigned per snapshot routing fields.
- HR/Admin: least-privilege administrative access.

Manager/GM ratings, Part B, internal comments, and confidential scores will be protected through Kintone field permissions and export-profile filtering.
