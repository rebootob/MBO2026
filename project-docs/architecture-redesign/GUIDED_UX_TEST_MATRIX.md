# Guided Workflow UX Test Matrix (25 Scenarios)

> **Document Status:** Complete (Test Blueprint)  
> **Coverage:** Scenarios `UX-001` to `UX-025`  
> **Last Updated:** 2026-08-24  

---

## 1. Master Guided UX Test Table

| Test ID | Scenario Description | User Context & Inputs | Expected Guided UX Behavior | Pass Criteria |
| :--- | :--- | :--- | :--- | :---: |
| **UX-001** | Employee Objective Draft | Employee opens new record | Shows Guidance Header, Tasks Checklist, Save Draft / Submit buttons | PASS |
| **UX-002** | Missing Objective Validation | 1 Objective entered (< 2) | Checklist shows [X], Missing Panel highlights minimum 2 objectives required | PASS |
| **UX-003** | Total Weight != 100% | Total weight = 80% | Missing Panel shows "Weight = 80% (Must be 100%)", Submit CTA disabled | PASS |
| **UX-004** | Hoshin Not Ready Gate | Section Hoshin not ready | Banner: "Hoshin Not Ready", Save Draft allowed, Submit blocked with explanation | PASS |
| **UX-005** | Routing Not Configured | Employee without Route | Banner: "Routing not configured (HR action required)", clear error code | PASS |
| **UX-006** | Profile Not Configured | Employee without Profile | Banner: "Evaluation Profile not configured (HR action required)" | PASS |
| **UX-007** | Waiting for Manager Review | Employee views pending record | Banner: "No action required from you - Currently waiting for Manager Review" | PASS |
| **UX-008** | Manager Reviewing Objectives| Manager opens pending record | Shows Manager Tasks, Diff verification, [Return for Correction] & [Approve] | PASS |
| **UX-009** | Manager Missing Rating | Manager leaves Obj 2 blank | Missing Panel alerts required rating, [Approve] button disabled | PASS |
| **UX-010** | Manager Return Execution | Manager clicks Return | Modal enforces Return Reason entry, logs return event | PASS |
| **UX-011** | Returned to Employee | Employee opens returned record| Shows Return Banner, Manager Name, Return Reason, and Direct Field Links | PASS |
| **UX-012** | GM Review Stage | GM opens approved by Mgr record| Shows Manager Approval summary, GM review tasks, [Approve] / [Return] | PASS |
| **UX-013** | Skipped Route Slot | Topology M1_G1 (no Mgr L2) | Approval progress tracker displays Manager L2 as "Not Required" | PASS |
| **UX-014** | ALL Approver Step Guidance | Step requires ALL approvers | Guidance displays: "Waiting for All Assigned Approvers (1/2 Completed)" | PASS |
| **UX-015** | ANY Approver Step Guidance | Step requires ANY approver | Guidance displays: "Waiting for Any Single Approver" | PASS |
| **UX-016** | Approver Reassigned Notice | In-flight approver changed | Guidance immediately reflects new Approver Name without page refresh | PASS |
| **UX-017** | Reopen Revision 2 Banner | Record reopened by HR | Shows "Revision 2 (Reopened)", Reopen Reason, and Re-approval notice | PASS |
| **UX-018** | Reapproval Tracking | Manager approves Rev 2 | Shows Rev 1 as Superseded, Rev 2 Manager Approved, GM Pending | PASS |
| **UX-019** | Historical FY Read-Only | User views FY2025 record | Shows "Historical Evaluation - Read Only", hides Save/Submit buttons | PASS |
| **UX-020** | Completed Evaluation View | Record in Completed status | Shows Stage 5 Completed, Final Score (if published), Read-Only view | PASS |
| **UX-021** | Confidential Score Security | Employee inspects DOM/API | Manager/GM internal scores and ratings are completely absent from response | PASS |
| **UX-022** | Shared Department Account | Shared PC user opens record | Verifies authorized employee/section before enabling editing | PASS |
| **UX-023** | System Configuration Error | Corrupt/Unknown stage | Enters fail-safe diagnostic error screen, blocks all workflow transitions | PASS |
| **UX-024** | Responsive Mobile Guidance | View on mobile resolution | Guidance Header collapses cleanly into readable cards without overflow | PASS |
| **UX-025** | Bilingual Language Switch | User toggles TH <-> EN | 100% of headers, checklists, labels, and alerts switch language instantly | PASS |
