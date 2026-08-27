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

## Failure Modes
- `catch` logs error then returns original event;
- missing Space field causes "retain native form";
- async authorization/lookup runs in background while event returns early;
- custom list filters visually but native records remain visible underneath;
- mismatch handling returns without rendering a visible block.

## Safety Gates
- production protection dependency missing = block;
- auth/identity unknown = block;
- malformed security state = block;
- await authorization-critical async work before returning the event when platform lifecycle permits it;
- render a clear Access Denied / Initialization Failed state without exposing sensitive native content;
- use safe DOM APIs (`textContent`) for dynamic values.

## Verification
Test explicit failure paths, not only happy paths:
- gate module missing/init error;
- required DOM host missing;
- unauthorized identity;
- record identity mismatch;
- async lookup failure;
- malformed configuration.

For each case, prove sensitive native/custom content is not shown.

## Reuse Notes
Fail-closed behavior is especially important when native Kintone ACL cannot represent the application's finer-grained identity model.
