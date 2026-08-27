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

## Failure Modes
- write succeeds but deployment/apply step is missed;
- revision changed between backup and write;
- wrong app ID/environment;
- API accepts payload but effective permission differs;
- partial multi-step execution;
- operator continues after unexpected read-back.

## Safety Gates
- explicit authorization boundary before write;
- backup before write;
- exact app/environment verification;
- fail closed on unknown live state;
- no secrets in Git evidence;
- never infer PASS from HTTP success alone.

## Verification
Evidence should include only what is needed:
- target app/config identity;
- revision before/after when applicable;
- exact expected state;
- exact read-back state;
- rollback result if used.

## Reuse Notes
Adapt API endpoints and revision/apply mechanics to the specific Kintone setting being changed. The backup/write/read-back/rollback sequence remains the same.
