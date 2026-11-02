import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import path from 'node:path';
import vm from 'node:vm';
import * as catalogue from '../front/available-markets/catalogue.mjs';

const source = readFileSync(new URL('../back/fetch-tv-data.js', import.meta.url), 'utf8');
const market = { symbol: 'ONE', exchange: 'TEST', prefix: 'TEST' };
const empty = { symbols: [], symbols_remaining: 0 };

const scenario = async (fetchPage, { previous = { TEST: ['OLD'] }, renameFails = false, respond } = {}) => {
  const destination = path.join('front/available-markets', 'data.json');
  const files = new Map([[destination, JSON.stringify(previous)]]);
  const writes = [];
  const warnings = [];
  const delays = [];
  const context = vm.createContext({
    module: { exports: {} },
    require(name) {
      if (name === 'path') return path;
      if (name === '../front/available-markets/catalogue.mjs') return catalogue;
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
    setTimeout: (callback, delay) => { delays.push(delay); callback(); },
    console: { log() {}, warn(message) { warnings.push(message); }, error() {} },
  });
  vm.runInContext(source, context);
  let error;
  try {
    await context.module.exports({ fetch: async url => {
      const params = new URL(url).searchParams;
      return respond ? respond(params) : { ok: true, json: async () => fetchPage(params) };
    } });
  } catch (caught) { error = caught; }
  return { error, writes, warnings, delays, data: JSON.parse(files.get(destination)), temporary: files.has(`${destination}.tmp`) };
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
  let probes = 0;
  const result = await scenario(params => {
    if (!params.get('exchange')) return singlePage(params);
    if (!params.has('start')) probes++;
    return params.has('start') ? empty : { symbols: [market], symbols_remaining: 1 };
  });
  assert.match(result.error.message, /Incomplete page/);
  assert.deepEqual(result.data, { TEST: ['OLD'] });
  assert.deepEqual(result.writes, []);
  assert.equal(probes, 3);
  assert.deepEqual(result.delays.filter(delay => delay > 200), [15000, 30000]);
});

test('temporary HTTP failures recover with exponential backoff', async () => {
  let attempts = 0;
  const result = await scenario(singlePage, { respond: params => {
    if (params.get('exchange') && ++attempts < 5) return { ok: false, status: 502 };
    return { ok: true, json: async () => singlePage(params) };
  } });
  assert.equal(result.error, undefined);
  assert.equal(attempts, 5);
  assert.deepEqual(result.delays.filter(delay => delay > 200), [5000, 10000, 20000, 40000]);
  assert.deepEqual(result.data, { TEST: ['ONE'] });
});

test('persistent HTTP failures stop after five attempts without publishing', async () => {
  let attempts = 0;
  const result = await scenario(singlePage, { respond: params => {
    if (params.get('exchange')) {
      attempts++;
      return { ok: false, status: 502 };
    }
    return { ok: true, json: async () => singlePage(params) };
  } });
  assert.match(result.error.message, /Failed TEST\/\/\@0: HTTP 502/);
  assert.equal(attempts, 5);
  assert.deepEqual(result.data, { TEST: ['OLD'] });
  assert.deepEqual(result.writes, []);
});

test('inconsistent pagination restarts only the affected exchange and discards its partial results', async () => {
  const other = { symbol: 'UNCHANGED', exchange: 'OTHER', prefix: 'OTHER' };
  const fresh = { ...market, symbol: 'FRESH' };
  let probes = 0;
  let otherRequests = 0;
  const result = await scenario(params => {
    if (!params.get('exchange')) {
      return params.get('type') === 'stock' ? { symbols: [market, other] } : empty;
    }
    if (params.get('exchange') === 'OTHER') {
      otherRequests++;
      return { symbols: [other] };
    }
    if (params.has('start')) return empty;
    return ++probes === 1 ? { symbols: [market], symbols_remaining: 1 } : { symbols: [fresh] };
  });
  assert.equal(result.error, undefined);
  assert.equal(probes, 2);
  assert.equal(otherRequests, 1);
  assert.deepEqual(result.data, { OTHER: ['UNCHANGED'], TEST: ['FRESH'] });
  assert.deepEqual(result.delays.filter(delay => delay > 200), [15000]);
});

test('empty discovery and abnormal count drops do not replace valid data', async () => {
  const emptyResult = await scenario(() => empty);
  assert.match(emptyResult.error.message, /empty catalogue/);
  const drop = await scenario(singlePage, { previous: { TEST: ['A', 'B', 'C', 'D'] } });
  assert.match(drop.error.message, /catalogue drop/);
  assert.deepEqual(drop.data, { TEST: ['A', 'B', 'C', 'D'] });
});

const cappedExchange = params => {
  if (!params.get('exchange')) return singlePage(params);
  if (params.get('text').replace(/a/g, '')) return empty;
  if (params.get('type') && params.get('type') !== 'stock') return empty;
  return { symbols: [market], symbols_remaining: 10000 };
};

test('uncleared search caps retain the complete saved exchange with a warning', async () => {
  const result = await scenario(cappedExchange);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, { TEST: ['OLD'] });
  assert.match(result.warnings[0], /exceeds the search cap; retaining 1 previously saved TEST markets/);
});

test('a capped refresh preserves daily flags without replacing saved data with a partial result', async () => {
  const result = await scenario(cappedExchange, { previous: { TEST: [["OLD", "D"]] } });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, { TEST: [["OLD", "D"]] });
  assert.equal(result.warnings.length, 1);
});

test('an exchange without a valid saved catalogue still fails on a search cap', async () => {
  for (const previous of [{}, { TEST: [] }, { TEST: [null] }]) {
    const result = await scenario(cappedExchange, { previous });
    assert.match(result.error.message, /exceeds the search cap/);
    assert.deepEqual(result.writes, []);
  }
});

test('a capped exchange discards partial results while other exchanges refresh', async () => {
  const other = { symbol: 'NEW', exchange: 'OTHER', prefix: 'OTHER' };
  const result = await scenario(params => {
    if (!params.get('exchange')) {
      return params.get('type') === 'stock' ? { symbols: [market, other] } : empty;
    }
    if (params.get('exchange') === 'OTHER') return { symbols: [other] };
    // Collect a partial type before a later type hits its search cap.
    if (params.get('type') === 'stock') return { symbols: [market] };
    if (!params.get('type') || params.get('type') === 'bond') {
      return params.get('text').replace(/a/g, '') ? empty : { symbols: [market], symbols_remaining: 10000 };
    }
    return empty;
  }, { previous: { TEST: ['OLD'], OTHER: ['BEFORE'] } });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, { OTHER: ['NEW'], TEST: ['OLD'] });
  assert.equal(result.warnings.length, 1);
});

test('retaining a capped exchange does not bypass the catalogue drop safeguard', async () => {
  const result = await scenario(cappedExchange, { previous: { TEST: ['OLD'], OTHER: ['A', 'B', 'C'] } });
  assert.match(result.error.message, /catalogue drop/);
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
