import { D3_ROUTE_PATTERNS, D3_SLOT_DEFINITIONS } from '../config/d3-route-contract.js';

/**
 * Canonical Stage Logical Snapshot Builder (Shared Pure Module).
 *
 * Deterministic pure transformation over authoritative record state.
 * Strictly enforces exact persisted values and fails closed without fallbacks.
 * Zero browser globals, zero credentials, zero network calls.
 *
 * @param {object} record Authoritative Kintone App 794 record
 * @param {string} targetStage Target evaluation stage ('OBJECTIVE' | 'MIDYEAR' | 'FINAL')
 * @param {string} currentStatus Current workflow status
 * @returns {object} Canonical D3 logical snapshot
 */
export function buildStageLogicalSnapshot(record, targetStage, currentStatus) {
  const getVal = (f) => (record && record[f] && typeof record[f] === 'object' && 'value' in record[f]) ? record[f].value : record?.[f];

  const sourceRecordKey = String(getVal('Record_Key') || '').trim();
  if (!sourceRecordKey) {
    throw new Error('PROVENANCE_MISSING: Record_Key is required');
  }

  const employeeCode = String(getVal('Employee_Code') || '').trim();
  if (!employeeCode) {
    throw new Error('PROVENANCE_MISSING: Employee_Code is required');
  }

  const fiscalYear = String(getVal('Fiscal_Year') || '').trim();
  if (!fiscalYear) {
    throw new Error('PROVENANCE_MISSING: Fiscal_Year is required');
  }

  const rawRecordId = Number(getVal('$id') || getVal('Record_ID') || 0);

  // Revision authority: Kintone native $revision is the live authoritative source.
  // Custom fields Revision_Number / Current_Revision_Number do not exist in App794 live schema.
  // $revision Kintone shape: { value: "10" } — a string-valued integer.
  const rawRevSystem = getVal('$revision');
  const rawRevCustom = getVal('Revision_Number') ?? getVal('Current_Revision_Number');
  const rawRev = rawRevSystem ?? rawRevCustom;
  const revisionNumber = Number(rawRev);
  if (!Number.isInteger(revisionNumber) || revisionNumber < 1) {
    throw new Error(`PROVENANCE_INVALID: Revision_Number must be a positive integer, got "${rawRev}"`);
  }

  const frozenProfileCode = String(getVal('Frozen_Profile_Code') || getVal('Profile_Code') || '').trim();
  if (!frozenProfileCode) {
    throw new Error('PROVENANCE_MISSING: Frozen_Profile_Code is required');
  }

  const rawK = getVal('K_expected_Snapshot');
  const kExpected = Number(rawK);
  if (kExpected !== 1 && kExpected !== 2) {
    throw new Error(`PROVENANCE_INVALID: K_expected_Snapshot must be 1 or 2, got "${rawK}"`);
  }

  // Route_Pattern does NOT exist in App794 live schema.
  // Routing_Topology IS a live App794 field. Derive Route_Pattern deterministically
  // from the locked D3_ROUTE_PATTERNS contract using Routing_Topology.
  const routingTopology = String(getVal('Routing_Topology') || '').trim();
  if (!routingTopology) {
    throw new Error('PROVENANCE_MISSING: Routing_Topology is required');
  }

  // Build topology→pattern lookup once from the authoritative D3_ROUTE_PATTERNS contract.
  const topologyToPattern = Object.fromEntries(
    Object.entries(D3_ROUTE_PATTERNS).map(([patternKey, def]) => [def.topology, patternKey])
  );
  const routePattern = topologyToPattern[routingTopology];
  if (!routePattern) {
    throw new Error(`PROVENANCE_INVALID: Routing_Topology "${routingTopology}" has no locked D3 route pattern mapping`);
  }
  const patternDef = D3_ROUTE_PATTERNS[routePattern];

  const effectiveRoutingKey = String(getVal('Effective_Routing_Key') || '').trim();
  if (!effectiveRoutingKey) {
    throw new Error('PROVENANCE_MISSING: Effective_Routing_Key is required');
  }
  const effectiveRouteVersionKey = String(getVal('Effective_Route_Version_Key') || '').trim();
  if (!effectiveRouteVersionKey) {
    throw new Error('PROVENANCE_MISSING: Effective_Route_Version_Key is required');
  }

  // Workflow appraisers: strictly mapped from active slots defined in D3_ROUTE_PATTERNS
  // Enforce single user per active slot, approvalRule === 'ALL', fail-closed on duplicates/missing
  const workflowAppraisers = [];
  for (const slotId of patternDef.sourceSlots) {
    const slotDef = D3_SLOT_DEFINITIONS[slotId];
    if (!slotDef) {
      throw new Error(`PROVENANCE_INVALID: Unknown slot definition "${slotId}"`);
    }

    // Approval rule must strictly be "ALL"
    const ruleVal = String(getVal(slotDef.approvalRuleField) || '').trim();
    if (ruleVal !== 'ALL') {
      throw new Error(
        `PROVENANCE_INVALID: Approval rule for slot ${slotId} (${slotDef.approvalRuleField}) must be "ALL", received: "${ruleVal}"`
      );
    }

    // Physical USER_SELECT field
    let rawApprover = getVal(slotDef.approverField);
    if (
      (rawApprover === undefined || rawApprover === null || (Array.isArray(rawApprover) && rawApprover.length === 0)) &&
      slotDef.legacyApproverField
    ) {
      rawApprover = getVal(slotDef.legacyApproverField);
    }

    let userList = [];
    if (Array.isArray(rawApprover)) {
      userList = rawApprover;
    } else if (rawApprover && typeof rawApprover === 'object') {
      userList = [rawApprover];
    } else if (typeof rawApprover === 'string' && rawApprover.trim()) {
      userList = [{ code: rawApprover.trim() }];
    }

    if (userList.length === 0) {
      throw new Error(
        `PROVENANCE_MISSING: Missing approver for active slot ${slotId} (${slotDef.approverField})`
      );
    }
    if (userList.length > 1) {
      throw new Error(
        `PROVENANCE_INVALID: Active slot ${slotId} (${slotDef.approverField}) must have exactly one user, found ${userList.length}`
      );
    }

    const appraiserCode = String(userList[0]?.code || userList[0]?.value || '').trim();
    if (!appraiserCode) {
      throw new Error(
        `PROVENANCE_INVALID: Active slot ${slotId} (${slotDef.approverField}) user has blank code`
      );
    }

    workflowAppraisers.push({ code: appraiserCode });
  }

  const seenAppraisers = new Set();
  for (const a of workflowAppraisers) {
    if (seenAppraisers.has(a.code)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate appraiser code in workflow: "${a.code}"`);
    }
    seenAppraisers.add(a.code);
  }

  if (workflowAppraisers.length !== patternDef.sourceSlots.length) {
    throw new Error(`PROVENANCE_MISMATCH: Workflow_Appraisers count (${workflowAppraisers.length}) does not match route pattern slot count (${patternDef.sourceSlots.length})`);
  }

  // Scorers: must come strictly from persisted Effective_Scorer_Slots_Snapshot (DEC-036 locked weights)
  const rawScorerSnapshot = getVal('Effective_Scorer_Slots_Snapshot');
  if (rawScorerSnapshot === undefined || rawScorerSnapshot === null || String(rawScorerSnapshot).trim() === '') {
    throw new Error('PROVENANCE_MISSING: Effective_Scorer_Slots_Snapshot is required');
  }

  let parsedSlots;
  try {
    parsedSlots = typeof rawScorerSnapshot === 'string' ? JSON.parse(rawScorerSnapshot) : rawScorerSnapshot;
  } catch (err) {
    throw new Error('PROVENANCE_MALFORMED: Effective_Scorer_Slots_Snapshot contains malformed JSON');
  }

  if (!Array.isArray(parsedSlots) || parsedSlots.length === 0) {
    throw new Error('PROVENANCE_INVALID: Effective_Scorer_Slots_Snapshot must be a non-empty array');
  }

  if (parsedSlots.length !== kExpected) {
    throw new Error(
      `PROVENANCE_MISMATCH: Scorer slot count (${parsedSlots.length}) does not match K_expected_Snapshot (${kExpected})`
    );
  }

  const seenOrdinals = new Set();
  for (const ordinal of parsedSlots) {
    if (!Number.isInteger(ordinal)) {
      throw new Error(`PROVENANCE_MALFORMED: Effective_Scorer_Slots_Snapshot ordinals must be integers, got: ${ordinal}`);
    }
    if (ordinal < 1 || ordinal > workflowAppraisers.length) {
      throw new Error(
        `PROVENANCE_MISMATCH: Scorer slot ordinal ${ordinal} out of range (1..${workflowAppraisers.length})`
      );
    }
    if (seenOrdinals.has(ordinal)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate scorer slot ordinal: ${ordinal}`);
    }
    seenOrdinals.add(ordinal);
  }

  // DEC-036 exact weight authority: K=1 -> [100], K=2 -> [50, 50]
  const dec036Weights = kExpected === 1 ? [100] : [50, 50];
  const scorers = [];
  const seenScorers = new Set();
  for (let idx = 0; idx < parsedSlots.length; idx++) {
    const ord = parsedSlots[idx];
    const scorerCode = workflowAppraisers[ord - 1].code;
    if (seenScorers.has(scorerCode)) {
      throw new Error(`PROVENANCE_DUPLICATE: Duplicate scorer identity: "${scorerCode}"`);
    }
    seenScorers.add(scorerCode);
    scorers.push({
      code: scorerCode,
      weight: dec036Weights[idx]
    });
  }

  // Department_Hoshin_Key is NOT an authoritative App794 live field (CONTRACT_DECISION: NO_AUTHORITY_FOUND).
  // It MUST NOT block the D3 stage snapshot. Read as optional; set undefined when absent so serializer omits it.
  const rawDepartmentHoshinKey = String(getVal('Department_Hoshin_Key') || '').trim();
  const departmentHoshinKey = rawDepartmentHoshinKey || undefined;

  const configurationHash = String(getVal('Configuration_Hash') || '').trim();
  if (!configurationHash) {
    throw new Error('PROVENANCE_MISSING: Configuration_Hash is required');
  }

  // Business snapshot: read physical fields from App 794 schema (Objective_Count & Objective matrix 1..10)
  const rawObjectiveCount = getVal('Objective_Count');
  if (rawObjectiveCount === undefined || rawObjectiveCount === null || String(rawObjectiveCount).trim() === '') {
    throw new Error('PROVENANCE_MISSING: Objective_Count is required');
  }
  const objectiveCount = Number(rawObjectiveCount);
  if (!Number.isInteger(objectiveCount) || objectiveCount < 2 || objectiveCount > 10) {
    throw new Error(`PROVENANCE_INVALID: Objective_Count must be an integer between 2 and 10, got "${rawObjectiveCount}"`);
  }

  const rawPartARawScore = getVal('PartA_Raw_Score');
  if (rawPartARawScore === undefined || rawPartARawScore === null || String(rawPartARawScore).trim() === '') {
    throw new Error('PROVENANCE_MISSING: PartA_Raw_Score is required');
  }
  const partARawScore = Number(rawPartARawScore);
  if (!Number.isFinite(partARawScore)) {
    throw new Error(`PROVENANCE_INVALID: PartA_Raw_Score must be a finite number, got "${rawPartARawScore}"`);
  }

  const objectives = [];
  for (let i = 1; i <= objectiveCount; i++) {
    const rawObjective = getVal(`Objective_${i}`);
    if (rawObjective === undefined || rawObjective === null || String(rawObjective).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Objective_${i} is required for objective ${i}`);
    }
    const rawActionPlan = getVal(`Action_Plan_${i}`);
    if (rawActionPlan === undefined || rawActionPlan === null || String(rawActionPlan).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Action_Plan_${i} is required for objective ${i}`);
    }
    const rawWeight = getVal(`Weight_${i}`);
    if (rawWeight === undefined || rawWeight === null || String(rawWeight).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Weight_${i} is required for objective ${i}`);
    }
    const weightNum = Number(rawWeight);
    if (!Number.isFinite(weightNum) || weightNum < 0 || weightNum > 100) {
      throw new Error(`PROVENANCE_INVALID: Weight_${i} must be a number between 0 and 100, got "${rawWeight}"`);
    }
    const rawDifficulty = getVal(`Difficulty_${i}`);
    if (rawDifficulty === undefined || rawDifficulty === null || String(rawDifficulty).trim() === '') {
      throw new Error(`PROVENANCE_MISSING: Difficulty_${i} is required for objective ${i}`);
    }
    const difficultyNum = Number(rawDifficulty);
    if (!Number.isFinite(difficultyNum) || difficultyNum < 1 || difficultyNum > 4) {
      throw new Error(`PROVENANCE_INVALID: Difficulty_${i} must be an integer between 1 and 4, got "${rawDifficulty}"`);
    }

    const item = {
      index: i,
      Objective: String(rawObjective).trim(),
      Action_Plan: String(rawActionPlan).trim(),
      Weight: weightNum,
      Difficulty: difficultyNum,
      Additional_Agreement: getVal(`Additional_Agreement_${i}`) ?? '',
      Objective_Attachment: getVal(`Objective_Attachment_${i}`) ?? [],
      Progress_Percent: (getVal(`Progress_Percent_${i}`) !== undefined && getVal(`Progress_Percent_${i}`) !== null && getVal(`Progress_Percent_${i}`) !== '') ? Number(getVal(`Progress_Percent_${i}`)) : '',
      Periodical_Review: getVal(`Periodical_Review_${i}`) ?? '',
      MidYear_Result: getVal(`MidYear_Result_${i}`) ?? '',
      MidYear_Issue_Risk: getVal(`MidYear_Issue_Risk_${i}`) ?? '',
      MidYear_Next_Action: getVal(`MidYear_Next_Action_${i}`) ?? '',
      MidYear_Attachment: getVal(`MidYear_Attachment_${i}`) ?? [],
      Actual_Result: getVal(`Actual_Result_${i}`) ?? '',
      Self_Achievement: (getVal(`Self_Achievement_${i}`) !== undefined && getVal(`Self_Achievement_${i}`) !== null && getVal(`Self_Achievement_${i}`) !== '') ? Number(getVal(`Self_Achievement_${i}`)) : '',
      Self_Comment: getVal(`Self_Comment_${i}`) ?? '',
      Final_Attachment: getVal(`Final_Attachment_${i}`) ?? [],
      Manager_Achievement: (getVal(`Manager_Achievement_${i}`) !== undefined && getVal(`Manager_Achievement_${i}`) !== null && getVal(`Manager_Achievement_${i}`) !== '') ? Number(getVal(`Manager_Achievement_${i}`)) : '',
      Manager_Objective_Score: (getVal(`Manager_Objective_Score_${i}`) !== undefined && getVal(`Manager_Objective_Score_${i}`) !== null && getVal(`Manager_Objective_Score_${i}`) !== '') ? Number(getVal(`Manager_Objective_Score_${i}`)) : '',
      Manager_Comment: getVal(`Manager_Comment_${i}`) ?? '',
      GM_Achievement: (getVal(`GM_Achievement_${i}`) !== undefined && getVal(`GM_Achievement_${i}`) !== null && getVal(`GM_Achievement_${i}`) !== '') ? Number(getVal(`GM_Achievement_${i}`)) : '',
      GM_Objective_Score: (getVal(`GM_Objective_Score_${i}`) !== undefined && getVal(`GM_Objective_Score_${i}`) !== null && getVal(`GM_Objective_Score_${i}`) !== '') ? Number(getVal(`GM_Objective_Score_${i}`)) : '',
      GM_Comment: getVal(`GM_Comment_${i}`) ?? ''
    };
    objectives.push(item);
  }

  return {
    source: {
      Record_Key: sourceRecordKey,
      Employee_Code: employeeCode,
      Fiscal_Year: fiscalYear,
      ...(rawRecordId > 0 ? { Record_ID: rawRecordId } : {})
    },
    stage: {
      Evaluation_Stage: targetStage,
      Revision_Number: revisionNumber,
      Previous_Status: String(currentStatus || '').trim()
    },
    profile: {
      Frozen_Profile_Code: frozenProfileCode,
      K_expected_Snapshot: kExpected
    },
    route: {
      Effective_Routing_Key: effectiveRoutingKey,
      Effective_Route_Version_Key: effectiveRouteVersionKey,
      Route_Pattern: routePattern,
      Routing_Topology: routingTopology,
      Workflow_Appraisers: workflowAppraisers
    },
    scoring: {
      Scorers: scorers
    },
    hoshin: {
      Department_Hoshin_Key: departmentHoshinKey
    },
    config: {
      Configuration_Hash: configurationHash
    },
    business: {
      Objective_Count: objectives.length,
      Objectives: objectives
    },
    computed: {
      PartA_Raw_Score: partARawScore
    }
  };
}
