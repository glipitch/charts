import { addRow, debounce } from "../utilities.mjs";

const available = document.querySelector(".available");
const search = document.querySelector(".search");
let worker;
let requestId = 0;

const clearResults = () => available.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
const showMessage = message => {
  const row = document.createElement("tr");
  const cell = row.insertCell();
  cell.colSpan = 2;
  cell.textContent = message;
  cell.style.textAlign = "center";
  cell.style.opacity = "0.5";
  available.appendChild(row);
  return cell;
};
const runSearch = () => {
  requestId++;
  clearResults();
  if (!search.value.trim()) return;
  showMessage("Searching…");
  worker?.postMessage({ type: "search", query: search.value, id: requestId });
};
const showError = () => {
  clearResults();
  const cell = showMessage("Could not load markets. ");
  const retry = document.createElement("button");
  retry.textContent = "Retry";
  retry.addEventListener("click", () => { worker?.terminate(); worker = undefined; loadAvailable(); });
  cell.appendChild(retry);
};
export const loadAvailable = () => {
  if (worker) return;
  clearResults();
  showMessage("loading...");
  try {
    worker = new Worker(new URL("search-worker.mjs", import.meta.url), { type: "module" });
    worker.addEventListener("error", showError);
    worker.addEventListener("message", ({ data }) => {
      if (data.type === "error") { showError(); return; }
      if (data.type === "ready") { runSearch(); return; }
      if (data.id !== requestId) return;
      clearResults();
      data.results.forEach(market => {
        const row = addRow(available, [market.exchange, market.symbol]);
        row.dataset.market = "true";
        row.tabIndex = 0;
      });
      if (!data.total) showMessage("No matching markets");
      else if (data.total > data.results.length) showMessage(`${data.total - data.results.length} more - refine your search`);
    });
    worker.postMessage({ type: "load" });
  } catch { showError(); }
};
export const subscribe = callback => {
  const select = event => {
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("tr[data-market]");
    if (!row) return;
    if (event.type === "keydown") event.preventDefault();
    callback(row.cells[0].textContent, row.cells[1].textContent);
    row.classList.add("just-added");
    row.addEventListener("animationend", () => row.classList.remove("just-added"), { once: true });
  };
  available.addEventListener("click", select);
  available.addEventListener("keydown", select);
};

search.value = localStorage.getItem("search") || "";
const debouncedSearch = debounce(runSearch, 150);
search.addEventListener("input", () => {
  requestId++;
  clearResults();
  loadAvailable();
  if (search.value.trim()) { showMessage("Searching…"); debouncedSearch(); }
  localStorage.setItem("search", search.value);
});
