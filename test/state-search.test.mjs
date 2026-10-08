import assert from 'node:assert/strict';
import test from 'node:test';
import { webcrypto } from 'node:crypto';
import { normalizeCharts, readSavedState, getPresentation } from '../front/current-markets/state.mjs';
import { prepare, findMarkets } from '../front/available-markets/search.mjs';
import { readFileSync } from 'node:fs';

test('old saved charts migrate without markup and invalid records are discarded', () => {
  globalThis.window = { crypto: webcrypto };
  globalThis.localStorage = { getItem: () => JSON.stringify([
    { id: 'old', exchange: 'BBG', symbol: '<em>G</em>COMIJ', interval: '240' },
    { id: 'old', exchange: 'SGX', symbol: 'MIJ', interval: 'toString' },
    { exchange: '', symbol: 'BAD' }, null,
  ]) };
  const state = readSavedState();
  assert.equal(state.charts.length, 2);
  assert.equal(state.charts[0].symbol, 'GCOMIJ');
  assert.equal(state.charts[0].id, 'old');
  assert.notEqual(state.charts[1].id, 'old');
  assert.equal(state.charts[1].interval, '60');
  assert.equal(state.mobileView, 'focus');
});

test('corrupt storage and malformed chart fields do not prevent startup', () => {
  globalThis.localStorage = { getItem: () => '{invalid' };
  assert.deepEqual(readSavedState().charts, []);
  assert.deepEqual(normalizeCharts([{ exchange: 'TEST', symbol: 123 }]), []);
});

test('mobile presentation selects charts without changing the shared desktop grid', () => {
  const charts = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  const state = { charts, activeId: 'd', mobileView: 'compare' };
  const grid = { x: 2, y: 2 };
  globalThis.window = { innerWidth: 390, innerHeight: 844 };
  assert.deepEqual(getPresentation(state, grid), { view: 'focus', charts: [charts[3]] });
  window.innerWidth = 844; window.innerHeight = 390;
  assert.deepEqual(getPresentation(state, grid), { view: 'compare', charts: [charts[3], charts[0]] });
  window.innerWidth = 1280; window.innerHeight = 720;
  assert.deepEqual(getPresentation(state, grid), { view: 'grid', charts });
  assert.deepEqual(getPresentation(state, { x: 1, y: 1 }), { view: 'grid', charts: [charts[3]] });
  assert.deepEqual(grid, { x: 2, y: 2 });
});

test('search ranks exact symbols first and combines symbol and exchange terms', () => {
  const groups = prepare({ BBG: ['GCOMIJ'], SGX: ['MIJ', 'MIJX'], NASDAQ: ['XMIJ'] });
  assert.deepEqual(findMarkets(groups, 'mij').results.map(m => m.symbol), ['MIJ', 'MIJX', 'GCOMIJ', 'XMIJ']);
  assert.deepEqual(findMarkets(groups, 'mij bbg'), { results: [{ exchange: 'BBG', symbol: 'GCOMIJ' }], total: 1 });
  assert.equal(findMarkets(groups, 'mij', 2).results.length, 2);
  assert.equal(findMarkets(groups, 'mij', 2).total, 4);
  assert.equal(findMarkets(groups, 'unknown').total, 0);
  assert.equal(findMarkets(groups, ' ').total, 0);
});

test('shared entry point is generated from the same shell without an eager chart script', () => {
  const shell = readFileSync(new URL('../front/index.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const fallback = readFileSync(new URL('../front/404.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(fallback, shell.replace('<head>', '<head>\n  <base href="/charts/" />'));
  assert.ok(!fallback.includes('s3.tradingview.com/tv.js'));
});
