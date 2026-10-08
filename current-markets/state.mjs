import { getNewId } from "../utilities.mjs?v=e5e8dd98c0fa";

export const INTERVALS = { "1": "1m", "5": "5m", "15": "15m", "30": "30m", "60": "1h", "240": "4h", D: "1D", W: "1W", M: "1M" };
export const cleanSymbol = value => typeof value === "string" ? value.replace(/<\/?em>/gi, "").trim() : "";

export const normalizeCharts = items => {
  const ids = new Set();
  return (Array.isArray(items) ? items : []).flatMap(item => {
    if (!item || typeof item.exchange !== "string") return [];
    const exchange = item.exchange.trim();
    const symbol = cleanSymbol(item.symbol);
    if (!exchange || !symbol) return [];
    const id = typeof item.id === "string" && /^[a-z\d_-]+$/i.test(item.id) && !ids.has(item.id) ? item.id : getNewId();
    ids.add(id);
    return [{ id, exchange, symbol, interval: Object.hasOwn(INTERVALS, item.interval) ? String(item.interval) : "60" }];
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
