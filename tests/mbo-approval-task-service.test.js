import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MboApprovalTaskService } from '../src/services/mbo-approval-task-service.js';

test('MboApprovalTaskService — Dedicated Current-Assignee Authority Corrective R1', async (t) => {

  const validContext = { mode: 'DEDICATED', kintoneUserCode: 'natta' };
  const sharedContext = { mode: 'SHARED', kintoneUserCode: 'f1', employeeCode: '0118' };

  await t.test('1. Dedicated list builds query containing Assignee in (LOGINUSER())', async () => {
    let capturedQuery = '';
    const mockWrapper = {
      getRecords: async (appId, query) => {
        capturedQuery = query;
        return { records: [] };
      }
    };
    await MboApprovalTaskService.fetchApprovalTasks(validContext, 794, mockWrapper);
    assert.ok(capturedQuery.includes('Assignee in (LOGINUSER())'), 'Query must contain Assignee in (LOGINUSER())');
  });

  await t.test('2. Exact assignee { code: "natta", name: ... } authorizes natta through Dedicated context', () => {
    const record = {
      Assignee: {
        type: 'STATUS_ASSIGNEE',
        value: [{ code: 'natta', name: 'Natta' }]
      }
    };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, record), true);
  });

  await t.test('3. Case mismatch does not authorize', () => {
    const record = {
      Assignee: {
        type: 'STATUS_ASSIGNEE',
        value: [{ code: 'Natta', name: 'Natta' }]
      }
    };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, record), false);
  });

  await t.test('4. Empty Assignee.value does not authorize', () => {
    const record = {
      Assignee: {
        type: 'STATUS_ASSIGNEE',
        value: []
      }
    };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, record), false);
  });

  await t.test('5. Wrong field type or malformed Assignee does not authorize', () => {
    const wrongTypeRec = {
      Assignee: {
        type: 'USER_SELECT',
        value: [{ code: 'natta', name: 'Natta' }]
      }
    };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, wrongTypeRec), false);

    const malformedRec1 = { Assignee: null };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, malformedRec1), false);

    const malformedRec2 = { Assignee: { type: 'STATUS_ASSIGNEE', value: 'natta' } };
    assert.equal(MboApprovalTaskService.isAuthorizedAssignee(validContext, malformedRec2), false);
  });

  await t.test('6. SHARED mode is denied before any API call (R1-B)', async () => {
    let apiCalled = false;
    const mockWrapper = {
      getRecords: async () => {
        apiCalled = true;
        return { records: [] };
      },
      getRecord: async () => {
        apiCalled = true;
        return {};
      }
    };

    assert.throws(
      () => MboApprovalTaskService.isAuthorizedAssignee(sharedContext, { Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'f1' }] } }),
      /APPROVER_AUTHORITY_DENIED/
    );

    await assert.rejects(
      async () => MboApprovalTaskService.fetchApprovalTasks(sharedContext, 794, mockWrapper),
      /APPROVER_AUTHORITY_DENIED/
    );
    assert.equal(apiCalled, false, 'API must NOT be called for SHARED context in fetchApprovalTasks');

    await assert.rejects(
      async () => MboApprovalTaskService.revalidateApprovalTask(sharedContext, 794, 10, mockWrapper),
      /APPROVER_AUTHORITY_DENIED/
    );
    assert.equal(apiCalled, false, 'API must NOT be called for SHARED context in revalidateApprovalTask');
  });

  await t.test('7. List query result with mismatched Assignee fails closed / is never returned', async () => {
    const mockWrapper = {
      getRecords: async () => ({
        records: [
          { $id: { value: '1' }, Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'other_user' }] } },
          { $id: { value: '2' }, Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] } }
        ]
      })
    };
    const tasks = await MboApprovalTaskService.fetchApprovalTasks(validContext, 794, mockWrapper);

    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].$id.value, '2');
  });

  await t.test('8. Revalidation mock matches canonical seam: getRecord returns record object directly (R1-A)', async () => {
    let getRecordCallCount = 0;
    const mockWrapper = {
      getRecord: async (appId, recordId) => {
        getRecordCallCount++;
        assert.equal(appId, 794);
        assert.equal(recordId, 101);
        // R1-A: Returns record object directly (canonical main-mbo-app seam)
        return {
          $id: { value: '101' },
          Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] }
        };
      }
    };
    const result = await MboApprovalTaskService.revalidateApprovalTask(validContext, 794, 101, mockWrapper);

    assert.equal(getRecordCallCount, 1, 'getRecord must be called exactly once');
    assert.equal(result.authorized, true);
    assert.equal(result.record.$id.value, '101');
  });

  await t.test('9. Fresh revalidation denies a different current assignee', async () => {
    let getRecordCallCount = 0;
    const mockWrapper = {
      getRecord: async () => {
        getRecordCallCount++;
        return {
          $id: { value: '102' },
          Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'other_user' }] }
        };
      }
    };
    const result = await MboApprovalTaskService.revalidateApprovalTask(validContext, 794, 102, mockWrapper);

    assert.equal(getRecordCallCount, 1);
    assert.equal(result.authorized, false);
    assert.equal(result.reason, 'ASSIGNEE_MISMATCH');
  });

  await t.test('10. Missing getRecord function throws INVALID_KINTONE_API_WRAPPER without getRecords fallback (R1-A)', async () => {
    let getRecordsCalled = false;
    const mockWrapperWithOnlyGetRecords = {
      getRecords: async () => {
        getRecordsCalled = true;
        return { records: [{ $id: { value: '103' }, Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] } }] };
      }
    };

    await assert.rejects(
      async () => MboApprovalTaskService.revalidateApprovalTask(validContext, 794, 103, mockWrapperWithOnlyGetRecords),
      /INVALID_KINTONE_API_WRAPPER/
    );
    assert.equal(getRecordsCalled, false, 'revalidateApprovalTask must NOT fall back to getRecords');
  });

  await t.test('11. Record objects are not mutated', async () => {
    const origRecord = {
      $id: { value: '200' },
      Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] }
    };
    const recordSnapshot = JSON.stringify(origRecord);

    MboApprovalTaskService.isAuthorizedAssignee(validContext, origRecord);
    assert.equal(JSON.stringify(origRecord), recordSnapshot);

    const mockWrapper = {
      getRecord: async () => origRecord
    };
    await MboApprovalTaskService.revalidateApprovalTask(validContext, 794, 200, mockWrapper);
    assert.equal(JSON.stringify(origRecord), recordSnapshot);
  });

  await t.test('12. Pagination does not silently truncate a mocked multi-page result', async () => {
    const page1Records = Array.from({ length: 500 }, (_, i) => ({
      $id: { value: String(i + 1) },
      Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] }
    }));
    const page2Records = Array.from({ length: 1 }, (_, i) => ({
      $id: { value: String(501 + i) },
      Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'natta' }] }
    }));

    let callCount = 0;
    const mockWrapper = {
      getRecords: async (appId, query) => {
        callCount++;
        if (query.includes('offset 0')) {
          return { records: page1Records };
        }
        if (query.includes('offset 500')) {
          return { records: page2Records };
        }
        return { records: [] };
      }
    };

    const tasks = await MboApprovalTaskService.fetchApprovalTasks(validContext, 794, mockWrapper);

    assert.equal(callCount, 2, 'Pagination must fetch 2 pages');
    assert.equal(tasks.length, 501, 'Multi-page results must return all 501 items without truncation');
  });

  await t.test('13. No App 795 or static snapshot fallback is used', () => {
    const recWithFallbackOnly = {
      Manager_User: { value: [{ code: 'natta' }] },
      GM_User: { value: [{ code: 'natta' }] },
      First_Manager_User: { value: [{ code: 'natta' }] },
      Requester_User: { value: [{ code: 'natta' }] },
      Assignee: { type: 'STATUS_ASSIGNEE', value: [{ code: 'someone_else' }] }
    };
    assert.equal(
      MboApprovalTaskService.isAuthorizedAssignee(validContext, recWithFallbackOnly),
      false,
      'Static snapshot fields (Manager_User, etc.) must NEVER grant authority when Assignee is someone else'
    );
  });

});
