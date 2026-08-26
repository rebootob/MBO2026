import test from 'node:test';
import assert from 'node:assert/strict';
import { ScoringConfigMasterService } from '../src/services/scoring-config-master-service.js';
import { ScoringConfigKintoneRepository } from '../src/services/scoring-config-kintone-repository.js';
import { createScoringConfigRepositoryRequestBridge } from '../src/core/kintone-client.js';
import {
  assertScoringMasterSupersessionAuthorization,
  WP002C_SUPERSEDE_STAGE,
  WP002C_SUPERSEDE_CONTRACT_ID
} from '../src/core/sandbox-write-guard.js';
import {
  canonicalizeScoringConfigPayload,
  computeConfigurationHash,
  CONFIG_LIFECYCLE_STATUS
} from '../src/profiles/scoring-config-master.js';

function createFakeKintoneTransport() {
  const records = new Map();
  let nextId = 10;
  const transportCalls = [];

  // Seed Record ID 6: PROF_DGM::v1.0.0 in PUBLISHED status
  const dgm100Payload = {
    Master_Record_Key: 'PROF_DGM::v1.0.0',
    Profile_Code: 'PROF_DGM',
    Profile_Family: 'PROFILE_MANAGEMENT',
    Scoring_Config_Code: 'SCORE_CFG_DGM_V1',
    Scoring_Config_Version: 'v1.0.0',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31',
    Fiscal_Year: 'FY2026',
    PartA_Weight: '50',
    PartB_Weight: '50',
    Expected_Appraiser_Count: '2',
    Appraiser_Weight_Rule_Code: 'EQUAL_DISTRIBUTION_V1',
    Part_A_Scoring_Mode: 'DIFFICULTY_ACHIEVEMENT_MATRIX',
    Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
    PartA_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    PartB_Raw_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    PartB_Weighted_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    Final_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    Supersedes_Config_Version: 'NONE'
  };
  const dgm100Canonical = canonicalizeScoringConfigPayload(dgm100Payload);
  const dgm100Hash = computeConfigurationHash(dgm100Canonical);

  const rawRecord6 = {
    $id: { type: '__ID__', value: '6' },
    $revision: { type: '__REVISION__', value: '1' },
    Config_Status: { type: 'SINGLE_LINE_TEXT', value: 'PUBLISHED' },
    Published_By: { type: 'USER_SELECT', value: [{ code: 'admin-form', name: 'Admin' }] },
    Published_At: { type: 'SINGLE_LINE_TEXT', value: '2026-08-25T05:20:00Z' },
    Configuration_Hash: { type: 'SINGLE_LINE_TEXT', value: dgm100Hash }
  };
  for (const [k, v] of Object.entries(dgm100Canonical)) {
    rawRecord6[k] = { type: 'SINGLE_LINE_TEXT', value: String(v) };
  }
  records.set('6', rawRecord6);

  async function transport(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body;
    transportCalls.push({ url, method, body });

    const parsedUrl = new URL(url, 'https://localhost');
    const pathname = parsedUrl.pathname;

    if (method === 'GET' && pathname === '/k/v1/records.json') {
      const app = parsedUrl.searchParams.get('app');
      const query = parsedUrl.searchParams.get('query');
      const matched = [];
      for (const rec of records.values()) {
        const pCode = rec.Profile_Code?.value;
        const fYear = rec.Fiscal_Year?.value;
        const cStatus = rec.Config_Status?.value;
        const mKey = rec.Master_Record_Key?.value;

        if (query.includes('Master_Record_Key = "') && mKey) {
          const matchKey = query.match(/Master_Record_Key = "([^"]+)"/)?.[1];
          if (mKey === matchKey) matched.push(rec);
        } else if (pCode === 'PROF_DGM' && fYear === 'FY2026' && cStatus === 'PUBLISHED') {
          matched.push(rec);
        }
      }
      return { records: matched };
    }

    if (method === 'GET' && pathname === '/k/v1/record.json') {
      const id = parsedUrl.searchParams.get('id');
      const rec = records.get(String(id));
      if (!rec) throw new Error(`Kintone Record ID ${id} not found`);
      return { record: rec };
    }

    if (method === 'POST' && pathname === '/k/v1/record.json') {
      const idStr = String(nextId++);
      const newRaw = {
        $id: { type: '__ID__', value: idStr },
        $revision: { type: '__REVISION__', value: '1' }
      };
      for (const [k, v] of Object.entries(body.record)) {
        newRaw[k] = v;
      }
      records.set(idStr, newRaw);
      return { id: idStr, revision: '1' };
    }

    if (method === 'POST' && pathname === '/k/v1/bulkRequest.json') {
      const [req0, req1] = body.requests;

      const predId = req0.payload.id;
      const predRev = req0.payload.revision;
      const predRec = records.get(predId);
      if (!predRec || predRec.$revision.value !== predRev) {
        throw new Error('Revision Conflict 409 on predecessor');
      }
      predRec.Config_Status = req0.payload.record.Config_Status;
      predRec.$revision.value = String(Number(predRev) + 1);

      const newId = req1.payload.id;
      const newRev = req1.payload.revision;
      const newRec = records.get(newId);
      if (!newRec || newRec.$revision.value !== newRev) {
        throw new Error('Revision Conflict 409 on new record');
      }
      newRec.Config_Status = req1.payload.record.Config_Status;
      newRec.Published_By = req1.payload.record.Published_By;
      newRec.Published_At = req1.payload.record.Published_At;
      newRec.$revision.value = String(Number(newRev) + 1);

      return {
        results: [
          { id: predId, revision: predRec.$revision.value },
          { id: newId, revision: newRec.$revision.value }
        ]
      };
    }

    throw new Error(`Unhandled fake transport route: ${method} ${url}`);
  }

  return { transport, records, transportCalls };
}

test('M10M-R2D Cross-Layer Integration: full local supersession path Service -> Repository -> Bridge -> Fake Transport', async () => {
  const { transport, records, transportCalls } = createFakeKintoneTransport();

  const requestBridge = createScoringConfigRepositoryRequestBridge({ transport });

  const activeAuthId = 'AUTH_INTEGRATION_SUPERSEDE_001';

  function authorizeWrite(context) {
    if (context.operation === 'SCORING_CONFIG_CREATE_VALIDATED') {
      return true;
    }
    if (context.operation === 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH') {
      const authConfig = {
        workPackageId: 'MBO-P03-WP-002C',
        stage: WP002C_SUPERSEDE_STAGE,
        contractId: WP002C_SUPERSEDE_CONTRACT_ID,
        operation: 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH',
        activeWindow: true,
        explicitUserAuthorization: true,
        prewriteBackupVerified: true,
        authorizationId: activeAuthId
      };
      return assertScoringMasterSupersessionAuthorization(authConfig, context);
    }
    return false;
  }

  const repository = new ScoringConfigKintoneRepository({
    request: requestBridge,
    authorizeWrite,
    appId: 796
  });

  const auditProvider = {
    async getPublisherIdentity() { return 'admin-form'; },
    async getPublishedAt() { return '2026-08-26T22:00:00Z'; }
  };

  const service = new ScoringConfigMasterService({ repository, auditProvider });

  const candidateDgmV110 = {
    Master_Record_Key: 'PROF_DGM::v1.1.0',
    Profile_Code: 'PROF_DGM',
    Profile_Family: 'PROFILE_MANAGEMENT',
    Scoring_Config_Code: 'SCORE_CFG_DGM_V1',
    Scoring_Config_Version: 'v1.1.0',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31',
    Fiscal_Year: 'FY2026',
    PartA_Weight: '50',
    PartB_Weight: '50',
    Expected_Appraiser_Count: '1',
    Appraiser_Weight_Rule_Code: 'EQUAL_DISTRIBUTION_V1',
    Part_A_Scoring_Mode: 'DIFFICULTY_ACHIEVEMENT_MATRIX',
    Competency_Set_Code: 'COMP_SET_MANAGEMENT_V1',
    PartA_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    PartB_Raw_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    PartB_Weighted_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    Final_Rounding_Rule: 'ROUNDING_LEGACY_PER_APP_CALC',
    Supersedes_Config_Version: 'v1.0.0'
  };

  const result = await service.publishSupersedingScoringConfig({ candidate: candidateDgmV110 });

  // 1. Result verification
  assert.equal(result.status, 'SUPERSESSION_PUBLISH_VERIFIED');
  assert.equal(result.predecessorRecordId, '6');
  assert.equal(result.newRecordId, '10');
  assert.equal(result.newMasterRecordKey, 'PROF_DGM::v1.1.0');
  assert.equal(result.newConfigurationHash, 'e69989df7118601b95b3c4df1a0d7cfc6c5b2c3bf3be124a0470d82ff079892e');

  // 2. State verification in fake transport storage
  const oldRaw = records.get('6');
  assert.equal(oldRaw.Config_Status.value, CONFIG_LIFECYCLE_STATUS.SUPERSEDED);
  assert.equal(oldRaw.Expected_Appraiser_Count.value, '2');

  const newRaw = records.get('10');
  assert.equal(newRaw.Config_Status.value, CONFIG_LIFECYCLE_STATUS.PUBLISHED);
  assert.equal(newRaw.Expected_Appraiser_Count.value, '1');
  assert.equal(newRaw.Published_By.value[0].code, 'admin-form');
  assert.equal(newRaw.Published_At.value, '2026-08-26T22:00:00Z');

  // 3. Verify exactly 1 PUBLISHED record remains for PROF_DGM / FY2026
  const publishedConfigs = await repository.findPublishedByProfileFiscalYear('PROF_DGM', 'FY2026');
  assert.equal(publishedConfigs.length, 1);
  assert.equal(publishedConfigs[0].__recordId, '10');
  assert.equal(publishedConfigs[0].Scoring_Config_Version, 'v1.1.0');

  // 4. Verify exact Bulk Request reached the fake transport
  const bulkCall = transportCalls.find(c => c.method === 'POST' && c.url.includes('/k/v1/bulkRequest.json'));
  assert.ok(bulkCall);
  assert.equal(bulkCall.body.requests.length, 2);
  assert.equal(bulkCall.body.requests[0].payload.id, '6');
  assert.equal(bulkCall.body.requests[0].payload.record.Config_Status.value, 'SUPERSEDED');
  assert.equal(bulkCall.body.requests[1].payload.id, '10');
  assert.equal(bulkCall.body.requests[1].payload.record.Config_Status.value, 'PUBLISHED');
});
