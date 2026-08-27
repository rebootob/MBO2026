import test from 'node:test';
import assert from 'node:assert/strict';
import { HrDashboardService } from '../src/services/hr-dashboard-service.js';

test('HR_DASHBOARD_LOCAL: filters records accurately across department, status, and approver', () => {
  const records = [
    { Fiscal_Year: 'FY2026', Employee_Code: 'EMP001', Employee_Department: 'IT', Workflow_Status: 'DRAFT', Appraiser_1_User: 'mgr01' },
    { Fiscal_Year: 'FY2026', Employee_Code: 'EMP002', Employee_Department: 'HR', Workflow_Status: 'WAITING_APPROVAL', Appraiser_1_User: 'mgr02' },
    { Fiscal_Year: 'FY2026', Employee_Code: 'EMP003', Employee_Department: 'IT', Workflow_Status: 'WAITING_APPROVAL', Appraiser_1_User: 'mgr01' }
  ];

  const filteredIT = HrDashboardService.filterRecords(records, { department: 'IT' });
  assert.equal(filteredIT.length, 2);

  const filteredApprover = HrDashboardService.filterRecords(records, { approverUserCode: 'mgr01' });
  assert.equal(filteredApprover.length, 2);

  const filteredStatus = HrDashboardService.filterRecords(records, { status: 'WAITING_APPROVAL' });
  assert.equal(filteredStatus.length, 2);
});

test('HR_DASHBOARD_LOCAL: computes overview summary counts correctly', () => {
  const records = [
    { Workflow_Status: 'DRAFT' },
    { Workflow_Status: 'WAITING_APPROVAL' },
    { Workflow_Status: 'RETURNED' },
    { Workflow_Status: 'COMPLETED' },
    { Workflow_Status: 'WAITING_APPROVAL', Due_Date: '2020-01-01' } // Overdue
  ];

  const counts = HrDashboardService.computeOverviewCounts(records);
  assert.equal(counts.total, 5);
  assert.equal(counts.draft, 1);
  assert.equal(counts.waitingApproval, 2);
  assert.equal(counts.returned, 1);
  assert.equal(counts.completed, 1);
  assert.equal(counts.overdue, 1);
});

test('PHASE_CALENDAR_LOCAL: evaluates open, closed, and not-yet-open window states without process side effects', () => {
  const now = new Date('2026-06-15T00:00:00Z');

  // Open window
  const openRes = HrDashboardService.evaluatePhaseCalendarWindow({
    phaseName: 'Mid-Year',
    openDate: '2026-06-01T00:00:00Z',
    closeDate: '2026-06-30T00:00:00Z',
    currentDate: now
  });
  assert.equal(openRes.isOpen, true);
  assert.equal(openRes.state, 'OPEN');
  assert.equal(openRes.daysRemaining, 15);

  // Closed window
  const closedRes = HrDashboardService.evaluatePhaseCalendarWindow({
    phaseName: 'Objectives',
    openDate: '2026-04-01T00:00:00Z',
    closeDate: '2026-04-30T00:00:00Z',
    currentDate: now
  });
  assert.equal(closedRes.isOpen, false);
  assert.equal(closedRes.state, 'CLOSED');

  // Not open yet window
  const futureRes = HrDashboardService.evaluatePhaseCalendarWindow({
    phaseName: 'Self Evaluation',
    openDate: '2026-10-01T00:00:00Z',
    closeDate: '2026-10-31T00:00:00Z',
    currentDate: now
  });
  assert.equal(futureRes.isOpen, false);
  assert.equal(futureRes.state, 'NOT_OPEN_YET');
  assert.ok(futureRes.daysRemaining > 0);
});
