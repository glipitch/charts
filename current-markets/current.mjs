import * as constants from "./../constants.mjs";
import * as widget from "./widget.mjs";
import * as visibility from "./visibility.mjs";
import * as utilities from "./../utilities.mjs";
const table = document.querySelector(".current");
let charts = [];
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
  visibility.setVisibility();
}
export const loadCurrentMarkets = () => {
  charts = JSON.parse(localStorage.getItem("charts")) || [];
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
  visibility.setVisibility();
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
};
document.querySelector(".clear").addEventListener("click", () => clearCurrentMarkets());
