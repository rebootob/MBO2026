import fs from 'node:fs';
import * as esbuild from 'esbuild';

export async function buildMboUi(options = {}) {
  fs.mkdirSync('dist', { recursive: true });

  const result = await esbuild.build({
    entryPoints: ['src/main-mbo-app.js'],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: false,
    sourcemap: false,
    metafile: true,
    outfile: 'dist/mbo-employee-app.js',
    ...options
  });

  fs.copyFileSync('src/styles/mbo-employee.css', 'dist/mbo-employee.css');

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
