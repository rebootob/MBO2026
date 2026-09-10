# D3-SBX-MIGRATION-01-PREEXEC-01-R1 — Canonical Test Placement + Concrete Live Adapter Binding Corrective

Updated: 2026-09-10 ICT
Work Package: `D3-SBX-MIGRATION-01-PREEXEC-01-R1`
Mode: `SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O`
Authorized Base HEAD: `e1759eed10885fa5e67624a0f34b32df84664408`
Status: `EXECUTION COMPLETE / INDEPENDENT REVIEW PENDING`

## Owner authorization
`อนุมัติ D3-SBX-MIGRATION-01-PREEXEC-01-R1 แบบ SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O ตามขอบเขตที่เสนอ`

## Corrective reason
Independent review of PREEXEC-01 found that `scripts/kintone/d3-sbx-migration-live-runner.test.js` used relative imports that only resolve correctly when the file is under the repository-root `tests/` directory. The previous isolated assembled harness therefore did not prove that the committed test was discoverable/runnable from the canonical repository layout. Review also required a dedicated narrow live-I/O binding and one-shot authorization-ledger binding before any future live migration authorization could be considered.

## R1 changes
1. Move the existing runner test blob unchanged from `scripts/kintone/d3-sbx-migration-live-runner.test.js` to `tests/d3-sbx-migration-live-runner.test.js` so its existing relative imports resolve to root `config/`, `scripts/` and `project-docs/` paths and the file is covered by the repository `npm test` glob `tests/*.test.js`.
2. Add `scripts/kintone/d3-sbx-migration-live-binding.js` with a request-only transport contract, exact read/write app allowlists, exact schema/record endpoint binding, exact phase/field guards, and a durable file-backed one-shot authorization ledger.
3. Add `scripts/kintone/d3-sbx-migration-live-entrypoint.js` as the canonical no-side-effect binding between the reviewed live runner, the narrow I/O adapter, and the durable authorization ledger.
4. Add `tests/d3-sbx-migration-live-binding.test.js` for endpoint/scope/phase/field/record and replay guards.

## Frozen binding scope
```text
READ_APPS = [794,795,798]
WRITE_APPS = [794,795]
FORBIDDEN_WRITE_APPS = [796,797,798,800]

ALLOWED_WRITE_ENDPOINTS =
  POST /k/v1/preview/app/form/fields.json
  PUT  /k/v1/preview/app/form/fields.json
  POST /k/v1/preview/app/deploy.json
  PUT  /k/v1/records.json

PROCESS_WRITE = FORBIDDEN
ACL_WRITE = FORBIDDEN
CUSTOMIZATION_WRITE = FORBIDDEN
RECORD_CREATE = FORBIDDEN
RECORD_DELETE = FORBIDDEN
HISTORICAL_BACKFILL = FORBIDDEN
GENERIC_DEPLOY = FORBIDDEN
```

The adapter does not accept caller-selected endpoint paths and rejects extra callable transport methods. App795 record mutation is restricted to one atomic exact-20 existing-record update contract. App794 schema staging is restricted to the exact five provenance fields. The file-backed authorization ledger uses exclusive create semantics so replay is rejected across ledger instances sharing the same ledger directory.

## Validation evidence
```text
NODE_SYNTAX_CHECK_LIVE_BINDING = PASS
NODE_SYNTAX_CHECK_LIVE_ENTRYPOINT = PASS
NODE_SYNTAX_CHECK_BINDING_TEST = PASS
ISOLATED_BINDING_GUARD_HARNESS = 10/10 PASS
CANONICAL_RUNNER_TEST_PLACEMENT = PASS BY REPOSITORY-PATH INSPECTION
PACKAGE_TEST_GLOB_DISCOVERY = PASS / tests/*.test.js
CANONICAL_FULL_REPOSITORY_RUNTIME_TEST = NOT RUN IN CONNECTOR-ONLY ENVIRONMENT
FULL_REPOSITORY_INTEGRATION_TEST = NOT CLAIMED

KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
DEPLOYMENTS = 0
LIVE_MIGRATION_EXECUTIONS = 0
```

## Boundary
This corrective does not authorize `D3-SBX-MIGRATION-01`. PREEXEC-01 is not closed merely by this execution. R1 must receive an independent Control Plane review. Any future live migration still requires a new exact Owner authorization bound to the reviewed canonical HEAD and fresh fail-closed live guards.
