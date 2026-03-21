import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const types = {
    '.html': 'text/html', '.css': 'text/css',
    '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = join(dir, url.pathname === '/' ? 'index.html' : url.pathname);
    try {
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
        res.end(data);
    } catch {
        res.writeHead(404);
        res.end('Not found');
    }
}).listen(3000, () => console.log('http://localhost:3000'));
