# AI ACTIVE TASK — D2 CONTINUITY / R3-R26 PROPOSED

Mode: **CONTROL PLANE / R3-R25 INDEPENDENT REVIEW COMPLETE / NO KINTONE / NO DEPLOY**  
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
R3-R25_IMPLEMENTATION_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
R3-R25_SCOPE_REVIEW = PASS
R3-R25_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R25_PROOF_REVIEW = FAIL / REGRESSION + INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = ACTIVE
CONTROL_PLANE_REVIEW_CORRECTIVE_MAX_ROUNDS = 20
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_USED = 3
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUNDS_REMAINING = 17
ANTIGRAVITY_AUTO_AUTH = NO
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R26
PROPOSED_WORK_PACKAGE_NAME = STRICT TARGET LEXICAL IDENTITY + PROOF REGRESSION RESTORE CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
CORRECTIVE_BASELINE_COMMIT = 60b24f39b78013d37fe210192bb97876e0184638
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3_EXECUTION = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP / WAIT OWNER
```

## 1. Independent R3-R25 review

Authorization consumed:

```text
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

Scope result = PASS:
- implementation `60b24f39b78013d37fe210192bb97876e0184638` is exactly one commit ahead of authorization commit `8d6c4fb229d4f82adf3ea6aa7cd7e9dd3c70b8ba`;
- only `scripts/export/mbo-xlsx-ooxml-feasibility.js` and `tests/mbo-xlsx-ooxml-feasibility.test.js` changed;
- no evidence document, dependency, Kintone, deploy, PDF, renderer or D3 change is present;
- `getNoOpParityBuffers()` remains frozen.

Source review = FAIL / CORRECTIVE REQUIRED:
1. exact worksheet relationship Type and global duplicate-ID checks improved correctly;
2. target lexical identity remains fail-open: leading-slash and already-`xl/` aliases are normalized into the same ZIP path as the owner source instead of being rejected. For example `Target="/worksheets/sheet1.xml"` normalizes to `xl/worksheets/sheet1.xml`, and `Target="xl/worksheets/sheet1.xml"` is also treated as that same target even though relationship URI resolution semantics differ;
3. `parseTopLevelChildren()` only recognizes unprefixed element names matching `[a-zA-Z0-9]+`; a prefixed top-level XML element can be skipped rather than causing fail-closed structural rejection;
4. `parseGlobalRels()` likewise scans only unprefixed `<Relationship ...>` tags, so an additional prefixed Relationship element is not included in the claimed global duplicate-ID inventory;
5. the source-order equality includes an unauthorized exception that silently drops an observed leading `sheetPr` when the source lacks `sheetPr`, even though R3-R25 required observed top-level child order to equal source order with only source `dimension` omitted.

Proof review = FAIL / REGRESSION + INCOMPLETE:
- R3-R25 added counterfeit-Type, cross-type duplicate-ID and schema-order negatives;
- however it removed multiple valid R3-R24 preservation negatives despite the explicit requirement to preserve them;
- removed proof includes missing relationship, duplicate normalized worksheet target, real relationship-target swap, cross-sheet mapping, non-worksheet target/type, external target, missing/multiple source dimension, conflicting/multiple observed dimension, malformed source buffer, malformed observed buffer and the explicit missing-partKey negative;
- current target-normalization negative proves `..` traversal only and does not prove leading-slash/already-`xl/` alias rejection;
- no negative proves prefixed Relationship/top-level worksheet elements are rejected;
- GitHub has no CI/status checks or workflow runs for the implementation commit.

These are preservation-path defects/proof regressions. No privacy purge is required.

## 2. Standing Control Plane authority

R3-R25 review plus the R3-R26 corrective draft consumes Control Plane round `3/20`.

This standing authority allows ChatGPT independent review, bounded corrective drafting and Control Plane documentation synchronization only. It does NOT authorize Antigravity implementation, evidence publication, Kintone access/write, deploy, Live UAT, rollback, D3 or scope expansion.

## 3. Proposed R3-R26 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R26
PROPOSED_WORK_PACKAGE_NAME = STRICT TARGET LEXICAL IDENTITY + PROOF REGRESSION RESTORE CORRECTIVE
PROPOSED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
EXECUTOR = NONE
```

R3-R26 is the smallest corrective for the remaining R3-R25 fail-open parsing/normalization defects and the proof regression. Do not redesign workbook preservation.

## 4. Proposed exact write scope if authorized

Expected modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Read-only as needed:
- `package.json`, `package-lock.json`;
- current governance/baseline documents;
- exact ignored owner templates after SHA verification.

No new file, dependency, generated workbook, PDF, image/media or evidence document.

## 5. Proposed mandatory source correction

If authorized, R3-R26 must:
1. preserve accepted R3-R25 exact `A`/`B` part-key, source-SHA, exact worksheet Type, global duplicate-ID and exact relationship tuple gates;
2. preserve the exact raw relationship Target lexical form from source and observed separately from the ZIP lookup path;
3. require exact source/observed raw Target equality for each worksheet relationship before ZIP lookup;
4. reject leading slash, `./`, embedded `/./`, `..`, repeated slash, backslash, percent-encoded slash/dot-segment aliases, URI scheme/authority, query/fragment and any non-canonical worksheet target lexical form;
5. compute the ZIP lookup path only after lexical validation, without treating `Target="xl/..."` as equivalent to source `Target="worksheets/..."`;
6. parse or explicitly reject every Relationship element including namespace-prefixed forms so duplicate IDs cannot be hidden from the global inventory;
7. parse or explicitly reject every worksheet top-level child including namespace-prefixed forms so structural elements cannot be silently skipped;
8. remove the unauthorized observed-only `sheetPr` exception; observed top-level child order must equal exact source order with only exact source `dimension` omitted for restoration;
9. retain exact predecessor/successor restoration and generic schema-order rejection;
10. keep `getNoOpParityBuffers()` frozen and return no partially preserved buffer on any failure.

## 6. Proposed mandatory proof

Restore ALL valid R3-R24 preservation negatives before adding/retaining R3-R25/R3-R26 negatives.

Mandatory retained/restored preservation negatives include:
- invalid AND missing `partKey`;
- wrong-SHA source override;
- missing relationship;
- duplicate relationship ID;
- duplicate worksheet target;
- actual relationship-target swap with sheet names/order unchanged;
- cross-sheet mapping;
- non-worksheet Type/target;
- external target/TargetMode;
- missing/multiple source dimension;
- conflicting/multiple observed dimension;
- malformed source buffer/XML;
- malformed observed buffer/XML.

Mandatory R3-R25/R3-R26 additions:
- counterfeit worksheet-like Type URI;
- duplicate ID across worksheet/non-worksheet types;
- exact Type mismatch with same ID/target;
- leading-slash Target alias;
- already-`xl/` Target alias;
- `./` and `/./` target aliases;
- percent-encoded alias/dot-segment form;
- prefixed Relationship duplicate-ID attempt;
- prefixed/unknown worksheet top-level child attempt;
- observed `sheetPr` not present in source;
- reordered `sheetPr`, missing predecessor/successor and duplicate schema-boundary cases.

Positive/regression requirements remain:
- exact source Part A/Part B validate TRUE when available;
- raw Part A/Part B remain frozen and fail real parity as accepted;
- preserved Part A/Part B pass real parity;
- dimensions occupy exact source-equivalent predecessor/successor slot;
- no non-dimension fingerprint change;
- source/raw hashes unchanged;
- all R3-R22 and R3-R17 accepted tests remain present.

## 7. Frozen / out of scope

Do not start evidence publication, image closure, objective/competency insertion closure, formula authority, production sanitizer/renderer, combined Excel, PDF/UI, Kintone, deploy, Live UAT, rollback, D3, R3-R27 or another WP.

## 8. Expected commands if authorized

```text
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Antigravity must make at most one bounded implementation/blocker commit, push, STOP, and report for independent review. Antigravity must not self-declare PASS/CLOSED.

## 9. Authorization ledger

```text
D2-WP003-R3-R22-TEST-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R22-EVIDENCE-20260901-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP003-R3-R23-SOURCE-20260901-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R24-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R3-R25-SOURCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = ACTIVE / ROUND 3 OF 20
ANTIGRAVITY_AUTO_AUTH = NO
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
NEXT_CONTROL_STEP = OWNER DECIDES WHETHER TO AUTHORIZE D2-WP003-R3-R26
NEXT_EXECUTOR = NONE
ANTIGRAVITY = STOP
D3 = HOLD
```
