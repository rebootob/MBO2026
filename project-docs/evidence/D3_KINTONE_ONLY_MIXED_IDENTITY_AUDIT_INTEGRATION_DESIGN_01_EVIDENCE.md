# Evidence — D3 Kintone-Only Mixed Identity Audit Integration Design 01

## Metadata
```text
PACKAGE = D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-DESIGN-01
TYPE = DESIGN / SOURCE-CONTRACT EVIDENCE
BASE_HEAD = 5235d124f215be86fe4709cba7b38f24c5042a24
KINTONE_IO = 0
SOURCE_CHANGES = 0
TEST_CHANGES = 0
```

## 1. Corrective review findings incorporated

The corrected design resolves these review findings from the prior design draft:

1. Archive_Key was previously described with an invented generic format. Corrected to preserve the repository's event-specific `buildArchiveKey()` contract.
2. Historical `Kintone_Login_User_Code` inference from `Archived_By` was previously permitted. Corrected to `AUTOMATIC_IDENTITY_INFERENCE = FORBIDDEN`.
3. Kintone user code was previously described as lowercase/trimmed. Corrected to exact trimmed code with case preserved.
4. Initial plan placed live App798 schema changes before local source implementation/tests. Corrected to local-first order.
5. The authorized design evidence dossier was missing. This document supplies that evidence surface.
6. Canonical source reconciliation away from the historical Decision-009 endpoint is now explicit.

## 2. Repository source facts used by the design

### Runtime identity context
Canonical source already constructs:
- SHARED context with `mode`, authenticated `employeeCode`, and `kintoneUserCode`;
- DEDICATED context with App53-resolved `employeeCode` and `kintoneUserCode`.

Therefore no second login or second PIN is required.

### Archive actor behavior
The live verified path calls `executeProcessTransitionArchive(...)` without supplying `options.actor`, so the existing helper falls back to the Kintone login principal. This is insufficient for identifying the actual human when a Shared account is used.

### Archive_Key
`src/services/revision-archive-service.js` owns canonical key construction through `buildArchiveKey()`.

Verified current forms:
- stage completion: `<key>|<stage>|R<rev>|STAGE_COMPLETION`;
- evaluation revision created: `<key>|<stage>|R<rev>|EVALUATION_REVISION_CREATED|TO_R<nextRev>`;
- route reassignment prechange: `<key>|<stage>|R<rev>|ROUTE_REASSIGNMENT_PRECHANGE|<stableEventId>`.

### Repository normalization
`src/services/revision-archive-kintone-repository.js` currently normalizes existing App798 fields including `Archived_By`, but not the five Decision-010 identity/action fields. Future implementation must extend normalization/readback without changing existing semantics.

## 3. Direction and scope evidence

Current Owner authority:
```text
OWNER_DEC_D3_010
CURRENT_SYSTEM_BOUNDARY = KINTONE_ONLY
CURRENT_SECURITY_TARGET = BUSINESS_AUDITABILITY_AND_TRACEABILITY
DECISION_009 = HISTORICAL / NOT CURRENT IMPLEMENTATION TARGET
```

The accepted target is business traceability, not cryptographic non-repudiation.

## 4. Historical data rule

```text
HISTORICAL_BACKFILL = NO_FABRICATED_VALUES
AUTOMATIC_IDENTITY_INFERENCE = FORBIDDEN
```

No operator identity may be invented for old App798 rows. Any migration/backfill is a separate future decision/package.

## 5. Exact-case Kintone principal rule

Kintone user codes must be preserved as exact trimmed values. No lowercasing or case remapping is authorized.

## 6. Delivery order evidence

The corrected design locks:
```text
design
-> local implementation
-> local targeted tests
-> regression/baseline attribution
-> App798 schema preflight
-> App798 schema deploy
-> App794 customization deploy
-> live readback
-> SHARED UAT
-> DEDICATED UAT
-> D3 closure
```

## 7. Zero-I/O accounting

```text
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
DEPLOYMENTS = 0
UAT = 0
SOURCE_CHANGES = 0
TEST_CHANGES = 0
```

## 8. Review status

```text
STATUS = CORRECTED DESIGN / AWAITING INDEPENDENT CONTROL PLANE REVIEW
AUTO_START_NEXT_PACKAGE = NO
```
