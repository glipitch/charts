import { getNewId } from "../utilities.mjs?v=96ca637f308a";
import { canonicalExchange, canonicalSymbol, isDailyOnly } from "../market-rules.mjs?v=96ca637f308a";

export const INTERVALS = { "1": "1m", "5": "5m", "15": "15m", "30": "30m", "60": "1h", "240": "4h", D: "1D", W: "1W", M: "1M" };
export const cleanSymbol = value => typeof value === "string" ? value.replace(/<\/?em>/gi, "").trim() : "";
export const supportedIntervals = chart => chart.daily === true || isDailyOnly(chart.exchange, chart.symbol)
  ? ["D", "W", "M"] : Object.keys(INTERVALS);

export const normalizeCharts = items => {
  const ids = new Set();
  return (Array.isArray(items) ? items : []).flatMap(item => {
    if (!item || typeof item.exchange !== "string") return [];
    const cleaned = cleanSymbol(item.symbol);
    const exchange = canonicalExchange(item.exchange.trim(), cleaned);
    const symbol = canonicalSymbol(exchange, cleaned);
    if (!exchange || !symbol) return [];
    const id = typeof item.id === "string" && /^[a-z\d_-]+$/i.test(item.id) && !ids.has(item.id) ? item.id : getNewId();
    ids.add(id);
    const daily = item.daily === true || isDailyOnly(exchange, symbol);
    const supported = supportedIntervals({ exchange, symbol, daily });
    const interval = supported.includes(String(item.interval)) ? String(item.interval) : daily ? "D" : "60";
    return [{ id, exchange, symbol, interval, ...(daily ? { daily: true } : {}) }];
  });
};
export const readSavedState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("charts"));
    return { charts: normalizeCharts(Array.isArray(saved) ? saved : saved?.charts) };
  } catch {
    return { charts: [] };
  }
};
