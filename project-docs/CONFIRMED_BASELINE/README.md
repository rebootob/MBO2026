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

D1 authentication/access is **KINTONE-ONLY HYBRID IDENTITY**.

```text
External server/service = FORBIDDEN
Auth Bridge              = CANCELLED / SUPERSEDED
External database        = FORBIDDEN
Reverse proxy            = FORBIDDEN

HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Canonical meaning:
- dedicated Kintone employee/approvers may auto-bind to their exact active Employee_Code only through the approved authoritative mapping contract;
- approved mapping design is App53 `MBO_Kintone_User` (USER_SELECT) -> active row -> canonical `emp_text` Employee_Code;
- approved shared Kintone principals continue to use Employee_Code + App801 MBO password/session;
- one person may be both Employee and Approver without duplicate employee/MBO records;
- `My MBO` and `My Approval Tasks` are separate security contexts;
- self-approval is prohibited by default; the approved own-MBO-only exception removes the self appraiser before workflow snapshot, preserves remaining order, recalculates topology, and never auto-approves;
- dedicated App794 access is separated from `MBO_EMPLOYEE_ACCESS` and uses a separate `MBO_DEDICATED_ACCESS` boundary plus status-aware native Record ACL design;
- protected App53/App794/group writes remain separate explicit authorization gates.

Do not infer otherwise from historical chat, commits, or abandoned `services/mbo-auth-bridge/` files.

## Canonical Files

- `AI_OPERATING_GOVERNANCE.md` — Multi-AI role model, low-credit policy, review rules, Control Center/Active Task model, Baseline promotion and reusable-skill rules.
- `ROLLBACK_RECOVERY_SAFETY.md` — mandatory Live rollback/recovery standard: immutable known-good manifest, atomic JS/CSS release pair, validated rollback material, explicit rollback authorization, one-attempt fail-closed execution and exact post-readback.
- `SOURCE_CODE_ARCHITECTURE.md` — modular JavaScript architecture, one-feature/one-owner rule, feature/service/domain/adapter boundaries, change locality, no copy-paste implementations, feature-level tests, controlled decomposition and generated-dist traceability.
- `DOCUMENT_CONTROL.md` — lean document policy, Core Read Set and default-ignore historical files.
- `D1_AUTH_SECURITY.md` — current KINTONE-ONLY HYBRID IDENTITY architecture, dedicated-vs-shared identity modes, Employee-Self/Approver separation, App801 shared credential model, PBKDF2/lockout/password rules, HR/admin reset authority, `MBO_EMPLOYEE_ACCESS` shared-principal ACL and final D1 UAT requirements.
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — approved App53 `MBO_Kintone_User` mapping design, own-MBO self-appraiser elision rule, `MBO_DEDICATED_ACCESS` separation, status-aware FIELD_ENTITY Record ACL target, implementation/write/UAT gates.
- `D1_SESSION_CONTINUITY.md` — dedicated native-Kintone continuity versus shared 8-hour App801-backed same-tab MBO session, Credential_Version/Kintone-principal binding, logout/password rotation and UAT requirements.
- `D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO ownership/history/status/no-delete rules for both identity modes, with dual-role separation from Approval Tasks.
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — Live must not fabricate workflow/comment history; native Kintone Comments authority; truthful zero/pending/saved/multiple attachment states and Kintone-only file lifecycle.
- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes, weights and lifecycle appraiser model.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app IDs/names used as historical classification evidence.
- `ROUTING_WORKFLOW.md` — confirmed App795 routing model, effective dedicated/shared requester identity, dual-role Approver authorization and routing/workflow rules.
- `EMPLOYEE_MASTER_ROUTING.md` — confirmed App53 routing-input semantics plus dedicated Kintone User <-> Employee_Code mapping contract, Position normalization, GM precedence, Team semantics and President-resolution safety.
- `UI_UX.md` — confirmed App794 UI/UX, bilingual presentation, route display, HR phase-calendar ownership, deadlines, attachments, Preview approval rules, and Hybrid Identity Home (`My MBO` + `My Approval Tasks`).

## Review Rule

For every future `review`, reviewer must:
1. read `AI_CONTROL_CENTER.md` and only the relevant Baselines;
2. compare implementation/evidence against confirmed facts;
3. independently accept/reject new evidence;
4. promote newly accepted durable facts into this folder before closing the control cycle;
5. extract reusable Kintone knowledge into `skills/kintone/` when generalizable;
6. treat conflicts as MUST FIX/BLOCKER according to impact;
7. update Control Center / Active Task to match the promoted Baseline.

For any Hybrid Identity / dual-role review, the minimum relevant set is:
- `D1_AUTH_SECURITY.md`
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `D1_SESSION_CONTINUITY.md`
- `D1_EMPLOYEE_SELF_MY_MBO.md`
- `EMPLOYEE_MASTER_ROUTING.md`
- `ROUTING_WORKFLOW.md`
- `UI_UX.md` when Home/record UX is involved.

For any Live deployment/rollback/recovery review, `ROLLBACK_RECOVERY_SAFETY.md` is mandatory reading.
For any source implementation/refactor review, `SOURCE_CODE_ARCHITECTURE.md` is mandatory reading when functional ownership or module boundaries are affected.

Temporary status, blockers, transient commit SHAs and raw test logs belong in `AI_CONTROL_CENTER.md` / evidence, not duplicated here.
