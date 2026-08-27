# CONFIRMED BASELINE — SOURCE OF TRUTH

This folder contains business, technical, security, UI/UX, routing, data, and governance facts that have already been explicitly confirmed by user decision, live Kintone evidence accepted by independent review, or completed review gates.

## Governance

1. This folder is the highest-priority durable source of truth for future ChatGPT/Antigravity reviews.
2. Only confirmed/frozen facts belong here. Drafts, proposals, hypotheses, candidate mappings, temporary findings, pending-review execution claims, and unresolved decisions must stay outside this folder.
3. **Every important durable fact that becomes confirmed MUST be promoted into this folder in the same control cycle. Do not leave confirmed important information only in chat, AI_CONTROL_CENTER, AI_ACTIVE_TASK, evidence files, screenshots, CHANGELOG, or HANDOFF.**
4. When a confirmed fact changes, update the existing canonical file in place. Do not create `_old`, `_v1`, duplicate baseline files, or parallel sources of truth.
5. Every change to confirmed baseline data must include the evidence/review context or explicit user decision that caused the change.
6. If another project document conflicts with this folder, STOP and reconcile before runtime/deployment work. Do not silently choose one.
7. Runtime code, Kintone configuration, tests, `AI_CONTROL_CENTER.md`, and `AI_ACTIVE_TASK.md` must remain consistent with the applicable confirmed baseline.
8. Historical evidence may support a decision, but does not become a current baseline until independently reviewed/accepted or explicitly confirmed by the user.
9. NO_ORPHAN_ARTIFACT_GATE applies to this folder.
10. Baseline promotion is a Control Plane responsibility. Do not spend Antigravity credit on baseline maintenance unless ChatGPT explicitly assigns a narrow baseline-only task.
11. AI must follow `DOCUMENT_CONTROL.md`: historical/superseded documents remain available for audit but are not reread by default.

## What Must Be Promoted

Examples of baseline-worthy important facts:
- user-approved architecture;
- source-of-truth app definitions / app IDs;
- field semantics / canonical mappings;
- authentication and security design;
- roles, permissions, and authority boundaries;
- routing/workflow/scoring rules;
- mandatory/frozen UI/UX rules;
- migration authority rules;
- durable Multi-AI operating/governance rules;
- any durable fact a future AI must use without rediscovery.

Temporary status, blockers, one-time commands, pending-review claims, transient commit SHAs, and raw test logs belong in `AI_CONTROL_CENTER.md` / evidence until they create a durable confirmed rule.

## Canonical Files

- `AI_OPERATING_GOVERNANCE.md` — confirmed Multi-AI role model, Antigravity low-credit policy, Control Center/Active Task model, mandatory baseline-promotion rule, reusable Kintone skill-extraction rule, and review/new-chat governance.
- `DOCUMENT_CONTROL.md` — confirmed lean document policy: Core Read Set, task-triggered documents, and default-ignore historical/superseded files.
- `D1_AUTH_SECURITY.md` — confirmed Kintone-only D1 authentication/security architecture, App801 credential model, page-memory auth, lockout/password rules, Employee Self gate, dedicated `MBO_EMPLOYEE_ACCESS` group model, App801 ACL target, and D1 UAT closure rule.
- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes, weights, and lifecycle appraiser model.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app IDs/names used as historical classification evidence.
- `ROUTING_WORKFLOW.md` — confirmed App795 routing model and workflow rules.
- `EMPLOYEE_MASTER_ROUTING.md` — confirmed App53 routing-input semantics, Position normalization, General Manager precedence, TMG2 Team values, President-resolution safety, and TMG2 CAD same-route decision.
- `UI_UX.md` — confirmed App794 five-stage UI/UX, bilingual presentation, route display, HR phase-calendar ownership, deadline/countdown, attachments, and Preview visual-approval rules.

## Review Rule

For every future `review`, reviewer must:

1. Read `AI_CONTROL_CENTER.md` and only the relevant files in this folder.
2. Compare implementation/evidence against confirmed facts.
3. Independently accept/reject new evidence.
4. **Promote every newly accepted important durable fact into this folder before closing the control cycle.**
5. Extract reusable Kintone knowledge into `skills/kintone/` when the knowledge is generalizable beyond MBO2026.
6. Treat conflicts as MUST FIX/BLOCKER according to impact.
7. Update Control Center / Active Task to match the promoted baseline.

This folder is intentionally concise. Detailed execution logs remain outside it; confirmed durable truth belongs here.
