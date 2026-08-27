# Skill — Shared Kintone Account + Application-Level Identity Gate

## Problem
Multiple employees may enter Kintone through the same/shared Kintone principal, while the application still needs to identify the real employee and restrict Employee-Self UI behavior.

## Use When
Use only when the organization intentionally uses shared/access Kintone accounts and cannot rely on one native Kintone user per employee.

## Pattern
- Kintone principal authenticates access to the platform.
- A second application-level login identifies the actual employee.
- Bind the current page/session context to the authenticated employee identifier.
- Never let a free-form selector replace the authenticated identity.
- Filter custom list/create/detail/edit behavior by that application identity.
- Keep authentication state intentionally scoped and clearly documented.

## Critical Limitation
Application-level identity does **not** create native Kintone principal isolation.

If multiple employees share the same Kintone principal and that principal has REST/native record access, technically capable users may bypass custom UI controls.

Therefore:
- call this an application/UI authorization gate;
- do not claim hard native employee isolation;
- document the direct URL/REST limitation explicitly.

## Failure Modes
- employee selector remains editable after login;
- native list leaks other employees' records;
- detail/edit mismatch only blocks custom fields but leaves native content visible;
- login gate fails open when customization initialization fails;
- persistent browser storage allows unintended identity carryover.

## Safety Gates
- fail closed on gate initialization errors;
- hide/replace native sensitive Employee-Self list where needed;
- visible blocking state on employee mismatch;
- bind create flow to authenticated employee code;
- never silently describe UI isolation as native ACL isolation.

## Verification
Test with at least two distinct employee identities using the same Kintone access principal:
- A cannot switch to B;
- A's custom list shows only A;
- A cannot use custom detail/edit UI for B;
- reload/logout behavior matches the intended auth scope.

## Reuse Notes
If true hard isolation is required, move to unique native principals or an external trusted server/auth architecture instead of overstating this pattern's protection.
