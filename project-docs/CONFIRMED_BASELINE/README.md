# CONFIRMED BASELINE — SOURCE OF TRUTH

This folder contains business, technical, security, UI/UX, routing, data, and governance facts that have already been explicitly confirmed by user decision, live Kintone evidence accepted by independent review, or completed review gates.

## Governance

1. This folder is the highest-priority durable source of truth for future ChatGPT/Antigravity reviews.
2. Only confirmed/frozen facts belong here. Drafts, proposals, hypotheses, candidate mappings, temporary findings, pending-review execution claims, and unresolved decisions must stay outside this folder.
3. **Every important durable fact that becomes confirmed MUST be promoted into this folder in the same control cycle.**
4. When a confirmed fact changes, update the existing canonical file in place. Do not create duplicate `_old` / `_v1` sources of truth.
5. Every Baseline change must include the evidence/review context or explicit user decision that caused it.
6. If another project document conflicts with this folder, STOP and reconcile before runtime/deployment work.
7. Runtime code, Kintone configuration, tests, `AI_CONTROL_CENTER.md`, and `AI_ACTIVE_TASK.md` must remain consistent with the applicable Baseline.
8. Historical evidence does not become current truth until independently reviewed/accepted or explicitly confirmed.
9. Baseline promotion is a Control Plane responsibility.
10. Follow `DOCUMENT_CONTROL.md`; historical/superseded documents remain available for audit but are not reread by default.

## Critical D1 Constraint

D1 authentication is **KINTONE-ONLY**.

```text
External server/service = FORBIDDEN
Auth Bridge              = CANCELLED / SUPERSEDED
External database        = FORBIDDEN
Reverse proxy            = FORBIDDEN
```

Do not infer otherwise from historical chat, commits, or abandoned `services/mbo-auth-bridge/` files.

## Canonical Files

- `AI_OPERATING_GOVERNANCE.md` — Multi-AI role model, low-credit policy, review rules, Control Center/Active Task model, Baseline promotion and reusable-skill rules.
- `ROLLBACK_RECOVERY_SAFETY.md` — mandatory Live rollback/recovery standard: immutable known-good manifest, atomic JS/CSS release pair, validated rollback material, explicit rollback authorization, one-attempt fail-closed execution and exact post-readback.
- `SOURCE_CODE_ARCHITECTURE.md` — modular JavaScript architecture, one-feature/one-owner rule, feature/service/domain/adapter boundaries, change locality, no copy-paste implementations, feature-level tests, controlled decomposition and generated-dist traceability.
- `DOCUMENT_CONTROL.md` — lean document policy, Core Read Set and default-ignore historical files.
- `D1_AUTH_SECURITY.md` — **current KINTONE-ONLY D1 authentication architecture**, App801 credential model, PBKDF2/lockout/password rules, Employee-Self identity binding, `MBO_EMPLOYEE_ACCESS` ACL target, shared-principal limitation and final D1 UAT requirements.
- `D1_SESSION_CONTINUITY.md` — 8-hour same-tab opaque session model validated through App801 inside Kintone, Credential_Version/Kintone-principal binding, logout/password rotation and UAT requirements.
- `D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO ownership/history/status/no-delete rules.
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — Live must not fabricate workflow/comment history; native Kintone Comments authority; truthful zero/pending/saved/multiple attachment states and Kintone-only file lifecycle.
- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes, weights and lifecycle appraiser model.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app IDs/names used as historical classification evidence.
- `ROUTING_WORKFLOW.md` — confirmed App795 routing model and workflow rules.
- `EMPLOYEE_MASTER_ROUTING.md` — confirmed App53 routing-input semantics, Position normalization, GM precedence, Team semantics and President-resolution safety.
- `UI_UX.md` — confirmed App794 UI/UX, bilingual presentation, route display, HR phase-calendar ownership, deadlines, attachments and Preview approval rules.

## Review Rule

For every future `review`, reviewer must:
1. read `AI_CONTROL_CENTER.md` and only the relevant Baselines;
2. compare implementation/evidence against confirmed facts;
3. independently accept/reject new evidence;
4. promote newly accepted durable facts into this folder before closing the control cycle;
5. extract reusable Kintone knowledge into `skills/kintone/` when generalizable;
6. treat conflicts as MUST FIX/BLOCKER according to impact;
7. update Control Center / Active Task to match the promoted Baseline.

For any Live deployment/rollback/recovery review, `ROLLBACK_RECOVERY_SAFETY.md` is mandatory reading.
For any source implementation/refactor review, `SOURCE_CODE_ARCHITECTURE.md` is mandatory reading when functional ownership or module boundaries are affected.

Temporary status, blockers, transient commit SHAs and raw test logs belong in `AI_CONTROL_CENTER.md` / evidence, not duplicated here.