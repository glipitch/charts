import * as theme from "./../header/theme.mjs";
const prefixId = (id) => `cc_${id}`;

export const addWidget = (item) => {
  const container = document.createElement("div");
  container.classList.add("hidden");
  container.id = prefixId(item.id);
  const main = document.querySelector("main");
  main.appendChild(container);
  new TradingView.widget({
    autosize: true,
    symbol: `${item.exchange}:${item.symbol}`,
    interval: item.interval,
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    backgroundColor: "rgba(255, 255, 255, 1)",
    gridColor: "rgba(0, 0, 0, 0.06)",
    save_image: false,
    container_id: container.id,
  });
};
export const remove = (id) => {
  const el = document.getElementById(prefixId(id));
  el.remove();
};
