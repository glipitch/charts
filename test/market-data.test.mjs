import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import path from 'node:path';

const source = readFileSync(new URL('../back/fetch-tv-data.js', import.meta.url), 'utf8');

test('market collection saves plain, unique symbols from prefix searches', async () => {
  const requests = [];
  let savedData;
  const context = vm.createContext({
    module: { exports: {} },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs') return {
        existsSync: file => !file.endsWith('.json') && !file.endsWith('.tmp'),
        writeFileSync(_file, content) { savedData = JSON.parse(content); },
        renameSync() {},
      };
      throw new Error(`Unexpected module: ${name}`);
    },
    URLSearchParams,
    setTimeout(callback) { callback(); },
    console: { log() {}, warn() {}, error() {} },
  });
  vm.runInContext(source, context);

  await context.module.exports({
    async fetch(url) {
      const params = new URL(url).searchParams;
      requests.push(params);
      const exchange = params.get('exchange');
      const type = params.get('type');
      const text = params.get('text');
      let data = { symbols: [], symbols_remaining: 0 };
      if (!exchange && type === 'stock') {
        data.symbols = [{ symbol: 'GCOMIJ', exchange: 'TEST', prefix: 'TEST' }];
      } else if (exchange === 'TEST' && !text && (!type || type === 'stock')) {
        // Force collection to subdivide into prefix searches.
        data = {
          symbols: [{ symbol: 'GCOMIJ', exchange: 'TEST' }],
          symbols_remaining: 10000,
        };
      } else if (exchange === 'TEST' && type === 'stock' && text === 'g') {
        data.symbols = [
          { symbol: '<em>G</em>COMIJ', exchange: 'TEST' },
          { symbol: 'GCO<EM>MIJ</EM>', exchange: 'TEST' },
          { symbol: 'GCOMIJ', exchange: 'TEST' },
          { symbol: '<em>G</em>BP<em>USD</em>', exchange: 'TEST' },
          { symbol: 'GBPUSD', exchange: 'OTHER' },
          { symbol: 'GOLD.P', exchange: 'TEST' },
        ];
      }
      return { ok: true, json: async () => data };
    },
  });

  assert.ok(requests.some(params => params.get('text') === 'g'));
  assert.ok(requests.every(params => params.get('hl') === '0'));
  assert.deepEqual(savedData, {
    OTHER: ['GBPUSD'],
    TEST: ['GBPUSD', 'GCOMIJ', 'GOLD.P'],
  });
});

test('published market data contains no highlighting or duplicate symbols', () => {
  const data = JSON.parse(readFileSync(new URL('../front/available-markets/data.json', import.meta.url), 'utf8'));
  for (const [exchange, symbols] of Object.entries(data)) {
    assert.equal(symbols.find(symbol => /<\/?em>/i.test(symbol)), undefined, exchange);
    assert.equal(new Set(symbols).size, symbols.length, exchange);
  }
});
