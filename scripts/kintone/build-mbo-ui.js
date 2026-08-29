import fs from 'node:fs';
import * as esbuild from 'esbuild';

export async function buildMboUi(options = {}) {
  fs.mkdirSync('dist', { recursive: true });
  const outfile = options.outfile || 'dist/mbo-employee-app.js';

  const result = await esbuild.build({
    entryPoints: ['src/main-mbo-app.js'],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: false,
    sourcemap: false,
    metafile: true,
    outfile,
    ...options
  });

  // Ensure canonical LF line endings for generated CSS bundle determinism
  const cssRaw = fs.readFileSync('src/styles/mbo-employee.css', 'utf8');
  const cssLf = cssRaw.replace(/\r\n/g, '\n');
  fs.writeFileSync('dist/mbo-employee.css', cssLf, 'utf8');

  return result;
}

// Execute build if called directly
if (process.argv[1] && (process.argv[1].endsWith('build-mbo-ui.js') || process.argv[1].endsWith('build-mbo-ui'))) {
  buildMboUi().then(() => {
    console.log('Dist bundle generated: dist/mbo-employee-app.js & dist/mbo-employee.css');
  }).catch(err => {
    console.error('BUILD FAILED:', err);
    process.exit(1);
  });
}
