import { debounce } from "../utilities.mjs";
const results = document.querySelector(".available");
const search = document.querySelector(".search");
const status = document.querySelector(".search-status");
let worker;
let requestId = 0;
const showStatus = message => { status.textContent = message; };
const runSearch = () => {
  requestId++;
  results.replaceChildren();
  if (!search.value.trim()) { showStatus("Search symbols or exchanges"); return; }
  showStatus("Searching…");
  worker?.postMessage({ type: "search", query: search.value, id: requestId });
};
const showError = () => {
  results.replaceChildren();
  showStatus("Could not load markets. ");
  const retry = document.createElement("button");
  retry.textContent = "Retry";
  retry.addEventListener("click", () => { worker?.terminate(); worker = undefined; loadAvailable(); });
  status.append(retry);
};
export const loadAvailable = () => {
  if (worker) return;
  showStatus("Loading markets…");
  try {
    worker = new Worker(new URL("search-worker.mjs", import.meta.url), { type: "module" });
    worker.addEventListener("error", showError);
    worker.addEventListener("message", ({ data }) => {
      if (data.type === "error") { showError(); return; }
      if (data.type === "ready") { runSearch(); return; }
      if (data.id !== requestId) return;
      results.replaceChildren();
      data.results.forEach(market => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.dataset.exchange = market.exchange;
        button.dataset.symbol = market.symbol;
        const name = document.createElement("strong");
        name.textContent = market.symbol;
        const exchange = document.createElement("small");
        exchange.textContent = market.exchange;
        const add = document.createElement("span");
        add.textContent = "+";
        add.setAttribute("aria-hidden", "true");
        button.append(name, exchange, add);
        button.setAttribute("aria-label", `Add ${market.symbol} on ${market.exchange}`);
        item.append(button);
        results.append(item);
      });
      showStatus(data.total ? `${data.total.toLocaleString()} matches${data.total > data.results.length ? " · Showing the first 200" : ""}` : "No matching markets");
    });
    worker.postMessage({ type: "load" });
  } catch { showError(); }
};
export const subscribe = callback => results.addEventListener("click", event => {
  const button = event.target.closest("button[data-symbol]");
  if (!button) return;
  callback(button.dataset.exchange, button.dataset.symbol);
  button.classList.add("just-added");
  button.addEventListener("animationend", () => button.classList.remove("just-added"), { once: true });
});
search.value = localStorage.getItem("search") || "";
const debouncedSearch = debounce(runSearch, 150);
search.addEventListener("input", () => {
  requestId++;
  results.replaceChildren();
  showStatus(search.value.trim() ? "Searching…" : "Search symbols or exchanges");
  loadAvailable();
  if (search.value.trim()) debouncedSearch(); else runSearch();
  localStorage.setItem("search", search.value);
});
