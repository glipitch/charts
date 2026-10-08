import { addRow, debounce } from "../utilities.mjs?v=2df584b8f1cb";

const available = document.querySelector(".available");
const body = available.tBodies[0];
const search = document.querySelector(".search");
const status = document.querySelector(".search-status");
let worker;
let requestId = 0;

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
const runSearch = () => {
  requestId++;
  clearResults();
  if (!search.value.trim()) return;
  showMessage("Searching…");
  worker?.postMessage({ type: "search", query: search.value, id: requestId });
};
const showError = () => {
  worker?.terminate();
  worker = undefined;
  requestId++;
  clearResults();
  const cell = showMessage("Could not load markets. ");
  const retry = document.createElement("button");
  retry.textContent = "Retry";
  retry.addEventListener("click", loadAvailable);
  cell.appendChild(retry);
};
export const loadAvailable = () => {
  if (worker) return;
  clearResults();
  showMessage("loading...");
  try {
    worker = new Worker(new URL("search-worker.mjs?v=2df584b8f1cb", import.meta.url), { type: "module" });
    const currentWorker = worker;
    worker.addEventListener("error", () => { if (worker === currentWorker) showError(); });
    worker.addEventListener("message", ({ data }) => {
      if (worker !== currentWorker) return;
      if (data.type === "error") { showError(); return; }
      if (data.type === "ready") { runSearch(); return; }
      if (data.id !== requestId) return;
      clearResults();
      data.results.forEach(market => {
        const row = addRow(available, [market.exchange, market.symbol]);
        row.dataset.market = "true";
        row.tabIndex = 0;
      });
      status.textContent = `${data.total.toLocaleString()} matching markets`;
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
  if (search.value.trim()) {
    if (!worker) loadAvailable(); else showMessage("Searching…");
    debouncedSearch();
  }
  localStorage.setItem("search", search.value);
});
