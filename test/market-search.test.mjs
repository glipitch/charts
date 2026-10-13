import assert from 'node:assert/strict';
import test from 'node:test';

let importId = 0;
const setup = async t => {
  const timers = new Map();
  const workers = [];
  let nextTimer = 0;
  class FakeWorker {
    listeners = new Map();
    messages = [];
    constructor() { workers.push(this); }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    postMessage(data) { this.messages.push(data); }
    emit(data) { this.listeners.get('message')({ data }); }
    terminate() { this.terminated = true; }
  }
  for (const [key, value] of Object.entries({ Worker: FakeWorker,
    setTimeout(callback, delay) { assert.equal(delay, 150); timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout(id) { timers.delete(id); } })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const api = await import(`../front/available-markets/market-search.mjs?test=${importId++}`);
  const flush = () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(callback => callback()); };
  return { ...api, workers, flush };
};

test('search channels share one worker, debounce independently, and reject stale results', async t => {
  const { createMarketSearch, workers, flush } = await setup(t);
  const settingsUpdates = [], welcomeUpdates = [];
  const settings = createMarketSearch(data => settingsUpdates.push(data));
  const welcome = createMarketSearch(data => welcomeUpdates.push(data), 8);
  settings('air'); welcome('btc'); welcome('btcusdt binance');
  assert.equal(workers.length, 1);
  const worker = workers[0];
  worker.emit({ type: 'ready' });
  assert.equal(worker.messages.filter(data => data.type === 'search').length, 0);
  flush();
  const queries = worker.messages.filter(data => data.type === 'search');
  assert.deepEqual(queries.map(data => [data.query, data.limit]), [['air', 200], ['btcusdt binance', 8]]);
  for (const query of queries) worker.emit({ ...query, type: 'results', results: [{ symbol: query.query }], total: 1 });
  assert.equal(settingsUpdates.at(-1).results[0].symbol, 'air');
  assert.equal(welcomeUpdates.at(-1).results[0].symbol, 'btcusdt binance');
  welcome('aapl');
  worker.emit({ ...queries[1], type: 'results', results: [{ symbol: 'STALE' }], total: 1 });
  assert.equal(welcomeUpdates.at(-1).type, 'loading');
  welcome(''); flush();
  assert.equal(welcomeUpdates.at(-1).type, 'clear');
  assert.equal(worker.messages.filter(data => data.type === 'search').length, 2);
});

test('loading failure retries a pending query and ignores messages from the failed worker', async t => {
  const { createMarketSearch, loadAvailable, subscribeCurrent, workers, flush } = await setup(t);
  const updates = [];
  const search = createMarketSearch(data => updates.push(data));
  let resolved;
  subscribeCurrent(() => [{ id: 'saved' }], charts => { resolved = charts; });
  search('air fwb'); flush();
  const failed = workers[0];
  failed.emit({ type: 'error' });
  assert.equal(failed.terminated, true);
  assert.equal(updates.at(-1).type, 'error');
  loadAvailable();
  failed.emit({ type: 'ready' });
  assert.equal(updates.at(-1).type, 'loading');
  const retry = workers[1];
  retry.emit({ type: 'ready' });
  assert.deepEqual(retry.messages.find(data => data.type === 'resolve').charts, [{ id: 'saved' }]);
  assert.equal(retry.messages.find(data => data.type === 'search').query, 'air fwb');
  retry.emit({ type: 'resolved', charts: [{ id: 'saved', daily: true }] });
  assert.equal(resolved[0].daily, true);
});

test('the actual worker keeps search channels alive while loading and respects result limits', async t => {
  let handler, finishLoad;
  const messages = [];
  const previousSelf = Object.getOwnPropertyDescriptor(globalThis, 'self');
  const previousFetch = globalThis.fetch;
  globalThis.self = { addEventListener(type, listener) { handler = listener; }, postMessage(data) { messages.push(data); } };
  globalThis.fetch = () => new Promise(resolve => { finishLoad = resolve; });
  t.after(() => {
    if (previousSelf) Object.defineProperty(globalThis, 'self', previousSelf); else delete globalThis.self;
    globalThis.fetch = previousFetch;
  });
  await import(`../front/available-markets/search-worker.mjs?test=${importId++}`);
  const pending = [handler({ data: { type: 'search', channel: 0, id: 1, query: 'old' } }),
    handler({ data: { type: 'search', channel: 1, id: 1, query: 'btc', limit: 8 } }),
    handler({ data: { type: 'search', channel: 0, id: 2, query: 'aapl' } })];
  finishLoad({ ok: true, async json() { return { NASDAQ: ['AAPL'], BINANCE: Array.from({ length: 12 }, (_, index) => `BTC${index}`) }; } });
  await Promise.all(pending);
  assert.equal(messages.length, 2);
  assert.equal(messages.find(data => data.channel === 1).results.length, 8);
  assert.equal(messages.find(data => data.channel === 1).total, 12);
  assert.equal(messages.find(data => data.channel === 0).id, 2);
  assert.equal(messages.find(data => data.channel === 0).results[0].symbol, 'AAPL');
});
