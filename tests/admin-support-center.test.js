import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDiagnosticModel, BUILD_VERSION_INFO } from '../src/admin/admin-diagnostic-model.js';
import { AdminSupportCenterUI } from '../src/admin/admin-support-center.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

test('Admin Support Center — Access Gate & Security Boundaries', async (t) => {

  await t.test('admin-form and administrator access allowed', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('admin-form'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('ADMIN-FORM'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('administrator'), true);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('  admin-form  '), true);
  });

  await t.test('non-admin access denied', () => {
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('EMP0118'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('hr'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('m01'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('g01'), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin(''), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin(null), false);
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin(undefined), false);
  });

  await t.test('Employee_Code cannot grant admin access', () => {
    // Even if record has Employee_Code = ADMIN or admin-form, login user identity is authoritative
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('emp_admin_01'), false);
    const mockRec = { Employee_Code: { value: 'admin-form' }, Requester_User: { value: [{ code: 'emp01' }] } };
    assert.equal(resolveIdentityViewerRole(mockRec, 'emp01', { isPreviewMode: false }), 'EMPLOYEE');
    assert.equal(resolveIdentityViewerRole(mockRec, 'admin-form', { isPreviewMode: false }), 'RESTRICTED', 'admin-form fails closed for business role authority');
  });

  await t.test('workflow status cannot grant admin access', () => {
    // Status 15 or Status 16 does NOT elevate a regular user to technical admin
    assert.equal(AdminDiagnosticModel.isTechnicalAdmin('user_status15'), false);
  });

  await t.test('technical admin surface exposes 0 business action capability', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });

    assert.ok(html.includes('0 Business Workflow Authority'), 'HTML must clearly state 0 business workflow authority');
    assert.ok(!html.includes('Submit MBO'), 'Must not include Submit MBO button');
    assert.ok(!html.includes('Approve Objective'), 'Must not include Approve Objective button');
    assert.ok(!html.includes('Return Objective'), 'Must not include Return Objective button');
    assert.ok(!html.includes('Score as Appraiser'), 'Must not include Score as Appraiser button');
    assert.ok(!html.includes('Complete HR Final'), 'Must not include Complete HR Final button');
  });
});

test('Admin Support Center — Diagnostic Model & Health Engine', async (t) => {

  await t.test('active appraiser diagnostic follows resolved current slot', () => {
    const healthActive = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      activeAppraiserSlot: 2,
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff / Chief' },
      activeObjCount: 4,
      currentStatus: '14 GM Final Evaluation',
      resolvedViewerRole: 'RESTRICTED'
    });

    const activeItem = healthActive.items.find(i => i.key === 'active_appraiser_slot');
    assert.equal(activeItem.status, 'PASS');
    assert.ok(activeItem.reason.includes('Slot 2'));
  });

  await t.test('routing fail-closed reason modeled correctly', () => {
    const healthFail = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      routingKey: 'TMG2|INVALID_TEAM',
      routingResult: { status: 'FAIL_CLOSED', isFailClosed: true, reason: 'ROUTE_NOT_FOUND' },
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff / Chief' },
      activeObjCount: 4,
      currentStatus: '01 Draft Objective',
      resolvedViewerRole: 'RESTRICTED'
    });

    const routingItem = healthFail.items.find(i => i.key === 'routing_resolution');
    assert.equal(routingItem.status, 'ERROR');
    assert.ok(routingItem.reason.includes('ROUTE_NOT_FOUND'));
  });

  await t.test('missing data remains NOT_AVAILABLE rather than fabricated', () => {
    const healthMissing = AdminDiagnosticModel.evaluateSystemHealth({
      loginUserCode: 'admin-form',
      profileCode: 'PROF_STAFF_CHIEF',
      evalProfile: { nameEN: 'Staff / Chief' },
      activeObjCount: 4,
      currentStatus: '01 Draft Objective',
      resolvedViewerRole: 'RESTRICTED'
    });

    const slotItem = healthMissing.items.find(i => i.key === 'active_appraiser_slot');
    assert.equal(slotItem.status, 'NOT_AVAILABLE');
    assert.ok(slotItem.reason.includes('Not currently in Appraiser Evaluation stage'));
  });

  await t.test('snapshot sanitizes Password_Hash/password/secret/token fields', () => {
    const sampleData = {
      recordId: '101',
      user: 'admin-form',
      Password_Hash: 'pbkdf2$100000$secret_salt$secret_hash',
      password: 'my_plaintext_password',
      api_token: 'secret_token_123',
      nested: {
        client_secret: 'top_secret',
        normalField: 'safe_value'
      }
    };

    const snapshot = AdminDiagnosticModel.generateDiagnosticSnapshot(sampleData);

    assert.equal(snapshot.sanitized, true);
    assert.equal(snapshot.data.Password_Hash, '[REDACTED_FOR_SECURITY]');
    assert.equal(snapshot.data.password, '[REDACTED_FOR_SECURITY]');
    assert.equal(snapshot.data.api_token, '[REDACTED_FOR_SECURITY]');
    assert.equal(snapshot.data.nested.client_secret, '[REDACTED_FOR_SECURITY]');
    assert.equal(snapshot.data.nested.normalField, 'safe_value');
  });

  await t.test('Controlled Repair remains disabled contract placeholder', () => {
    const ui = new AdminSupportCenterUI();
    const html = ui.renderHtml({ loginUserCode: 'admin-form' });

    assert.ok(html.includes('Controlled Repair Contract Placeholder'), 'Must include Controlled Repair placeholder heading');
    assert.ok(html.includes('REPAIR_WRITE_IMPLEMENTED = NO'), 'Must state REPAIR_WRITE_IMPLEMENTED = NO');
    assert.ok(html.includes('disabled'), 'Tab button must have disabled attribute');
  });
});
