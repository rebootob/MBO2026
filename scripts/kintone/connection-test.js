import { kintoneRequest } from '../../src/core/kintone-client.js';

try {
  await kintoneRequest('/k/v1/app.json?id=53');
  await kintoneRequest('/k/v1/app.json?id=283');
  console.log('Read-only connection test passed: App 53 and App 283 settings are accessible.');
} catch (error) {
  console.error(`Read-only connection test failed: ${error.message}`);
  process.exitCode = 1;
}
