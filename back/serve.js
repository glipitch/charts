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
    const pathname = url.pathname.replace(/^\/charts(?=\/|$)/, '') || '/';
    const file = join(dir, pathname === '/' || !extname(pathname) ? 'index.html' : pathname);
    readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(port, () => console.log(`http://localhost:${port}`));
