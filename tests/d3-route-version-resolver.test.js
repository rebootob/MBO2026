import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveEffectiveRouteVersion,
  D3RouteVersionResolutionError
} from '../src/services/d3-route-version-resolver.js';

function route({
  key = 'TME1',
  version,
  status = 'ACTIVE',
  from,
  to = ''
}) {
  return {
    Routing_Key: { value: key },
    Version_Key: { value: `${key}#v${version}` },
    Version_Number: { value: String(version) },
    Version_Status: { value: status },
    Effective_From: { value: from },
    Effective_To: { value: to }
  };
}

test('Model A: future ACTIVE version has zero effect before Effective_From', () => {
  const records = [
    route({ version: 1, from: '2026-04-01', to: '2026-09-30' }),
    route({ version: 2, from: '2026-10-01' })
  ];

  const sep30 = resolveEffectiveRouteVersion({
    records,
    routingKey: 'TME1',
    at: '2026-09-30'
  });
  assert.equal(sep30.versionKey, 'TME1#v1');

  const oct1 = resolveEffectiveRouteVersion({
    records,
    routingKey: 'TME1',
    at: '2026-10-01'
  });
  assert.equal(oct1.versionKey, 'TME1#v2');
});

test('Model A: DRAFT and SUPERSEDED versions never participate', () => {
  const records = [
    route({ version: 1, status: 'SUPERSEDED', from: '2026-04-01' }),
    route({ version: 2, status: 'DRAFT', from: '2026-04-01' }),
    route({ version: 3, status: 'ACTIVE', from: '2026-04-01' })
  ];

  const resolved = resolveEffectiveRouteVersion({
    records,
    routingKey: 'TME1',
    at: '2026-09-09'
  });

  assert.equal(resolved.versionKey, 'TME1#v3');
});

test('Model A: intentional gap fails closed with NO_EFFECTIVE_ROUTE', () => {
  const records = [
    route({ version: 1, from: '2026-04-01', to: '2026-08-31' }),
    route({ version: 2, from: '2026-10-01' })
  ];

  assert.throws(
    () => resolveEffectiveRouteVersion({
      records,
      routingKey: 'TME1',
      at: '2026-09-09'
    }),
    error =>
      error instanceof D3RouteVersionResolutionError &&
      error.code === 'NO_EFFECTIVE_ROUTE'
  );
});

test('Model A: overlapping ACTIVE intervals fail closed with AMBIGUOUS_EFFECTIVE_ROUTE', () => {
  const records = [
    route({ version: 1, from: '2026-04-01', to: '2026-12-31' }),
    route({ version: 2, from: '2026-09-01' })
  ];

  assert.throws(
    () => resolveEffectiveRouteVersion({
      records,
      routingKey: 'TME1',
      at: '2026-09-09'
    }),
    error =>
      error instanceof D3RouteVersionResolutionError &&
      error.code === 'AMBIGUOUS_EFFECTIVE_ROUTE'
  );
});

test('Model A: invalid ACTIVE interval fails closed before selection', () => {
  const records = [
    route({ version: 1, from: '2026-10-01', to: '2026-09-30' })
  ];

  assert.throws(
    () => resolveEffectiveRouteVersion({
      records,
      routingKey: 'TME1',
      at: '2026-09-09'
    }),
    error =>
      error instanceof D3RouteVersionResolutionError &&
      error.code === 'INVALID_EFFECTIVE_INTERVAL'
  );
});

test('Model A: exact Routing_Key isolation', () => {
  const records = [
    route({ key: 'TME1', version: 1, from: '2026-04-01' }),
    route({ key: 'TMF1', version: 1, from: '2026-04-01' })
  ];

  const resolved = resolveEffectiveRouteVersion({
    records,
    routingKey: 'TMF1',
    at: '2026-09-09'
  });

  assert.equal(resolved.routingKey, 'TMF1');
  assert.equal(resolved.versionKey, 'TMF1#v1');
});
