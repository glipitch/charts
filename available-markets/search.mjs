import { readMarket } from "./catalogue.mjs?v=2eeebaa694f4";
import { canonicalExchange, isDailyOnly, isWidgetRestricted, sourceSearchNames } from "../market-rules.mjs?v=2eeebaa694f4";

export const prepare = grouped => Object.entries(grouped).map(([source, entries]) => {
  const exchange = canonicalExchange(source);
  const markets = entries.filter(entry => !isWidgetRestricted(exchange, typeof entry === "string" ? entry : entry[0]));
  return { exchange, normalizedExchange: sourceSearchNames(exchange), markets,
    normalizedSymbols: markets.map(entry => readMarket(entry).symbol.toLowerCase()) };
});

const resultAt = (group, index) => {
  const symbol = readMarket(group.markets[index]).symbol;
  const exchange = canonicalExchange(group.exchange, symbol);
  const daily = Array.isArray(group.markets[index]) || isDailyOnly(exchange, symbol);
  return { exchange, symbol, ...(daily ? { daily: true } : {}) };
};

export const resolveMarkets = (groups, charts) => charts.flatMap(chart => {
  const source = canonicalExchange(chart.exchange, chart.symbol).toLowerCase();
  const group = groups.find(group => group.exchange.toLowerCase() === source);
  const index = group?.markets.findIndex(entry => (typeof entry === "string" ? entry : entry[0]) === chart.symbol) ?? -1;
  return index < 0 ? [] : [{ id: chart.id, ...resultAt(group, index) }];
});

export const findMarkets = (groups, query, limit = 200) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return { results: [], total: 0 };
  const ranked = [[], [], []];
  let total = 0;
  for (const group of groups) {
    // Test source terms once per group, rather than for every symbol.
    const symbolTerms = terms.filter(term => !group.normalizedExchange.includes(term));
    for (let index = 0; index < group.markets.length; index++) {
      const symbol = group.normalizedSymbols[index];
      if (!symbolTerms.every(term => symbol.includes(term))) continue;
      total++;
      const rank = terms.some(term => symbol === term) ? 0 : terms.some(term => symbol.startsWith(term)) ? 1 : 2;
      if (ranked[rank].length < limit) ranked[rank].push(resultAt(group, index));
    }
  }
  return { results: ranked.flat().slice(0, limit), total };
};
