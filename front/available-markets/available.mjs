import * as utilities from "./../utilities.mjs";
let markets = [];
const available = document.querySelector(".available");
const search = document.querySelector(".search");
export const subscribe = (selectionCallback) => {
  available.addEventListener("click", e => {
    if (e.target.tagName !== "TD") {
      return;
    }
    const exchange = e.target.parentElement.firstChild.textContent;
    const symbol = e.target.parentElement.firstChild.nextSibling.textContent;
    selectionCallback(exchange, symbol);
  });
}
export const loadAvailable = async () => {
  if (markets.length > 0) {
    return;
  }
  const response = await fetch("available-markets/data.json");
  markets = await response.json();
  applyFilter();
};
search.addEventListener("input", () => {
  if (!markets) {
    return;
  }
  utilities.debounce(applyFilter, 500)();
});
const applyFilter = () => {
  const filtered = markets.filter(market =>
    utilities.includesCaseInsensitive(market.exchange, search.value) ||
    utilities.includesCaseInsensitive(market.symbol, search.value)
  );
  available.querySelectorAll("tr:not(:first-child)").forEach(x => x.remove());
  filtered.forEach(x => utilities.addRow(available, [x.exchange, x.symbol]));
};
