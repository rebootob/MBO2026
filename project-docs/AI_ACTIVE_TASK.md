# AI ACTIVE TASK — HOLD / D1 AUTH ARCHITECTURE DECISION

Mode: **CONTROL PLANE + USER DECISION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Confirmed live blocker

- Employee `0113` credential in App801 is healthy (`ACTIVE`, failed attempts 0, no lock, no force change).
- Shared Kintone principal `s1` receives `CB_NO02` / HTTP 403 when opening or REST-reading App801.
- Current browser-direct App801 auth therefore cannot work for `s1`.
- Do **not** widen App801 ACL to `s1` as a shortcut.

## Preferred architecture awaiting user approval

```text
App794 Browser
  -> Trusted Auth Bridge (HTTPS)
      -> App801 using server-side-only Kintone credential/API token
```

Browser must not receive/read `Password_Hash`, privileged Kintone secrets, or raw App801 credential/session rows.

## Antigravity

HOLD.
Do not change Source, App801 ACL, App801 records, App794 customization, Deploy Guard, or D2-D7 until a new Active Task is issued after architecture approval.
