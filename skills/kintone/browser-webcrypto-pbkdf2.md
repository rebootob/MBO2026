# Skill — Browser WebCrypto PBKDF2 for Kintone Customization

## Problem
A Kintone browser customization needs password verification but cannot use Node-only crypto modules.

## Use When
Use for browser-side password hashing/verification in a Kintone customization where the architecture explicitly accepts application-level browser auth.

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

## Failure Modes
- importing `node:crypto` into browser bundle;
- storing plaintext password;
- logging password/hash/salt unnecessarily;
- accepting malformed hash strings;
- silently changing iteration/format without version handling;
- comparing incompatible encodings.

## Safety Gates
- Web Crypto only in browser modules;
- random salt per credential;
- no plaintext persistence;
- exact format parser;
- malformed credential = deny;
- never expose raw hash in normal UI;
- test hashing and verification against known vectors/local unit tests.

## Verification
Prove:
- valid password verifies;
- wrong password fails;
- malformed credential fails closed;
- browser bundle contains no Node crypto dependency;
- plaintext password is not persisted/logged.

## Reuse Notes
Iteration count and storage format are project policy and may evolve. Keep the format versioned/explicit so migration is possible later.
