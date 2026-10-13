import assert from 'node:assert/strict';
import test from 'node:test';
import { versionAssets } from '../back/build.js';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

test('a release uses the same cache version for the shell, CSS imports, modules, worker and catalogue', () => {
  const source = `<script src="app.mjs"></script><link href="css/app.css">
@import url(settings.css); @import url("dialog.css");
import { prepare } from "./search.mjs";
new Worker(new URL("search-worker.mjs", import.meta.url));
fetch(new URL("data.json", import.meta.url));`;
  const result = versionAssets(source, 'release-one');
  for (const asset of ['app.mjs', 'css/app.css', 'settings.css', 'dialog.css', './search.mjs', 'search-worker.mjs', 'data.json']) {
    assert.ok(result.includes(`${asset}?v=release-one`), asset);
  }
  assert.ok(!result.includes('?v=release-one?v='));
});

test('cache versioning preserves external resources and does not change source files', () => {
  const source = 'fetch("https://example.com/data.json"); import "./state.mjs";';
  assert.equal(versionAssets(source, 'new-release'), 'fetch("https://example.com/data.json"); import "./state.mjs?v=new-release";');
  assert.equal(source, 'fetch("https://example.com/data.json"); import "./state.mjs";');
});

test('a release supplies enriched data to the new worker while cached workers keep a strings-only endpoint', t => {
  const root = mkdtempSync(path.join(tmpdir(), 'charts-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'back'));
  mkdirSync(path.join(root, 'front', 'available-markets'), { recursive: true });
  copyFileSync(new URL('../back/build.js', import.meta.url), path.join(root, 'back', 'build.js'));
  writeFileSync(path.join(root, 'front', 'index.html'), '<html><head></head></html>');
  writeFileSync(path.join(root, 'front', 'available-markets', 'search-worker.mjs'), 'fetch(new URL("catalogue.json", import.meta.url));');
  const catalogue = { TEST: ['ONE', ['TWO', 'D']] };
  writeFileSync(path.join(root, 'front', 'available-markets', 'data.json'), JSON.stringify(catalogue));
  execFileSync(process.execPath, [path.join(root, 'back', 'build.js')]);
  const read = name => JSON.parse(readFileSync(path.join(root, 'dist', 'available-markets', name), 'utf8'));
  assert.deepEqual(read('catalogue.json'), catalogue);
  assert.deepEqual(read('data.json'), { TEST: ['ONE', 'TWO'] });
  assert.match(readFileSync(path.join(root, 'dist', 'available-markets', 'search-worker.mjs'), 'utf8'), /catalogue\.json\?v=[a-f\d]+/);
  assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'front', 'available-markets', 'data.json'), 'utf8')), catalogue);
});
