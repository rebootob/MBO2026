/**
 * Test-only adapter for the preserved D3-IMP-06 matrix.
 *
 * The original matrix pre-dates R1 explicit-authority arguments. This adapter
 * supplies those authorities explicitly so the historical assertions continue
 * to exercise their original subjects. R1 fail-closed behavior is tested
 * directly against the production facade in hr-routing-management-service.test.js.
 */

import * as Strict from '../../src/services/hr-routing-management-service.js';
import { D3_PROCESS_CAPABILITY_ID } from '../../src/validation/validation-engine.js';

export * from '../../src/services/hr-routing-management-service.js';

const MATRIX_PRINCIPAL = Object.freeze({ userCode: 'd3_imp_06_matrix_hr', groups: ['hr'] });

function unwrap(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'value')
    ? value.value
    : value;
}

function read(value) {
  const raw = unwrap(value);
  return raw === null || raw === undefined ? '' : String(raw);
}

function withScorerDraft(draft = {}) {
  if (
    Object.prototype.hasOwnProperty.call(draft, 'scorerPrioritySlots') ||
    Object.prototype.hasOwnProperty.call(draft, 'Scorer_Priority_Slots') ||
    Object.prototype.hasOwnProperty.call(draft, 'scorerSlots')
  ) {
    return draft;
  }
  return { ...draft, scorerPrioritySlots: '1' };
}

function withScorerRecord(record = {}) {
  if (Object.prototype.hasOwnProperty.call(record, 'Scorer_Priority_Slots')) return record;
  return { ...record, Scorer_Priority_Slots: { value: '1' } };
}

function authority(args = {}) {
  return {
    ...args,
    kExpected: args.kExpected ?? 1,
    processCapabilityId: args.processCapabilityId ?? D3_PROCESS_CAPABILITY_ID
  };
}

function historyProof(routingKey) {
  return { routingKey: read(routingKey), complete: true };
}

export function deriveNextVersionNumber(existingVersions, routingKey) {
  return Strict.deriveNextVersionNumber(existingVersions, routingKey, historyProof(routingKey));
}

export function buildCandidateRecordFromDraft(draft = {}) {
  return Strict.buildCandidateRecordFromDraft(withScorerDraft(draft));
}

export function validateRoutingDraft(draft, options = {}) {
  return Strict.validateRoutingDraft(withScorerDraft(draft), {
    ...options,
    principal: options.principal ?? MATRIX_PRINCIPAL,
    kExpected: options.kExpected ?? 1,
    processCapabilityId: options.processCapabilityId ?? D3_PROCESS_CAPABILITY_ID
  });
}

export function previewRoutingPlan(args = {}) {
  return Strict.previewRoutingPlan({
    ...args,
    principal: args.principal ?? MATRIX_PRINCIPAL,
    draft: withScorerDraft(args.draft || {}),
    kExpected: args.kExpected ?? 1,
    processCapabilityId: args.processCapabilityId ?? D3_PROCESS_CAPABILITY_ID
  });
}

export class HrRoutingManagementService extends Strict.HrRoutingManagementService {
  static validateRouteCandidate(args = {}) {
    return Strict.HrRoutingManagementService.validateRouteCandidate(authority({
      ...args,
      routeCandidate: withScorerRecord(args.routeCandidate || {})
    }));
  }

  static createDraftRoutePlan(args = {}) {
    const draftInput = withScorerRecord(args.draftInput || {});
    return Strict.HrRoutingManagementService.createDraftRoutePlan(authority({
      ...args,
      draftInput,
      historyCompleteness: args.historyCompleteness ?? historyProof(draftInput.Routing_Key)
    }));
  }

  static editDraftRoutePlan(args = {}) {
    return Strict.HrRoutingManagementService.editDraftRoutePlan(authority(args));
  }

  static createPublishRoutePlan(args = {}) {
    return Strict.HrRoutingManagementService.createPublishRoutePlan(authority(args));
  }

  static createSupersedeRoutePlan(args = {}) {
    return Strict.HrRoutingManagementService.createSupersedeRoutePlan(authority(args));
  }

  static generateRoutePreview(args = {}) {
    return Strict.HrRoutingManagementService.generateRoutePreview(authority(args));
  }

  static generateSelfElisionPreview(args = {}) {
    return Strict.HrRoutingManagementService.generateSelfElisionPreview({
      ...args,
      routeCandidate: withScorerRecord(args.routeCandidate || {}),
      kExpected: args.kExpected ?? 1
    });
  }
}
