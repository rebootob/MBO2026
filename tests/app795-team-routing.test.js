import test from 'node:test';
import assert from 'node:assert/strict';
import { APPROVED_TEAM_ROUTING_MANIFEST, validateTeamRoutingManifest } from '../scripts/kintone/seed-routing-baseline.js';

test('App 795 Team-Aware Routing Manifest: Contains exact 17 approved routing flows', () => {
  assert.equal(APPROVED_TEAM_ROUTING_MANIFEST.length, 17);
  assert.equal(validateTeamRoutingManifest(APPROVED_TEAM_ROUTING_MANIFEST), true);
});

test('App 795 Team-Aware Routing Keys: All 17 Routing_Keys are unique', () => {
  const keys = APPROVED_TEAM_ROUTING_MANIFEST.map(m => m.routingKey);
  const keySet = new Set(keys);
  assert.equal(keySet.size, 17);
});

test('App 795 Routing Discriminator: TMG sections require exact Team, Non-TMG sections have blank Team', () => {
  for (const item of APPROVED_TEAM_ROUTING_MANIFEST) {
    if (item.sectionCode === 'TMG1' || item.sectionCode === 'TMG2') {
      assert.notEqual(item.team, '');
      assert.equal(item.routingKey, `${item.sectionCode}|${item.team}`);
    } else {
      assert.equal(item.team, '');
      assert.equal(item.routingKey, item.sectionCode);
    }
  }
});

test('App 795 Fail-Closed Contract: Manifest rejects invalid item count or duplicate routing keys', () => {
  assert.throws(() => validateTeamRoutingManifest([]), /TEAM ROUTING MANIFEST INVALID/);
  assert.throws(() => validateTeamRoutingManifest([...APPROVED_TEAM_ROUTING_MANIFEST, { routingKey: 'TME1', sectionCode: 'TME1', sectionName: 'Dup', team: '', requesterUser: 'e1' }]), /TEAM ROUTING MANIFEST INVALID/);
});
