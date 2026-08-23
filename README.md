# TTMET MBO / PMS V2

Sandbox-only implementation of the TTMET MBO / PMS V2 system.

## Safety boundary

- App 53 (`Employee Namelist`) is read-only.
- App 283 (`PMS Staff & Chief`) is read-only.
- Kintone writes are denied unless the target is recorded in `config/sandbox-apps.json`.
- Secrets belong only in local environment variables or `.env`, which is ignored by Git.

## Development

Run the mandatory guard tests with `npm test`.

Set `KINTONE_BASE_URL` and either `KINTONE_API_TOKEN` or `KINTONE_USERNAME` plus `KINTONE_PASSWORD` in local `.env.local` before running `npm run connection:test`. If the domain has Basic Authentication enabled, also set `KINTONE_BASIC_AUTH_USERNAME` and `KINTONE_BASIC_AUTH_PASSWORD`. The connection test makes a GET request to App 53 only.

Sandbox app IDs are intentionally unset until a successful read-only Kintone authentication test and app creation.
