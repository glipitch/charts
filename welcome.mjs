import { createMarketSearch, loadAvailable } from "./available-markets/market-search.mjs?v=7d0691b8c6f8";
import { addCurrentMarket, getCurrentMarkets } from "./current-markets/current.mjs?v=7d0691b8c6f8";
import { setGrid } from "./dimensions.mjs?v=7d0691b8c6f8";
import { open } from "./header/dialog.mjs?v=7d0691b8c6f8";
import { searchFor } from "./available-markets/available.mjs?v=7d0691b8c6f8";
import { showFirstChartGuide } from "./header/first-chart-guide.mjs?v=7d0691b8c6f8";

const form = document.querySelector(".welcome-search-form");
const input = document.querySelector("#welcome-search");
const results = document.querySelector(".welcome-results");
const status = document.querySelector(".welcome-search-status");

if (form && results && status) {
  const search = createMarketSearch(data => {
    results.replaceChildren();
    input.setAttribute("aria-busy", String(data.type === "loading" && !!input.value.trim()));
    status.textContent = "";
    if (!input.value.trim() || data.type === "clear") return;
    if (data.type === "loading") { status.textContent = "Searching…"; return; }
    if (data.type === "error") {
      status.textContent = "Could not load markets. ";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = "Retry";
      retry.addEventListener("click", loadAvailable);
      status.appendChild(retry);
      return;
    }
    for (const market of data.results) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Add ${market.exchange} ${market.symbol}`);
      for (const text of [market.exchange, market.symbol]) {
        const span = document.createElement("span");
        span.textContent = text;
        button.appendChild(span);
      }
      button.addEventListener("click", () => {
        if (!getCurrentMarkets().length) setGrid(1, 1, false);
        addCurrentMarket(market.exchange, market.symbol, market.daily);
        document.querySelector(".dialog-visibility").focus({ preventScroll: true });
        showFirstChartGuide();
      });
      item.appendChild(button);
      results.appendChild(item);
    }
    status.textContent = !data.total ? "No matching markets"
      : data.total > data.results.length ? `${data.total.toLocaleString()} matches. Keep typing to narrow the results.`
      : `${data.total.toLocaleString()} matching markets. Select one to add a chart.`;
  }, 8);

  input.addEventListener("input", () => search(input.value));
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" && results.firstElementChild) {
      event.preventDefault();
      results.querySelector("button").focus();
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    results.querySelector("button")?.focus();
  });
  results.addEventListener("keydown", event => {
    if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
    const buttons = [...results.querySelectorAll("button")];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    event.preventDefault();
    if (event.key === "ArrowUp") (buttons[index - 1] || input).focus();
    else (buttons[index + 1] || buttons[index]).focus();
  });
  form.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !input.value) return;
    event.preventDefault();
    event.stopPropagation();
    input.value = "";
    search("");
    input.focus();
  });
  window.addEventListener("chartschange", ({ detail }) => {
    if (!detail.count) return;
    input.value = "";
    search("");
  });
} else if (form) {
  // Cached pages with the previous search form still open settings.
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!input.value.trim()) return;
    searchFor(input.value);
    open();
  });
}
