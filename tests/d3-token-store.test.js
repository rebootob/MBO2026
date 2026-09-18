import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryTokenStore, D3TokenStoreError } from '../src/server/services/d3-token-store-interface.js';

test('InMemoryTokenStore lifecycle: store, retrieve, update, delete with sessionBinding', async () => {
  const store = new InMemoryTokenStore({ isProduction: false });
  const sessionBinding = 'sess_binding_sha256_hash_value_1';
  const tokenData = {
    accessToken: 'test_access_token_123',
    refreshToken: 'test_refresh_token_456',
    expiresAt: Date.now() + 3600000
  };

  await store.storeGrant(sessionBinding, tokenData);

  const retrieved = await store.loadGrant(sessionBinding);
  assert.ok(retrieved);
  assert.equal(retrieved.accessToken, 'test_access_token_123');

  await store.invalidateGrant(sessionBinding);
  const deleted = await store.loadGrant(sessionBinding);
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
    await store.storeGrant('sess_binding_1', { accessToken: 'tok' });
  }, (err) => {
    return err instanceof D3TokenStoreError && err.code === 'STORE_UNAVAILABLE';
  });
});

test('InMemoryTokenStore rejects invalid or blank sessionBinding', async () => {
  const store = new InMemoryTokenStore({ isProduction: false });

  await assert.rejects(async () => {
    await store.storeGrant('', { accessToken: 'tok' });
  }, (err) => {
    return err instanceof D3TokenStoreError && err.code === 'INVALID_SESSION_BINDING';
  });

  await assert.rejects(async () => {
    await store.loadGrant(null);
  }, (err) => {
    return err instanceof D3TokenStoreError && err.code === 'INVALID_SESSION_BINDING';
  });
});
