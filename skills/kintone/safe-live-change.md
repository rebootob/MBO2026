# Skill — Safe Kintone Live Change

## Problem
Production Kintone changes can succeed partially, target the wrong revision, or leave an app in an unexpected state.

## Use When
Use for app settings, ACL, customization, process management, schema/configuration, or controlled data changes.

## Pattern

```text
1. Read current live state
2. Save rollback-ready backup
3. Verify exact target/app/revision
4. Execute the smallest authorized change
5. Immediately read back live state
6. Compare expected vs actual
7. PASS only on exact match
8. On mismatch: rollback immediately and STOP
```

Do not combine unrelated live changes in one operation when they can be staged safely.

For a Kintone customization that replaces only one uploaded FILE entry, distinguish **effective/live state** from **Preview/Test state**:

```text
GET effective/live customize
GET preview/test customize
  -> compare semantic topology/scope
  -> fail closed on unexpected drift
  -> identify exact target in preview state
  -> upload only the changed target file
  -> rebuild Preview PUT payload from preview state
  -> reuse preview FILE fileKeys for unchanged entries
  -> preserve scope / order / URL entries / mobile entries
  -> include preview revision
  -> PUT preview customization
  -> deploy
  -> verify effective live state after deployment
```

Kintone's Preview customization update expects retained FILE references to use `fileKey` values obtained from the Preview/Test customization state. Do not assume a FILE key returned by the effective Production customization GET is valid for a Preview PUT.

When constructing an update payload, normalize GET entries to fields accepted by the update API:

```text
URL  -> { type: 'URL', url }
FILE -> { type: 'FILE', file: { fileKey } }
```

Do not forward extra GET-only FILE metadata merely because it was present in a read response.

Do not re-upload an unchanged non-target FILE merely to reconstruct the payload. A re-upload creates a new `fileKey` and therefore changes metadata even when the bytes are identical.

## Failure Modes
- write succeeds but deployment/apply step is missed;
- revision changed between backup and write;
- wrong app ID/environment;
- API accepts payload but effective permission differs;
- partial multi-step execution;
- operator continues after unexpected read-back;
- a single-file customization change re-uploads unrelated CSS/JS and silently changes their `fileKey` values;
- a Production/effective FILE key is reused in a Preview PUT and is rejected/not found;
- raw GET FILE objects with read-only metadata are forwarded into a PUT payload;
- Preview/Test state already contains pending drift but the script overwrites it from Production state;
- an old backup payload is used instead of current state, overwriting later legitimate entries.

## Safety Gates
- explicit authorization boundary before write;
- backup before write;
- exact app/environment verification;
- fail closed on unknown live or preview state;
- compare effective/live and Preview/Test topology before a narrow replacement;
- preserve non-target FILE entries using Preview/Test fileKeys when writing Preview customization;
- include Preview revision in PUT to detect concurrent changes;
- construct PUT payload from current Preview/Test state, not a stale snapshot;
- no secrets in Git evidence;
- never infer PASS from HTTP success alone.

## Verification
Evidence should include only what is needed:
- target app/config identity;
- revision before/after when applicable;
- exact expected state;
- exact read-back state;
- changed target file content hash when relevant;
- pre/post non-target entry metadata/fileKeys when the scope requires exact preservation;
- proof that unchanged CSS/JS was not uploaded;
- rollback result if used.

## Reuse Notes
Adapt API endpoints and deployment mechanics to the specific Kintone setting being changed. For Kintone JavaScript/CSS customization, treat Preview/Test and effective/live configuration as distinct states: use Preview/Test fileKeys for Preview PUT preservation, compare against live state to detect drift, and verify effective live state only after deployment completes.
