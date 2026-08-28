# Skill — Browser WebCrypto PBKDF2 for Kintone Customization

## Problem
A Kintone browser customization needs password hashing/verification but cannot use Node-only crypto modules, and live credential provisioning must be verified without exposing secret material.

## Use When
Use for browser-side password hashing/verification in a Kintone customization where the architecture explicitly accepts application-level browser auth, including post-provisioning verification of a credential population.

## Pattern
Use Web Crypto (`window.crypto.subtle`) with a versioned, parseable stored format such as:

```text
pbkdf2$<iterations>$<saltHex>$<hashHex>
```

Example policy:

```text
algorithm = PBKDF2-SHA256
iterations = 100000
salt = cryptographically random
```

Keep parsing strict: unknown algorithm/version/iteration format must fail closed.

For provisioning, use a **create-only reconciliation** pattern:
1. determine the approved identity population;
2. read existing credential identities first;
3. fail closed on duplicate target identities;
4. preserve existing unique credentials unless reset/update is separately authorized;
5. create only missing credentials;
6. use a unique cryptographically random salt for every new credential;
7. immediately read back and verify non-secret metadata and identity counts.

## Failure Modes
- importing `node:crypto` into browser bundle;
- storing plaintext password;
- logging password/hash/salt unnecessarily;
- accepting malformed hash strings;
- silently changing iteration/format without version handling;
- comparing incompatible encodings;
- blindly overwriting existing credentials during bulk provisioning;
- treating executor success logs as sufficient production proof;
- exposing raw hashes/salts in screenshots or evidence;
- reusing one salt across multiple credentials.

## Safety Gates
- Web Crypto only in browser modules;
- random salt per credential;
- no plaintext persistence;
- exact format parser;
- malformed credential = deny;
- never expose raw hash in normal UI;
- pre-write identity reconciliation before bulk create;
- duplicate target credential rows = STOP before write;
- existing credential rows remain unchanged unless exact update/reset authorization exists;
- evidence contains counts/results, not passwords/hashes/salts/tokens.

## Independent Post-Provisioning Verification
After a production credential write, perform a separate **read-only** verification path when practical. Do not rely solely on the executor's self-report.

A strong verifier should prove, without printing secret values:
- expected total credential count;
- expected unique identity count;
- no duplicate identities;
- every stored credential matches the expected PBKDF2 format;
- expected password can be recomputed in memory and compared to the stored derived hash when the bootstrap-password policy permits it;
- every credential salt is unique;
- algorithm/version/forced-change/account-state metadata matches policy;
- expected included/excluded identities are present/absent;
- the verifier performs zero Kintone writes.

The verifier may read a stored hash internally when cryptographic verification requires it, but should never print, persist, screenshot, or commit the raw hash or salt.

## Verification
Prove:
- valid password verifies;
- wrong password fails;
- malformed credential fails closed;
- browser bundle contains no Node crypto dependency;
- plaintext password is not persisted/logged;
- bulk provisioning preserves existing credentials unless explicitly authorized otherwise;
- post-provisioning identity counts and duplicates are independently checked;
- salts are unique across newly provisioned credentials;
- read-only independent verification produces only sanitized boolean/count evidence.

## Reuse Notes
Iteration count, password bootstrap rule, account-state values, and storage format are project policy and may evolve. Keep the format versioned/explicit so migration is possible later. Adapt the independent verifier to the project's exact approved metadata and identity source; never hard-code one project's employee codes or counts into a reusable verifier.
