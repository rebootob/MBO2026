# Skill — Fail-Closed Kintone Customization Gate

## Problem
A Kintone customization protects sensitive or role-specific UI, but initialization errors can accidentally fall back to the native Kintone page and expose data/functions.

## Use When
Use whenever custom JavaScript is responsible for authorization-sensitive list/create/detail/edit behavior.

## Pattern
For every protected event:

```text
Initialize gate
  -> validate required DOM/space/config/data
  -> validate authenticated/authorized context
  -> render only allowed custom UI
```

Any failure in a protection dependency should move to a blocking state, not native fallback.

Protected surfaces commonly include:
- index/list;
- create;
- detail;
- edit;
- action buttons;
- export/copy controls.

For hand-built/classic browser bundles, treat runtime dependency completeness as part of the security gate. If a source module imports an authorization class/function, the generated classic bundle must contain that dependency before code that uses it.

## Failure Modes
- `catch` logs error then returns original event;
- missing Space field causes "retain native form";
- async authorization/lookup runs in background while event returns early;
- custom list filters visually but native records remain visible underneath;
- mismatch handling returns without rendering a visible block;
- hand-concatenated classic bundle omits an imported auth module/class while still passing syntax parsing;
- build test reconstructs the expected bundle from the same incomplete file list as the build script, causing a false PASS;
- unresolved runtime identifiers exist inside code paths that `new Function(...)` parses but does not execute.

## Safety Gates
- production protection dependency missing = block;
- auth/identity unknown = block;
- malformed security state = block;
- await authorization-critical async work before returning the event when platform lifecycle permits it;
- render a clear Access Denied / Initialization Failed state without exposing sensitive native content;
- use safe DOM APIs (`textContent`) for dynamic values;
- keep a canonical/explicit bundle dependency list or otherwise prove every required imported runtime symbol is included;
- do not treat classic-script syntax parsing alone as proof that the bundle can initialize.

## Verification
Test explicit failure paths, not only happy paths:
- gate module missing/init error;
- required DOM host missing;
- unauthorized identity;
- record identity mismatch;
- async lookup failure;
- malformed configuration.

For classic bundles, also prove:
- required auth classes/functions appear in the generated bundle exactly as expected;
- definitions appear before their first runtime use when order matters;
- zero forbidden ES-module residue remains if deploying as classic JS;
- a minimal runtime smoke using fake/stub platform APIs can resolve and initialize the authorization dependencies without real network calls;
- source-to-dist exactness uses the complete dependency set rather than merely mirroring an incomplete build list.

For each failure case, prove sensitive native/custom content is not shown.

## Reuse Notes
Fail-closed behavior is especially important when native Kintone ACL cannot represent the application's finer-grained identity model. A visible fail-closed page is evidence that exposure prevention worked, but it is not evidence that the feature itself is functional or ready for UAT.
