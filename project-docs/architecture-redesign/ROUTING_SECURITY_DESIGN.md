# Routing Security, Permission & Requester Authorization Model

> **Document Status:** Complete (Updated with Reassignment Security Boundaries)  
> **Last Updated:** 2026-08-24  

---

## 1. Requester Authorization Model (Shared Account Handling)

In TTMET operations, administrative staff may enter MBO drafts on behalf of employees using shared department accounts.
* **Authorization Verification:**
  $$\text{Authorized Requester} \iff (\text{Current Login} = \text{Employee.Login}) \lor (\text{Current Login} \in \text{Section.Authorized\_Requesters})$$
* **Security Boundary:** Enforced server-side via Kintone Native App/Record Permissions.

---

## 2. In-Flight Reassignment Authorization Security
* **Strict Role Restriction:** Only users belonging to the `HR_ADMIN` role or administrators with explicit app management rights can execute the Reassign Approver REST API.
* **Server-Side Verification:** Kintone native API checks session credentials before updating assignees. Unauthorized calls fail with HTTP 403.
