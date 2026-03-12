import * as utilities from "./../utilities.mjs";
let markets = [];
const available = document.querySelector(".available");
const search = document.querySelector(".search");
export const subscribe = (selectionCallback) => {
  available.addEventListener("click", e => {
    if (e.target.tagName !== "TD") {
      return;
    }
    const row = e.target.parentElement;
    const exchange = row.firstChild.textContent;
    const symbol = row.firstChild.nextSibling.textContent;
    row.classList.add('just-added');
    row.addEventListener('animationend', () => row.classList.remove('just-added'), { once: true });
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
  localStorage.setItem("search", search.value);
});
const applyFilter = () => {
  const filtered = markets.filter(market =>
    utilities.includesCaseInsensitive(market.exchange, search.value) ||
    utilities.includesCaseInsensitive(market.symbol, search.value)
  );
  available.querySelectorAll("tr:not(:first-child)").forEach(x => x.remove());
  filtered.forEach(x => utilities.addRow(available, [x.exchange, x.symbol]));
};
search.value = localStorage.getItem("search") || "";
