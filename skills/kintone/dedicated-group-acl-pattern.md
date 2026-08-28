# Skill — Dedicated Kintone Group for Access ACL

## Problem
A Kintone app is used through multiple operational/shared accounts, and maintaining one ACL row per account creates ongoing admin debt and inconsistency.

## Use When
Use when several Kintone principals need the same app-level permission set and future principals may be added.

## Pattern
Create one purpose-specific Kintone group, for example:

```text
<APP_OR_DOMAIN>_ACCESS
```

Then:
- grant app permission to the group, not each user individually;
- add/remove Kintone principals through group membership;
- keep `everyone` denied when the app is restricted;
- preserve a known admin/creator recovery path;
- use least privilege for the group.

Example least-privilege app ACL for a credential/read-update supporting app:

```text
View   = YES
Edit   = YES
Add    = NO
Delete = NO
Import = NO
Export = NO
Admin  = NO
```

Exact permissions must be adapted to the app's purpose.

## Atomic Cutover Sequence
Treat group membership and app ACL cutover as one gated sequence:

```text
verify principals
-> read/backup current group membership
-> write/reconcile membership
-> read back and prove required members are present
-> only then apply/reconcile the app ACL
-> read back app ACL
```

Do not cut an app over to a dedicated group before required membership is proven. An empty or incomplete group may fail closed, but it is still an incomplete cutover and must not be reported as PASS.

## Cybozu Group Membership API Notes
For the Cybozu User API group-membership update:

```text
PUT /v1/group/users.json
```

The request body uses:

```json
{
  "code": "GROUP_CODE",
  "users": ["user1", "user2"]
}
```

Important operational rules:
- the API requires cybozu.com Common Administrator authority;
- when an API token is used, ensure the token has the required administrative scope;
- the `users` array represents the membership set being written, so read current membership first and preserve unrelated legitimate members;
- never print tokens, cookies, or authorization headers in evidence.

An error such as `CB_IJ01 Invalid JSON string` is not sufficient by itself to prove an authorization failure. Treat it first as request/payload/serialization evidence and capture the sanitized HTTP status + error code/body before classifying the root cause.

## Benefits
- adding a new access account usually requires group membership only;
- no source-code change;
- no repeated app ACL redesign;
- easier audit of who gets the capability.

## Failure Modes
- falling back to `everyone` because group membership setup is inconvenient;
- creating per-user ACL rows in parallel with the group;
- removing pre-existing group members without proving ownership;
- granting app admin/import/export unintentionally;
- assuming group ACL provides per-employee isolation when accounts are shared;
- applying the app ACL before membership read-back succeeds;
- interpreting a JSON/request parsing error as a permission error without proof;
- writing only the new users to a replace-style membership API and accidentally removing legitimate existing members.

## Safety Gates
- verify every intended principal exists before membership write;
- backup/read current group membership when the group pre-exists;
- compute the exact target membership and preserve unrelated legitimate members;
- use the documented request shape and authorized administrative credential;
- capture sanitized HTTP status/error code/body on failure;
- require membership read-back PASS before ACL cutover;
- backup app ACL before change;
- immediate read-back after group/ACL write;
- rollback or stop on mismatch; never broaden `everyone` to work around a group problem.

## Verification
Prove independently:
- group exists and is active;
- required principals are members after live read-back;
- app ACL references the group;
- permissions equal the least-privilege target;
- `everyone` remains at the intended deny state;
- no unintended record ACL was introduced;
- evidence contains enough sanitized request/response information to distinguish payload errors from authorization errors.

## Reuse Notes
Group-management APIs and permissions differ from normal Kintone app APIs. If membership cannot be changed with the available credential, stop with the exact verified blocker and use an authorized admin path rather than broadening app ACL or guessing that a manual step is required.
