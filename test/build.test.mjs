import assert from 'node:assert/strict';
import test from 'node:test';
import { versionAssets } from '../back/build.js';

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
