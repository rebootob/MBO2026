---
name: mbo-kintone-development
description: Standards, conventions, and architectural lifecycle rules for TTMET MBO V2
---

# MBO V2 Kintone Development & Architecture Standards

## 1. Core Architectural Standards
- Single Long-Lived Transaction App (App 794) for all fiscal years.
- Master Apps: Evaluation Profile (App 796), Competency (App 797), Generic Routing (App 795), Hoshin (App 799).
- Immutable Record Snapshots for all historical evaluations.
- UI: Vanilla JavaScript, Zero build step, Desktop Space element `SPACE_HEADER`.

## 2. Artifact Lifecycle & Cleanup Governance (No Orphan / No Dead Artifact Rule)
- **Goal:** `ORPHAN / DEAD ARTIFACT = 0` across all Sandbox/V2 apps.
- **Replace Means Cleanup:** When a new field/model replaces an old one (e.g. `Manager_Level1_Approvers` replacing `Manager_User`):
  1. Dependency Audit (Form, JS, API, Workflow, View, Permissions, Tests, Docs)
  2. Data/Logic Migration
  3. Regression Testing
  4. Confirm Reference Count = 0
  5. Remove Old Field / Config / Script
  6. Update Documentation & User Manuals
- **Zero Parallel Models:** Never maintain competing old and new architecture models simultaneously without an active migration plan.
- **No Git Clutter:** Never commit `backup_old.js`, `temp_v2.js`, or dead scratch scripts to the codebase. Git history serves as version backup.
