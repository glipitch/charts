const fs = require('fs');
const path = require('path');
const front = path.join(__dirname, '..', 'front');
const shell = fs.readFileSync(path.join(front, 'index.html'), 'utf8');
const newline = shell.includes('\r\n') ? '\r\n' : '\n';
fs.writeFileSync(path.join(front, '404.html'), shell.replace('<head>', `<head>${newline}  <base href="/charts/" />`));
