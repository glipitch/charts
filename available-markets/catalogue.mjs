import { canonicalExchange, isDailyOnly, isWidgetRestricted } from "../market-rules.mjs?v=2eeebaa694f4";

// Ordinary symbols stay strings. A [symbol, "D"] entry carries an EOD flag
// without a second download or a separate copy of the symbol catalogue.
export const readMarket = entry => {
  if (typeof entry === "string" && entry.trim() && entry === entry.trim()) return { symbol: entry };
  if (Array.isArray(entry) && entry.length === 2 && entry[1] === "D" &&
      typeof entry[0] === "string" && entry[0].trim() && entry[0] === entry[0].trim()) {
    return { symbol: entry[0], daily: true };
  }
  throw new Error("Invalid saved market");
};

export const normalizeMarket = item => {
  if (typeof item?.symbol !== "string" || typeof item.exchange !== "string") throw new Error("Invalid market in response");
  const symbol = item.symbol.replace(/<\/?em>/gi, "").trim();
  const source = item.prefix || item.source_id || item.exchange;
  if (typeof source !== "string" || !source.trim() || !symbol || !item.exchange.trim()) throw new Error("Invalid market in response");
  const exchange = canonicalExchange(source.trim(), symbol);
  const daily = item.daily === true || item.params?.includes("eod") || isDailyOnly(exchange, symbol);
  return { exchange, symbol, ...(daily ? { daily: true } : {}) };
};

export const buildCatalogue = records => {
  const sources = new Map();
  for (const record of records) {
    const item = normalizeMarket(record);
    if (isWidgetRestricted(item.exchange, item.symbol)) continue;
    if (!sources.has(item.exchange)) sources.set(item.exchange, new Map());
    const symbols = sources.get(item.exchange);
    // Some searches return the same instrument more than once. Preserve EOD
    // information from either response instead of letting the first win.
    symbols.set(item.symbol, symbols.get(item.symbol) === true || item.daily === true);
  }
  return Object.fromEntries([...sources].sort(([a], [b]) => a.localeCompare(b)).map(([exchange, entries]) => [exchange,
    [...entries].sort(([a], [b]) => a.localeCompare(b))
      .map(([symbol, daily]) => daily && !isDailyOnly(exchange, symbol) ? [symbol, "D"] : symbol),
  ]));
};

export function* savedRecords(catalogue) {
  for (const [exchange, entries] of Object.entries(catalogue)) {
    if (!Array.isArray(entries)) throw new Error("Invalid saved catalogue");
    for (const entry of entries) yield { exchange, ...readMarket(entry) };
  }
}

export const countMarkets = catalogue => Object.values(catalogue).reduce((count, entries) => count + entries.length, 0);

export const retainSource = (previous, source) => {
  const records = [];
  for (const [exchange, entries] of Object.entries(previous)) {
    // Old COT lists combine source IDs. Keep their original identifiers when
    // COT2 is capped, until a complete refresh supplies per-symbol metadata.
    if (canonicalExchange(exchange).toLowerCase() !== source.toLowerCase() && !(exchange === "COT" && source === "COT2")) continue;
    if (!Array.isArray(entries)) throw new Error("Invalid saved catalogue");
    for (const entry of entries) records.push({ exchange, ...readMarket(entry) });
  }
  return records;
};
