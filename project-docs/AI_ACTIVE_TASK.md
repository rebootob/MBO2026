# AI ACTIVE TASK — D2-WP003-R7-R2 SOURCE+TEST AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT TWO FILES / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact changed files only.

## 1. Current truth
```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION = PASS / CLOSED
D2_REFERENCE_IMAGE = PASS / CLOSED
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED
D2_FORMULA_AUTHORITY = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY = CORRECTIVE REQUIRED / NOT CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R2
ACTIVE_WORK_PACKAGE_NAME = PART B PRIVACY SOURCE-EVIDENCE FAIL-CLOSED FINAL CORRECTIVE
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 52a28d6f24a353f4a425315b730b9b9f19cd4bce
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R2 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
D3 = HOLD
```

The previous standing 20-round Control Plane authorization remains exhausted and is NOT renewed. This Owner authorization is execution-only for exactly one R7-R2 implementation/blocker commit. Independent review begins only when Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP003-R7-R2
AUTHORIZATION_TOKEN = D2-WP003-R7-R2-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT
OWNER_APPROVAL_BASELINE_HEAD = 52a28d6f24a353f4a425315b730b9b9f19cd4bce
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Writable files ONLY:
1. `scripts/export/mbo-xlsx-ooxml-feasibility.js`
2. `tests/mbo-xlsx-ooxml-feasibility.test.js`

Any other changed file is out of scope and must block completion.

## 3. R7-R1 review truth / accepted work — FREEZE
R7-R1 authorization commit: `273d5ccbbb24d6aaa1b5ae23bab2a0941977d591`  
R7-R1 implementation: `7c1be393bbddaf1f6b439d13229ad256c23517cf`

```text
R7-R1_SCOPE_REVIEW = PASS
R7-R1_ROW30_ROLE_MAPPING = PASS / FROZEN
R7-R1_DYNAMIC_CARDINALITY = PASS / FROZEN (432 / 474 / 516)
R7-R1_STYLE_MERGE_SOURCE_BACKING = PASS / FROZEN
R7-R1_EXPANDED_PACKAGE_TOKEN_PURGE = PASS / FROZEN
R7-R1_CALLER_BUFFER_IMMUTABILITY = PASS / FROZEN
R7-R1_ZERO_FORMULA_PROOF = PASS / FROZEN
R7-R1_FAIL_CLOSED_SOURCE_EVIDENCE = CORRECTIVE REQUIRED
R7-R1_STATUS = CORRECTIVE REQUIRED
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
```

DO NOT redesign or weaken:
- support restricted to N=6/7/8;
- exact source-role row mapping;
- source row30 and clone rows 34/38 as protected non-dynamic padding;
- dynamic address counts N6=432, N7=474, N8=516;
- styleId + normalized merge relocation logic;
- count-aware typed metadata/cardinality;
- expanded `xl/*.xml` / `.rels` / sharedStrings sensitive-token purge proof;
- caller-buffer immutability proof;
- formula inventory exactly zero;
- Preservation / Reference Image / Part A / Part B Structural / Formula Authority proof.

## 4. Exact R7-R2 corrective contract

### A. Remove protected-static authority bypasses
Current R7-R1 resolver contains tolerance for protected padding cells equivalent to allowing `B30/B34/B38` `valHash` or `normalizedType` drift.

R7-R2 MUST:
- remove that exception and any equivalent special tolerance;
- never teach the authoritative role resolver to accept protected-static drift merely to make synthetic proof-token tests work;
- require source row30 and every row30 clone to match exact source-backed protected-static evidence BEFORE proof mutation.

### B. Strict pre-mutation source-evidence validation
On untouched real structural N=6/7/8 buffers, every relevant observed target record must map to its exact normalized source authority:
- original rows => same source row;
- cloned block rows => source 27/28/29/30 by exact 4-row offset;
- shifted summary rows => source 31/32/33/34 by exact `extraRows` normalization.

Before accepting role classification, compare the evidence required by this feasibility gate:
1. exact `styleId`;
2. exact normalized relocated `mergeRef`;
3. exact `normalizedType`;
4. exact `nonblank` state;
5. for protected-static records where source authority has `valHash`, exact `valHash`.

Any missing/malformed/mismatched/ambiguous evidence must throw exactly:
`BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`

This strict comparison is for the untouched structural feasibility authority. Do NOT infer from it that a future production renderer may only write values with the template's original runtime value/type; Production Renderer is a later gate. R7-R2 only proves that the structural role map is resolved from an exact source-backed pre-mutation buffer.

### C. Separate validation from synthetic mutation
Required flow for feasibility proof:
1. obtain real N6/N7/N8 structural buffer from accepted `getStructuralPartBBuffers()`;
2. run strict source-backed resolver/validation on untouched buffer;
3. obtain the validated dynamic/protected role map;
4. copy to a disposable buffer;
5. inject privacy-safe synthetic sensitive/static proof tokens only AFTER strict validation;
6. sanitize the disposable copy using the already validated role map/dynamic inventory, or an equivalently strict design that does not revalidate the intentionally mutated proof copy against pristine static hashes/types;
7. run the already accepted expanded package token-purge/static-survival/formula-zero proof.

Do NOT solve proof mutation by reintroducing resolver tolerance.

### D. Mandatory negative fail-closed tests
Retain existing changed-style, wrong/missing-merge, missing-record, unsupported-count tests.

Add direct negative inventory/proof mutations showing at minimum:
1. a dynamic target `normalizedType` mismatch => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`;
2. a dynamic target `nonblank` mismatch => blocker;
3. protected source-row30 or a row30-clone static `valHash` mismatch => blocker;
4. protected source-row30 or a row30-clone static `normalizedType` mismatch => blocker.

Use privacy-safe in-memory/disposable inventory mutations only. Do not alter or commit owner-template binaries.

### E. Retain accepted R7-R1 proof exactly
For N=6/7/8 retain proof that:
- dynamic cardinality = 432 / 474 / 516;
- row30/34/38 are absent from dynamic metadata/inventory;
- cloned rows 27:29 map to exact dynamic K:X semantics;
- shifted summary/signature destinations remain 31:34 / 35:38 / 39:42;
- metadata exact address set and cardinality remain valid;
- sensitive synthetic tokens are absent from relevant `xl/*.xml`, `.rels`, and sharedStrings evidence after sanitization;
- protected static proof survives where applicable after post-validation injection;
- original caller structural buffer bytes remain unchanged;
- formula inventory remains exactly zero.

## 5. Explicitly OUT OF SCOPE
Do NOT:
- redesign Part B row insertion or privacy row mapping/cardinality;
- create Production XLSX Renderer;
- modify `src/services/mbo-export-service.js`;
- implement/recalculate scoring;
- modify dependencies/package-lock;
- commit generated XLSX/PDF/image/evidence binaries;
- modify Part A source behavior;
- touch Kintone records/apps/settings/ACL/process/customization;
- deploy anything;
- perform Live UAT;
- start Combined Excel, PDF, export security regression, D3, or any later WP;
- invoke Claude.

## 6. Required commands
Run exactly:
```bash
node --check scripts/export/mbo-xlsx-ooxml-feasibility.js
node --check tests/mbo-xlsx-ooxml-feasibility.test.js
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

If local owner-template binaries are unavailable and template-dependent tests skip, report the skip truth exactly. Skipped proof is not runtime PASS.

## 7. Commit/push contract
After implementation/testing:
- create exactly ONE bounded R7-R2 implementation commit OR exactly ONE blocker commit;
- commit must change only the two authorized files;
- push to `ai/antigravity-wp002c`;
- STOP immediately after push/report;
- do not self-declare PASS/CLOSED;
- do not start the next gate.

Report only:
- commit SHA;
- exact changed files;
- both `node --check` results;
- `node --test` result including skip count if any;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker, if any.

## 8. Authorization ledger
```text
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP003-R7-R2-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R2-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD
```

## 9. Exact next action
```text
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP003-R7-R2-SOURCE-TEST-20260902-01; CREATE EXACTLY ONE BOUNDED IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
EXPECTED_CHANGED_FILES = scripts/export/mbo-xlsx-ooxml-feasibility.js + tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R2
CLAUDE = STOP
CHATGPT = INDEPENDENT REVIEW ONLY AFTER OWNER INITIATES `review`
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
