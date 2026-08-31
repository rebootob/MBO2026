# MBO2026 — ENTERPRISE SECURITY & PRIVACY MODEL

> Governance Authority: `DEC-039 (STRICT EMPLOYEE RECORD DATA ISOLATION)`  
> Status: **FROZEN SECURITY MODEL / D1 CLOSED WITH DOCUMENTED KINTONE-ONLY CEILINGS**  
> Updated: 2026-08-31 ICT

## 1. Core security principle — DEC-039

Within the authorization boundary the system can enforce, each employee must access only their own MBO/evaluation data unless an explicit current business role authorizes access to another record.

Employee A must not be granted Employee-Self access to Employee B objectives, action plans, ratings, comments, scores, history, attachments or routing information merely by knowing an Employee_Code, record ID or URL.

Explicit business roles may include current assigned Appraiser/Approver and authorized HR/Admin operations, each constrained by its own approved authority.

## 2. Authenticated identity binding

`Employee_Code` alone is not authentication.

```text
Authenticated identity
  -> verified Dedicated mapping OR valid Shared MBO session
  -> bound Employee_Code
  -> authorized Employee-Self record scope
```

Dedicated Employee-Self identity derives from native Kintone authentication plus exact active App53 `MBO_Kintone_User` mapping.

Shared Employee-Self identity derives from an approved shared Kintone principal plus App801-backed MBO authentication/session.

No user-selectable identity switch may widen Employee-Self scope.

## 3. D1 final security disposition

```text
D1_OVERALL = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
```

Accepted evidence covers Dedicated identity, record ACL/privacy, foreign-record denial, current-Assignee approval authority, Shared session runtime, dual-role separation, HR non-employee mode and truthful comments/history/attachments.

D1 PASS is expressly qualified by the platform ceilings in Sections 4 and 5.

## 4. Shared Kintone principal — accepted platform ceiling

Multiple employees may use the same approved native Kintone principal. Native Kintone permissions therefore see those employees as the same principal.

Canonical limitation:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE PRINCIPAL
```

Consequences:
- App794 custom MBO Login/session must bind normal Employee-Self UI behavior to the authenticated Employee_Code;
- Shared session state must fail closed on missing/tampered/expired/principal-mismatched credentials;
- SHARED approver authority remains denied;
- browser JavaScript cannot truthfully claim native per-Employee hard REST isolation behind one shared Kintone principal;
- do not embed privileged API tokens/credentials in browser code to pretend to create a hidden server-side boundary.

This is an accepted Kintone-only architecture ceiling, not an unresolved D1 blocker. Any future requirement for true native per-person REST isolation under shared access requires a new architecture decision.

## 5. Dedicated create-path — accepted platform ceiling

Dedicated users require native App794 Add permission for the approved Kintone-only create flow. The normal UI derives Employee_Code from the authoritative App53 mapping and does not expose an Employee selector.

Canonical limitation:

```text
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

Client-side customization is not a privileged server-side enforcement layer. Do not claim stronger direct-REST create-field integrity than native Kintone permissions provide.

## 6. Security boundary rule — native permission vs UX

Kintone App/Record/Field/Process permissions are the native security boundary where applicable.

JavaScript/CSS controls, hidden fields/buttons, list filters and redirects are UX/runtime controls and must not be described as stronger than the native principal permissions beneath them.

For Dedicated access, native record/process permissions plus current workflow assignment provide the hard authorization boundary for tested record access.

For Shared Employee-Self, the custom MBO session is the approved application identity layer, subject to the explicit native REST ceiling in Section 4.

## 7. Least-privilege role access matrix

| Role / User Category | Authorized scope | Confidential field rule |
|---|---|---|
| Employee (Self) | Own MBO records only through bound Employee_Code | No unauthorized manager/GM/final confidential data |
| Dedicated current Appraiser/Approver | Records currently assigned by native workflow | Only business fields/actions required for current stage |
| Shared employee | Own Employee-Self context through valid App801 session | No Approver authority |
| HR | Enterprise records according to approved HR role/process | HR business scope only |
| Technical Admin (`admin-form`) | Diagnosis/recovery/approved admin operations | Not Employee-Self or business Approver by implication |

## 8. Approval authority

Dedicated Approver authority is:

```text
current authenticated dedicated Kintone User
AND
exact authoritative current native App794 Assignee
```

The following are insufficient by themselves:
- App795 route membership;
- `Manager_User` / `GM_User` / `First_Manager_User` snapshots;
- caller-supplied role names;
- UI visibility;
- knowledge of a record ID.

Fresh current-Assignee revalidation is required for approval record/action authority. SHARED mode is denied.

Self-approval is prohibited. Approved own-MBO self-appraiser elision removes self before the own-record workflow snapshot and never auto-approves.

## 9. Employee lifecycle security invariants

Canonical policy: `project-docs/CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`.

```text
EMPLOYEE_CODE = STABLE PERSON ID
APP53 = CURRENT EMPLOYEE / ORG / POSITION TRUTH
APP795 = CURRENT ROUTING FOR FRESH RESOLUTION
APP794 = HISTORICAL ANNUAL SNAPSHOT + CURRENT WORKFLOW TRUTH
APP53_OR_APP795_CHANGE != AUTOMATIC RETROACTIVE APP794 REWRITE
MID_CYCLE_CHANGE = HR-CONTROLLED EXPLICIT OPERATION + AUDIT
```

Security consequences:
- inactive/resigned Dedicated Employee-Self auto-binding must fail closed when no active App53 identity row remains;
- historical App794 evidence must remain retained rather than being deleted or silently rewritten;
- changing App795 alone does not revoke or grant authority on an already-open App794 task; authoritative current native Assignee remains the boundary until an approved reassignment occurs;
- controlled reassignment must prove stale prior authority is removed after the change unless another independently valid current role grants access;
- Shared lifecycle handling must eventually support App801 disable/session invalidation under D4 authorization;
- Dedicated principal changes keep the same Employee_Code, require protected App53 mapping change, stop old-principal auto-binding, permit new-principal binding only through exact active mapping, and must not duplicate the employee/MBO or rewrite historical actor evidence;
- if lifecycle state is ambiguous or unreconciled, fail closed and route to HR rather than guessing.

Lifecycle policy confirmation does not reopen D1 by itself. D4 owns operational implementation and D6 owns integrated lifecycle/security regression.

## 10. Direct URL/API adversarial tests

Security review should include, where the native architecture can enforce the property:
- direct record URL tampering;
- sequential record ID attempts;
- REST record queries;
- list/search access;
- export access;
- attachment access;
- stale-prior-approver access;
- unauthorized process action attempts.

Accepted D1 Dedicated foreign-record UAT proved direct GET/query/direct URL denial for an unauthorized employee record.

For Shared principals, do **not** falsely mark native Employee_Code-level REST isolation PASS; record the Section 4 ceiling instead and test the application session/Employee-Self behavior that D1 actually controls.

## 11. Confidentiality policy

Confidential appraisal fields are confidential by default. Employee/Shared Employee-Self output/UI must not expose unauthorized fields, including applicable:

```text
Manager_Achievement_1..10
GM_Achievement_1..10
Manager_Comment_1..10
GM_Comment_1..10
PartA_Raw_Score
PartA_Weighted_Score
Manager_Competency_Rating_1..8
GM_Competency_Rating_1..8
PartB_Raw_Score
PartB_Weighted_Score
Final_Confidential_Score
Final_Grade
```

Security rules must cover all active competency indexes, not a hard-coded obsolete subset.

D2 Excel/PDF export must inherit the same authorization/confidentiality boundary; export UI visibility alone is never authority.

## 12. Historical migrated data — DEC-040

The same record/privacy rules apply to historical migrated data such as `Record_Origin = LEGACY_MIGRATED`.

D3 migration must not weaken current authorization boundaries. Legacy source Apps `283, 310, 305, 643, 307, 640, 715, 716` remain read-only by default.

## 13. App794 controlled test environment — DEC-041

App794 remains the approved MBO development/full-test environment for controlled work.

```text
DEFAULT WRITE_ALLOWED_APPS = []
```

Any App794 POST/PUT/DELETE/schema/process/security write still requires an exact authorized Work Package. Protected App53 and legacy source apps remain read-only unless separately and explicitly authorized where policy permits.

D1 closure does not create standing write/deploy permission.

## 14. Current authorization state

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ROLLBACK_AUTH = NONE
```

## 15. Change rule

Any proposal to remove the shared-principal REST ceiling, claim privileged browser enforcement, add external auth/server/database/proxy, broaden shared approver authority, weaken current-Assignee authorization, silently rewrite App794 because of a master/lifecycle change, or expose confidential data requires explicit architecture/security review and Owner decision before implementation.
