const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const versionAssets = (source, version) => {
  const versioned = file => /^(?:[a-z]+:|\/\/)/i.test(file) ? file : `${file}?v=${version}`;
  return source
    .replace(/(['"])([^'"\s]+\.(?:mjs|css|svg|json|ico))\1/g, (_match, quote, file) => `${quote}${versioned(file)}${quote}`)
    .replace(/url\(([^'"\s)]+\.(?:css|svg|ico))\)/g, (_match, file) => `url(${versioned(file)})`);
};

const walk = directory => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);

const build = () => {
  const root = path.resolve(__dirname, '..');
  const front = path.join(root, 'front');
  const output = path.resolve(root, 'dist');
  const shell = fs.readFileSync(path.join(front, 'index.html'), 'utf8');
  const newline = shell.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(path.join(front, '404.html'), shell.replace('<head>', `<head>${newline}  <base href="/charts/" />`));

  const files = walk(front).sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(path.relative(front, file).split(path.sep).join('/'));
    const contents = fs.readFileSync(file);
    hash.update(/\.(?:html|mjs|css|json|svg|xml)$/.test(file) ? contents.toString().replace(/\r\n/g, '\n') : contents);
  }
  const version = hash.digest('hex').slice(0, 12);
  // Only clear the generated output directory in this checkout.
  if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build directory');
  fs.rmSync(output, { recursive: true, force: true });
  for (const file of files) {
    const destination = path.join(output, path.relative(front, file));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (/\.(?:html|mjs|css)$/.test(file)) {
      fs.writeFileSync(destination, versionAssets(fs.readFileSync(file, 'utf8'), version));
    } else fs.copyFileSync(file, destination);
  }
  console.log(`Built release ${version}`);
};

module.exports = { versionAssets };
if (require.main === module) build();
