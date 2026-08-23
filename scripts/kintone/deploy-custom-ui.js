import fs from 'node:fs';
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest, getKintoneConnection } from '../../src/core/kintone-client.js';
import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };

const app = sandboxRegistry.mboV2AppId;
assertSandboxWriteTarget(app);

// 1. Build Single JS File
const constantsJs = fs.readFileSync('src/config/constants.js', 'utf8')
  .replace(/export const/g, 'const');

const hostResolverJs = fs.readFileSync('src/ui/host-resolver.js', 'utf8')
  .replace(/import .*/g, '')
  .replace(/export function/g, 'function');

const validationJs = fs.readFileSync('src/validation/validation-engine.js', 'utf8')
  .replace(/import .*/g, '')
  .replace(/export class/g, 'class');

const employeeServiceJs = fs.readFileSync('src/services/employee-service.js', 'utf8')
  .replace(/import .*/g, '')
  .replace(/export class/g, 'class');

const routingServiceJs = fs.readFileSync('src/services/routing-service.js', 'utf8')
  .replace(/import .*/g, '')
  .replace(/export class/g, 'class');

const uiJs = fs.readFileSync('src/ui/employee-part-a-ui.js', 'utf8')
  .replace(/import .*/g, '')
  .replace(/export class/g, 'class');

const mainJs = fs.readFileSync('src/main-mbo-app.js', 'utf8')
  .replace(/import .*/g, '');

const fullJs = `
(function() {
  'use strict';

  ${constantsJs}

  ${hostResolverJs}

  ${validationJs}

  ${employeeServiceJs}

  ${routingServiceJs}

  ${uiJs}

  ${mainJs}

})();
`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/mbo-employee-app.js', fullJs, 'utf8');

const cssContent = fs.readFileSync('src/styles/mbo-employee.css', 'utf8');
fs.writeFileSync('dist/mbo-employee.css', cssContent, 'utf8');

console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');

// 2. Upload Files to Kintone
async function uploadFile(filename, content, contentType) {
  const { baseUrl, headers } = getKintoneConnection();
  const formData = new FormData();
  const blob = new Blob([content], { type: contentType });
  formData.append('file', blob, filename);

  const authHeaders = { ...headers };
  delete authHeaders['Content-Type'];

  const resp = await fetch(`${baseUrl}/k/v1/file.json`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });

  if (!resp.ok) {
    throw new Error(`File upload failed: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json();
  console.log(`Uploaded ${filename} -> fileKey: ${data.fileKey}`);
  return data.fileKey;
}

const jsFileKey = await uploadFile('mbo-employee-app.js', fullJs, 'text/javascript');
const cssFileKey = await uploadFile('mbo-employee.css', cssContent, 'text/css');

// 3. Put Customization to Preview
await kintoneRequest('/k/v1/preview/app/customize.json', {
  method: 'PUT',
  body: {
    app,
    scope: 'ALL',
    desktop: {
      js: [{ type: 'FILE', file: { fileKey: jsFileKey } }],
      css: [{ type: 'FILE', file: { fileKey: cssFileKey } }]
    },
    mobile: {
      js: [],
      css: []
    }
  }
});

console.log('Customization preview updated.');

// 4. Deploy Live Sandbox App 794
await kintoneRequest('/k/v1/preview/app/deploy.json', {
  method: 'POST',
  body: { apps: [{ app }] }
});

console.log(`Live deployment requested for App ${app}. Polling status...`);

// Poll until deployment is complete
let deployed = false;
for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 1500));
  const res = await kintoneRequest(`/k/v1/preview/app/deploy.json?apps[0]=${app}`);
  const status = res.apps?.[0]?.status;
  console.log(`Deployment status check ${i + 1}: ${status}`);
  if (status === 'SUCCESS') {
    deployed = true;
    break;
  }
  if (status === 'FAIL') {
    throw new Error('Sandbox app deployment failed.');
  }
}

if (!deployed) {
  throw new Error('Deployment timeout.');
}

console.log(`MBO V2 Sandbox (App ${app}) Custom UI successfully deployed to LIVE!`);
