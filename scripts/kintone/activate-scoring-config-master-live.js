import { activateScoringConfigMasterLive } from '../../src/core/kintone-client.js';

const APP_NAME = 'MBO Profile & Scoring Configuration Master [Sandbox]';

const authorization = {
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_3A_LIVE_ACTIVATION',
  explicitUserAuthorization: true,
  activeWindow: true,
  authorizationId: 'MBO-P03-WP-002C-STAGE3A-20260824-2219-ICT'
};

const request = {
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_3A_LIVE_ACTIVATION',
  appId: 796,
  appName: APP_NAME,
  operationSequence: ['APP_ACL_PREVIEW_UPDATE', 'APP_DEPLOY']
};

try {
  const result = await activateScoringConfigMasterLive(authorization, request);
  process.stdout.write(`${JSON.stringify({
    appId: result.appId,
    name: result.name,
    revision: result.revision,
    deployStatus: result.deployStatus,
    accessStatus: result.accessStatus
  })}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : 'DEPLOY_RESULT_UNCERTAIN'}\n`);
  process.exitCode = 1;
}
