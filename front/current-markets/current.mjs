import * as constants from "../constants.mjs";
import * as dimensions from "../dimensions.mjs";
import * as urlState from "./url-state.mjs";
import * as widget from "./widget.mjs";
import * as visibility from "./visibility.mjs";
import * as utilities from "../utilities.mjs";

const table = document.querySelector(".current");
const marketCount = document.querySelector(".market-count");
const emptyState = document.querySelector(".empty-state");
const main = document.querySelector("main");

const INTERVALS = ["1", "5", "15", "60", "240", "D", "W", "M"];
const INTERVAL_LABELS = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "60": "1h",
  "240": "4h",
  D: "1D",
  W: "1W",
  M: "1M",
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
  marketCount.textContent = n > 0 ? `(${n})` : "";
  emptyState.style.display = n > 0 ? "none" : "";
};

const reorderChartsFromTable = () => {
  charts = [...table.querySelectorAll("tr:not(:first-child)")]
    .map(row => chartById(row.id.replace("row_", "")))
    .filter(Boolean);
  charts.forEach(chart => {
    const el = document.getElementById(`cc_${chart.id}`);
    if (el) main.appendChild(el);
  });
  saveCharts();
  visibility.setVisibility();
};

const enableDragReorder = row => {
  row.draggable = true;
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
    const rows = [...table.querySelectorAll("tr:not(:first-child)")];
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
  widget.addWidget(item);
  visibility.setVisibility();
};

const removeCurrentMarket = id => {
  const pos = charts.findIndex(chart => chart.id === id);
  if (pos < 0) return;
  charts.splice(pos, 1);
  widget.remove(id);
  saveCharts();
  visibility.setVisibility();
  updateMarketCount();
};

const addChartToTable = item => {
  const row = utilities.addRow(table, [item.exchange, item.symbol, displayInterval(item.interval)]);
  row.id = "row_" + item.id;

  const button = document.createElement("button");
  button.appendChild(document.createTextNode(constants.HEAVY_MULTIPLICATION_X));
  button.addEventListener("click", () => {
    removeCurrentMarket(item.id);
    row.remove();
  }, { once: true });
  row.insertCell().appendChild(button);

  const intervalCell = row.cells[2];
  intervalCell.addEventListener("click", () => {
    const idx = INTERVALS.indexOf(item.interval);
    item.interval = INTERVALS[(idx + 1) % INTERVALS.length];
    intervalCell.textContent = displayInterval(item.interval);
    saveCharts();
    refreshWidget(item);
  });

  enableDragReorder(row);
  updateMarketCount();
};

const addChart = item => {
  charts.push(item);
  widget.addWidget(item);
  addChartToTable(item);
  saveCharts();
  visibility.setVisibility();
};

export const addCurrentMarket = (exchange, symbol) => {
  addChart({
    id: utilities.getNewId(),
    exchange,
    symbol,
    interval: "60",
  });
};

export const loadCurrentMarkets = () => {
  const state = urlState.getState();
  if (state) {
    charts = state.charts;
    const grid = state.grid || dimensions.getReasonableGrid(charts.length);
    dimensions.setGrid(grid.x, grid.y, false);
    localStorage.setItem("charts", JSON.stringify(charts));
  } else {
    charts = JSON.parse(localStorage.getItem("charts")) || [];
  }

  urlState.update(charts);
  charts.forEach(item => {
    widget.addWidget(item);
    addChartToTable(item);
  });
  visibility.setVisibility();
};

export const reloadWidgets = () => {
  charts.forEach(refreshWidget);
  visibility.setVisibility();
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
  visibility.setVisibility();
  urlState.update(charts);
});
updateMarketCount();
