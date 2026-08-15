const prefixId = id => `cc_${id}`;
const main = document.querySelector("main");
const getTheme = () => document.documentElement.dataset.theme;
const TRADING_VIEW_SRC = "https://s3.tradingview.com/tv.js";

const pageLoaded = new Promise(resolve => {
  if (document.readyState === "complete") {
    resolve();
  } else {
    window.addEventListener("load", resolve, { once: true });
  }
});

const loadTradingView = () => new Promise((resolve, reject) => {
  if (window.TradingView) {
    resolve(window.TradingView);
    return;
  }

  const script = document.createElement("script");
  script.src = TRADING_VIEW_SRC;
  script.addEventListener("load", () => resolve(window.TradingView), { once: true });
  script.addEventListener("error", () => reject(new Error("Unable to load TradingView")), { once: true });
  document.head.appendChild(script);
});

// Firefox consumes Escape to stop a page that is still loading. Starting the
// third-party download after load keeps it from extending that first-load window.
const tradingViewReady = pageLoaded.then(loadTradingView);

export const addWidget = async (item) => {
  const container = document.createElement("div");
  container.classList.add("hidden");
  container.id = prefixId(item.id);
  main.appendChild(container);

  const TradingView = await tradingViewReady;
  if (!container.isConnected) return;

  new TradingView.widget({
    autosize: true,
    symbol: `${item.exchange}:${item.symbol}`,
    interval: item.interval,
    timezone: "Etc/UTC",
    theme: getTheme(),
    style: "1",
    locale: "en",
    enable_publishing: false,
    save_image: false,
    container_id: container.id,
  });
}
export const remove = id => {
  const el = document.getElementById(prefixId(id));
  el?.remove();
};
