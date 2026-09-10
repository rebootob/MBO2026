# D3-SBX-MIGRATION-01-PREEXEC-01-R1 — Execution Evidence

Updated: 2026-09-10 ICT
Authorized Base HEAD: `e1759eed10885fa5e67624a0f34b32df84664408`
Mode: `SOURCE/TEST/DOCS-ONLY / ZERO KINTONE I/O`

## Corrected canonical test placement
The existing runner test blob SHA `75b7460506a7bc5badce4fb66ff077347ee84798` is moved unchanged to:

`tests/d3-sbx-migration-live-runner.test.js`

The former path is removed:

`scripts/kintone/d3-sbx-migration-live-runner.test.js`

From the root `tests/` location, its existing imports resolve to the canonical root paths `config/schema-spec.js`, `scripts/kintone/...` and `project-docs/evidence/...`. `package.json` defines `npm test` as `node --test tests/*.test.js services/mbo-auth-bridge/tests/*.test.js`, so the corrected runner test is now included in normal repository test discovery.

## Added binding artifacts
```text
scripts/kintone/d3-sbx-migration-live-binding.js
scripts/kintone/d3-sbx-migration-live-entrypoint.js
tests/d3-sbx-migration-live-binding.test.js
```

### Binding safeguards
- exact read scope `[794,795,798]`
- exact write scope `[794,795]`
- forbidden write scope `[796,797,798,800]`
- request-only transport; extra callable transport methods rejected
- caller cannot choose arbitrary endpoint paths
- App795 schema stage/finalize limited to frozen target fields and frozen phases
- App794 stage limited to the exact five provenance fields
- App795 record write limited to one atomic exact-20 existing-record update operation
- preview deployment limited to the staged App794/App795 schema revision only
- no Process Management, ACL, customization, create/delete-record or historical-backfill path exists in the binding
- durable file-backed one-shot authorization ledger uses exclusive-create replay protection

## Local validation performed in this execution environment
```text
node --check d3-sbx-migration-live-binding.js = PASS
node --check d3-sbx-migration-live-entrypoint.js = PASS
node --check d3-sbx-migration-live-binding.test.js = PASS
node --test d3-sbx-migration-live-binding.test.js = 10/10 PASS
```

The 10 isolated binding tests cover frozen runner-contract scope matching, generic transport-callable rejection, read-scope rejection before snapshot access, exact App795 schema POST binding, out-of-scope field rejection, exact App795 schema PUT binding, staged-revision deployment guard, exact-20 App795 record update, exact-five App794 provenance scope, and durable authorization replay rejection across ledger instances.

## Explicit non-claims
The execution environment has GitHub connector access but no network-resolvable repository checkout, so a full canonical `npm test` run was not executed here. No full-repository integration pass is claimed. Independent review must verify the final Git diff and may require a canonical checkout test run before any live migration authorization.

## Zero-live-I/O evidence
```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
DEPLOYMENTS = 0
LIVE_MIGRATION_EXECUTIONS = 0
```

`D3-SBX-MIGRATION-01` remains `NOT AUTHORIZED`.
