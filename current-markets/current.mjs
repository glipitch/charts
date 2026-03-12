import * as constants from "./../constants.mjs";
import * as widget from "./widget.mjs";
import * as visibility from "./visibility.mjs";
import * as utilities from "./../utilities.mjs";
const table = document.querySelector(".current");
const marketCount = document.querySelector(".market-count");
const emptyState = document.querySelector(".empty-state");
const INTERVALS = ["1", "5", "15", "60", "D", "W", "M"];
let charts = [];
let draggedRow = null;
const enableDragReorder = (row) => {
  row.draggable = true;
  row.addEventListener('dragstart', () => {
    draggedRow = row;
    row.classList.add('dragging');
  });
  row.addEventListener('dragend', () => {
    row.classList.remove('dragging');
    draggedRow = null;
    table.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
  });
  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (draggedRow && draggedRow !== row) row.classList.add('drag-over');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('drag-over');
    if (!draggedRow || draggedRow === row) return;
    const rows = [...table.querySelectorAll('tr:not(:first-child)')];
    if (rows.indexOf(draggedRow) < rows.indexOf(row)) {
      row.after(draggedRow);
    } else {
      row.before(draggedRow);
    }
    const reordered = [...table.querySelectorAll('tr:not(:first-child)')].map(r => {
      const id = r.id.replace('row_', '');
      return charts.find(c => c.id === id);
    }).filter(Boolean);
    charts.length = 0;
    charts.push(...reordered);
    const main = document.querySelector('main');
    reordered.forEach(c => {
      const el = document.getElementById(`cc_${c.id}`);
      if (el) main.appendChild(el);
    });
    localStorage.setItem('charts', JSON.stringify(charts));
    updateUrlFromCharts();
    visibility.setVisibility();
  });
};
const addChartToTable = (item, removeCallback) => {
  const row = utilities.addRow(table, [item.exchange, item.symbol, item.interval]);
  row.id = "row_" + item.id;
  const button = document.createElement("button");
  const textNode = document.createTextNode(constants.HEAVY_MULTIPLICATION_X);
  button.appendChild(textNode);
  button.addEventListener("click", () => {
    removeCallback(item.id);
    row?.remove();
  }, { once: true });
  row.insertCell().appendChild(button);
  // Interval cycling — click interval cell to change
  const intervalCell = row.cells[2];
  intervalCell.addEventListener('click', () => {
    const idx = INTERVALS.indexOf(item.interval);
    item.interval = INTERVALS[(idx + 1) % INTERVALS.length];
    intervalCell.textContent = item.interval;
    localStorage.setItem('charts', JSON.stringify(charts));
    updateUrlFromCharts();
    widget.remove(item.id);
    widget.addWidget(item);
    visibility.setVisibility();
  });
  enableDragReorder(row);
  updateMarketCount();
};
export const addCurrentMarket = (exchange, symbol) => {
  const item = {
    id: utilities.getNewId(),
    exchange: exchange,
    symbol: symbol,
    interval: "60",
  };
  charts.push(item);
  widget.addWidget(item);
  addChartToTable(item, removeCurrentMarket);
  localStorage.setItem("charts", JSON.stringify(charts));
  updateUrlFromCharts();
  visibility.setVisibility();
}
export const loadCurrentMarkets = () => {
  // Prefer charts from URL (if present), otherwise fall back to localStorage
  const urlCharts = getChartsFromUrl();
  if (urlCharts) {
    charts = urlCharts;
    // persist to localStorage so the app works offline/without the URL
    localStorage.setItem("charts", JSON.stringify(charts));
    // replace the URL to a normalized (encoded) form
    updateUrlFromCharts();
  } else {
    charts = JSON.parse(localStorage.getItem("charts")) || [];
    // Ensure the URL reflects the loaded localStorage config on initial load
    updateUrlFromCharts();
  }
  charts.forEach(item => {
    widget.addWidget(item);
    addChartToTable(item, removeCurrentMarket);
  });
  visibility.setVisibility();
};
const removeCurrentMarket = id => {
  const pos = charts.map(e => e.id).indexOf(id);
  charts.splice(pos, 1);
  localStorage.setItem("charts", JSON.stringify(charts));
  widget.remove(id);
  updateUrlFromCharts();
  visibility.setVisibility();
  updateMarketCount();
};
export const reloadWidgets = () => {
  charts.forEach(item => {
    widget.remove(item.id);
    widget.addWidget(item);
  });
  visibility.setVisibility();
};
const clearCurrentMarkets = () => {
  charts.forEach(item => {
    document.getElementById("row_" + item.id)?.remove();
    widget.remove(item.id);
  });
  charts = [];
  localStorage.setItem("charts", JSON.stringify(charts));
  updateUrlFromCharts();
  updateMarketCount();
};
document.querySelector(".clear").addEventListener("click", () => clearCurrentMarkets());

const updateMarketCount = () => {
  const n = charts.length;
  marketCount.textContent = n > 0 ? `(${n})` : '';
  emptyState.style.display = n > 0 ? 'none' : '';
};
updateMarketCount();

// --- URL sync helpers -------------------------------------------------
function getChartsFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('charts');
    if (!encoded) return null;
    // Support two formats:
    // 1) legacy JSON-encoded: charts=%5B%7B"exchange"...%7D%5D
    // 2) compact readable: charts=EX:SYM:INT,EX2:SYM2:INT  (fields are URI-encoded individually)
    // Detect JSON-style (starts with %5B or [) and try to parse it first.
    const looksLikeJson = encoded.startsWith('%5B') || encoded.startsWith('[');
    if (looksLikeJson) {
      const decoded = decodeURIComponent(encoded);
      const parsed = JSON.parse(decoded);
      if (!Array.isArray(parsed)) return null;
      return parsed.map(item => ({
        id: utilities.getNewId(),
        exchange: item.exchange,
        symbol: item.symbol,
        interval: item.interval || '60'
      }));
    }
    // Otherwise parse compact format: EX:SYM:INT,EX2:SYM2:INT
    const parts = encoded.split(',').filter(Boolean);
    const results = [];
    for (const part of parts) {
      const fields = part.split(':');
      if (fields.length < 2) continue; // at least exchange:symbol
      const exchange = decodeURIComponent(fields[0]);
      const symbol = decodeURIComponent(fields[1]);
      const interval = fields[2] ? decodeURIComponent(fields[2]) : '60';
      results.push({ id: utilities.getNewId(), exchange, symbol, interval });
    }
    return results.length ? results : null;
  } catch (err) {
    console.warn('Could not parse charts from URL:', err);
    return null;
  }
}

function updateUrlFromCharts() {
  try {
    // Serialize to compact readable format: EX:SYM:INT,EX2:SYM2:INT
    const safeEncode = s => encodeURIComponent(String(s));
    const parts = charts.map(({ exchange, symbol, interval }) =>
      `${safeEncode(exchange)}:${safeEncode(symbol)}:${safeEncode(interval)}`
    );
    // Build the query string manually to keep ':' and ',' unescaped
    const url = new URL(window.location.href);
    url.search = parts.length ? `?charts=${parts.join(',')}` : '';
    // Replace the current history entry without reloading
    history.replaceState(null, '', url.toString());
  } catch (err) {
    console.warn('Could not update URL with charts:', err);
  }
}
