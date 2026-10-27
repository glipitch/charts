import * as constants from "../constants.mjs?v=4a1ba037781b";
import * as dimensions from "../dimensions.mjs?v=4a1ba037781b";
import * as urlState from "./url-state.mjs?v=4a1ba037781b";
import * as widget from "./widget.mjs?v=4a1ba037781b";
import { INTERVALS as INTERVAL_LABELS, normalizeCharts, readSavedState, supportedIntervals } from "./state.mjs?v=4a1ba037781b";
import * as utilities from "../utilities.mjs?v=4a1ba037781b";

const table = document.querySelector(".current");
const body = table.tBodies[0];
const marketCount = document.querySelector(".market-count");
const emptyState = document.querySelector(".empty-state");
const fitAll = document.querySelector(".fit-all");
const welcome = document.querySelector(".chart-empty");
const main = document.querySelector("main");
const syncCharts = () => {
  const { x, y } = dimensions.getGrid();
  const compact = window.innerWidth <= 600 || (window.innerWidth <= 1000 && window.innerHeight <= 500);
  widget.sync(charts.slice(0, x * y), compact);
  updateMarketCount();
};

let charts = [];
let draggedRow = null;

const displayInterval = value => INTERVAL_LABELS[value] || value;
const chartById = id => charts.find(chart => chart.id === id);

const saveCharts = () => {
  localStorage.setItem("charts", JSON.stringify(charts));
  urlState.update(charts);
};

const updateMarketCount = () => {
  const n = charts.length;
  const { x, y } = dimensions.getGrid();
  const capacity = x * y;
  const countText = n > capacity ? `${capacity} of ${n} shown` : n > 0 ? `(${n})` : "";
  if (marketCount.textContent !== countText) marketCount.textContent = countText;
  marketCount.title = `${x} columns × ${y} rows`;
  if (fitAll) {
    fitAll.hidden = n <= capacity;
    fitAll.disabled = n > constants.MAX_DIMENSION ** 2;
    fitAll.title = fitAll.disabled ? `Maximum grid size is ${constants.MAX_DIMENSION ** 2} charts` : "Expand the grid to show every chart";
  }
  emptyState.style.display = n > 0 ? "none" : "";
  if (welcome) welcome.hidden = n > 0;
  main.classList.toggle("is-empty", !!welcome && n === 0);
  main.classList.toggle("is-single", Math.min(n, capacity) === 1);
  window.dispatchEvent(new CustomEvent("chartschange", { detail: { count: n } }));
};

const reorderChartsFromTable = () => {
  charts = [...body.rows]
    .map(row => chartById(row.id.replace("row_", "")))
    .filter(Boolean);
  saveCharts();
  syncCharts();
};

const enableDragReorder = row => {
  row.draggable = true;
  row.tabIndex = 0;
  row.title = "Drag to reorder, or use Alt + ↑ / ↓";
  row.setAttribute("aria-keyshortcuts", "Alt+ArrowUp Alt+ArrowDown");
  row.addEventListener("keydown", event => {
    if (event.target !== row) return;
    if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    const target = event.key === "ArrowUp" ? row.previousElementSibling : row.nextElementSibling;
    if (!target) return;
    event.preventDefault();
    if (event.key === "ArrowUp") target.before(row); else target.after(row);
    reorderChartsFromTable();
    row.focus();
  });
  row.addEventListener("dragstart", () => {
    draggedRow = row;
    row.classList.add("dragging");
  });
  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
    draggedRow = null;
    table.querySelectorAll(".drag-over").forEach(row => row.classList.remove("drag-over"));
  });
  row.addEventListener("dragover", event => {
    event.preventDefault();
    if (draggedRow && draggedRow !== row) row.classList.add("drag-over");
  });
  row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
  row.addEventListener("drop", event => {
    event.preventDefault();
    row.classList.remove("drag-over");
    if (!draggedRow || draggedRow === row) return;
    const rows = [...body.rows];
    if (rows.indexOf(draggedRow) < rows.indexOf(row)) {
      row.after(draggedRow);
    } else {
      row.before(draggedRow);
    }
    reorderChartsFromTable();
  });
};

const refreshWidget = item => {
  widget.remove(item.id);
  syncCharts();
};

const removeCurrentMarket = id => {
  const pos = charts.findIndex(chart => chart.id === id);
  if (pos < 0) return;
  charts.splice(pos, 1);
  widget.remove(id);
  saveCharts();
  syncCharts();
};

const addChartToTable = item => {
  const row = utilities.addRow(table, [item.exchange, item.symbol, displayInterval(item.interval)]);
  row.id = "row_" + item.id;

  const button = document.createElement("button");
  button.setAttribute("aria-label", `Remove ${item.symbol}`);
  button.appendChild(document.createTextNode(constants.HEAVY_MULTIPLICATION_X));
  button.addEventListener("click", () => {
    const nextRow = row.nextElementSibling || row.previousElementSibling;
    removeCurrentMarket(item.id);
    row.remove();
    (nextRow?.querySelector("button") || document.querySelector(".search"))?.focus({ preventScroll: true });
  }, { once: true });
  row.insertCell().appendChild(button);

  const intervalCell = row.cells[2];
  const intervalSelect = document.createElement("select");
  intervalSelect.className = "interval";
  intervalSelect.setAttribute("aria-label", `Interval for ${item.symbol}`);
  renderIntervalOptions(intervalSelect, item);
  intervalCell.replaceChildren(intervalSelect);
  intervalSelect.addEventListener("change", () => {
    if (!supportedIntervals(item).includes(intervalSelect.value)) return;
    item.interval = intervalSelect.value;
    saveCharts();
    refreshWidget(item);
  });

  enableDragReorder(row);
};

const renderIntervalOptions = (select, item) => {
  select.replaceChildren(...supportedIntervals(item).map(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = displayInterval(value);
    return option;
  }));
  select.value = item.interval;
};

const addChart = item => {
  charts.push(item);
  addChartToTable(item);
  saveCharts();
  syncCharts();
};

export const addCurrentMarket = (exchange, symbol, daily = false) => {
  const [item] = normalizeCharts([{ exchange, symbol, daily, interval: "60" }]);
  if (item) addChart(item);
};

export const getCurrentMarkets = () => charts.map(chart => ({ ...chart }));

// Saved daily flags survive reloads; shared links get fresh metadata once the
// catalogue is ready. Update only charts still present, preserving user edits.
export const applyMarketMetadata = resolved => {
  let changed = false;
  for (const market of resolved) {
    const chart = chartById(market.id);
    if (!chart || chart.symbol !== market.symbol) continue;
    const [next] = normalizeCharts([{ ...chart, exchange: market.exchange, daily: chart.daily || market.daily }]);
    if (chart.exchange === next.exchange && chart.interval === next.interval && chart.daily === next.daily) continue;
    Object.assign(chart, next);
    const row = document.getElementById("row_" + chart.id);
    if (row) {
      row.cells[0].textContent = chart.exchange;
      renderIntervalOptions(row.cells[2].querySelector("select"), chart);
    }
    changed = true;
  }
  if (changed) { saveCharts(); syncCharts(); }
};

export const loadCurrentMarkets = () => {
  const state = urlState.getState();
  if (state) {
    charts = state.charts;
    const grid = state.grid || dimensions.getReasonableGrid(charts.length);
    dimensions.setGrid(grid.x, grid.y, false);
    localStorage.setItem("charts", JSON.stringify(charts));
  } else {
    charts = readSavedState().charts;
    // Start an empty dashboard with one full-size chart. Users can then choose
    // a different grid in settings before selecting their first market.
    if (!charts.length) dimensions.setGrid(1, 1, false);
  }

  urlState.update(charts);
  charts.forEach(item => {
    addChartToTable(item);
  });
  syncCharts();
};

export const reloadWidgets = () => {
  widget.reset();
  syncCharts();
};

const clearCurrentMarkets = () => {
  charts.forEach(item => {
    document.getElementById("row_" + item.id)?.remove();
    widget.remove(item.id);
  });
  charts = [];
  saveCharts();
  syncCharts();
};

document.querySelector(".clear").addEventListener("click", () => clearCurrentMarkets());
fitAll?.addEventListener("click", () => {
  const grid = dimensions.getReasonableGrid(charts.length);
  dimensions.setGrid(grid.x, grid.y);
});
window.addEventListener("gridchange", () => {
  syncCharts();
  urlState.update(charts);
});
window.addEventListener("resize", syncCharts);
updateMarketCount();
