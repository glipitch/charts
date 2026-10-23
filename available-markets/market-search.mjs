// Both search fields share one catalogue and worker, while keeping their
// queries and responses independent.
const searches = new Map();
let worker;
let ready = false;
let nextChannel = 0;
let getCurrentCharts = () => [];
let applyCurrentMetadata = () => {};

export const subscribeCurrent = (getCharts, applyMetadata) => {
  getCurrentCharts = getCharts;
  applyCurrentMetadata = applyMetadata;
};

const runSearch = search => {
  if (!ready || !search.query) return;
  worker.postMessage({ type: "search", channel: search.channel,
    query: search.query, id: search.id, limit: search.limit });
};

const showError = () => {
  worker?.terminate();
  worker = undefined;
  ready = false;
  for (const search of searches.values()) {
    clearTimeout(search.timer);
    search.timer = undefined;
    search.id++;
    search.onUpdate({ type: "error" });
  }
};

export const loadAvailable = () => {
  if (worker) return;
  ready = false;
  for (const search of searches.values()) search.onUpdate({ type: "loading" });
  try {
    worker = new Worker(new URL("search-worker.mjs?v=28d787534369", import.meta.url), { type: "module" });
    const currentWorker = worker;
    worker.addEventListener("error", () => { if (worker === currentWorker) showError(); });
    worker.addEventListener("message", ({ data }) => {
      if (worker !== currentWorker) return;
      if (data.type === "error") { showError(); return; }
      if (data.type === "ready") {
        ready = true;
        worker.postMessage({ type: "resolve", charts: getCurrentCharts() });
        for (const search of searches.values()) {
          // A pending input timer keeps the same delay even if loading finishes.
          if (!search.query) search.onUpdate({ type: "clear" });
          else if (!search.timer) runSearch(search);
        }
        return;
      }
      if (data.type === "resolved") { applyCurrentMetadata(data.charts); return; }
      const search = searches.get(data.channel);
      if (data.type === "results" && search && data.id === search.id && search.query) search.onUpdate(data);
    });
    worker.postMessage({ type: "load" });
  } catch { showError(); }
};

export const createMarketSearch = (onUpdate, limit = 200) => {
  const search = { channel: nextChannel++, query: "", id: 0, limit, onUpdate };
  searches.set(search.channel, search);
  return query => {
    clearTimeout(search.timer);
    search.timer = undefined;
    search.query = query.trim();
    search.id++;
    onUpdate({ type: search.query ? "loading" : "clear" });
    if (!search.query) return;
    if (!worker) loadAvailable();
    search.timer = setTimeout(() => {
      search.timer = undefined;
      runSearch(search);
    }, 150);
  };
};
