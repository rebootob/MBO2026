import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { assertSandboxWriteTarget } from '../../src/core/sandbox-write-guard.js';
import { kintoneRequest } from '../../src/core/kintone-client.js';

const app = sandboxRegistry.mboV2AppId;
assertSandboxWriteTarget(app);

const currentLayout = await kintoneRequest(`/k/v1/preview/app/form/layout.json?app=${app}`);
const existingRows = currentLayout.layout || [];

// Check if SPACE_HEADER already exists
const hasSpaceHeader = existingRows.some(row =>
  row.type === 'ROW' && row.fields?.some(f => f.type === 'SPACER' && f.elementId === 'SPACE_HEADER')
);

if (!hasSpaceHeader) {
  const spacerRow = {
    type: 'ROW',
    fields: [
      {
        type: 'SPACER',
        elementId: 'SPACE_HEADER',
        size: {
          width: '1200',
          height: '60'
        }
      }
    ]
  };

  const updatedLayout = [spacerRow, ...existingRows];
  await kintoneRequest('/k/v1/preview/app/form/layout.json', {
    method: 'PUT',
    body: {
      app,
      layout: updatedLayout
    }
  });

  console.log('SPACE_HEADER spacer added to App 794 preview layout.');
} else {
  console.log('SPACE_HEADER already exists in App 794 preview layout.');
}
