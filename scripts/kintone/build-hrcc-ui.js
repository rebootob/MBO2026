import fs from 'node:fs';
import * as esbuild from 'esbuild';

export async function buildHrccUi(options = {}) {
  fs.mkdirSync('dist', { recursive: true });
  const outfile = options.outfile || 'dist/hr-control-center-bundle.js';
  const cssOutfile = options.cssOutfile || 'dist/hr-control-center.css';

  const result = await esbuild.build({
    entryPoints: ['src/ui/hr-control-center.js'],
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
  const cssRaw = fs.readFileSync('src/styles/hr-control-center.css', 'utf8');
  const cssLf = cssRaw.replace(/\r\n/g, '\n');
  fs.writeFileSync(cssOutfile, cssLf, 'utf8');

  return result;
}

// Execute build if called directly
if (process.argv[1] && (process.argv[1].endsWith('build-hrcc-ui.js') || process.argv[1].endsWith('build-hrcc-ui'))) {
  buildHrccUi().then(() => {
    console.log('Dist HRCC bundle generated: dist/hr-control-center-bundle.js & dist/hr-control-center.css');
  }).catch(err => {
    console.error('BUILD FAILED:', err);
    process.exit(1);
  });
}
