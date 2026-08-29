# AI START HERE — MBO2026

> Mandatory entry point for every AI working on MBO2026.

## 1. Do Not Browse the Repository First

Before planning, reviewing, coding, or changing Kintone:

1. Fetch current HEAD of `ai/antigravity-wp002c`.
2. Read `project-docs/AI_CONTROL_CENTER.md`.
3. Read `project-docs/AI_DOCUMENT_INDEX.md`.
4. Read `project-docs/CONFIRMED_BASELINE/README.md`.
5. Use the Document Index to open **only** the Baseline/evidence files relevant to the current task.
6. Read `project-docs/AI_ACTIVE_TASK.md` if execution is involved or if reviewing the execution it authorized.

Do not read the whole `project-docs/` tree.
Do not read all Confirmed Baseline files automatically.
Do not ask the user to repeat history already available in Git/GitHub.
Do not start a Live write/deploy during startup.

Repository/live evidence beats chat memory.

## 2. Authority Is By Purpose — Not One Flat Order

- `project-docs/CONFIRMED_BASELINE/` = durable confirmed business/technical/security truth.
- `project-docs/00_MASTER_JOBLIST.md` = D1–D7 completeness and no-drop authority.
- `project-docs/AI_CONTROL_CENTER.md` = current independently accepted state, blockers, authorization and next owner.
- `project-docs/AI_ACTIVE_TASK.md` = exact current execution packet only; it is not evidence that execution succeeded.
- Git/Kintone evidence = what actually exists/ran/live-read-back.

If implementation evidence conflicts with Baseline, stop and reconcile before further execution.

## 3. Permanent Roles

**ChatGPT = Control Plane**
- plan, design, inspect Git, review, decide PASS/CORRECTIVE/BLOCKED;
- maintain Baseline, Control Center, Document Index, Active Task and new-chat handoff;
- extract reusable Kintone Skills.

**Antigravity = Low-Credit Execution Plane**
- use only for actual implementation/live Kintone/local runtime work ChatGPT cannot perform;
- read only Control Center + Active Task + explicitly listed files;
- no broad planning/repository archaeology/self-review/long reports by default.

Full governance:
`project-docs/CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`

Document-read policy:
`project-docs/CONFIRMED_BASELINE/DOCUMENT_CONTROL.md`

## 4. Mandatory Knowledge Rules

When a durable important project fact becomes confirmed:
→ update `project-docs/CONFIRMED_BASELINE/` in the same control cycle.

When a reusable Kintone technique/lesson is discovered:
→ update `skills/kintone/` in the same review/control cycle when practical.

Do not spend Antigravity credit on these documentation tasks unless exact execution is required.

## 5. D1–D7 No-Drop

```text
D1 Login + Password Change + Employee-Self MBO Gate
D2 Excel + PDF Legacy Format Export
D3 8 Legacy PMS Apps -> App794 Migration
D4 App800 HR Control Center End-to-End
D5 Copy Own Previous MBO
D6 Integrated E2E / Security / Regression
D7 Admin Support Center
```

Current status is in `AI_CONTROL_CENTER.md`; detailed acceptance/no-drop criteria are in `00_MASTER_JOBLIST.md`.

## 6. Critical D1 Constraint

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

Do not revive `services/mbo-auth-bridge/` from historical files or chat memory.

## 7. User Shorthand

`review` → ChatGPT re-fetches HEAD and independently reviews exact latest evidence against the authorizing Active Task + relevant Baseline.

`ต่อ` / `ต่อไป` → ChatGPT re-fetches HEAD + Control Center, checks duplicate/pending work, chooses the smallest next action, and invokes Antigravity only if actual execution is needed.

`อนุมัติ ...` → record the exact authorization boundary; do not widen it silently and do not reuse a consumed one-shot authorization.

## 8. New Chat

Use only:
`project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`

That file is the single canonical reusable new-chat prompt. It includes a current handoff checkpoint, but a new chat must still re-fetch HEAD / Control Center / Active Task and must not treat the embedded checkpoint as newer than repository evidence.
