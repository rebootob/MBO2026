import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryTokenStore, D3TokenStoreError } from '../src/server/services/d3-token-store-interface.js';

test('InMemoryTokenStore lifecycle: store, retrieve, update, delete', async () => {
  const store = new InMemoryTokenStore({ isProduction: false });
  const userCode = 'USER_001';
  const tokenData = {
    accessToken: 'test_access_token_123',
    refreshToken: 'test_refresh_token_456',
    expiresAt: Date.now() + 3600000
  };

  await store.storeGrant(userCode, tokenData);

  const retrieved = await store.loadGrant(userCode);
  assert.ok(retrieved);
  assert.equal(retrieved.accessToken, 'test_access_token_123');

  await store.invalidateGrant(userCode);
  const deleted = await store.loadGrant(userCode);
  assert.equal(deleted, null);
});

test('InMemoryTokenStore fails closed when production environment is detected', () => {
  assert.throws(() => {
    new InMemoryTokenStore({ isProduction: true });
  }, (err) => {
    return err instanceof D3TokenStoreError && err.code === 'PRODUCTION_IN_MEMORY_FORBIDDEN';
  });
});

test('InMemoryTokenStore fails closed when store is unavailable', async () => {
  const store = new InMemoryTokenStore({ isProduction: false });
  store.setUnavailable(true);

  await assert.rejects(async () => {
    await store.storeGrant('USER_01', { accessToken: 'tok' });
  }, (err) => {
    return err instanceof D3TokenStoreError && err.code === 'STORE_UNAVAILABLE';
  });
});
