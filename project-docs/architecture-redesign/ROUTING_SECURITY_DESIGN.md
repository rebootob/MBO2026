# Routing Security, Permission & Requester Authorization Model

> **Document Status:** Complete  
> **Last Updated:** 2026-08-24  

---

## 1. Requester Authorization Model (Shared Account Handling)

In TTMET operations, administrative staff may enter MBO drafts on behalf of employees using shared department accounts.
* **Authorization Verification:**
  $$\text{Authorized Requester} \iff (\text{Current Login} = \text{Employee.Login}) \lor (\text{Current Login} \in \text{Section.Authorized\_Requesters})$$
* **Security Boundary:** Enforced server-side via Kintone Native App/Record Permissions.

---

## 2. Workflow Action Security
* Native Process Management Assignees are bound directly to `Step_X_Approvers`.
* An unauthorized user cannot click `Approve` or `Return` because Kintone Native Process Management restricts action buttons exclusively to current assignees.
