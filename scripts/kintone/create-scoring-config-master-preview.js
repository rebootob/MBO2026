import {
  createAndVerifyScoringConfigMasterPreview
} from '../../src/core/kintone-client.js';

const APP_NAME = 'MBO Profile & Scoring Configuration Master [Sandbox]';

const authorization = {
  workPackageId: 'MBO-P03-WP-002C',
  activeWindow: true,
  explicitUserAuthorization: true,
  authorizationId: 'MBO-P03-WP-002C-STAGE2-20260824-2144-ICT',
  authorizationConsumed: false,
  authorizedAppName: APP_NAME
};

const request = {
  workPackageId: 'MBO-P03-WP-002C',
  operation: 'APP_CREATE',
  method: 'POST',
  path: '/k/v1/preview/app.json',
  body: { name: APP_NAME },
  manifest: {
    expectedChanges: [{ operation: 'APP_CREATE', appName: APP_NAME }]
  }
};

try {
  const result = await createAndVerifyScoringConfigMasterPreview(authorization, request);
  process.stdout.write(`${JSON.stringify({
    appId: result.appId,
    name: result.name,
    createRevision: result.createRevision,
    identityRevision: result.identityRevision
  })}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : 'APP_CREATE_RESULT_UNCERTAIN'}\n`);
  process.exitCode = 1;
}
