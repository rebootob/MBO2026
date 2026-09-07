# MBO2026 Active Work Package Contract

## Current Contract State

- **WORK_PACKAGE_ID**: `MBO-GOVERNANCE-V2-INIT`
- **MODE**: `DOCS-ONLY / GOVERNANCE REBASELINE / FUNCTION INVENTORY / LOW-CREDIT`
- **AUTHORIZATION_TOKEN**: `MBO-GOVERNANCE-V2-INIT-20260907-01`
- **BASIS_HEAD**: `0e4a9ccb1f62476f6f0fde6c0dd50f6588e6f13a`
- **STATUS**: `COMPLETED / CLOSING`

---

## State Transition Upon Completion

Upon completion of this governance initialization commit:

- **ACTIVE_WORK_PACKAGE**: `NONE`
- **NEXT_WORK_PACKAGE**: `CONTROL-PLANE FUNCTION-GAP REVIEW / NOT AUTHORIZED`

---

## Permanent Execution Rules

> [!IMPORTANT]
> All AI coding assistants (Antigravity, Claude, ChatGPT Control Plane) MUST enforce these 10 permanent rules without exception.

- **RULE-01**: No code change without an authorized `FUNCTION_ID` or `DEFECT_ID`.
- **RULE-02**: Exactly ONE `ACTIVE_WORK_PACKAGE` is permitted at a time.
- **RULE-03**: Every work package contract MUST explicitly define `IN_SCOPE` and `OUT_OF_SCOPE`.
- **RULE-04**: Execution agents MUST NOT automatically fix or modify out-of-scope findings. Out-of-scope findings must be logged for Control Plane review.
- **RULE-05**: New features or requirement expansions require explicit Owner authorization before entering release scope.
- **RULE-06**: A function is marked `CLOSED` only when its complete Definition of Done (code, tests, evidence, privacy, security) is satisfied.
- **RULE-07**: Closed functions may be reopened ONLY for `PROVEN_REGRESSION` or explicit `OWNER_CHANGE_REQUEST`.
- **RULE-08**: Minor wording, typo, or non-material documentation label issues DO NOT block engineering closure.
- **RULE-09**: Production, security, privacy, scoring, formula, or data-integrity defects are strictly `MATERIAL` and block closure.
- **RULE-10**: Kintone schema writes, live record mutations, and production deployment require separate, explicit, tokenized Owner authorization.

---

## Defect Severity Classification Model

- **CRITICAL**: Security breach, privacy leak, cross-employee data access, data loss or corruption, wrong scoring calculation, production environment corruption. (Blocks closure; requires immediate containment).
- **MATERIAL**: Function, workflow, business-rule, or export behavior incorrect against documented specification. (Blocks closure).
- **MINOR**: Minor formatting alignment, docstring wording, typo, cosmetic UI padding, or documentation label adjustment. (Accumulated into housekeeping batches; does not block engineering closure unless creating material ambiguity).

---

## Standard Work Package Contract Template

```markdown
# Work Package Contract: [WORK_PACKAGE_ID]

## Work Package Metadata
- **WORK_PACKAGE_ID**: [e.g. D2-WP005-PDF-EXPORT]
- **ACTIVE_WORK_PACKAGE**: [WORK_PACKAGE_ID]
- **MODE**: [e.g. BOUNDED SOURCE+TEST / LOW-CREDIT]
- **AUTHORIZATION_TOKEN**: [TOKEN]
- **BASIS_HEAD**: [EXACT_40_CHAR_SHA]
- **FUNCTION_IDS**: [e.g. XLSX-007]
- **DEFECT_IDS**: [NONE or DEFECT_ID]

## Scope Boundaries
- **OBJECTIVE**: [Concise 1-sentence goal]
- **IN_SCOPE**:
  - [Explicit file / task 1]
  - [Explicit file / task 2]
- **OUT_OF_SCOPE**:
  - [Excluded task 1]
  - [Excluded task 2]

## File Boundaries
- **WRITABLE_FILES**:
  - [file path 1]
  - [file path 2]
- **READ_ONLY_FILES**:
  - [file path 1]

## Execution Protocol
- **ACCEPTANCE_CRITERIA**:
  - [Criterion 1]
  - [Criterion 2]
- **TEST_REQUIREMENTS**:
  - [Test command 1]
  - [Test command 2]
- **STOP_CONDITIONS**:
  - [Stop condition 1]
  - [Stop condition 2]

## Authorization & Closure
- **OWNER_AUTHORIZATION**: [Owner approval text / token]
- **RESULT**: [PENDING / PASS / FAIL]
- **CLOSURE_EVIDENCE**: [Result SHA, test outputs, log paths]
```
