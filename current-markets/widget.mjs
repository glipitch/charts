const prefixId = id => `cc_${id}`;
const main = document.querySelector("main");
const getTheme = () => document.documentElement.dataset.theme;

export const addWidget = (item) => {
  const container = document.createElement("div");
  container.classList.add("hidden");
  container.id = prefixId(item.id);
  main.appendChild(container);
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
