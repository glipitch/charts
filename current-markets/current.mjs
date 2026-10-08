import * as dimensions from "../dimensions.mjs";
import * as urlState from "./url-state.mjs";
import * as widget from "./widget.mjs";
import { INTERVALS, normalizeCharts, readSavedState, saveState, getPresentation, isCompactViewport } from "./state.mjs";

const list = document.querySelector(".current");
const picker = document.querySelector(".chart-picker");
const viewPicker = document.querySelector(".mobile-view");
let state = { charts: [], mobileView: "focus" };

const persist = () => { saveState(state); urlState.update(state.charts); };
const renderCharts = () => {
  const presentation = getPresentation(state, dimensions.getGrid());
  document.documentElement.dataset.view = presentation.view;
  document.querySelector(".chart-navigation").hidden = !isCompactViewport() || !state.charts.length;
  viewPicker.querySelector('[value="compare"]').disabled = window.innerWidth < 600;
  if (isCompactViewport()) viewPicker.value = presentation.view;
  document.querySelector(".chart-empty").hidden = !!state.charts.length;
  widget.sync(presentation.charts, presentation.view === "stack");
};
const selectChart = id => { state.activeId = id; picker.value = id; persist(); renderCharts(); };
const makeButton = (text, label, action) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", action);
  return button;
};

const renderList = () => {
  list.replaceChildren();
  picker.replaceChildren();
  document.querySelector(".market-count").textContent = state.charts.length ? String(state.charts.length) : "";
  document.querySelector(".empty-state").hidden = !!state.charts.length;
  document.querySelector(".clear").hidden = !state.charts.length;
  state.charts.forEach((chart, index) => {
    picker.add(new Option(`${chart.symbol} · ${chart.exchange}`, chart.id));
    const row = document.createElement("li");
    const name = makeButton("", `Show ${chart.symbol} on ${chart.exchange}`, () => selectChart(chart.id));
    name.className = "chart-name";
    const symbol = document.createElement("strong");
    symbol.textContent = chart.symbol;
    const exchange = document.createElement("small");
    exchange.textContent = chart.exchange;
    name.append(symbol, exchange);
    const interval = document.createElement("select");
    interval.setAttribute("aria-label", `Interval for ${chart.symbol}`);
    Object.entries(INTERVALS).forEach(([value, label]) => interval.add(new Option(label, value)));
    interval.value = chart.interval;
    interval.addEventListener("change", () => { chart.interval = interval.value; persist(); renderCharts(); });
    const menu = document.createElement("details");
    menu.className = "chart-actions";
    const summary = document.createElement("summary");
    summary.textContent = "⋯";
    summary.setAttribute("aria-label", `Actions for ${chart.symbol}`);
    const actions = document.createElement("div");
    [-1, 1].forEach(direction => {
      const button = makeButton(direction < 0 ? "Move up" : "Move down", `${direction < 0 ? "Move up" : "Move down"} ${chart.symbol}`, () => {
        const position = state.charts.indexOf(chart);
        const target = position + direction;
        [state.charts[position], state.charts[target]] = [state.charts[target], state.charts[position]];
        persist(); renderList(); renderCharts();
        list.children[target].querySelector("summary").focus();
      });
      button.disabled = index + direction < 0 || index + direction >= state.charts.length;
      actions.append(button);
    });
    const remove = makeButton("Remove", `Remove ${chart.symbol}`, () => {
      state.charts.splice(state.charts.indexOf(chart), 1);
      if (state.activeId === chart.id) state.activeId = state.charts[Math.min(index, state.charts.length - 1)]?.id;
      persist(); renderList(); renderCharts();
      (list.children[Math.min(index, state.charts.length - 1)]?.querySelector(".chart-name") || document.querySelector(".search")).focus();
    });
    remove.className = "remove";
    actions.append(remove);
    menu.append(summary, actions);
    row.append(name, interval, menu);
    list.append(row);
  });
  picker.value = state.activeId || "";
  viewPicker.value = state.mobileView;
};

export const addCurrentMarket = (exchange, symbol) => {
  const [chart] = normalizeCharts([{ exchange, symbol }]);
  if (!chart) return;
  state.charts.push(chart);
  state.activeId = chart.id;
  persist(); renderList(); renderCharts();
};

export const loadCurrentMarkets = () => {
  state = readSavedState();
  const shared = urlState.getState();
  if (shared) {
    const sameCharts = shared.charts.length === state.charts.length && shared.charts.every((chart, index) =>
      ["exchange", "symbol", "interval"].every(key => chart[key] === state.charts[index][key]));
    if (sameCharts) shared.charts = state.charts;
    state.charts = shared.charts;
    if (!sameCharts) state.activeId = state.charts[0]?.id;
    const grid = shared.grid || dimensions.getReasonableGrid(state.charts.length);
    dimensions.setGrid(grid.x, grid.y, false);
  }
  persist(); renderList(); renderCharts();
};
export const reloadWidgets = () => { widget.reset(); renderCharts(); };

picker.addEventListener("change", () => selectChart(picker.value));
viewPicker.addEventListener("change", () => { state.mobileView = viewPicker.value; persist(); renderCharts(); });
document.querySelectorAll("[data-step]").forEach(button => button.addEventListener("click", () => {
  const index = state.charts.findIndex(chart => chart.id === state.activeId);
  const next = (index + Number(button.dataset.step) + state.charts.length) % state.charts.length;
  if (state.charts[next]) selectChart(state.charts[next].id);
}));
document.querySelector(".clear").addEventListener("click", () => {
  state.charts = [];
  state.activeId = undefined;
  persist(); renderList(); renderCharts();
  document.querySelector(".search").focus();
});
window.addEventListener("gridchange", () => { persist(); renderCharts(); });
window.addEventListener("resize", renderCharts);
