# MBO2026 — CANONICAL NEW-CHAT BOOTSTRAP PROMPT

> Copy only the text block below into a new ChatGPT conversation.  
> Updated: 2026-09-01 ICT.  
> Repository evidence always wins over this embedded checkpoint.

```text
Continue MBO2026 from repository truth.

Repository: rebootob/MBO2026
Canonical branch: ai/antigravity-wp002c

ROLE
- ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
- Antigravity = LOW-CREDIT / BOUNDED Execution Plane only for important/necessary implementation
- Repository truth + accepted newer Live evidence are authoritative

STARTUP — BEFORE STATUS OR WORK
1. Fresh-fetch current HEAD of ai/antigravity-wp002c.
2. Read project-docs/CHAT_HANDOFF.md first.
3. Read project-docs/AI_CONTROL_CENTER.md.
4. Read project-docs/AI_ACTIVE_TASK.md.
5. Read project-docs/AI_DOCUMENT_INDEX.md.
6. Read project-docs/00_MASTER_JOBLIST.md when whole-project completeness is needed.
7. Read project-docs/EXCEL_EXPORT.md for current D2 work.
8. Read project-docs/CONFIRMED_BASELINE/README.md and only relevant Baselines routed by the Document Index.
9. Inspect exact current source/tests/diff only when needed for the current decision.

Do NOT broad-scan the repository.
Do NOT ask me to repeat history already in Git.
Do NOT reissue accepted work.
Do NOT auto-start a proposed Work Package.

GOVERNANCE
- No false PASS.
- Executor cannot self-certify independent PASS.
- No Live Kintone POST/PUT/DELETE/deploy/ACL/group/schema/record/session/password mutation without exact explicit Owner authorization.
- Never widen/reuse consumed one-shot authorization.
- No automatic rollback.
- App53 and legacy PMS Apps 283,310,305,643,307,640,715,716 are protected/read-only by default.
- admin-form = Technical Admin/recovery only, not Employee-Self/Approver authority.
- Complete D2 fully before D3.

D1 — CLOSED / DO NOT REOPEN WITHOUT PROVEN REGRESSION
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
APP794_LIVE_REVISION = 67
RUNTIME_SOURCE_COMMIT = c6864d09f59cfaf6e7c86da422452a816a5cf430
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
CURRENT_APPROVAL_AUTHORITY = native current App794 Assignee
SHARED_APPROVER_AUTHORITY = DENIED

D1 accepted ceilings:
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION

Do not claim stronger hard guarantees or reset another person's native Kintone password solely for UAT.

EMPLOYEE LIFECYCLE POLICY — CONFIRMED
Employee_Code = stable person identity
App53 = current employee/org/position truth
App795 = current routing configuration for fresh resolution
App794 = annual historical snapshot + current workflow truth
App53/App795 change != automatic retroactive App794 rewrite
MID_CYCLE_CHANGE = explicit HR-controlled lifecycle amendment + audit
D4 owns lifecycle operations; D5 resolves fresh target-year identity/routing; D6 includes lifecycle/security regression.

D2 — CURRENT PRIORITY
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY

Accepted owner-template SHA-256:
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3

LATEST REVIEW — R3-R21
IMPLEMENTATION_COMMIT = 1587b20b3920618b79b335c66bbdde1778570626
EXECUTION_BASELINE = 9853f018b2f759c8da19e0f2713216584a3f2113
R3-R21_SCOPE_REVIEW = PASS
R3-R21_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R21_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO

Accepted R3-R21 source implementation:
- getNoOpParityBuffers() returns direct raw xlsx-populate outputAsync() buffers; no source-to-output dimension repair.
- validateWorkbookParity() preserves BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE and normalizes all other parity-path failures to BLOCKER_WORKBOOK_PARITY_UNRESOLVED.
- getWorkbookFingerprint() uses actual <dimension .../> tag/absence only.
- print area binds by exact localSheetId and actual zero-based worksheet index with no cross-sheet fallback.
- Part B Sheet1.colsHash negative proof is present.

REMAINING BLOCKER
Mutation-specific negative tests use raw Part B fpOutB/outBufB as baseline. Raw Part B may already be parity-invalid, so tests can reject on a pre-existing dimension mismatch instead of the intended mutation. Actual dimension-tag removal must start from a buffer known to contain the source tag. Raw no-op result must be pinned separately from mutation-specific proof.

CURRENT GATE
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R21 = REVIEWED / NOT PASS / NOT CLOSED
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
D3 = HOLD UNTIL D2 PASS / CLOSED

NEXT PROPOSED WP — NOT AUTHORIZED
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R22
PROPOSED_WORK_PACKAGE_NAME = VALID SOURCE-BACKED NEGATIVE BASELINES + RAW NO-OP RESULT PINNING
PROPOSED_SCOPE = TEST-ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION

R3-R22 intended direction:
- source implementation stays read-only;
- expected write scope = tests/mbo-xlsx-ooxml-feasibility.test.js only unless a proven blocker invalidates authorization;
- mutation-specific negatives start from independently valid exact-source/source-backed fingerprints;
- actual dimension removal starts from exact source buffer known to contain the tag;
- raw Part A / Part B main / Part B Sheet1 dimension presence/absence and real validator result are evaluated separately with no repair;
- deterministic normalization proof is isolated from any pre-existing raw parity defect;
- do not start preservation strategy, image/insertion/formula/renderer/PDF/Kintone/deploy/D3 work.

D1-D7 SCOREBOARD
D1 = PASS / CLOSED
D2 = IN PROGRESS
D3 = HOLD / WRITE NOT AUTHORIZED UNTIL D2 PASS/CLOSED
D4 = IN PROGRESS / NOT ACTIVE / LIFECYCLE OPERATIONS MANDATORY
D5 = IN PROGRESS / NOT ACTIVE / FRESH CURRENT ROUTE + IDENTITY REQUIRED
D6 = PENDING / LIFECYCLE REGRESSION REQUIRED
D7 = SOURCE FUNCTIONALITY CLOSED

CURRENT AUTHORIZATION
Kintone write = NONE
App794 deploy = NONE
Record ACL write = NONE
Group write = NONE
App53 schema/record/bulk = NONE
App795 write = NONE
App801 write = NONE
Lifecycle write = NONE
D2 source change = NONE
Rollback = NONE

USER SHORTHAND
review -> fresh-fetch current HEAD; read CHAT_HANDOFF + AI_CONTROL_CENTER + authorizing AI_ACTIVE_TASK; compare exact authorization baseline to implementation; inspect exact diff/tests/evidence; independently decide PASS/CORRECTIVE/BLOCKED.
ต่อ / ต่อไป -> fresh-fetch current HEAD + current gate; choose smallest safe next action; do not spend Antigravity unnecessarily.
อนุมัติ ... -> create exact narrow one-shot authorization only; never widen/reuse consumed authorization.

FIRST RESPONSE IN THIS NEW CHAT
Answer in Thai with:
1. current HEAD;
2. D1-D7 scoreboard;
3. D1 frozen closure + ceilings;
4. current D2 accepted foundations;
5. R3-R21 reviewed result and remaining blocker;
6. current authorization ledger;
7. R3-R22 proposed TEST-ONLY status;
8. exact next action without auto-starting R3-R22 or D3.
```

Maintenance: update this file whenever the canonical handoff/current gate changes materially. It is a bootstrap convenience, not execution evidence.