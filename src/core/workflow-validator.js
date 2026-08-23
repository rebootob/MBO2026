import { assertSandboxWriteTarget } from './sandbox-write-guard.js';

const TYPES = new Set(['ONE', 'ALL', 'ANY']);
const ENTITY_TYPES = new Set(['USER_SELECT', 'GROUP_SELECT', 'ORGANIZATION_SELECT', 'CREATOR', 'MODIFIER']);

export function validateWorkflowPayload(payload, fieldTypes) {
  assertSandboxWriteTarget(payload.app);
  if (typeof payload.enable !== 'boolean' || !payload.states || Array.isArray(payload.states) || !Array.isArray(payload.actions)) throw new Error('Invalid workflow root payload.');
  const names = new Set(Object.values(payload.states).map((state) => state.name));
  for (const [key, state] of Object.entries(payload.states)) {
    if (!state?.name || (state.name !== key && key !== 'Not started') || !Number.isInteger(Number(state.index)) || !TYPES.has(state.assignee?.type) || !Array.isArray(state.assignee.entities)) throw new Error(`Invalid state: ${key}.`);
    for (const item of state.assignee.entities) {
      if (!item?.entity?.type || (item.entity.type === 'FIELD_ENTITY' && !ENTITY_TYPES.has(fieldTypes[item.entity.code]))) throw new Error(`Invalid assignee field: ${item?.entity?.code ?? 'unknown'}.`);
    }
  }
  for (const action of payload.actions) if (!action?.name || !names.has(action.from) || !names.has(action.to) || typeof action.filterCond !== 'string') throw new Error(`Invalid action: ${action?.name ?? 'unknown'}.`);
  return true;
}
