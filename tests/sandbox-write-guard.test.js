import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSandboxWriteTarget } from '../src/core/sandbox-write-guard.js';

const registry = { mboV2AppId: 900, routingMasterAppId: 901 };

test('blocks writes to protected employee master App 53', () => {
  assert.throws(() => assertSandboxWriteTarget(53, registry), /WRITE BLOCKED/);
});

test('blocks writes to protected legacy App 283', () => {
  assert.throws(() => assertSandboxWriteTarget(283, registry), /WRITE BLOCKED/);
});

test('blocks writes to an unregistered app', () => {
  assert.throws(() => assertSandboxWriteTarget(902, registry), /WRITE BLOCKED/);
});

test('allows writes to a registered sandbox app', () => {
  assert.equal(assertSandboxWriteTarget(900, registry), 900);
});

test('allows the registered MBO V2 Sandbox app', () => {
  assert.equal(assertSandboxWriteTarget(794), 794);
});

test('allows the registered Routing Master Sandbox app', () => {
  assert.equal(assertSandboxWriteTarget(795), 795);
});
