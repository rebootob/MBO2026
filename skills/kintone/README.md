# KINTONE REUSABLE SKILLS LIBRARY

> Purpose: reusable Kintone engineering knowledge extracted from MBO2026 and future Kintone work.
> Scope: cross-project patterns only. Do NOT store MBO2026 current status or project-specific temporary facts here.

---

## 1. Skill Extraction Gate — Mandatory

After every independent review, ChatGPT Control Plane must ask:

```text
Did this work produce a Kintone technique, failure mode, safety rule,
implementation pattern, API behavior, UI pattern, migration pattern,
security lesson, or testing approach that can be reused in another Kintone project?
```

If YES:
1. extract the reusable knowledge;
2. generalize it so it is not MBO2026-specific;
3. update an existing skill if one already covers it;
4. create a new skill only when there is no suitable existing skill;
5. update this README index;
6. do this in the same Control Plane cycle when practical;
7. do NOT spend Antigravity credit on skill writing unless an exact execution task requires it.

---

## 2. What Belongs in a Skill

Good skill content:
- reusable Kintone REST/API behavior;
- safe live-change procedure;
- backup/read-back/rollback patterns;
- app/group/record ACL design patterns;
- shared-account security limitations;
- browser customization patterns;
- fail-closed UI/runtime patterns;
- routing/scoring implementation patterns;
- migration/reconciliation techniques;
- Kintone field/schema handling lessons;
- deployment/version/read-back techniques;
- test/UAT patterns;
- troubleshooting methods with clear symptoms and causes.

Do NOT put here:
- current D1–D7 status;
- MBO2026 blocker state;
- one-time employee/user names;
- secrets/tokens/password hashes;
- transient commit SHAs as the main knowledge;
- MBO2026-specific business policy unless generalized.

---

## 3. Skill Quality Standard

Every skill should answer:

1. **Problem** — what recurring problem does this solve?
2. **Use When** — trigger conditions.
3. **Pattern** — recommended implementation/operation.
4. **Failure Modes** — common ways it breaks.
5. **Safety Gates** — how to fail closed / protect production.
6. **Verification** — what evidence proves success.
7. **Reuse Notes** — what must be adapted in a new project.

Keep skills concise and operational. Prefer patterns/checklists over narrative history.

---

## 4. Current Skill Index

- `safe-live-change.md`
  - backup -> exact change -> immediate read-back -> rollback on mismatch

- `shared-account-application-auth.md`
  - application-level employee identity on top of shared Kintone principals and its hard-isolation limitations

- `dedicated-group-acl-pattern.md`
  - manage multiple shared/access accounts through a dedicated Kintone group instead of per-user app ACL rows

- `browser-webcrypto-pbkdf2.md`
  - browser-compatible PBKDF2 password hashing plus create-only credential reconciliation and independent read-only post-provision verification without exposing secret material

- `fail-closed-customization.md`
  - design Kintone customization gates so missing host/init/data errors do not expose native sensitive UI

---

## 5. Skill Reuse in a New Kintone Project

Before designing a new Kintone project, ChatGPT should:
1. read this README;
2. select only skills matching the new project's requirements;
3. treat skills as reusable engineering patterns, not project truth;
4. validate project-specific assumptions before implementation;
5. promote new project-specific confirmed truth into that project's own Confirmed Baseline.

---

## 6. Skill Update Rule

Prefer updating an existing skill over creating near-duplicates.

Do not create:
- `safe-live-change-v2.md`
- `safe-live-change-new.md`
- duplicate skills for one project

Instead update the canonical skill in place and preserve important changes through Git history.

---

## 7. Security Rule

Never store:
- passwords;
- API tokens;
- cookies;
- raw session values;
- raw Password_Hash values;
- private production credentials.

Skills contain patterns, not secrets.
