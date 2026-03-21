const { createServer } = require('http');
const { readFile } = require('fs');
const { join, extname } = require('path');

const dir = join(__dirname, '..', 'front');
const port = 3000;
const types = {
    '.html': 'text/html', '.css': 'text/css',
    '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = join(dir, url.pathname === '/' ? 'index.html' : url.pathname);
    readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(port, () => console.log(`http://localhost:${port}`));
