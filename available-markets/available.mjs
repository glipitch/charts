import { addRow } from "../utilities.mjs?v=e698ad81464a";
import { createMarketSearch, loadAvailable } from "./market-search.mjs?v=e698ad81464a";
export { loadAvailable, subscribeCurrent } from "./market-search.mjs?v=e698ad81464a";

const available = document.querySelector(".available");
const body = available.tBodies[0];
const search = document.querySelector(".search");
const status = document.querySelector(".search-status");

const clearResults = () => { body.replaceChildren(); status.textContent = ""; };
const showMessage = message => {
  const row = body.insertRow();
  const cell = row.insertCell();
  cell.colSpan = 2;
  cell.textContent = message;
  cell.style.textAlign = "center";
  cell.style.opacity = "0.5";
  status.textContent = message;
  return cell;
};
const runSearch = createMarketSearch(data => {
  clearResults();
  if (data.type === "clear") return;
  if (data.type === "loading") { showMessage("Searching…"); return; }
  if (data.type === "error") {
    const cell = showMessage("Could not load markets. ");
    const retry = document.createElement("button");
    retry.textContent = "Retry";
    retry.addEventListener("click", loadAvailable);
    cell.appendChild(retry);
    return;
  }
  data.results.forEach(market => {
    const row = addRow(available, [market.exchange, market.symbol]);
    row.dataset.market = "true";
    if (market.daily) row.dataset.daily = "true";
    row.tabIndex = 0;
  });
  status.textContent = `${data.total.toLocaleString()} matching markets`;
  if (!data.total) showMessage("No matching markets");
  else if (data.total > data.results.length) showMessage(`${data.total - data.results.length} more - refine your search`);
});

export const subscribe = callback => {
  const select = event => {
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("tr[data-market]");
    if (!row) return;
    if (event.type === "keydown") event.preventDefault();
    callback(row.cells[0].textContent, row.cells[1].textContent, row.dataset.daily === "true");
    row.classList.add("just-added");
    row.addEventListener("animationend", () => row.classList.remove("just-added"), { once: true });
  };
  available.addEventListener("click", select);
  available.addEventListener("keydown", select);
};

search.value = localStorage.getItem("search") || "";
if (search.value.trim()) runSearch(search.value);
search.addEventListener("input", () => {
  runSearch(search.value);
  localStorage.setItem("search", search.value);
});

export const searchFor = query => {
  search.value = query;
  search.dispatchEvent(new Event("input", { bubbles: true }));
};
