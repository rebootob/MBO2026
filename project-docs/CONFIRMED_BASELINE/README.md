# CONFIRMED BASELINE — SOURCE OF TRUTH

This folder contains business and technical facts that have already been explicitly confirmed by user decision, live Kintone evidence, or completed review gates.

## Governance

1. This folder is the first reference for future ChatGPT/Antigravity reviews.
2. Only confirmed/frozen facts belong here. Drafts, proposals, hypotheses, candidate mappings, temporary findings, and unresolved decisions must stay outside this folder.
3. When a confirmed fact changes, update the existing canonical file in place. Do not create `_old`, `_v1`, duplicate baseline files, or parallel sources of truth.
4. Every change to confirmed baseline data must include the evidence/review context or explicit user decision that caused the change.
5. If another project document conflicts with this folder, STOP and reconcile before runtime/deployment work. Do not silently choose one.
6. Runtime code, Kintone configuration, tests, and living docs must remain consistent with the applicable confirmed baseline.
7. Historical evidence may support a decision, but does not become a current baseline until reviewed/accepted.
8. NO_ORPHAN_ARTIFACT_GATE applies to this folder.

## Canonical Files

- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes and weights.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app IDs/names used as historical classification evidence.
- `ROUTING_WORKFLOW.md` — confirmed App795 routing model and workflow rules.

## Review Rule

For every future `review`, reviewer must:

1. Read this folder first.
2. Compare implementation/evidence against these confirmed facts.
3. Update this folder only when a new fact is actually confirmed.
4. Treat conflicts as MUST FIX/BLOCKER according to impact.

This folder is intentionally concise. Detailed execution logs remain in CHANGELOG/HANDOFF/AI_REVIEW_PACKAGE; confirmed baseline facts belong here.