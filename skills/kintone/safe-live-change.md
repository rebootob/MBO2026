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

For a Kintone customization that replaces only one uploaded FILE entry:

```text
live customize read-back
  -> identify the exact target entry
  -> upload only the changed target file
  -> rebuild payload from current live state
  -> reuse existing fileKeys for every unchanged FILE entry
  -> preserve scope / order / URL entries / mobile entries
  -> apply
  -> verify target content + non-target metadata
```

Do not re-upload an unchanged non-target FILE merely to reconstruct the payload. A re-upload creates a new `fileKey` and therefore changes production metadata even when the bytes are identical.

## Failure Modes
- write succeeds but deployment/apply step is missed;
- revision changed between backup and write;
- wrong app ID/environment;
- API accepts payload but effective permission differs;
- partial multi-step execution;
- operator continues after unexpected read-back;
- a single-file customization change re-uploads unrelated CSS/JS and silently changes their `fileKey` values;
- an old backup payload is used instead of the current live customization, overwriting later legitimate entries.

## Safety Gates
- explicit authorization boundary before write;
- backup before write;
- exact app/environment verification;
- fail closed on unknown live state;
- construct customization changes from the current live state, not a stale snapshot;
- preserve non-target FILE entries by reusing their current fileKeys;
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
- rollback result if used.

## Reuse Notes
Adapt API endpoints and revision/apply mechanics to the specific Kintone setting being changed. The backup/write/read-back/rollback sequence remains the same. For customization FILE replacement, treat unchanged `fileKey` values as part of the preservation contract when the approved scope says non-target entries must remain unchanged.
