const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

// Extensions we're willing to serve + their MIME types
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js':  'application/javascript; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Strip query string
  const urlPath = req.url.split('?')[0];
  const ext = path.extname(urlPath).toLowerCase();

  // Only serve whitelisted extensions
  if (!MIME[ext]) {
    res.writeHead(404);
    res.end(`Not found. Try /styles.css or /scripts.js`);
    return;
  }

  // Resolve + guard against directory traversal
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? `Not found: ${urlPath}` : 'Error reading file');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext],
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
    console.log(`[${new Date().toISOString()}] served ${urlPath} (${data.length} bytes)`);
  });
});

server.listen(PORT, () => {
  console.log(`Serving files at http://localhost:${PORT}`);
  console.log(`  CSS: http://localhost:${PORT}/styles.css`);
  console.log(`  JS:  http://localhost:${PORT}/scripts.js`);
  console.log(`Root: ${ROOT}`);
  console.log(`Next: run "ngrok http ${PORT}" in another terminal.`);
});
