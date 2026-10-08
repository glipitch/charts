import { getNewId } from "../utilities.mjs";

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
    const charts = normalizeCharts(Array.isArray(saved) ? saved : saved?.charts);
    return {
      charts,
      activeId: charts.some(chart => chart.id === saved?.activeId) ? saved.activeId : charts[0]?.id,
      mobileView: ["focus", "stack", "compare"].includes(saved?.mobileView) ? saved.mobileView : "focus",
    };
  } catch {
    return { charts: [], activeId: undefined, mobileView: "focus" };
  }
};

export const saveState = state => localStorage.setItem("charts", JSON.stringify({ version: 2, ...state }));
export const isCompactViewport = () => window.innerWidth < 768 || (window.innerWidth <= 1000 && window.innerHeight <= 500);

export const getPresentation = (state, grid) => {
  if (!isCompactViewport()) {
    const charts = state.charts.slice(0, grid.x * grid.y);
    const active = state.charts.find(chart => chart.id === state.activeId);
    if (active && !charts.includes(active)) charts[charts.length - 1] = active;
    return { view: "grid", charts };
  }
  const view = state.mobileView === "compare" && window.innerWidth < 600 ? "focus" : state.mobileView;
  if (view === "stack") return { view, charts: state.charts };
  const index = Math.max(0, state.charts.findIndex(chart => chart.id === state.activeId));
  const charts = state.charts.slice(index, index + (view === "compare" ? 2 : 1));
  if (view === "compare" && charts.length === 1 && state.charts.length > 1) charts.push(state.charts[0]);
  return { view, charts };
};
