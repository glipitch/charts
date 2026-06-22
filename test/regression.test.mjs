import assert from "node:assert/strict";
import test from "node:test";

let importId = 0;

const importFresh = path => import(`${path}?test=${importId++}`);

const setupBrowser = (url = "http://localhost:3000/") => {
  const styleValues = new Map();
  const storageValues = new Map();
  let gridChangeCount = 0;

  globalThis.CustomEvent = class CustomEvent {
    constructor(type) {
      this.type = type;
    }
  };
  globalThis.window = {
    innerWidth: 1600,
    innerHeight: 900,
    location: new URL(url),
    crypto: {
      getRandomValues(values) {
        values.fill(7);
        return values;
      },
    },
    dispatchEvent(event) {
      if (event.type === "gridchange") gridChangeCount += 1;
    },
    get gridChangeCount() {
      return gridChangeCount;
    },
  };
  globalThis.history = {
    replaceState(_state, _title, nextUrl) {
      window.location = new URL(nextUrl);
    },
  };
  globalThis.localStorage = {
    getItem(key) {
      return storageValues.get(key) || null;
    },
    setItem(key, value) {
      storageValues.set(key, String(value));
    },
  };
  globalThis.document = {
    documentElement: {
      style: {
        getPropertyValue(key) {
          return styleValues.get(key) || "";
        },
        setProperty(key, value) {
          styleValues.set(key, String(value));
        },
      },
    },
    getElementById() {
      return null;
    },
  };

  return { styleValues, storageValues };
};

test("auto grid uses compact, readable layouts for common chart counts", async () => {
  setupBrowser();
  const dimensions = await importFresh("../front/dimensions.mjs");
  const expected = new Map([
    [1, { x: 1, y: 1 }],
    [2, { x: 2, y: 1 }],
    [3, { x: 2, y: 2 }],
    [4, { x: 2, y: 2 }],
    [5, { x: 3, y: 2 }],
    [6, { x: 3, y: 2 }],
    [7, { x: 4, y: 2 }],
    [8, { x: 4, y: 2 }],
    [9, { x: 3, y: 3 }],
    [10, { x: 4, y: 3 }],
    [12, { x: 4, y: 3 }],
  ]);

  for (const [count, grid] of expected) {
    assert.deepEqual(dimensions.getReasonableGrid(count), grid);
  }
});

test("setGrid can initialize quietly or notify listeners", async () => {
  const { styleValues, storageValues } = setupBrowser();
  const dimensions = await importFresh("../front/dimensions.mjs");

  dimensions.setGrid(2, 4, false);
  assert.equal(window.gridChangeCount, 0);
  assert.equal(styleValues.get("--x"), "2");
  assert.equal(styleValues.get("--y"), "4");
  assert.equal(storageValues.get("x"), "2");
  assert.equal(storageValues.get("y"), "4");

  dimensions.setGrid(3, 2);
  assert.equal(window.gridChangeCount, 1);
});

test("URL state parses omitted default interval and explicit grid", async () => {
  setupBrowser("http://localhost:3000/?charts=Binance:BTCUSDT,NYSE:DOW:240&grid=2x4");
  const urlState = await importFresh("../front/current-markets/url-state.mjs");

  const state = urlState.getState();

  assert.deepEqual(state.grid, { x: 2, y: 4 });
  assert.equal(state.charts[0].exchange, "Binance");
  assert.equal(state.charts[0].symbol, "BTCUSDT");
  assert.equal(state.charts[0].interval, "60");
  assert.equal(state.charts[1].interval, "240");
});

test("URL state keeps encoded separators inside chart fields", async () => {
  setupBrowser("http://localhost:3000/?charts=Binance:BTC%3AUSDT,NYSE:DOW");
  const urlState = await importFresh("../front/current-markets/url-state.mjs");

  const state = urlState.getState();

  assert.equal(state.charts[0].symbol, "BTC:USDT");
  assert.equal(state.charts[1].interval, "60");
});

test("URL state omits :60 when serializing default intervals", async () => {
  setupBrowser("http://localhost:3000/?charts=old");
  const dimensions = await importFresh("../front/dimensions.mjs");
  const urlState = await importFresh("../front/current-markets/url-state.mjs");

  dimensions.setGrid(2, 2, false);
  urlState.update([
    { exchange: "Binance", symbol: "BTCUSDT", interval: "60" },
    { exchange: "Binance", symbol: "ETHUSDT", interval: "240" },
  ]);

  assert.equal(
    window.location.href,
    "http://localhost:3000/?charts=Binance:BTCUSDT,Binance:ETHUSDT:240&grid=2x2",
  );
});
