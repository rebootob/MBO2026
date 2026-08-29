# AI ACTIVE TASK — APP794 EMERGENCY RECOVERY AUTHORIZATION HOLD

Mode: **CONTROL PLANE HOLD — ANTIGRAVITY DO NOTHING / NO LIVE WRITE**
Branch: `ai/antigravity-wp002c`

## Current Live Problem

App794 Live customization is currently rev53 after a failed rollback. User reports the custom MBO UI has disappeared and only native Kintone fields are visible.

Independent review rejects the rollback claim that rev53 restored the true pre-deploy rev51 state.

## Known-Good Recovery Target

Use only if a NEW explicit user authorization is granted:

```text
KNOWN_GOOD_COMMIT       = ec6278524a2d5eb53050d0580c340d1b4e866b97
KNOWN_GOOD_JS_BLOB_SHA  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
KNOWN_GOOD_CSS_BLOB_SHA = 1710d770ae87fb5f910d669dd5a88ea0950e6991
KNOWN_GOOD_SCOPE        = ALL
KNOWN_GOOD_TOPOLOGY     = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

These identities are independently grounded by the accepted rev51 deployment evidence and direct repository readback at `ec627852...`.

## Current Rule

ANTIGRAVITY MUST DO NOTHING until the user explicitly authorizes emergency recovery.

No source change.
No test change.
No build/deploy.
No rollback attempt.
No CSS-only hotfix.
No Combined Employee UI deployment.
No App794 record/schema/layout/ACL/process/comment write.
No App801/App795/App796 write.
No D2-D7 execution.

## If Recovery Is Explicitly Authorized Later

Recovery must be a NEW one-shot authorization and must:
1. fetch latest branch and read Control Center + Active Task;
2. read current Live App794 customization revision/scope/topology/JS/CSS identities;
3. fail closed if unexpected unrelated drift exists;
4. materialize recovery files exactly from repository commit `ec6278524a2d5eb53050d0580c340d1b4e866b97` — do NOT use scratch rollback snapshots and do NOT rebuild latest source as recovery material;
5. verify local recovery JS blob = `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`;
6. verify local recovery CSS blob = `1710d770ae87fb5f910d669dd5a88ea0950e6991`;
7. perform exactly one App794 Desktop customization recovery attempt preserving Scope ALL / JS1 / CSS1 / Mobile0;
8. wait for Kintone result and read back exact Live JS/CSS identities;
9. prove exact known-good pair match;
10. commit recovery evidence only and STOP.

Recovery does NOT authorize the new Combined Employee UI candidate. After known-good recovery is independently accepted, the missing Back button and Combined UI packaging/deploy path will be diagnosed separately before any new forward deployment.

Maximum current status:
`BLOCKED_WAITING_EXPLICIT_EMERGENCY_RECOVERY_AUTHORIZATION`
