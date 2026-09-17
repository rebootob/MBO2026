# D3 Decision 009 — Platform-Stamped OAuth Attestation Architecture Ratification

## Decision Header
```text
DECISION = OWNER_DEC_D3_009
STATUS = LOCKED / OWNER APPROVED
VALUE = NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION
OWNER_APPROVAL = Explicit Owner "อนุมัติ" after Independent Control Plane PASS / ACCEPTED of D3-ARCHIVE-RUNTIME-TRUSTED-WRITER-NATIVE-OAUTH-TRANSACTION-ARCHITECTURE-DECISION-03-R1
ACCEPTED_EVIDENCE_HEAD = ca8828574b23de3f272c160319b16e0c041b6145
```

## Ratified Architecture Contract
The Owner explicitly ratifies the independently reviewed architecture:
`OWNER_RATIFIED_ARCHITECTURE = NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
(Evidence candidate alias: `PLATFORM_STAMPED_CREATED_BY_OAUTH_ATTESTATION`).

Locked conceptual sequence:
1. Human user authorizes Cybozu/Kintone OAuth.
2. Trusted Backend retains the user's OAuth authority in secure server-side storage.
3. Trusted Backend generates a high-entropy, single-use, server-side event challenge / nonce.
4. The SAME user's OAuth authority creates a record in a dedicated Kintone Attestation App.
5. Kintone platform automatically stamps Created By (`作成者`) with the exact authenticated Kintone user (`code`, `name`).
6. Normal workflow users MUST NOT have App Management permission in the Attestation App and MUST NOT be able to override Created By.
7. Trusted Backend independently reads the attestation record using a separate privileged read credential.
8. Backend validates the nonce and exact D3 event binding.
9. Trusted Writer writes App798 while preserving restricted App798 ACL (`GROUP everyone Add = NO`, `View = NO`).
10. App798 `Archived_By` is derived from the Kintone platform-stamped Created By identity.
11. App798 archive success is verified.
12. The SAME retained user OAuth authority then performs the App794 Process Management transition.

## Locked Security Invariants
- `APP798_GROUP_EVERYONE_ADD = NO`
- `APP798_GROUP_EVERYONE_VIEW = NO`
- `BROWSER_PRIVILEGED_SECRET = FORBIDDEN`
- `ATTESTATION_WORKFLOW_USER_MANAGE_APP = NO`
- `ATTESTATION_WORKFLOW_USER_EDIT = NO`
- `ATTESTATION_WORKFLOW_USER_DELETE = NO`
- `ATTESTATION_NONCE_SERVER_GENERATED = YES`
- `ATTESTATION_NONCE_SINGLE_USE = YES`
- `ATTESTATION_EVENT_BINDING_REQUIRED = YES`
- `ARCHIVED_BY_SOURCE = KINTONE_PLATFORM_STAMPED_CREATED_BY`
- `Archived_By = blank = FORBIDDEN`
- `Archived_By = guessed user = FORBIDDEN`
- `Archived_By = requester fallback = FORBIDDEN`
- `Archived_By = free-text SYSTEM = FORBIDDEN`
- `ARCHIVE_ACTOR_NOT_RESOLVED = FAIL_CLOSED`
- `ARCHIVE_KEY_IDEMPOTENT_EVENT_IDENTITY = YES`
- `SAME_LOGICAL_EVENT_DUPLICATE_ROW = FORBIDDEN`
- `ARCHIVE_HASH_CONFLICT = FAIL_CLOSED`
- `APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN`

## Token Continuity
- `ATTESTATION_AND_TRANSITION_USER_AUTHORITY = SAME_BACKEND_HELD_USER_OAUTH_AUTHORITY`
- Browser must NOT select, replace or assert the trusted backend token used for the transaction.
- If the original access token becomes unusable before transition, implementation must fail closed or perform a newly validated architecture-approved continuity/re-attestation flow.
- Do NOT silently substitute a different user's OAuth authority.

## Infrastructure Required — Future Only
- `DEDICATED_ATTESTATION_APP_REQUIRED = YES`
- `CYBOZU_OAUTH_CLIENT_REQUIRED = YES`
- `TRUSTED_BACKEND_REQUIRED = YES`
- `SECURE_TOKEN_STORAGE_REQUIRED = YES`
- `PRIVILEGED_ATTESTATION_READER_REQUIRED = YES`
- `PRIVILEGED_APP798_TRUSTED_WRITER_REQUIRED = YES`
- `NEW_EXTERNAL_IDP_REQUIRED = NO`
(None of these may be created in this package.)

## Architecture State After Ratification
- `PLATFORM_STAMPED_CREATOR_ATTESTATION = PROVEN_SUPPORTED`
- `NATIVE_USER_OAUTH_TRANSACTION_TRUST_CHAIN = PROVEN_SUPPORTED`
- `ARCHIVED_BY_EXACT_ACTOR_PROOF = PROVEN_AT_ARCHITECTURE_LEVEL`
- `ARCHITECTURE_DECISION_RESULT = OWNER_RATIFIED`
- `OWNER_RATIFIED_ARCHITECTURE = NATIVE_KINTONE_PLATFORM_STAMPED_OAUTH_ATTESTATION`
- `NO_MORE_NATIVE_ACTOR_RESEARCH = YES`
- `TRUSTED_WRITER_ACTOR_ARCHITECTURE_SELECTION_BLOCKER = RESOLVED`
- `BLOCKING_CONDITION = RATIFIED_PLATFORM_STAMPED_OAUTH_ARCHITECTURE_NOT_YET_IMPLEMENTED`
- `IMPLEMENTATION_AUTHORIZED = NO`
- `DEPLOYMENT_AUTHORIZED = NO`
- `KINTONE_READ_AUTHORIZED = NO`
- `KINTONE_WRITE_AUTHORIZED = NO`
- `PROCESS_WRITE_AUTHORIZED = NO`
- `UAT_AUTHORIZED = NO`
- `FULL_D3_BUSINESS_UAT = NOT_PROVEN`
- `D3_CLOSURE = NOT_CLAIMED`
- `PRODUCTION_READY = NO`
- `NEXT_GATE_AUTHORIZED = NO`
- `AUTO_START_NEXT_WORK_PACKAGE = NO`
