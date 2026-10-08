import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import path from 'node:path';
import vm from 'node:vm';

const source = readFileSync(new URL('../back/fetch-tv-data.js', import.meta.url), 'utf8');
const market = { symbol: 'ONE', exchange: 'TEST', prefix: 'TEST' };
const empty = { symbols: [], symbols_remaining: 0 };

const scenario = async (fetchPage, { previous = { TEST: ['OLD'] }, renameFails = false } = {}) => {
  const destination = path.join('front/available-markets', 'data.json');
  const files = new Map([[destination, JSON.stringify(previous)]]);
  const writes = [];
  const context = vm.createContext({
    module: { exports: {} },
    require(name) {
      if (name === 'path') return path;
      return {
        existsSync: file => files.has(file) || file === 'front/available-markets',
        readFileSync: file => files.get(file),
        writeFileSync(file, data) { writes.push(file); files.set(file, data); },
        renameSync(from, to) {
          if (renameFails) throw new Error('rename failed');
          files.set(to, files.get(from)); files.delete(from);
        },
        unlinkSync: file => files.delete(file),
      };
    },
    URLSearchParams,
    setTimeout: callback => callback(),
    console: { log() {}, warn() {}, error() {} },
  });
  vm.runInContext(source, context);
  let error;
  try {
    await context.module.exports({ fetch: async url => ({ ok: true, json: async () => fetchPage(new URL(url).searchParams) }) });
  } catch (caught) { error = caught; }
  return { error, writes, data: JSON.parse(files.get(destination)), temporary: files.has(`${destination}.tmp`) };
};

const singlePage = params => !params.get('exchange')
  ? params.get('type') === 'stock' ? { symbols: [market] } : empty
  : { symbols: [market] };

test('an upstream outage leaves the previous catalogue intact', async () => {
  const result = await scenario(() => { throw new Error('outage'); });
  assert.match(result.error.message, /Failed/);
  assert.deepEqual(result.data, { TEST: ['OLD'] });
  assert.deepEqual(result.writes, []);
});

test('a missing later page cannot publish partial data', async () => {
  const result = await scenario(params => {
    if (!params.get('exchange')) return singlePage(params);
    return params.has('start') ? empty : { symbols: [market], symbols_remaining: 1 };
  });
  assert.match(result.error.message, /Incomplete page/);
  assert.deepEqual(result.data, { TEST: ['OLD'] });
  assert.deepEqual(result.writes, []);
});

test('empty discovery and abnormal count drops do not replace valid data', async () => {
  const emptyResult = await scenario(() => empty);
  assert.match(emptyResult.error.message, /empty catalogue/);
  const drop = await scenario(singlePage, { previous: { TEST: ['A', 'B', 'C', 'D'] } });
  assert.match(drop.error.message, /catalogue drop/);
  assert.deepEqual(drop.data, { TEST: ['A', 'B', 'C', 'D'] });
});

test('uncleared search caps stop publication instead of truncating results', async () => {
  const result = await scenario(params => {
    if (!params.get('exchange')) return singlePage(params);
    if (params.get('text').replace(/a/g, '')) return empty;
    if (params.get('type') && params.get('type') !== 'stock') return empty;
    return { symbols: [market], symbols_remaining: 10000 };
  });
  assert.match(result.error.message, /exceeds the search cap/);
  assert.deepEqual(result.writes, []);
});

test('atomic replacement cleans up a failed temporary file', async () => {
  const failure = await scenario(singlePage, { renameFails: true });
  assert.match(failure.error.message, /rename failed/);
  assert.deepEqual(failure.data, { TEST: ['OLD'] });
  assert.equal(failure.temporary, false);
  const success = await scenario(singlePage);
  assert.equal(success.error, undefined);
  assert.deepEqual(success.data, { TEST: ['ONE'] });
  assert.equal(success.temporary, false);
});
