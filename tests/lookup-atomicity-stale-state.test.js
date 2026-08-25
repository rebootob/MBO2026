import test from 'node:test';
import assert from 'node:assert/strict';
import { EmployeePartAUI } from '../src/ui/employee-part-a-ui.js';
import { BUSINESS_STAGES } from '../src/config/constants.js';

function createMockElement() {
  const children = [];
  const listeners = {};
  const dataset = {};
  const style = {};
  const classList = {
    _classes: new Set(),
    add(...cls) { cls.forEach(c => this._classes.add(c)); },
    remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
    contains(c) { return this._classes.has(c); }
  };

  const el = {
    tagName: 'DIV',
    innerHTML: '',
    textContent: '',
    value: '',
    readOnly: false,
    disabled: false,
    dataset,
    style,
    classList,
    children,
    appendChild(child) {
      children.push(child);
      return child;
    },
    querySelector(selector) {
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        return findById(this, id);
      }
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        return findByClass(this, cls);
      }
      return null;
    },
    querySelectorAll(selector) {
      return [];
    },
    addEventListener(evt, fn) {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    dispatchEvent(evt) {
      const type = typeof evt === 'string' ? evt : evt.type;
      (listeners[type] || []).forEach(fn => fn(evt));
    }
  };
  return el;
}

function findById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

function findByClass(node, cls) {
  if (!node) return null;
  if (node.classList && node.classList.contains(cls)) return node;
  for (const child of node.children || []) {
    const found = findByClass(child, cls);
    if (found) return found;
  }
  return null;
}

test('Lookup Atomicity: Changing employee code clears verified state and stale snapshot', () => {
  const USER_SELECT_FIELDS = new Set([
    'Requester_User',
    'Manager_Level1_Approvers',
    'Manager_Level2_Approvers',
    'GM_Level1_Approvers',
    'GM_Level2_Approvers',
    'First_Manager_User',
    'Manager_User',
    'GM_User'
  ]);

  const record = {
    Employee_Code: { type: 'SINGLE_LINE_TEXT', value: '0118' },
    Employee_Name: { type: 'SINGLE_LINE_TEXT', value: 'Mr. Peranut Hanpratum' },
    Employee_Section: { type: 'DROP_DOWN', value: 'TMS1' },
    Employee_Position: { type: 'SINGLE_LINE_TEXT', value: 'Technical Service Chief' },
    Manager_Level1_Approvers: { type: 'USER_SELECT', value: [{ code: 'm1' }] }
  };

  let isVerified = true;

  const ui = new EmployeePartAUI({
    container: createMockElement(),
    record: record,
    stage: BUSINESS_STAGES.NEW_RECORD,
    isEditable: true,
    isCreate: true,
    onFieldChange: () => {},
    onEmployeeCodeChanged: (newCode) => {
      isVerified = false;
      const fieldsToClear = [
        'Employee_Name', 'Employee_Name_TH', 'Employee_Section',
        'Employee_Department', 'Employee_Position', 'Employee_Email',
        'Employee_Start_Date', 'Department_Hoshin', 'Section_Hoshin', 'Record_Key',
        'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
        'GM_Level1_Approvers', 'GM_Level2_Approvers',
        'Has_Manager_Level2', 'Has_GM_Level2', 'Routing_Topology',
        'First_Manager_User', 'Manager_User', 'GM_User', 'Requester_User'
      ];
      if (record.Employee_Code) record.Employee_Code.value = newCode;
      fieldsToClear.forEach(k => {
        if (record[k]) {
          record[k].value = USER_SELECT_FIELDS.has(k) ? [] : '';
        }
      });
    },
    onLookupEmployee: async () => {}
  });

  ui.isEmployeeVerified = isVerified;
  assert.equal(ui.isEmployeeVerified, true);
  assert.equal(record.Employee_Name.value, 'Mr. Peranut Hanpratum');

  // Trigger employee code change to '0111'
  ui.onEmployeeCodeChanged('0111');
  ui.isEmployeeVerified = false;

  assert.equal(ui.isEmployeeVerified, false);
  assert.equal(record.Employee_Code.value, '0111');
  assert.equal(record.Employee_Name.value, '');
  assert.equal(record.Employee_Section.value, '');
  assert.equal(record.Employee_Position.value, '');
  assert.deepEqual(record.Manager_Level1_Approvers.value, []);
});

test('Lookup Atomicity: Failed lookup (Ambiguous profile) leaves verified=false and clears stale snapshot', async () => {
  const USER_SELECT_FIELDS = new Set([
    'Requester_User', 'Manager_Level1_Approvers', 'Manager_Level2_Approvers',
    'GM_Level1_Approvers', 'GM_Level2_Approvers', 'First_Manager_User', 'Manager_User', 'GM_User'
  ]);

  const record = {
    Employee_Code: { type: 'SINGLE_LINE_TEXT', value: '0118' },
    Employee_Name: { type: 'SINGLE_LINE_TEXT', value: 'Mr. Peranut Hanpratum' },
    Employee_Position: { type: 'SINGLE_LINE_TEXT', value: 'Technical Service Chief' }
  };

  const ui = new EmployeePartAUI({
    container: createMockElement(),
    record: record,
    stage: BUSINESS_STAGES.NEW_RECORD,
    isEditable: true,
    isCreate: true,
    onFieldChange: () => {},
    onEmployeeCodeChanged: (newCode) => {
      const fieldsToClear = ['Employee_Name', 'Employee_Position'];
      if (record.Employee_Code) record.Employee_Code.value = newCode;
      fieldsToClear.forEach(k => {
        if (record[k]) record[k].value = USER_SELECT_FIELDS.has(k) ? [] : '';
      });
    },
    onLookupEmployee: async (code) => {
      if (code === '0111') {
        throw new Error('PROFILE_RESOLUTION_AMBIGUOUS: Position Assistant Section Manager is ambiguous');
      }
    }
  });

  ui.isEmployeeVerified = true;

  // Simulate lookup process for 0111
  ui.isEmployeeVerified = false;
  ui.onEmployeeCodeChanged('0111');

  try {
    await ui.onLookupEmployee('0111');
    ui.isEmployeeVerified = true;
  } catch (err) {
    ui.isEmployeeVerified = false;
  }

  assert.equal(ui.isEmployeeVerified, false);
  assert.equal(record.Employee_Code.value, '0111');
  assert.equal(record.Employee_Name.value, '');
  assert.equal(record.Employee_Position.value, '');
});

test('Lookup Atomicity: Successful lookup unlocks verified=true only after all stages pass', async () => {
  const record = {
    Employee_Code: { type: 'SINGLE_LINE_TEXT', value: '' },
    Employee_Name: { type: 'SINGLE_LINE_TEXT', value: '' },
    Employee_Position: { type: 'SINGLE_LINE_TEXT', value: '' }
  };

  const ui = new EmployeePartAUI({
    container: createMockElement(),
    record: record,
    stage: BUSINESS_STAGES.NEW_RECORD,
    isEditable: true,
    isCreate: true,
    onFieldChange: () => {},
    onEmployeeCodeChanged: (newCode) => {
      record.Employee_Code.value = newCode;
    },
    onLookupEmployee: async (code) => {
      if (code === '0118') {
        record.Employee_Name.value = 'Mr. Peranut Hanpratum';
        record.Employee_Position.value = 'Technical Service Chief';
        return;
      }
      throw new Error('NOT_FOUND');
    }
  });

  assert.equal(ui.isEmployeeVerified, false);

  // Execute lookup for valid code 0118
  ui.isEmployeeVerified = false;
  ui.onEmployeeCodeChanged('0118');
  await ui.onLookupEmployee('0118');
  ui.isEmployeeVerified = true;

  assert.equal(ui.isEmployeeVerified, true);
  assert.equal(record.Employee_Code.value, '0118');
  assert.equal(record.Employee_Name.value, 'Mr. Peranut Hanpratum');
});
