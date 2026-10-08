import assert from 'node:assert/strict';
import test from 'node:test';
import { loadSvg } from '../front/utilities.mjs';

test('a missing decorative icon cannot reject application startup', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => ({ ok: false });
  assert.equal(await loadSvg('.theme', 'svg/theme.svg'), false);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal(await loadSvg('.theme', 'svg/theme.svg'), false);
});
