# CONFIRMED BASELINE — SOURCE OF TRUTH

This folder contains business, technical, security, UI/UX, routing, data, and governance facts that have already been explicitly confirmed by user decision, live Kintone evidence accepted by independent review, or completed review gates.

## Governance

1. This folder is the highest-priority durable source of truth for future ChatGPT/Antigravity reviews.
2. Only confirmed/frozen facts belong here. Drafts, proposals, hypotheses, candidate mappings, temporary findings, pending-review execution claims, and unresolved decisions must stay outside this folder.
3. **Every important durable fact that becomes confirmed MUST be promoted into this folder in the same control cycle.**
4. When a confirmed fact changes, update the existing canonical file in place or add a clearly scoped closure/supersession Baseline when preserving the original acceptance contract is important. Do not create duplicate `_old` / `_v1` sources of truth.
5. Every Baseline change must include the evidence/review context or explicit user decision that caused it.
6. If another project document conflicts with this folder, STOP and reconcile before runtime/deployment work.
7. Runtime code, Kintone configuration, tests, `AI_CONTROL_CENTER.md`, and `AI_ACTIVE_TASK.md` must remain consistent with the applicable Baseline.
8. Historical evidence does not become current truth until independently reviewed/accepted or explicitly confirmed.
9. Baseline promotion is a Control Plane responsibility.
10. Follow `DOCUMENT_CONTROL.md`; historical/superseded documents remain available for audit but are not reread by default.

## D1 final status

D1 authentication/access is **KINTONE-ONLY HYBRID IDENTITY** and is now closed:

```text
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
External server/service = FORBIDDEN
Auth Bridge              = CANCELLED / SUPERSEDED
External database        = FORBIDDEN
Reverse proxy            = FORBIDDEN
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

`D1_CLOSURE.md` is the durable final-status/supersession authority for D1. Older D1 Baselines continue to govern their detailed behavior/security contracts, but pre-live/pre-closure status sentences inside them are superseded by `D1_CLOSURE.md` and current accepted repository/live evidence.

Canonical meaning remains:
- dedicated Kintone employee/approvers auto-bind only through exact active App53 `MBO_Kintone_User` -> canonical `emp_text` Employee_Code;
- approved shared Kintone principals use Employee_Code + App801 MBO password/session;
- one person may be both Employee and Approver without duplicate employee/MBO records;
- `My MBO` and `My Approval Tasks` are separate security contexts;
- self-approval is prohibited; approved own-MBO-only elision removes self before workflow snapshot and never auto-approves;
- Dedicated approval authority is authoritative current native App794 `Assignee`;
- SHARED approver authority is denied.

Accepted D1 Kintone-only ceilings remain:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

## Employee lifecycle changes — durable policy

`EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` is the canonical policy for resignation, transfer, promotion/position change, Department/Section/Team change, Kintone-principal change, and manager/appraiser lifecycle changes.

Core rule:

```text
Employee_Code = stable person identity
App53 = current employee/org/position truth
App795 = current routing config for fresh resolution
App794 = annual historical snapshot + current workflow truth
master-data change != automatic retroactive App794 rewrite
mid-cycle operational change = HR-controlled explicit amendment + audit
```

This lifecycle policy does not reopen D1 by itself. D4 owns HR operational implementation and D6 owns integrated lifecycle/security regression.

## D2 Part B preservation allowed-drift — durable Owner decision

Owner decision confirmed on 2026-09-02 ICT:

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Durable meaning:
- the direct xlsx-populate Part B round trip may contain exactly one specifically proven deterministic `sheetPr` drift in legacy `Sheet1`;
- this is not generic `sheetPr` tolerance;
- the exact SHA-verified source must lack the allowed element;
- the observed element must match the exact pinned structure/value/fingerprint and exact pinned worksheet/slot derived from the verified round trip;
- normalization/removal must occur only inside the approved preservation path on its working copy;
- caller source/raw inputs remain byte-immutable;
- modified, extra, duplicate, reordered, moved, other-sheet or Part-A `sheetPr` remains fail-closed;
- every other non-dimension drift remains forbidden.

This decision changes only the D2 preservation policy. It does not by itself authorize source changes, evidence publication, Kintone access/write, deploy, Live UAT, rollback or D3.

## Canonical Files

- `AI_OPERATING_GOVERNANCE.md` — Multi-AI role model, low-credit policy, review rules, Control Center/Active Task model, Baseline promotion and reusable-skill rules.
- `ROLLBACK_RECOVERY_SAFETY.md` — mandatory Live rollback/recovery standard.
- `SOURCE_CODE_ARCHITECTURE.md` — modular JavaScript architecture and source ownership rules.
- `DOCUMENT_CONTROL.md` — lean document policy, Core Read Set and default-ignore historical files.
- `D1_CLOSURE.md` — final durable D1 PASS/closure, accepted runtime/config evidence, cleanup state, security ceilings and supersession rule for older pre-live status text.
- `D1_AUTH_SECURITY.md` — KINTONE-ONLY HYBRID IDENTITY architecture, dedicated-vs-shared identity modes, Employee-Self/Approver separation, App801 shared credential model, PBKDF2/lockout/password rules and HR/admin reset authority.
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — App53 mapping contract, own-MBO self-appraiser elision, Dedicated native access and status-aware Record ACL design.
- `D1_SESSION_CONTINUITY.md` — dedicated native-Kintone continuity versus shared 8-hour App801-backed same-tab MBO session, binding/logout/password rules.
- `D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO ownership/history/status/no-delete rules for both identity modes, with dual-role separation.
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — Live history/comments/attachments truthfulness and Kintone-only file lifecycle.
- `EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` — stable Employee_Code, current-master vs historical-snapshot rules, resignation/transfer/promotion/principal-change handling, HR-controlled mid-cycle reassignment and D4/D6 ownership.
- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes, weights and lifecycle appraiser model.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app IDs/names used as historical classification evidence.
- `ROUTING_WORKFLOW.md` — confirmed App795 routing model, effective requester identity and workflow rules.
- `EMPLOYEE_MASTER_ROUTING.md` — confirmed App53 routing-input semantics and mapping contract.
- `UI_UX.md` — confirmed App794 UI/UX and Hybrid Identity Home behavior.

## Review Rule

For every future `review`, reviewer must:
1. read `AI_CONTROL_CENTER.md` and only the relevant Baselines;
2. compare implementation/evidence against confirmed facts;
3. independently accept/reject new evidence;
4. promote newly accepted durable facts into this folder before closing the control cycle;
5. extract reusable Kintone knowledge into `skills/kintone/` when generalizable;
6. treat conflicts as MUST FIX/BLOCKER according to impact;
7. update Control Center / Active Task to match the promoted Baseline.

For any D1 reopen/security audit, read `D1_CLOSURE.md` first, then only the detailed D1 Baselines directly relevant to the suspected regression.
For employee resignation/transfer/promotion/principal/approver lifecycle work, `EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` is mandatory reading before planning or implementation.

For any Live deployment/rollback/recovery review, `ROLLBACK_RECOVERY_SAFETY.md` is mandatory reading.
For any source implementation/refactor review, `SOURCE_CODE_ARCHITECTURE.md` is mandatory reading when functional ownership or module boundaries are affected.

Temporary status, blockers, transient commit SHAs and raw test logs belong in `AI_CONTROL_CENTER.md` / evidence, not duplicated here.
