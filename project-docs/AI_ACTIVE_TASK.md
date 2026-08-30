# AI ACTIVE TASK — D1 MY APPROVAL TASKS — NATIVE CURRENT-ASSIGNEE READ-ONLY RUNTIME PROOF R1

Mode: **USER-ASSISTED APP794 READ-ONLY DIAGNOSTIC / CHATGPT REVIEW — NO ANTIGRAVITY / NO WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Why this proof is required

Repository inventory did NOT prove the exact native Kintone Process/Workflow current-assignee field code/query contract.

Do not invent `$assignee`, `Assignee`, or another field name.

Before implementing My Approval Tasks, prove the actual field shape from one App794 REST GET.

## 1. User action — one read-only diagnostic only

Prefer an App794 record currently in a review state with an active assignee, for example one of:
```text
03 Manager Objective Review
04 GM Objective Review
08 Manager Mid-Year Review
09 GM Mid-Year Review
13 Manager Final Evaluation
14 GM Final Evaluation
15 HR Final Check
```

Open that record's Detail page in Kintone.

Open browser Developer Tools -> Console and paste exactly:

```javascript
(async () => {
  const app = kintone.app.getId();
  const id = kintone.app.record.getId();

  if (Number(app) !== 794) {
    throw new Error(`STOP_NOT_APP794: current app is ${app}`);
  }
  if (!id) {
    throw new Error('STOP_NO_RECORD_ID: open an App794 record detail page first');
  }

  const url = kintone.api.url('/k/v1/record.json', true);
  const res = await kintone.api(url, 'GET', { app, id });
  const rec = res && res.record ? res.record : {};

  const processKeys = Object.keys(rec).filter(k => /assignee|status/i.test(k));
  const processFields = {};
  processKeys.forEach(k => { processFields[k] = rec[k]; });

  const output = {
    app,
    recordId: String(id),
    processKeys,
    processFields
  };

  console.log(JSON.stringify(output, null, 2));
  return output;
})();
```

This command performs exactly one:
```text
GET /k/v1/record.json
```

It does NOT POST/PUT/DELETE, does not execute a Process action, and does not touch App53.

## 2. User returns only the console output

Send the JSON shown by the console to ChatGPT, or send a screenshot of that JSON.

Do not send the whole App794 record. The diagnostic intentionally prints only field keys containing `status` or `assignee` plus their values.

## 3. Hard stop

```text
ANTIGRAVITY = DO NOT USE
SOURCE_EDIT = 0
TEST_EDIT = 0
TEST_RUN = 0
BUILD = 0
APP794_GET = 1 MAXIMUM FOR THIS PROOF
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
PROCESS_ACTION = 0
APP53_GET = 0
APP53_WRITE = 0
ACL_WRITE = 0
GROUP_WRITE = 0
DEPLOY = 0
```

Do not run a second query until ChatGPT reviews the first output.

## 4. ChatGPT review after output

ChatGPT must determine:
- exact current-assignee field code;
- field value shape/type;
- exact status field code if present;
- whether the returned assignee is a native Kintone user code;
- whether one additional READ-ONLY list-query proof is required before source implementation.

If the output does not prove a safe field contract:
```text
BLOCKED_NEEDS_READ_ONLY_RUNTIME_PROOF
```
remains in force.

If proven, ChatGPT may open the smallest possible implementation WP. Antigravity is still not used until that WP is exact.
