---
name: mbo-testing-security
description: Quality assurance, security validation, and automated test matrix
---

# MBO Testing & Security Protocol

## 1. Automated Test Suites (`npm test`)
- `tests/sandbox-write-guard.test.js`: Blocks writes to App 53 & App 283.
- `tests/workflow-validator.test.js`: Validates 16 Generic Workflow Statuses & 28 Actions.
- `tests/record-key.test.js`: Validates `buildRecordKey` preserving leading zeroes.
- `tests/host-resolver.test.js`: Validates safe DOM host resolution and regression against banned APIs.
- `tests/validation-engine.test.js`: Validates Objective count 2–10, Weight = 100%, Difficulty 1–4, Progress 0–100, Self Eval 1–5.
- `tests/ui-stage-and-privacy.test.js`: Ensures confidential fields are never exposed to employees.

## 2. Security Boundaries
- App 53 and App 283 are read-only.
- All confidential fields (`CONFIDENTIAL_FIELDS`) are protected by Kintone field permissions and excluded from employee UI components.
