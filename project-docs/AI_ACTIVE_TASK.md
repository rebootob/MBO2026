# AI ACTIVE TASK — D7 FINAL MINIMAL FIX / APP796 EVIDENCE ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `d29d69decd27ccd07ad6778556269c0d9aeabfc3`
> Mode: ONE BLOCKER ONLY / MINIMUM SOURCE + TEST FIX
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

Independent review accepts B3, B4 and B5 from Round 2.
B1/B2 are substantially fixed, but ONE remaining App796 evidence-boundary defect still blocks D7 PASS.

Do NOT refactor, redesign, clean up unrelated code, add features, change architecture, or touch other D1-D6 work in this task.

Target implementer status remains:

`D7_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## 1. ONLY BLOCKER — APP796 AUTHORITATIVE EVIDENCE MUST NEVER BE FABRICATED

File to change:
- `src/admin/admin-support-center.js`

Tests only as needed:
- `tests/admin-support-center.test.js`

Current provider already queries App796 by requested FY + PUBLISHED + expected profile when profile resolution succeeds, and already rejects 0 / duplicate records.

Remaining defects:

1. If App53 position cannot resolve an expected Profile_Code, provider currently falls back to a broad FY+PUBLISHED App796 query. This can select an unrelated published profile.
2. Returned `authoritativeProfile` currently fabricates evidence when fields are absent:

```js
fiscalYear: app796Obj.Fiscal_Year?.value || app796Obj.Fiscal_Year || cleanFy,
configStatus: app796Obj.Config_Status?.value || app796Obj.Config_Status || 'PUBLISHED'
```

This violates the evidence boundary because missing App796 Fiscal_Year / Config_Status can become apparently valid evidence.

### REQUIRED MINIMUM FIX

- If verified App53 position cannot resolve `expectedProfileCode`, fail closed before accepting any App796 record. Do not run/use an unscoped published-profile fallback as authoritative evidence.
- After exactly one App796 record is returned, read the REAL record fields and validate them before building `authoritativeProfile`:
  - `Profile_Code` present and exactly equals `expectedProfileCode`
  - `Fiscal_Year` present and exactly equals requested FY
  - `Config_Status` present and exactly equals `PUBLISHED`
  - `PartA_Weight` present
  - `PartB_Weight` present
- Missing/wrong authoritative App796 evidence => fail closed / error. Do not fabricate defaults.
- Returned `authoritativeProfile.fiscalYear` and `.configStatus` must come from the actual App796 record only. No `cleanFy` / `'PUBLISHED'` fallback.
- Do not change B3/B4/B5 code unless required only to keep existing tests compiling.
- No Kintone calls are authorized in this task.

## 2. MINIMUM TESTS

Add only the tests required to prove this blocker:

1. unresolvable App53 position cannot accept arbitrary App796 profile.
2. App796 record missing `Fiscal_Year` fails closed.
3. App796 record missing `Config_Status` fails closed.
4. App796 wrong Profile_Code / FY / status fails closed (can be one compact test if practical).
5. valid exact App796 record still returns authoritativeProfile using real record values.

Keep existing B1-B5 regression tests passing.

## 3. VERIFICATION

Run:

```bash
npm test -- tests/admin-support-center.test.js
npm test
npm run build
git diff --check
git status --short
```

If an existing source/dist parity command already exists, run it. Do not invent a new framework.

## 4. DELIVERY

Commit only this minimal fix.
Report:
- exact commit SHA
- files changed
- targeted test result
- full npm test result
- build result
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D7_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT edit Confirmed Baseline.
Do NOT deploy.
Do NOT mark D6 PASS.
Do NOT self-certify D7 PASS.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = BLOCKED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = MUST_FIX — ONE FINAL APP796 EVIDENCE BLOCKER