import * as utilities from "../utilities.mjs";

const available = document.querySelector(".available");
const search = document.querySelector(".search");
const MAX_ROWS = 200;

let markets = [];

const clearResults = () => {
  available.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
};

const addOverflowHint = count => {
  const hint = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = 2;
  td.textContent = `${count} more - refine your search`;
  td.style.textAlign = "center";
  td.style.opacity = "0.5";
  hint.appendChild(td);
  available.appendChild(hint);
};

const applyFilter = () => {
  const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = terms.length
    ? markets.filter(market => {
        const combined = `${market.exchange} ${market.symbol}`.toLowerCase();
        return terms.every(term => combined.includes(term));
      })
    : [];
  clearResults();
  filtered
    .slice(0, MAX_ROWS)
    .forEach(market => utilities.addRow(available, [market.exchange, market.symbol]));
  if (filtered.length > MAX_ROWS) addOverflowHint(filtered.length - MAX_ROWS);
};

const applyFilterDebounced = utilities.debounce(applyFilter, 500);

export const subscribe = selectionCallback => {
  available.addEventListener("click", event => {
    if (event.target.tagName !== "TD") return;
    const row = event.target.parentElement;
    const [exchangeCell, symbolCell] = row.children;
    if (!exchangeCell || !symbolCell) return;
    row.classList.add("just-added");
    row.addEventListener("animationend", () => row.classList.remove("just-added"), { once: true });
    selectionCallback(exchangeCell.textContent, symbolCell.textContent);
  });
};

export const loadAvailable = async () => {
  if (markets.length > 0) return;
  const response = await fetch("available-markets/data.json");
  const grouped = await response.json();
  markets = Object.entries(grouped).flatMap(([exchange, symbols]) =>
    symbols.map(symbol => ({ exchange, symbol }))
  );
  applyFilter();
};

search.value = localStorage.getItem("search") || "";
search.addEventListener("input", () => {
  applyFilterDebounced();
  localStorage.setItem("search", search.value);
});
