# CONFIRMED BASELINE — SOURCE OF TRUTH

This folder contains business, technical, security, UI/UX, routing, data, and governance facts already confirmed by Owner decision, accepted Live evidence, or completed independent review gates.

## Governance

1. This folder is the highest-priority durable source of truth for future ChatGPT/Antigravity reviews.
2. Only confirmed/frozen facts belong here. Drafts, proposals, hypotheses, candidate mappings, temporary findings, pending-review execution claims, and unresolved decisions must stay outside this folder.
3. Every important durable fact that becomes confirmed MUST be promoted here in the same control cycle.
4. When confirmed truth changes, update the canonical file or add a clearly scoped closure/supersession Baseline; do not create duplicate `_old` / `_v1` truth files.
5. Every Baseline change must include its evidence/review or explicit Owner decision basis.
6. If another project document conflicts with this folder, STOP and reconcile before runtime/deployment work.
7. Runtime code, Kintone configuration, tests, `AI_CONTROL_CENTER.md`, and `AI_ACTIVE_TASK.md` must remain consistent with applicable Baselines.
8. Historical evidence does not become current truth until independently accepted or explicitly confirmed.
9. Baseline promotion is a Control Plane responsibility.
10. Historical/superseded documents remain available for audit but are not reread by default.

## Fast D2 durable read set

For ordinary D2 continuation/review, start with `../D2_REVIEW_FAST_START.md` and read only the Baseline directly touched by the current gate/diff.

Current closed D2 gate Baselines:
- `D2_PART_A_STRUCTURAL_CLOSURE.md` — frozen Part A real 4..10 objective structural matrix and zero-formula invariant.
- `D2_PART_B_STRUCTURAL_CLOSURE.md` — frozen Part B real 6/7/8 competency structural matrix, fail-closed source/defined-name controls, zero-formula invariant, and explicit privacy-remap boundary.
- `D2_FORMULA_AUTHORITY_CLOSURE.md` — scoring authority = Kintone/App794; secured projection = export-data authority; Excel scoring formulas/recalculation forbidden; production XLSX formula inventory must remain zero.
- `D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md` — frozen Part B 6/7/8 privacy-role mapping, strict source evidence, sanitization/token-purge proof, and row30/clone protected-static semantics.
- `D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` — independently accepted owner-template semantic mapping authority: exactly 18 `SAFE_TO_MAP`, 22 unresolved fail-closed roles, 5 no-secured-source roles, zero duplicate safe targets, and Part B Chief authority `R:X`.

Production export architecture:
- `EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md` — mandatory centralized semantic Template Profile/Mapping; no scattered important cell/range addresses in the Production Renderer.

Do not reread closed gates by default unless the current diff touches their dependency or concrete regression evidence exists.

## D1 final status

D1 authentication/access is **KINTONE-ONLY HYBRID IDENTITY** and is closed:

```text
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / SUPERSEDED
External database = FORBIDDEN
Reverse proxy = FORBIDDEN
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

`D1_CLOSURE.md` is the durable final-status/supersession authority for D1. Older D1 Baselines govern detailed behavior/security contracts, but pre-live/pre-closure status text is superseded by `D1_CLOSURE.md` and current accepted repository/live evidence.

Canonical meaning remains:
- dedicated Kintone employee/approvers auto-bind only through exact active App53 `MBO_Kintone_User` -> canonical Employee_Code;
- approved shared Kintone principals use Employee_Code + App801 MBO password/session;
- one person may be both Employee and Approver without duplicate employee/MBO records;
- `My MBO` and `My Approval Tasks` are separate security contexts;
- self-approval is prohibited;
- Dedicated approval authority is authoritative current native App794 `Assignee`;
- SHARED approver authority is denied.

Accepted D1 Kintone-only ceilings remain:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

## Employee lifecycle changes — durable policy

`EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` is canonical for resignation, transfer, promotion/position change, Department/Section/Team change, Kintone-principal change, and manager/appraiser lifecycle changes.

```text
Employee_Code = stable person identity
App53 = current employee/org/position truth
App795 = current routing config for fresh resolution
App794 = annual historical snapshot + current workflow truth
master-data change != automatic retroactive App794 rewrite
mid-cycle operational change = HR-controlled explicit amendment + audit
```

D4 owns HR operational implementation and D6 owns integrated lifecycle/security regression.

## D2 preservation allowed-drift — durable Owner decision

```text
DECISION_ID = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
DECISION = OPTION B
STATUS = APPROVED
POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
```

Only the specifically proven deterministic Part B `Sheet1` `<sheetPr/>` drift is allowed in the approved preservation path. It is not generic tolerance. All other non-dimension drift remains fail-closed and caller source/raw inputs remain byte-immutable.

## D2 OOXML preservation gate — durable closure

```text
D2_PRESERVATION_GATE = PASS / CLOSED
R3-R29_SOURCE_BASELINE = PASS / FROZEN
D2-WP003-R3-R30 = PASS / CLOSED
R3-R30_IMPLEMENTATION_COMMIT = d15261eadbc726ea87f11085253c026fedada381
```

Frozen preservation controls include exact template SHA identity, worksheet relationship/type/target controls, XML structure/order/occurrence validation, direct raw Part A/Part B preservation, caller-buffer immutability, exact print-area and privacy/header regression guards, and Option B as the only allowed non-dimension drift.

## D2 reference-image gate — durable closure

```text
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
D2-WP003-R3-R36 = PASS / CLOSED
R3-R36_AUTHORIZATION_COMMIT = f72e935b639da850aacc675c1ef2e30ce5f892c7
R3-R36_IMPLEMENTATION_COMMIT = 45b2b15986aa814e5f863952f0d150e14360171e
```

Frozen reference-image controls preserve exact target anchor/relationship/media identity, complete before/after inventories, deterministic package-reference safety, fail-closed XML/relationship parsing, exact case/QName behavior, and branding/media survival outside the single approved removed target.

## Canonical Files

- `AI_OPERATING_GOVERNANCE.md` — Multi-AI role model, low-credit policy, review rules and Baseline promotion.
- `ROLLBACK_RECOVERY_SAFETY.md` — mandatory Live rollback/recovery standard.
- `SOURCE_CODE_ARCHITECTURE.md` — modular JavaScript architecture and source ownership rules.
- `EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md` — centralized export Template Profile/Mapping architecture and future template-change policy.
- `DOCUMENT_CONTROL.md` — lean document policy and historical/default-ignore rules.
- `D1_CLOSURE.md` — final durable D1 PASS/closure and security ceilings.
- `D1_AUTH_SECURITY.md` — KINTONE-ONLY HYBRID IDENTITY and shared credential model.
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — App53 mapping and access design.
- `D1_SESSION_CONTINUITY.md` — dedicated/shared session continuity rules.
- `D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO ownership/history/status rules.
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — Live history/comments/attachments truthfulness.
- `EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` — lifecycle change policy.
- `EVALUATION_CLASSES.md` — frozen evaluation/scoring classes and weights.
- `LEGACY_PMS_APPS.md` — verified legacy PMS app classification evidence.
- `ROUTING_WORKFLOW.md` — App795 routing/workflow rules.
- `EMPLOYEE_MASTER_ROUTING.md` — App53 routing-input semantics.
- `UI_UX.md` — confirmed App794 UI/UX behavior.
- `D2_PART_A_STRUCTURAL_CLOSURE.md` — Part A structural closure.
- `D2_PART_B_STRUCTURAL_CLOSURE.md` — Part B structural closure.
- `D2_FORMULA_AUTHORITY_CLOSURE.md` — formula/no-formula authority closure.
- `D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md` — Part B expanded privacy closure.
- `D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` — XLSX semantic mapping closure and exact safe/unresolved/no-source production role authority.

## Review Rule

For future `review`:
1. start from `D2_REVIEW_FAST_START.md` for D2 work;
2. read only the relevant Baseline;
3. compare implementation/evidence against confirmed facts;
4. independently accept/reject new evidence;
5. promote newly accepted durable facts before closing the cycle;
6. treat conflicts as MUST FIX/BLOCKER according to impact;
7. update Control Center / Active Task to match promoted truth.

For D1 reopen/security audit, read `D1_CLOSURE.md` first. For lifecycle work, read `EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`. For Live deployment/rollback, read `ROLLBACK_RECOVERY_SAFETY.md`. For source implementation/refactor affecting module ownership, read `SOURCE_CODE_ARCHITECTURE.md`. For Production XLSX/PDF template-address mapping or future form-layout changes, read `EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md` together with `D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`.
