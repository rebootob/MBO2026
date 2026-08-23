# Legacy Workflow Deep Dive & Routing Topologies Audit

> **Document Status:** Complete (Read-Only Legacy Analysis Across 8 Apps)  
> **Source Evidence:** Apps 283, 305, 307, 310, 640, 643, 715, 716  
> **Audit Date:** 2026-08-24  

---

## 1. Executive Summary

An exhaustive extraction of Kintone Process Management configurations across all 8 legacy PMS applications was conducted. The analysis reveals that legacy PMS suffered from an **extreme state explosion antipattern**: instead of dynamic routing, legacy apps created hardcoded process statuses for every single section (e.g. 384 separate actions in App 283).

By normalizing these hardcoded statuses into abstract business chains, we identify **5 distinct Routing Families** and a **Maximum Approval Depth of 5 Steps (+ HR Final Check)**.

---

## 2. Legacy Process Management Inventory

| App ID | Evaluation Target Group | Total Statuses | Total Actions | Routing Topology Found | Maximum Approval Steps |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **App 283** | FY2024 Staff / Chief | 79 | 384 | Emp -> (1st Mgr) -> Mgr -> GM -> HR | 3 steps + HR |
| **App 305** | FY2024 Section Manager | 33 | 109 | Emp -> GM -> VP -> President -> HR | 3 steps + HR |
| **App 307** | FY2024 Department Manager | 33 | 109 | Emp -> GM -> VP -> President -> HR | 3 steps + HR |
| **App 310** | FY2024 Japanese Staff | 79 | 230 | Emp -> 1st Appraiser -> 2nd Appraiser -> HR | 2 steps + HR |
| **App 640** | FY2025 Staff / Chief | 11 | 16 | Emp -> President -> HR (Direct Route) | 1 step + HR |
| **App 643** | FY2025 Japanese Staff | 15 | 27 | Emp -> GM -> President -> HR | 2 steps + HR |
| **App 715** | FY2025 Section Manager | 11 | 15 | Emp -> President -> HR (Direct Route) | 1 step + HR |
| **App 716** | FY2025 Japanese Staff (Expat) | 41 | 100 | Emp -> 1st Appraiser -> 2nd Appraiser -> HR | 2 steps + HR |

---

## 3. Normalized Routing Chains (5 Core Families)

```mermaid
graph TD
    subgraph Family_1 [Family 1: Standard Operational Staff]
        F1_E[Employee] --> F1_M1[Manager L1 / Mentor]
        F1_M1 --> F1_M2[Manager L2 / Section Head]
        F1_M2 --> F1_GM[General Manager]
        F1_GM --> F1_HR[HR Final Check]
    end

    subgraph Family_2 [Family 2: Management & Executive]
        F2_E[Section / Dept Mgr] --> F2_GM[General Manager]
        F2_GM --> F2_VP[Vice President]
        F2_VP --> F2_P[President]
        F2_P --> F2_HR[HR Final Check]
    end

    subgraph Family_3 [Family 3: Japanese Staff / Expatriates]
        F3_E[Japanese Staff] --> F3_A1[1st Appraiser]
        F3_A1 --> F3_A2[2nd Appraiser / GM]
        F3_A2 --> F3_HR[HR Final Check]
    end

    subgraph Family_4 [Family 4: Direct Executive Route]
        F4_E[Direct Report] --> F4_P[President]
        F4_P --> F4_HR[HR Final Check]
    end

    subgraph Family_5 [Family 5: Combined Hierarchical Route (Max Depth)]
        F5_E[Employee] --> F5_S1[Manager L1]
        F5_S1 --> F5_S2[Manager L2]
        F5_S2 --> F5_S3[GM]
        F5_S3 --> F5_S4[VP]
        F5_S4 --> F5_S5[President]
        F5_S5 --> F5_HR[HR Final Check]
    end
```

---

## 4. Separation of the Three Core Identity Dimensions

Legacy apps conflated three fundamentally distinct concepts. MBO V2 enforces strict separation:

1. **Requester Authorization:** The login user permitted to create/edit MBO records on behalf of an employee or section (Shared account handling).
2. **Scoring Appraiser:** The user(s) responsible for entering numeric ratings and qualitative feedback in Part A and Part B.
3. **Workflow Approver:** The user(s) assigned in Kintone Process Management to click `Approve` or `Return`.

*Finding:* In executive routes (App 307), VP and President are Workflow Approvers but Part B Competency scoring is completed by GM. In Japanese routes (App 310/716), 1st Appraiser and 2nd Appraiser are both Scoring Appraisers and Workflow Approvers.
