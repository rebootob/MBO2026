import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderHrRoutingManagerHtml,
  bindHrRoutingManagerEvents,
  escapeHtml,
  TOPOLOGY_OPTIONS,
  getRequiredSlotsForTopology
} from '../src/ui/hr-routing-manager.js';

import {
  TOPOLOGIES,
  ROUTING_STATUSES,
  HrRoutingManagementService
} from '../src/services/hr-routing-management-service.js';

import { renderHrControlCenterHtml, DEFAULT_APP_IDS } from '../src/ui/hr-control-center.js';

// Mock DOM element helper for event testing
function createMockElement() {
  const listeners = {};
  const queryMap = {};
  const elem = {
    innerHTML: '',
    value: '',
    disabled: false,
    textContent: '',
    style: {},
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; },
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    async trigger(event) {
      if (listeners[event]) {
        for (const fn of listeners[event]) {
          await fn({ target: elem });
        }
      }
    },
    querySelector(selector) {
      if (queryMap[selector]) return queryMap[selector];
      const newChild = createMockElement();
      queryMap[selector] = newChild;
      return newChild;
    },
    querySelectorAll(selector) {
      return [];
    }
  };
  return elem;
}

const PRINCIPAL_HR = { userCode: 'hr_lead_01', groups: ['hr'] };
const PRINCIPAL_ADMIN = { userCode: 'admin_tech_01', groups: ['admin-form'] };
const PRINCIPAL_DUAL = { userCode: 'dual_lead_01', groups: ['hr', 'admin-form'] };
const PRINCIPAL_UNAUTH = { userCode: 'unauth_01', groups: ['standard-users'] };

const SAMPLE_ROUTES = [
  {
    Routing_Key: 'DEPT_ENG_SEC1',
    Version_Number: 1,
    Version_Key: 'DEPT_ENG_SEC1#v1',
    Topology: 'M1_ONLY',
    Status: 'ACTIVE',
    Effective_From: '2026-01-01',
    Effective_To: '',
    Remark: 'Initial baseline for Eng'
  },
  {
    Routing_Key: 'DEPT_ENG_SEC1',
    Version_Number: 2,
    Version_Key: 'DEPT_ENG_SEC1#v2',
    Topology: 'M1_G1',
    Status: 'DRAFT',
    Effective_From: '2026-07-01',
    Effective_To: '',
    Remark: 'Promotion of second appraiser'
  }
];

// ----------------------------------------------------
// UI Test Matrix: Items 74..79
// ----------------------------------------------------

test('74. UI: Role-based control visibility (HR sees Create/Edit/Publish/Supersede actions; Admin-Form sees view/preview/diagnostics only)', () => {
  const htmlHr = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_HR,
    routes: SAMPLE_ROUTES
  });

  assert.ok(htmlHr.includes('id="hr-btn-create-draft"'), 'HR must see Create New Draft button');
  assert.ok(htmlHr.includes('id="hr-btn-save-draft"'), 'HR must see Update Draft button');
  assert.ok(htmlHr.includes('id="hr-btn-publish"'), 'HR must see Publish Plan button');
  assert.ok(htmlHr.includes('id="hr-btn-supersede"'), 'HR must see Supersede Plan button');
  assert.ok(htmlHr.includes('id="hr-btn-preview"'), 'HR must see Preview button');

  const htmlAdmin = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_ADMIN,
    routes: SAMPLE_ROUTES
  });

  assert.equal(htmlAdmin.includes('id="hr-btn-create-draft"'), false, 'Admin-Form must NOT see active Create Draft button');
  assert.equal(htmlAdmin.includes('id="hr-btn-publish"'), false, 'Admin-Form must NOT see active Publish button');
  assert.equal(htmlAdmin.includes('id="hr-btn-supersede"'), false, 'Admin-Form must NOT see active Supersede button');
  assert.ok(htmlAdmin.includes('id="hr-btn-preview"'), 'Admin-Form can see Preview button');
  assert.ok(htmlAdmin.includes('Admin-Form: Read-Only / Diagnostics / Zero Business Mutations'), 'Admin-Form capability indicator present');
});

test('75. UI: Admin-Form mutation buttons disabled/hidden with clear explanation', () => {
  const htmlAdmin = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_ADMIN,
    routes: SAMPLE_ROUTES
  });

  assert.ok(htmlAdmin.includes('admin-disabled'), 'Admin-disabled action group rendered');
  assert.ok(htmlAdmin.includes('Business mutation requires HR role (ROUTING_HR_AUTHORIZATION_REQUIRED)'), 'Clear HR authorization required explanation present');
  assert.ok(htmlAdmin.includes('Create New Draft (HR Only)'), 'Disabled button label clearly states HR Only');
  assert.ok(htmlAdmin.includes('disabled'), 'Buttons in admin view must be disabled');
});

test('76. UI: Topology selector contains all 5 distinct topologies', () => {
  assert.equal(TOPOLOGY_OPTIONS.length, 5);
  const topologyValues = TOPOLOGY_OPTIONS.map(o => o.value);
  assert.ok(topologyValues.includes(TOPOLOGIES.M1_ONLY), 'Must contain M1_ONLY');
  assert.ok(topologyValues.includes(TOPOLOGIES.M1_G1), 'Must contain M1_G1');
  assert.ok(topologyValues.includes(TOPOLOGIES.M1_M2_G1), 'Must contain M1_M2_G1');
  assert.ok(topologyValues.includes(TOPOLOGIES.M1_G1_G2), 'Must contain M1_G1_G2');
  assert.ok(topologyValues.includes(TOPOLOGIES.M1_M2_G1_G2), 'Must contain M1_M2_G1_G2');

  const html = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_HR,
    selectedTopology: TOPOLOGIES.M1_M2_G1
  });

  assert.ok(html.includes('value="M1_ONLY"'), 'Selector HTML includes M1_ONLY option');
  assert.ok(html.includes('value="M1_G1"'), 'Selector HTML includes M1_G1 option');
  assert.ok(html.includes('value="M1_M2_G1" selected'), 'Selector HTML selects M1_M2_G1');
  assert.ok(html.includes('value="M1_G1_G2"'), 'Selector HTML includes M1_G1_G2 option');
  assert.ok(html.includes('value="M1_M2_G1_G2"'), 'Selector HTML includes M1_M2_G1_G2 option');
});

test('77. UI: Dynamic slot inputs display/hide based on selected topology', () => {
  // M1_ONLY: only M1 visible
  const htmlM1Only = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_HR,
    selectedTopology: TOPOLOGIES.M1_ONLY
  });
  assert.ok(htmlM1Only.includes('id="slot-container-m1"'));
  assert.ok(htmlM1Only.includes('id="slot-container-m2" style="display: none;"'), 'M2 hidden for M1_ONLY');
  assert.ok(htmlM1Only.includes('id="slot-container-g1" style="display: none;"'), 'G1 hidden for M1_ONLY');
  assert.ok(htmlM1Only.includes('id="slot-container-g2" style="display: none;"'), 'G2 hidden for M1_ONLY');

  // M1_M2_G1: M1, M2, G1 visible; G2 hidden
  const htmlM1M2G1 = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_HR,
    selectedTopology: TOPOLOGIES.M1_M2_G1
  });
  assert.ok(htmlM1M2G1.includes('id="slot-container-m1"'));
  assert.ok(!htmlM1M2G1.includes('id="slot-container-m2" style="display: none;"'), 'M2 visible for M1_M2_G1');
  assert.ok(!htmlM1M2G1.includes('id="slot-container-g1" style="display: none;"'), 'G1 visible for M1_M2_G1');
  assert.ok(htmlM1M2G1.includes('id="slot-container-g2" style="display: none;"'), 'G2 hidden for M1_M2_G1');

  // M1_G1_G2: M1, G1, G2 visible; M2 hidden
  const htmlM1G1G2 = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_HR,
    selectedTopology: TOPOLOGIES.M1_G1_G2
  });
  assert.ok(htmlM1G1G2.includes('id="slot-container-m2" style="display: none;"'), 'M2 hidden for M1_G1_G2');
  assert.ok(!htmlM1G1G2.includes('id="slot-container-g1" style="display: none;"'), 'G1 visible for M1_G1_G2');
  assert.ok(!htmlM1G1G2.includes('id="slot-container-g2" style="display: none;"'), 'G2 visible for M1_G1_G2');
});

test('78. UI: HTML injection prevention: all fields (Remark, keys, user codes, names) strictly escaped', () => {
  const maliciousString = '<script>alert("xss")</script>&"\'';
  const escaped = escapeHtml(maliciousString);
  assert.equal(escaped.includes('<script>'), false);
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.ok(escaped.includes('&quot;'));
  assert.ok(escaped.includes('&#039;'));
  assert.ok(escaped.includes('&amp;'));

  const html = renderHrRoutingManagerHtml({
    principal: { userCode: '<malicious_user>', groups: ['hr'] },
    routes: [
      {
        Routing_Key: '<xss_key>',
        Version_Number: 1,
        Version_Key: '<xss_vkey>',
        Topology: '<xss_topo>',
        Status: '<xss_status>',
        Effective_From: '2026-01-01',
        Effective_To: '2026-12-31',
        Remark: '<script>evil()</script>'
      }
    ],
    selectedRouteKey: '<injected_key>',
    remark: '<payload_remark>',
    validationErrors: ['<script>error()</script>']
  });

  assert.equal(html.includes('<script>'), false, 'Rendered HTML must never contain unescaped script tag');
  assert.equal(html.includes('<malicious_user>'), false);
  assert.ok(html.includes('&lt;malicious_user&gt;'));
  assert.equal(html.includes('<xss_key>'), false);
  assert.ok(html.includes('&lt;xss_key&gt;'));
  assert.equal(html.includes('<xss_vkey>'), false);
  assert.ok(html.includes('&lt;xss_vkey&gt;'));
  assert.equal(html.includes('<payload_remark>'), false);
  assert.ok(html.includes('&lt;payload_remark&gt;'));
  assert.equal(html.includes('<script>error()</script>'), false);
  assert.ok(html.includes('&lt;script&gt;error()&lt;/script&gt;'));
});

test('79. UI: Existing App800 Control Center features (monitoring, password reset, filters) remain intact', () => {
  const html = renderHrControlCenterHtml({
    evaluations: [
      { $id: { value: '1' }, Employee_Code: { value: 'EMP001' }, Status: { value: 'COMPLETED' } }
    ],
    allEvaluations: [
      { $id: { value: '1' }, Employee_Code: { value: 'EMP001' }, Status: { value: 'COMPLETED' } }
    ],
    health: { app794Count: 1, routing: { available: true, count: 12 }, scoring: { available: true, count: 8 }, hoshin: { available: true, count: 2 }, archive: { available: true, count: 0 } },
    warnings: [],
    filters: { fy: '', dept: '', sec: '', status: '' },
    appIds: DEFAULT_APP_IDS
  });

  assert.ok(html.includes('MBO 2026 — HR Control Center'), 'Title intact');
  assert.ok(html.includes('System Health & Inventory'), 'Health panel intact');
  assert.ok(html.includes('Filters:'), 'Filters intact');
  assert.ok(html.includes('Total Evaluations'), 'KPI grid intact');
  assert.ok(html.includes('Pipeline Breakdown'), 'Pipeline breakdown intact');
  assert.ok(html.includes('รีเซ็ตรหัสผ่าน MBO / Reset MBO Password'), 'Password reset intact');
});

test('UI helper: Unauthorized principal renders access denied banner', () => {
  const html = renderHrRoutingManagerHtml({
    principal: PRINCIPAL_UNAUTH
  });

  assert.ok(html.includes('Access Denied / ไม่ได้รับอนุญาต'));
  assert.ok(html.includes('hr-access-denied'));
});

test('UI helper: getRequiredSlotsForTopology returns correct slots for each topology', () => {
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_ONLY), ['M1']);
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_G1), ['M1', 'G1']);
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_M2_G1), ['M1', 'M2', 'G1']);
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_G1_G2), ['M1', 'G1', 'G2']);
  assert.deepEqual(getRequiredSlotsForTopology(TOPOLOGIES.M1_M2_G1_G2), ['M1', 'M2', 'G1', 'G2']);
});
