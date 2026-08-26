import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

const srcDir = path.resolve('src');
const previewDir = path.resolve('preview');
const distDir = path.resolve('dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = '';
  if (reqPath === '/index.html') {
    filePath = path.resolve('preview/index.html');
  } else if (reqPath === '/mbo-employee.css') {
    filePath = path.resolve('dist/mbo-employee.css');
  } else if (reqPath === '/mbo-employee-app.js') {
    filePath = path.resolve('dist/mbo-employee-app.js');
  } else if (reqPath.startsWith('/src/')) {
    // Path containment guard for /src/ (R4 Bootstrap Repair)
    const relativeSubPath = reqPath.slice(5);
    filePath = path.resolve(srcDir, relativeSubPath);
    if (!filePath.startsWith(srcDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden: Path traversal outside src/ restricted');
      return;
    }
  } else {
    const relativeSubPath = reqPath.startsWith('/') ? reqPath.slice(1) : reqPath;
    filePath = path.resolve(previewDir, relativeSubPath);
    if (!filePath.startsWith(previewDir) && !filePath.startsWith(distDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden: Path traversal restricted');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🧪 App794 Evaluation UI V2 - Status Preview Lab`);
  console.log(`   Preview Server running at: http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.`);
  console.log(`==================================================\n`);
});
