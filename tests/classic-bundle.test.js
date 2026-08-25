import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function cleanEsModules(jsText) {
  return jsText
    .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+\{[\s\S]*?\};?/g, '');
}

test('Classic Bundle: App 794 Javascript bundle parses as classic script with zero ES module residue', () => {
  const constantsJs = cleanEsModules(fs.readFileSync('src/config/constants.js', 'utf8'));
  const fiscalYearEngineJs = cleanEsModules(fs.readFileSync('src/core/fiscal-year-engine.js', 'utf8'));
  const scoringConfigMasterJs = cleanEsModules(fs.readFileSync('src/profiles/scoring-config-master.js', 'utf8'));
  const profileScoringResolverJs = cleanEsModules(fs.readFileSync('src/profiles/profile-scoring-resolver.js', 'utf8'));
  const hostResolverJs = cleanEsModules(fs.readFileSync('src/ui/host-resolver.js', 'utf8'));
  const validationJs = cleanEsModules(fs.readFileSync('src/validation/validation-engine.js', 'utf8'));
  const employeeServiceJs = cleanEsModules(fs.readFileSync('src/services/employee-service.js', 'utf8'));
  const routingServiceJs = cleanEsModules(fs.readFileSync('src/services/routing-service.js', 'utf8'));
  const uiJs = cleanEsModules(fs.readFileSync('src/ui/employee-part-a-ui.js', 'utf8'));
  const mainJs = cleanEsModules(fs.readFileSync('src/main-mbo-app.js', 'utf8'));

  const fullJs = `
(function() {
  'use strict';

  ${constantsJs}

  ${fiscalYearEngineJs}

  ${scoringConfigMasterJs}

  ${profileScoringResolverJs}

  ${hostResolverJs}

  ${validationJs}

  ${employeeServiceJs}

  ${routingServiceJs}

  ${uiJs}

  ${mainJs}

})();
`;

  // 1. Classic Bundle Syntax Parse
  assert.doesNotThrow(() => {
    new Function(fullJs);
  }, 'fullJs must parse cleanly via Function constructor as classic JS script');

  // 2. Zero import statements
  assert.equal(/\bimport\b/.test(fullJs), false, 'fullJs must contain 0 import keywords');

  // 3. Zero export statements
  assert.equal(/\bexport\b/.test(fullJs), false, 'fullJs must contain 0 export keywords');

  // 4. Zero broken } from '...' residue
  assert.equal(/}\s*from\s*['"]/.test(fullJs), false, 'fullJs must contain 0 broken from residue');
});
