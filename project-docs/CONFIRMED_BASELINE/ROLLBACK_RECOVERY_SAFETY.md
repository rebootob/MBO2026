# CONFIRMED BASELINE — ROLLBACK / RECOVERY SAFETY STANDARD

> Status: **CONFIRMED / MANDATORY**  
> Confirmed by user decision: 2026-08-29  
> Scope: all MBO2026 Live deployment rollback, recovery, restoration and emergency-recovery actions

---

## 1. Objective

Rollback must make the system safer, never introduce a second unknown state.

The project therefore treats rollback/recovery as a controlled production change with the same or higher evidence standard as a forward deployment.

A file is **not** a valid rollback target merely because it is named backup, snapshot, predeploy, previous, old, or rollback.

---

## 2. Definitions

### Forward Deployment
Moves Live from the current accepted release to a new candidate.

### Rollback
Restores Live to the exact bytes/configuration of the independently verified release that was Live immediately before the failed forward deployment.

### Emergency Recovery
Restores Live to another independently verified known-good release after the current Live state or the rollback target itself is proven unreliable.

Rollback and recovery are Live writes. They are never treated as harmless read-only operations.

---

## 3. Immutable Known-Good Release Identity — Mandatory

Before any Live deployment, Control Plane must know and record the current independently accepted Live release identity.

For Kintone customization this must include, as applicable:

```text
SOURCE_COMMIT
LIVE_CUSTOMIZATION_REVISION
SCOPE
DESKTOP_JS_ENTRY_COUNT
DESKTOP_CSS_ENTRY_COUNT
MOBILE_JS_ENTRY_COUNT
MOBILE_CSS_ENTRY_COUNT
DESKTOP_JS_BLOB_SHA / content identity
DESKTOP_CSS_BLOB_SHA / content identity
optional SHA256/content checksum when available
customization entry order/topology
```

The rollback target must be reproducible from immutable repository content or another independently verified immutable artifact.

A transient local `scratch/` file is evidence only. It is never the sole source of truth for rollback material.

---

## 4. Atomic Release Pair Rule — JS/CSS Must Travel Together

When a release contains both Desktop JS and Desktop CSS, the reviewed JS/CSS set is one **atomic release unit**.

Rules:
- never mix JS from release A with CSS from release B;
- never claim candidate match by verifying JS only;
- never substitute an unchanged-looking CSS without verifying the exact reviewed identity;
- if CSS changed in the candidate, the deployment must deploy and read back that CSS identity;
- if JS/CSS are bundled as separate Kintone customization files, both identities must pass preflight and post-readback together;
- a CSS-only or JS-only hotfix requires a new explicitly reviewed candidate and separate authorization.

`EXACT_RELEASE_MATCH = YES` only when **all** required release artifacts and topology match.

---

## 5. Rollback Manifest Must Exist Before Forward Deploy

A forward Live deployment cannot be authorized unless an exact rollback manifest for the currently accepted Live release has already been independently established.

Minimum rollback manifest:

```text
ROLLBACK_SOURCE_COMMIT
ROLLBACK_JS_PATH + identity
ROLLBACK_CSS_PATH + identity
ROLLBACK_SCOPE
ROLLBACK_TOPOLOGY
KNOWN_GOOD_LIVE_EVIDENCE_REFERENCE
```

The manifest must point to immutable/retrievable material, preferably the exact Git commit whose generated files were independently read back from Live.

If the current Live bytes cannot be mapped to a retrievable immutable release, deployment is BLOCKED until that gap is resolved.

---

## 6. Snapshot Validation Rule

A pre-deploy snapshot may be captured for forensics and convenience, but before it can ever be called a rollback target it must be validated against the known-good release manifest.

Required proof:
- snapshot JS identity = known-good JS identity;
- snapshot CSS identity = known-good CSS identity;
- snapshot scope/topology = known-good scope/topology;
- all customization entries correspond to the accepted Live readback.

Self-consistency is not proof.

Forbidden example:
`SNAPSHOT_MATCH = YES` because post-rollback equals the same snapshot.

Required comparison:
`SNAPSHOT_MATCH = YES` only because snapshot equals the independently accepted known-good manifest.

---

## 7. Never Rebuild Latest Source for Rollback

Rollback/recovery material must not be produced by rebuilding the current/latest working tree unless that exact build was already the independently accepted known-good release.

Why:
- the working tree may contain later source changes;
- generated CSS/JS may differ from the historical Live release;
- build tooling may have changed;
- mixing current source with historical Live state destroys rollback determinism.

Use the exact immutable release commit/artifacts specified by the rollback manifest.

---

## 8. Separate Authorization for Every Rollback / Recovery Live Write

No AI may automatically rollback merely because a forward deploy failed.

After a failed/mismatched forward deployment:
1. STOP;
2. independently review post-deploy readback;
3. identify and validate the exact rollback target against the immutable known-good manifest;
4. obtain explicit user authorization for the rollback/recovery Live write;
5. execute one exact rollback/recovery attempt only.

A consumed forward-deploy authorization never silently becomes a second forward-deploy or rollback authorization.

Emergency recovery always requires a new explicit authorization.

---

## 9. Pre-Rollback / Pre-Recovery Gates — Fail Closed

Before any rollback/recovery write:

1. Re-fetch canonical Git HEAD.
2. Read `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, and this Baseline.
3. Read current actual Live revision/scope/topology/artifact identities.
4. Prove the current Live state matches the incident state expected by the rollback task; unexpected drift => STOP.
5. Retrieve rollback/recovery artifacts directly from the immutable source commit/artifact.
6. Verify all exact identities before upload.
7. Verify the target topology/scope.
8. Verify no mixed-release artifacts.
9. Record the current broken state for forensic evidence only.
10. Verify authorization is exact, explicit, unconsumed and limited to one attempt.

Any failed gate => **NO LIVE WRITE**.

---

## 10. One Attempt Rule

Rollback/recovery is one-shot.

If the attempt:
- fails;
- returns ambiguous deployment status;
- produces unexpected revision/topology;
- has any artifact identity mismatch;
- leaves custom UI/runtime broken;

then STOP immediately.

Do not perform a second rollback, hotfix, CSS-only fix, forward deploy, or alternate restore under the same authorization.

A new Control Plane diagnosis and new user authorization are required.

---

## 11. Post-Rollback / Post-Recovery Readback — Mandatory

A rollback/recovery cannot be called successful merely because Kintone reports deployment `SUCCESS`.

Required independent readback:

```text
POST_REVISION
POST_SCOPE
POST_TOPOLOGY
POST_JS_IDENTITY
POST_CSS_IDENTITY
POST_MOBILE_STATE
EXACT_KNOWN_GOOD_MATCH
FORBIDDEN_WRITE_COUNTS
```

PASS requires exact match of all expected artifacts and topology.

For a release pair:

```text
POST_JS == TARGET_JS
AND
POST_CSS == TARGET_CSS
AND
POST_SCOPE == TARGET_SCOPE
AND
POST_TOPOLOGY == TARGET_TOPOLOGY
```

Anything less = CORRECTIVE/BLOCKED.

---

## 12. Runtime Smoke Gate After Technical Readback

After artifact readback PASS, user-visible runtime must be smoke-tested before the recovered state is promoted to accepted Live.

Minimum relevant smoke checks for App794:
- custom index UI renders instead of raw native list when expected;
- create/detail/edit custom UI entry points render when expected;
- no blank screen / native-only fallback caused by customization runtime failure;
- previously accepted authentication/session gate still loads;
- no console/runtime blocker that prevents the app customization from starting.

This smoke test does not replace functional UAT; it proves only that recovery restored a viable runtime.

---

## 13. Evidence Integrity Rules

Executor evidence must never redefine the expected release identity.

The expected hashes/identities come from the independently reviewed authorization/manifest, not from what the executor happened to deploy.

Forbidden:
- replacing an expected CSS hash in evidence so the deployed CSS appears to match;
- declaring candidate match using only JS;
- declaring snapshot match by comparing the snapshot to itself;
- calling a newer Kintone revision number "Rev51" merely because it intends to restore Rev51 content.

Use wording such as:
`Revision 54 containing exact known-good Rev51 content identities`.

---

## 14. Deployment Tooling Requirements

Deployment tooling must treat customization release artifacts as a manifest, not as independent opportunistic files.

Tooling/preflight should verify before write:
- exact JS identity;
- exact CSS identity;
- exact scope;
- exact entry counts/order/topology;
- exact source commit/candidate;
- expected target App ID;
- build-only/no-network safety when applicable.

Tooling must fail closed if any required manifest field differs.

Whenever practical, add automated tests that intentionally supply mismatched JS/CSS identities and prove deployment is rejected before any Live write.

---

## 15. Incident Rule From 2026-08-29

The failed Combined Employee UI deploy/rollback incident established these permanent lessons:
- partial JS-new/CSS-old deployment is not an acceptable release;
- a scratch snapshot can contain the wrong release pair;
- restoring a snapshot and matching it afterward does not prove restoration of the real previous Live release;
- rollback must be grounded in immutable independently verified release identities;
- runtime visual evidence can expose a technically reported but invalid recovery state.

These lessons are permanent governance and must not be relaxed to save time or execution credit.

---

## 16. Change Rule

Changing this safety standard requires explicit user/Control Plane decision and Confirmed Baseline update.

No Active Task, executor report, script default, or emergency situation may silently weaken it.
