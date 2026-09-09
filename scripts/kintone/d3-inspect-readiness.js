/**
 * D3-IMP-02 — Readiness Inspector for D3 Target Schemas and Records
 *
 * Validates locally:
 * - App 795 target schema and record constraints (Model A, intervals, 1-user/ALL)
 * - App 794 target schema (five logical provenance fields)
 * - App 798 archive contract completeness (0 new physical fields, 11 archive primitives)
 *
 * Performs ZERO Kintone reads/writes and ZERO network operations.
 */

import { routingFields, mboFields, revisionArchiveFields } from '../../config/schema-spec.js';
import { D3_ROUTE_PATTERNS } from '../../src/config/d3-route-contract.js';

delete process.env.KINTONE_API_TOKEN;

export const APP794_FIVE_PROVENANCE_FIELDS = Object.freeze([
  'Frozen_Profile_Code',
  'K_expected_Snapshot',
  'Effective_Routing_Key',
  'Effective_Route_Version_Key',
  'Effective_Scorer_Slots_Snapshot'
]);

export const APP798_ELEVEN_ARCHIVE_PRIMITIVES = Object.freeze([
  'Archive_Key',
  'Source_Record_Key',
  'Evaluation_Stage',
  'Revision_Number',
  'Superseded_By_Revision',
  'Event_Type',
  'Reason',
  'Snapshot_JSON',
  'Snapshot_Hash',
  'Archived_By',
  'Archived_At'
]);

export const APP795_REQUIRED_TARGET_FIELDS = Object.freeze([
  'Routing_Key',
  'Version_Key',
  'Version_Number',
  'Version_Status',
  'Route_Pattern',
  'Scorer_Priority_Slots',
  'Effective_From'
]);

function extractUsers(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && Array.isArray(value.value)) return value.value;
  return [];
}

function extractString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value.value !== undefined) return String(value.value).trim();
  return String(value).trim();
}

/**
 * Inspects App 795, App 794, and App 798 schema specifications and optional records.
 *
 * @param {Object} [params]
 * @param {Object} [params.app795Schema] - App 795 field specification (defaults to routingFields)
 * @param {Object} [params.app794Schema] - App 794 field specification (defaults to mboFields)
 * @param {Object} [params.app798Schema] - App 798 field specification (defaults to revisionArchiveFields)
 * @param {Array<Object>} [params.app795Records] - Optional App 795 records to validate
 * @returns {Object} Deterministic machine-readable readiness assessment
 */
export function inspectD3Readiness({
  app795Schema = routingFields,
  app794Schema = mboFields,
  app798Schema = revisionArchiveFields,
  app795Records = []
} = {}) {
  const errors = [];
  const warnings = [];

  // 1. App 795 Schema Inspection
  const app795Checks = [];

  for (const fieldCode of APP795_REQUIRED_TARGET_FIELDS) {
    const field = app795Schema[fieldCode];
    if (!field) {
      errors.push(`App795 Schema: Missing required field "${fieldCode}".`);
      app795Checks.push({ check: `field_exists_${fieldCode}`, passed: false });
    } else {
      app795Checks.push({ check: `field_exists_${fieldCode}`, passed: true });
    }
  }

  // Routing_Key unique = false
  if (app795Schema.Routing_Key) {
    const unique = app795Schema.Routing_Key.unique;
    if (unique === false) {
      app795Checks.push({ check: 'Routing_Key_unique_false', passed: true });
    } else {
      errors.push('App795 Schema: Routing_Key.unique must be false for Model A.');
      app795Checks.push({ check: 'Routing_Key_unique_false', passed: false });
    }
  }

  // Version_Key unique = true, required = true
  if (app795Schema.Version_Key) {
    const unique = app795Schema.Version_Key.unique === true;
    const required = app795Schema.Version_Key.required === true;
    if (unique && required) {
      app795Checks.push({ check: 'Version_Key_unique_and_required', passed: true });
    } else {
      errors.push(`App795 Schema: Version_Key must be required and unique=true (unique=${unique}, required=${required}).`);
      app795Checks.push({ check: 'Version_Key_unique_and_required', passed: false });
    }
  }

  // Version_Number required = true, minValue >= 1
  if (app795Schema.Version_Number) {
    const required = app795Schema.Version_Number.required === true;
    const isNum = app795Schema.Version_Number.type === 'NUMBER';
    if (required && isNum) {
      app795Checks.push({ check: 'Version_Number_number_and_required', passed: true });
    } else {
      errors.push('App795 Schema: Version_Number must be required NUMBER.');
      app795Checks.push({ check: 'Version_Number_number_and_required', passed: false });
    }
  }

  // Version_Status options
  if (app795Schema.Version_Status) {
    const opts = app795Schema.Version_Status.options || {};
    const expected = ['DRAFT', 'ACTIVE', 'CANCELLED', 'SUPERSEDED'];
    const hasAll = expected.every(opt => Boolean(opts[opt]));
    if (hasAll && app795Schema.Version_Status.type === 'DROP_DOWN') {
      app795Checks.push({ check: 'Version_Status_lifecycle_options', passed: true });
    } else {
      errors.push(`App795 Schema: Version_Status must be DROP_DOWN with options [${expected.join(', ')}].`);
      app795Checks.push({ check: 'Version_Status_lifecycle_options', passed: false });
    }
  }

  // Effective_From required DATE
  if (app795Schema.Effective_From) {
    const isDate = app795Schema.Effective_From.type === 'DATE';
    const required = app795Schema.Effective_From.required === true;
    if (isDate && required) {
      app795Checks.push({ check: 'Effective_From_required_date', passed: true });
    } else {
      errors.push('App795 Schema: Effective_From must be a required DATE field.');
      app795Checks.push({ check: 'Effective_From_required_date', passed: false });
    }
  }

  // Effective_To optional DATE
  if (app795Schema.Effective_To) {
    const isDate = app795Schema.Effective_To.type === 'DATE';
    const optional = app795Schema.Effective_To.required !== true;
    if (isDate && optional) {
      app795Checks.push({ check: 'Effective_To_optional_date', passed: true });
    } else {
      errors.push('App795 Schema: Effective_To must be an optional DATE field.');
      app795Checks.push({ check: 'Effective_To_optional_date', passed: false });
    }
  }

  // 2. App 794 Schema Inspection (Five provenance fields)
  const app794Checks = [];
  for (const fieldCode of APP794_FIVE_PROVENANCE_FIELDS) {
    const field = app794Schema[fieldCode];
    if (!field) {
      errors.push(`App794 Schema: Missing required provenance field "${fieldCode}".`);
      app794Checks.push({ check: `provenance_field_${fieldCode}`, passed: false });
    } else {
      app794Checks.push({ check: `provenance_field_${fieldCode}`, passed: true });
    }
  }

  // K_expected_Snapshot valid domain 1..2
  if (app794Schema.K_expected_Snapshot) {
    const isNum = app794Schema.K_expected_Snapshot.type === 'NUMBER';
    const min = app794Schema.K_expected_Snapshot.minValue;
    const max = app794Schema.K_expected_Snapshot.maxValue;
    if (isNum && min === '1' && max === '2') {
      app794Checks.push({ check: 'K_expected_domain_1_or_2', passed: true });
    } else {
      warnings.push('App794 Schema: K_expected_Snapshot domain should specify minValue 1 and maxValue 2.');
      app794Checks.push({ check: 'K_expected_domain_1_or_2', passed: true });
    }
  }

  // 3. App 798 Schema Inspection (Zero new physical fields, 11 archive primitives present)
  const app798Checks = [];
  for (const fieldCode of APP798_ELEVEN_ARCHIVE_PRIMITIVES) {
    const field = app798Schema[fieldCode];
    if (!field) {
      errors.push(`App798 Schema: Missing archive primitive field "${fieldCode}".`);
      app798Checks.push({ check: `archive_primitive_${fieldCode}`, passed: false });
    } else {
      app798Checks.push({ check: `archive_primitive_${fieldCode}`, passed: true });
    }
  }

  // 4. App 795 Records Inspection (if provided)
  const recordChecks = [];
  if (Array.isArray(app795Records) && app795Records.length > 0) {
    const intervalsByRoutingKey = new Map();

    for (let i = 0; i < app795Records.length; i++) {
      const record = app795Records[i];
      const rk = extractString(record.Routing_Key);
      const vk = extractString(record.Version_Key);
      const ef = extractString(record.Effective_From);
      const et = extractString(record.Effective_To);
      const pat = extractString(record.Route_Pattern);

      if (!rk) {
        errors.push(`App795 Record [${i}]: Missing Routing_Key.`);
      }

      if (vk && !/^.+#[vV]\d+$/.test(vk)) {
        errors.push(`App795 Record [${i}] (${rk}): Version_Key "${vk}" does not match <Routing_Key>#v<N> pattern.`);
      }

      if (ef && et && et < ef) {
        errors.push(`App795 Record [${i}] (${rk}): Effective_To (${et}) is earlier than Effective_From (${ef}).`);
      }

      // Interval overlap check for ACTIVE versions
      const status = extractString(record.Version_Status) || 'ACTIVE';
      if (status === 'ACTIVE' && ef) {
        const intervals = intervalsByRoutingKey.get(rk) || [];
        const curFrom = ef;
        const curTo = et || '9999-12-31';

        for (const existing of intervals) {
          if (curFrom <= existing.to && curTo >= existing.from) {
            errors.push(`App795 Record [${i}] (${rk}): Overlapping active date interval [${curFrom}, ${curTo}] with version "${existing.vk}".`);
          }
        }
        intervals.push({ vk, from: curFrom, to: curTo });
        intervalsByRoutingKey.set(rk, intervals);
      }

      // 1 user per slot and ALL rule
      if (pat && D3_ROUTE_PATTERNS[pat]) {
        const patternDef = D3_ROUTE_PATTERNS[pat];
        const slotMap = {
          M1: { users: extractUsers(record.Manager_Level1_Approvers || record.Manager_User), rule: extractString(record.Manager_Level1_Approval_Rule) },
          M2: { users: extractUsers(record.Manager_Level2_Approvers || record.First_Manager_User), rule: extractString(record.Manager_Level2_Approval_Rule) },
          G1: { users: extractUsers(record.GM_Level1_Approvers || record.GM_User), rule: extractString(record.GM_Level1_Approval_Rule) },
          G2: { users: extractUsers(record.GM_Level2_Approvers), rule: extractString(record.GM_Level2_Approval_Rule) }
        };

        for (const slot of ['M1', 'M2', 'G1', 'G2']) {
          const isActive = patternDef.sourceSlots.includes(slot);
          const state = slotMap[slot];
          if (isActive) {
            if (state.users.length !== 1) {
              errors.push(`App795 Record [${i}] (${rk}): Slot ${slot} must have exactly 1 user in D3 V1 (got ${state.users.length}).`);
            }
            if (state.rule && state.rule !== 'ALL') {
              errors.push(`App795 Record [${i}] (${rk}): Slot ${slot} rule must be ALL (got "${state.rule}").`);
            }
          } else if (state.users.length > 0) {
            errors.push(`App795 Record [${i}] (${rk}): Inactive slot ${slot} must be empty for pattern ${pat}.`);
          }
        }
      }

      // Validate Scorer_Priority_Slots for each App 795 record
      const rawScorer = record.Scorer_Priority_Slots;
      const scorerVal = typeof rawScorer === 'object' && rawScorer !== null && 'value' in rawScorer
        ? rawScorer.value
        : rawScorer;

      if (scorerVal === undefined || scorerVal === null || (typeof scorerVal === 'string' && !scorerVal.trim())) {
        errors.push(`App795 Record [${i}] (${rk}): SCORER_PLAN_NOT_CONFIGURED: Scorer_Priority_Slots is missing or blank.`);
      } else {
        let slots;
        if (Array.isArray(scorerVal)) {
          slots = scorerVal;
        } else if (typeof scorerVal === 'string') {
          const trimmed = scorerVal.trim();
          if (trimmed.startsWith('[')) {
            try {
              slots = JSON.parse(trimmed);
            } catch {
              errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Scorer_Priority_Slots contains malformed JSON.`);
            }
          } else {
            slots = trimmed.split(',').map(s => s.trim());
          }
        } else {
          errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Unsupported Scorer_Priority_Slots shape.`);
        }

        if (slots !== undefined) {
          if (!Array.isArray(slots) || slots.length === 0) {
            errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Scorer priority slots must be a non-empty ordered array.`);
          } else {
            const patternDef = pat && D3_ROUTE_PATTERNS[pat] ? D3_ROUTE_PATTERNS[pat] : null;
            const maxActive = patternDef ? patternDef.sourceSlots.length : 4;
            const parsedSlots = [];
            let valid = true;

            for (const item of slots) {
              const parsed = Number(item);
              if (!Number.isInteger(parsed) || parsed < 1) {
                errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Scorer slot "${String(item)}" must be a positive integer.`);
                valid = false;
                break;
              }
              if (parsed > maxActive) {
                errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Scorer slot ${parsed} exceeds active route length (${maxActive}) for pattern ${pat || 'UNKNOWN'}.`);
                valid = false;
                break;
              }
              parsedSlots.push(parsed);
            }

            if (valid) {
              if (new Set(parsedSlots).size !== parsedSlots.length) {
                errors.push(`App795 Record [${i}] (${rk}): INVALID_SCORER_PLAN: Scorer priority slots must be distinct.`);
              }
            }
          }
        }
      }
    }
  }

  const isReady = errors.length === 0;
  const hasApp795Error = errors.some(e => e.startsWith('App795'));
  const hasApp794Error = errors.some(e => e.startsWith('App794'));
  const hasApp798Error = errors.some(e => e.startsWith('App798'));

  return {
    ready: isReady,
    app795: {
      status: (app795Checks.every(c => c.passed) && !hasApp795Error) ? 'PASS' : 'FAIL',
      checks: app795Checks
    },
    app794: {
      status: (app794Checks.every(c => c.passed) && !hasApp794Error) ? 'PASS' : 'FAIL',
      checks: app794Checks
    },
    app798: {
      status: (app798Checks.every(c => c.passed) && !hasApp798Error) ? 'PASS' : 'FAIL',
      checks: app798Checks
    },
    errors,
    warnings
  };
}

if (process.argv[1] && process.argv[1].endsWith('d3-inspect-readiness.js')) {
  const result = inspectD3Readiness();
  console.log(JSON.stringify(result, null, 2));
}
