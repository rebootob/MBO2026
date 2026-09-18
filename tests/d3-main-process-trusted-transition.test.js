import test from 'node:test';
import assert from 'node:assert/strict';
import { handleD3BrowserTrustedTransition } from '../src/main-mbo-app.js';

test('handleD3BrowserTrustedTransition: on backend success, cancels browser native process submission', async () => {
  const mockFetch = async (url, options) => {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        status: 'TRANSITION_COMMITTED',
        recordId: 100,
        targetStage: 'OBJECTIVE',
        previousStatus: '05 Objective Approved',
        newStatus: '06 Employee Mid-Year'
      })
    };
  };

  const outcome = await handleD3BrowserTrustedTransition({
    recordId: 100,
    actionName: 'Start Mid-Year',
    endpoint: '/api/mbo/d3/transaction/prepare-transition',
    fetchFn: mockFetch
  });

  assert.equal(outcome.cancelled, true, 'Must cancel browser native transition on success');
  assert.equal(outcome.result.status, 'TRANSITION_COMMITTED');
});

test('handleD3BrowserTrustedTransition: on backend fail-closed, cancels browser native process submission', async () => {
  const mockFetch = async (url, options) => {
    return {
      ok: false,
      status: 400,
      json: async () => ({
        status: 'INVALID_STATUS_PRECONDITION'
      })
    };
  };

  const outcome = await handleD3BrowserTrustedTransition({
    recordId: 100,
    actionName: 'Start Mid-Year',
    endpoint: '/api/mbo/d3/transaction/prepare-transition',
    fetchFn: mockFetch
  });

  assert.equal(outcome.cancelled, true, 'Must cancel browser native transition on backend 4xx fail-closed');
  assert.equal(outcome.error, 'INVALID_STATUS_PRECONDITION');
  assert.equal(outcome.statusCode, 400);
});

test('handleD3BrowserTrustedTransition: on HTTP error (500), cancels browser native process submission', async () => {
  const mockFetch = async (url, options) => {
    return {
      ok: false,
      status: 500,
      json: async () => ({
        status: 'INTERNAL_SERVER_ERROR'
      })
    };
  };

  const outcome = await handleD3BrowserTrustedTransition({
    recordId: 100,
    actionName: 'Start Mid-Year',
    endpoint: '/api/mbo/d3/transaction/prepare-transition',
    fetchFn: mockFetch
  });

  assert.equal(outcome.cancelled, true, 'Must cancel browser native transition on HTTP 500 error');
  assert.equal(outcome.statusCode, 500);
});

test('handleD3BrowserTrustedTransition: on network error, cancels browser native process submission', async () => {
  const mockFetch = async () => {
    throw new Error('NETWORK_CONNECTION_DROPPED');
  };

  const outcome = await handleD3BrowserTrustedTransition({
    recordId: 100,
    actionName: 'Start Mid-Year',
    endpoint: '/api/mbo/d3/transaction/prepare-transition',
    fetchFn: mockFetch
  });

  assert.equal(outcome.cancelled, true, 'Must cancel browser native transition on network error');
  assert.equal(outcome.error, 'NETWORK_OR_TRANSPORT_ERROR');
});
