const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 38636;

http.createServer((req, res) => {
  const url = req.url.split('?')[0];  // remove query parameters
  const filePath = url === '/' ? './index.html' : `.${url}`;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found: ' + filePath);
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.txt': 'text/plain',
        '.js': 'application/javascript',
        '.css': 'text/css',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });
}).listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`);
});
