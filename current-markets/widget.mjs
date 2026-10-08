const main = document.querySelector("main");
const entries = new Map();
let ready;
const pageLoaded = new Promise(resolve => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", resolve, { once: true });
});

const loadTradingView = () => {
  if (window.TradingView) return Promise.resolve(window.TradingView);
  if (!ready) ready = pageLoaded.then(() => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.addEventListener("load", () => resolve(window.TradingView), { once: true });
    script.addEventListener("error", () => {
      script.remove(); ready = undefined;
      reject(new Error("Unable to load charts"));
    }, { once: true });
    document.head.appendChild(script);
  }));
  return ready;
};

const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(records => {
  records.filter(record => record.isIntersecting).forEach(record => {
    observer.unobserve(record.target);
    const entry = entries.get(record.target.id.slice(3));
    if (entry?.container === record.target) start(entry);
  });
}, { root: main, rootMargin: "150px" }) : null;

const start = async entry => {
  if (entry.started) return;
  entry.started = true;
  entry.container.textContent = `Loading ${entry.chart.symbol}…`;
  try {
    const TradingView = await loadTradingView();
    if (!entry.container.isConnected) return;
    entry.container.replaceChildren();
    new TradingView.widget({
      autosize: true,
      symbol: `${entry.chart.exchange}:${entry.chart.symbol}`,
      interval: entry.chart.interval,
      timezone: "Etc/UTC",
      theme: document.documentElement.dataset.theme,
      style: "1", locale: "en", enable_publishing: false, save_image: false,
      // In a scrolling stack, let vertical touch gestures reach the page.
      disabled_features: entry.scrollPage ? ["vert_touch_drag_scroll"] : [],
      container_id: entry.container.id,
    });
  } catch {
    if (!entry.container.isConnected) return;
    entry.container.textContent = `Could not load ${entry.chart.symbol}. `;
    const retry = document.createElement("button");
    retry.textContent = "Retry";
    retry.addEventListener("click", () => { entry.started = false; start(entry); });
    entry.container.appendChild(retry);
  }
};

export const addWidget = (chart, lazy = false) => {
  const container = document.createElement("div");
  container.className = "chart";
  container.id = `cc_${chart.id}`;
  container.setAttribute("aria-label", `${chart.symbol} chart`);
  main.appendChild(container);
  const entry = { chart: { ...chart }, container, started: false, scrollPage: lazy };
  entries.set(chart.id, entry);
  if (lazy && observer) observer.observe(container);
  else return start(entry);
};
export const remove = id => {
  const entry = entries.get(id);
  if (!entry) return;
  observer?.unobserve(entry.container);
  entry.container.remove();
  entries.delete(id);
};
export const sync = (charts, lazy = false) => {
  const ids = new Set(charts.map(chart => chart.id));
  for (const id of entries.keys()) if (!ids.has(id)) remove(id);
  let previous = main.querySelector(".chart-empty");
  charts.forEach(chart => {
    let entry = entries.get(chart.id);
    if (entry && entry.chart.interval !== chart.interval) { remove(chart.id); entry = undefined; }
    if (entry && entry.scrollPage !== lazy) {
      if (entry.started) { remove(chart.id); entry = undefined; }
      else entry.scrollPage = lazy;
    }
    if (!entry) addWidget(chart, lazy);
    else if (!lazy && !entry.started) {
      observer?.unobserve(entry.container);
      start(entry);
    }
    const container = entries.get(chart.id).container;
    if (container.previousElementSibling !== previous) main.insertBefore(container, previous?.nextSibling || main.firstChild);
    previous = container;
  });
};
export const reset = () => [...entries.keys()].forEach(remove);
