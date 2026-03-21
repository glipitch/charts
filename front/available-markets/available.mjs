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
  const grouped = await response.json();
  for (const [exchange, symbols] of Object.entries(grouped)) {
    for (const symbol of symbols) {
      markets.push({ exchange, symbol });
    }
  }
  applyFilter();
};
search.addEventListener("input", () => {
  if (!markets) {
    return;
  }
  utilities.debounce(applyFilter, 500)();
  localStorage.setItem("search", search.value);
});
const MAX_ROWS = 200;
const applyFilter = () => {
  const query = search.value;
  const filtered = query
    ? markets.filter(market =>
        utilities.includesCaseInsensitive(market.exchange, query) ||
        utilities.includesCaseInsensitive(market.symbol, query)
      )
    : [];
  const display = filtered.slice(0, MAX_ROWS);
  available.querySelectorAll("tr:not(:first-child)").forEach(x => x.remove());
  display.forEach(x => utilities.addRow(available, [x.exchange, x.symbol]));
  if (filtered.length > MAX_ROWS) {
    const hint = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.textContent = `${filtered.length - MAX_ROWS} more — refine your search`;
    td.style.textAlign = "center";
    td.style.opacity = "0.5";
    hint.appendChild(td);
    available.appendChild(hint);
  }
};
search.value = localStorage.getItem("search") || "";
