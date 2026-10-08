import * as constants from "../constants.mjs?v=2df584b8f1cb";
import * as dimensions from "../dimensions.mjs?v=2df584b8f1cb";
import * as urlState from "./url-state.mjs?v=2df584b8f1cb";
import * as widget from "./widget.mjs?v=2df584b8f1cb";
import { INTERVALS as INTERVAL_LABELS, normalizeCharts, readSavedState } from "./state.mjs?v=2df584b8f1cb";
import * as utilities from "../utilities.mjs?v=2df584b8f1cb";

const table = document.querySelector(".current");
const body = table.tBodies[0];
const marketCount = document.querySelector(".market-count");
const emptyState = document.querySelector(".empty-state");
const syncCharts = () => {
  const { x, y } = dimensions.getGrid();
  const compact = window.innerWidth <= 600 || (window.innerWidth <= 1000 && window.innerHeight <= 500);
  widget.sync(charts.slice(0, x * y), compact);
};

const INTERVALS = Object.keys(INTERVAL_LABELS);

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
  marketCount.textContent = n > 0 ? `(${n})` : "";
  emptyState.style.display = n > 0 ? "none" : "";
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
  updateMarketCount();
};

const addChartToTable = item => {
  const row = utilities.addRow(table, [item.exchange, item.symbol, displayInterval(item.interval)]);
  row.id = "row_" + item.id;

  const button = document.createElement("button");
  button.setAttribute("aria-label", `Remove ${item.symbol}`);
  button.appendChild(document.createTextNode(constants.HEAVY_MULTIPLICATION_X));
  button.addEventListener("click", () => {
    removeCurrentMarket(item.id);
    row.remove();
  }, { once: true });
  row.insertCell().appendChild(button);

  const intervalCell = row.cells[2];
  const intervalButton = document.createElement("button");
  intervalButton.className = "interval";
  intervalButton.textContent = displayInterval(item.interval);
  intervalButton.setAttribute("aria-label", `Change interval for ${item.symbol}`);
  intervalCell.replaceChildren(intervalButton);
  intervalCell.addEventListener("click", () => {
    const idx = INTERVALS.indexOf(item.interval);
    item.interval = INTERVALS[(idx + 1) % INTERVALS.length];
    intervalButton.textContent = displayInterval(item.interval);
    saveCharts();
    refreshWidget(item);
  });

  enableDragReorder(row);
  updateMarketCount();
};

const addChart = item => {
  charts.push(item);
  addChartToTable(item);
  saveCharts();
  syncCharts();
};

export const addCurrentMarket = (exchange, symbol) => {
  const [item] = normalizeCharts([{ exchange, symbol, interval: "60" }]);
  if (item) addChart(item);
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
  updateMarketCount();
};

document.querySelector(".clear").addEventListener("click", () => clearCurrentMarkets());
window.addEventListener("gridchange", () => {
  syncCharts();
  urlState.update(charts);
});
window.addEventListener("resize", syncCharts);
updateMarketCount();
