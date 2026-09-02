# AI ACTIVE TASK — D2 CONTINUITY / R3-R27 REVIEWED CORRECTIVE / R3-R28 PROPOSED

Mode: **CONTROL PLANE / INDEPENDENT REVIEW COMPLETE / LOW-CREDIT / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Repository truth and accepted newer Live evidence always win. Fresh-fetch current branch HEAD before acting.

```text
TASK_STATE = WAIT_OWNER_CORRECTIVE_APPROVAL
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R23 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R24 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R25 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R26 = REVIEWED / BLOCKED / NOT CLOSED
D2-WP003-R3-R27 = REVIEWED / NOT PASS / NOT CLOSED
R3-R27_AUTHORIZATION_COMMIT = 671948b3d4a935118172a3c849d9265eb606ac73
R3-R27_IMPLEMENTATION_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
R3-R27_SCOPE_REVIEW = PASS
R3-R27_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R27_PROOF_REVIEW = FAIL / REGRESSION + WRONG-BRANCH + NO INDEPENDENT RUNTIME
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
PRESERVATION_POLICY = NARROW DETERMINISTIC ALLOWED-DRIFT
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 5
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 15
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R28
PROPOSED_WORK_PACKAGE_NAME = OPTION B WRITEBACK + COMPLETE XML TOKEN INVENTORY + EFFECTIVE PROOF CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
```

## 1. Independent R3-R27 review

Authorization consumed:

```text
D2-WP003-R3-R27-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Implementation:

```text
AUTHORIZATION_COMMIT = 671948b3d4a935118172a3c849d9265eb606ac73
IMPLEMENTATION_COMMIT = f7a7c82e7d39dc799be9b3687b2b4137c9797c7a
```

Scope review = PASS:
- implementation is exactly one commit ahead of authorization;
- only `scripts/export/mbo-xlsx-ooxml-feasibility.js` and `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no dependency/evidence/Kintone/deploy/PDF/renderer/D3 scope expansion;
- `getNoOpParityBuffers()` remains frozen.

Accepted improvements:
- direct raw `outBufB` is now used for the positive Part B preservation path; R3-R26 test-side pre-cleaning is removed;
- Option B is implemented inside `preserveExactWorkbookDimensions()` rather than in test setup;
- the allowed drift is narrowed to Part B worksheet target `worksheets/sheet2.xml`, source absence, observed first-child `sheetPr`, and exact observed tag `<sheetPr/>`;
- duplicate `sheetPr` and duplicate tested maxOccurs=1 children are rejected;
- missing explicit Target alias tests for repeated `//`, leading `./`, embedded `/./`, full URI scheme/authority, query and fragment were added.

## 2. Proven source defects

### A. Option B normalization can validate a cleaned local string but return an uncleaned workbook

The function removes the allowlisted `<sheetPr/>` only from local `obsXml` and reparses `obsChildren`. The ZIP write-back `wbPreserved._zip.file(obsSheet.rel.zipPath, obsXml)` occurs only in the branch where the observed `<dimension>` is missing and restored.

Therefore, if a Part B Sheet1 observed workbook already contains the exact correct source `<dimension>` plus the exact allowlisted `<sheetPr/>`, the function can:
1. validate and remove `sheetPr` from local `obsXml`;
2. find one exact matching dimension;
3. pass exact top-level-name validation against the normalized local XML;
4. skip the dimension-restoration branch;
5. return the original working ZIP where the `sheetPr` was never removed.

This violates the approved Option B rule that normalization/removal occurs inside preservation and violates the requirement to return no partially preserved buffer.

### B. Claimed complete QName/XML inventory is still incomplete and fail-open

`parseTopLevelChildren()` and `parseGlobalRels()` still recognize QName pieces only through ASCII classes `[A-Za-z0-9_.-]` and do not prove that all direct-child markup was consumed.

Valid XML names/prefixes can contain characters outside those ASCII classes. A direct element such as a Unicode-prefixed Relationship or Unicode-named worksheet child can therefore be omitted from the scanner rather than explicitly rejected.

Consequences include:
- a hidden namespace-prefixed `Relationship` can evade the claimed global duplicate-ID inventory;
- an unrecognized direct worksheet child can remain in the OOXML while the recognized source/observed child-name sequence still appears equal;
- the preservation path can write/return OOXML containing markup it never inventoried.

R3-R27 requirement 10 is therefore not satisfied. A broader regex is not sufficient unless the implementation also proves there is no unconsumed direct-child markup.

## 3. Proof/test defects

### A. R3-R25/R3-R26 regression negatives were not all retained

The current R3-R27 matrix adds new XML negatives and restores R3-R24 negatives, but several previously required R3-R25/R3-R26 negatives are no longer present as distinct effective proofs, including at minimum:
- counterfeit worksheet-like Type URI;
- exact Type mismatch with same ID/target;
- leading-slash Target alias;
- already-`xl/` Target alias;
- backslash Target alias;
- percent-encoded Target alias/dot segment;
- missing predecessor/successor boundary.

This violates the explicit R3-R27 requirement that all restored R3-R24/R3-R25/R3-R26 negatives remain present and effective.

### B. Several source-structure negatives still test the SHA gate, not the labeled structural branch

Examples include:
- `Source unexpectedly containing sheetPr in Sheet1`;
- missing source dimension;
- multiple source dimensions;
- malformed source XML.

Each mutates `origBufB` and passes the mutated buffer as `sourceBufOverride`. Production source-SHA validation runs before OOXML structural parsing, so these assertions reject at the wrong-SHA gate rather than proving the labeled source-structure condition.

Do not weaken the source-SHA gate. The structural logic must instead be factored into privacy-safe pure helpers and tested synthetically.

### C. Privacy-safe independent proof is still absent

The test file still begins with exact local-template SHA requirements, and the R3-R27 proof matrix remains inside the owner-template-dependent `FEASIBILITY_NO_OP_PARITY` test. No separate template-independent unit tests exist for the pure lexical/XML/allowlist logic.

GitHub reports no CI status checks and no workflow runs for the implementation commit. Control Plane therefore has no independent runtime signal for R3-R27.

## 4. Proposed R3-R28 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R28
PROPOSED_WORK_PACKAGE_NAME = OPTION B WRITEBACK + COMPLETE XML TOKEN INVENTORY + EFFECTIVE PROOF CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

No Antigravity or Claude execution is authorized by this proposal.

## 5. Proposed exact write scope if authorized

Modify ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- exact ignored owner templates only after SHA verification.

No new tracked file, dependency, generated workbook, evidence document, PDF, image/media, Kintone, deploy or D3 change.

## 6. Proposed mandatory source correction

If explicitly authorized, R3-R28 MUST:

1. preserve all accepted R3-R27 direct-raw positive-path, exact part-key, source-SHA, strict raw Target, exact worksheet Type, global duplicate-ID and exact relationship-tuple gates;
2. keep `getNoOpParityBuffers()` completely frozen and unrepaired;
3. preserve Option B as one exact Part B `Sheet1` `<sheetPr/>` exception only; do not widen the allowlist;
4. make allowed-drift normalization persist to the working ZIP regardless of whether the observed dimension is absent or already exactly correct; never return a buffer retaining an allowlisted drift that was logically normalized;
5. after allowed-drift normalization, require exact source-equivalent structure and dimension; return no partial buffer;
6. replace QName-shape regex assumptions with a coverage-complete direct-child tokenizer/gap validator that inventories every direct Relationship child and every worksheet top-level start element before semantic validation;
7. explicitly reject any unconsumed/non-whitespace direct-child markup, unknown direct child, namespace-prefixed Relationship, or namespace-prefixed worksheet top-level child, including Unicode QName forms;
8. retain exact canonical unprefixed source forms after SHA verification; do not normalize unknown QName forms into accepted ones;
9. preserve independent duplicate checks for maxOccurs=1 schema children and ensure the singleton set covers every singleton child actually claimed by the validator;
10. factor pure validation/normalization helpers as needed so XML inventory, Target lexical validation, duplicate-schema validation and Option B matching/normalization can be tested without bypassing production source-SHA gates;
11. keep production source-SHA enforcement before accepting any source override; do not weaken it to make tests easier;
12. retain deterministic `BLOCKER_WORKBOOK_DIMENSION_PRESERVATION_UNRESOLVED` for preservation failures and `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE` only for genuinely unavailable exact local templates.

## 7. Proposed mandatory proof

### Always-runnable privacy-safe unit proof

Create template-independent tests in the existing test file for the factored pure helpers. These tests must run in a clean checkout without owner templates and prove at minimum:
- Unicode/dotted/ASCII-prefixed Relationship forms cannot evade inventory;
- Unicode/prefixed/unknown worksheet direct children cannot evade inventory;
- unconsumed direct-child markup fails closed;
- duplicate relationship IDs fail globally;
- duplicate maxOccurs=1 worksheet children fail independently;
- Target lexical rejection for leading `/`, already-`xl/`, leading `./`, embedded `/./`, `..`, repeated `//`, backslash, percent encoding, URI scheme/authority, query and fragment;
- Option B exact matcher accepts only exact Part B `Sheet1` `<sheetPr/>` in the pinned slot and rejects changed/extra/duplicate/moved/other-sheet/Part-A cases;
- Option B normalizer actually removes the element from returned normalized XML both when dimension is absent and when an exact dimension is already present.

If owner templates are unavailable, exact-template-dependent tests may be explicitly skipped/reported unavailable, but the privacy-safe unit tests must still execute and pass. Do not make the entire test file fail solely because ignored owner binaries are absent.

### Exact-template proof when templates are available

Retain and run:
- exact source SHA validation;
- direct raw `outBufA` / `outBufB` frozen behavior;
- direct raw preservation for A and B with no test-side pre-clean;
- preserved A/B real parity;
- exact dimensions for Part A main, Part B main and Part B Sheet1;
- source/raw byte immutability;
- exact print-area binding and Part B Sheet1 `colsHash` negative;
- Difficulty Level blank temporarily.

### Regression restoration

Restore all still-valid R3-R25/R3-R26 negatives removed in R3-R27, including at minimum:
- counterfeit worksheet-like Type URI;
- duplicate ID across worksheet/non-worksheet types;
- exact Type mismatch with same ID/target;
- leading-slash and already-`xl/` Target aliases;
- backslash and percent-encoded Target aliases;
- standard prefixed Relationship duplicate-ID attempt in addition to dotted/Unicode prefix cases;
- missing predecessor/successor boundary;
- any remaining valid R3-R24/R3-R25/R3-R26 negatives not superseded by approved Option B.

For source-structure cases that cannot pass the exact source-SHA gate by design, test the extracted pure structural helper directly and separately retain a wrong-SHA production-gate test. Do not label a SHA-gate rejection as structural proof.

## 8. Frozen / out of scope

Do NOT publish evidence, start reference-image closure, objective/competency insertion, formula authority, production renderer, combined Excel/PDF, UI, Kintone, deploy, Live UAT, rollback, D3, R3-R29 or another WP.

Claude second review is not needed automatically. Use Claude again only if ChatGPT later finds material ambiguity after a future implementation reaches Git.

## 9. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R24-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R26-SOURCE-20260902-01 = CONSUMED / BLOCKED / DO NOT REUSE
D2-WP003-R3-R27-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED / ARCHITECTURE POLICY
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 5 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
D3_EXECUTION = HOLD
```

## 10. Exact next action

```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP003-R3-R28 AS PROPOSED
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP / NOT NEEDED AT THIS GATE
D3 = HOLD
```
