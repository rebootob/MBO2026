---
name: mbo-testing-security
description: Testing standards, security verification, and cleanup audit governance for MBO V2
---

# MBO V2 Testing & Security Governance

## 1. Security & Privacy Boundaries
- Server-side security via Kintone Field & Record Permissions (Manager/GM scores confidential from appraisee).
- Client-side JavaScript provides UX highlights and validation only.
- Strict Explicit Field Whitelisting for Annual Plan Carry Forward (Never clone whole record).

## 2. Definition of Done (DoD) & Cleanup Audit
Every feature, refactor, or schema modification must pass the Definition of Done:
- [x] New Feature Functional & Validated
- [x] Data Migration Complete
- [x] Security & Privacy Tested
- [x] Regression Test Suite Passing (`npm test`)
- [x] Old References Audited & Removed (Reference Count = 0)
- [x] Unused Fields / Views / Scripts / Config Removed
- [x] Living Documentation & User Manuals Synchronized
- [x] Orphan Artifact Audit Passed (`Orphan Artifact Count = 0`)
