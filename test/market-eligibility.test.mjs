import assert from "node:assert/strict";
import test from "node:test";
import { buildCatalogue, savedRecords, retainSource } from "../front/available-markets/catalogue.mjs";
import { normalizeCharts, supportedIntervals } from "../front/current-markets/state.mjs";
import { prepare, findMarkets, resolveMarkets } from "../front/available-markets/search.mjs";

test("the collector keeps canonical source IDs and merges duplicate EOD metadata", () => {
  const catalogue = buildCatalogue([
    { exchange: "Euronext Paris", prefix: "EURONEXT", symbol: "<em>AIR</em>" },
    { exchange: "Euronext Paris", prefix: "EURONEXT", symbol: "AIR", params: ["eod"] },
    { exchange: "COT", source_id: "COT2", symbol: "SAME", params: ["eod"] },
    { exchange: "COT", source_id: "COT", symbol: "SAME", params: ["eod"] },
    { exchange: "NYSE", symbol: "AIR" },
  ]);
  assert.deepEqual(catalogue, { COT: ["SAME"], COT2: ["SAME"], EURONEXT: [["AIR", "D"]], NYSE: ["AIR"] });
  assert.equal(findMarkets(prepare(catalogue), "same cot2").results[0].daily, true);
});

test("only confirmed restricted instruments are filtered, keeping other and historical series", () => {
  const catalogue = buildCatalogue([
    { exchange: "FINRA", symbol: "A4404722" },
    { exchange: "FINRA", symbol: "A_SHORT_VOLUME" },
    { exchange: "FINRA", symbol: "UNTESTED_BOND" },
    { exchange: "LunarCrush", prefix: "LUNARCRUSH", symbol: "BTC_GALAXYSCORE" },
    { exchange: "IntoTheBlock", prefix: "INTOTHEBLOCK", symbol: "HISTORICAL", typespecs: ["discontinued"] },
  ]);
  assert.deepEqual(catalogue, {
    FINRA: ["A_SHORT_VOLUME", "UNTESTED_BOND"],
    INTOTHEBLOCK: ["HISTORICAL"], LUNARCRUSH: ["BTC_GALAXYSCORE"],
  });
});

test("capped-source retention accepts legacy aliases and preserves saved daily metadata", () => {
  const previous = { "Coin Metrics": [["WORKING_HISTORY", "D"]], OTHER: ["KEEP"] };
  const retained = retainSource(previous, "COINMETRICS");
  assert.deepEqual(retained, [{ exchange: "Coin Metrics", symbol: "WORKING_HISTORY", daily: true }]);
  assert.deepEqual(buildCatalogue(retained), { COINMETRICS: [["WORKING_HISTORY", "D"]] });
  assert.throws(() => retainSource({ TEST: [["INVALID", "bad"]] }, "TEST"), /Invalid saved market/);
  assert.deepEqual(buildCatalogue(savedRecords({ TEST: ["ONE", ["TWO", "D"]] })), { TEST: ["ONE", ["TWO", "D"]] });
});

test("old chart identifiers migrate while working custom intervals and chart IDs survive", () => {
  const charts = normalizeCharts([
    { id: "air", exchange: "Euronext Paris", symbol: "AIR", interval: "240" },
    { id: "cot", exchange: "COT", symbol: "001602_F_CON_GROSS_LE_4_L", interval: "60" },
    { id: "fwb", exchange: "FWB", symbol: "AIR", interval: "5" },
    { id: "finra", exchange: "FINRA", symbol: "A_SHORT_VOLUME", interval: "W" },
    { id: "btc", exchange: "Binance", symbol: "BTCUSDT", interval: "240" },
    { id: "meta", exchange: "TEST", symbol: "EOD", interval: "60", daily: true },
  ]);
  assert.deepEqual(charts.map(({ id, exchange, interval }) => [id, exchange, interval]), [
    ["air", "EURONEXT", "240"], ["cot", "COT2", "D"], ["fwb", "FWB", "D"],
    ["finra", "FINRA", "W"], ["btc", "BINANCE", "240"], ["meta", "TEST", "D"],
  ]);
  assert.deepEqual(supportedIntervals(charts[2]), ["D", "W", "M"]);
  assert.ok(supportedIntervals(charts[4]).includes("60"));
});

test("search understands old display names and compact daily entries without excluding whole sources", () => {
  const groups = prepare({ EURONEXT: ["AIR"], FWB: [["AIR", "D"]],
    FINRA: ["A4404722", ["A_SHORT_VOLUME", "D"]], TEST: ["AIR", ["DAILY", "D"]] });
  assert.deepEqual(findMarkets(groups, "air paris").results, [{ exchange: "EURONEXT", symbol: "AIR" }]);
  assert.deepEqual(findMarkets(groups, "air fwb").results, [{ exchange: "FWB", symbol: "AIR", daily: true }]);
  assert.equal(findMarkets(groups, "A4404722").total, 0);
  assert.equal(findMarkets(groups, "short_volume").total, 1);
  assert.deepEqual(resolveMarkets(groups, [{ id: "saved", exchange: "TEST", symbol: "DAILY" }]),
    [{ id: "saved", exchange: "TEST", symbol: "DAILY", daily: true }]);
});
