import * as constants from "../constants.mjs";
import * as dimensions from "../dimensions.mjs";
import * as utilities from "../utilities.mjs";

const safeEncode = value => encodeURIComponent(String(value));
const DEFAULT_INTERVAL = "60";

const getRawParam = name => {
  const prefix = `${name}=`;
  return window.location.search
    .slice(1)
    .split("&")
    .find(part => part.startsWith(prefix))
    ?.slice(prefix.length) || null;
};

const parseGridSpec = raw => {
  if (!raw) return null;
  const value = raw.trim();
  const match = value.match(/^(\d+)\s*[xX,:]\s*(\d+)$/)
    || value.match(/^(\d+)\s*columns?\s+(\d+)\s*rows?$/i);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  const isValid = [x, y].every(value =>
    Number.isInteger(value)
    && value >= constants.MIN_DIMENSION
    && value <= constants.MAX_DIMENSION
  );
  return isValid ? { x, y } : null;
};

const normalizeChart = item => ({
  id: utilities.getNewId(),
  exchange: item.exchange,
  symbol: item.symbol,
  interval: item.interval || DEFAULT_INTERVAL,
});

const parseJsonCharts = encoded => {
  const parsed = JSON.parse(decodeURIComponent(encoded));
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeChart);
};

const parseCompactCharts = encoded => encoded
  .split(",")
  .filter(Boolean)
  .map(part => {
    const fields = part.split(":");
    if (fields.length < 2) return null;
    return normalizeChart({
      exchange: decodeURIComponent(fields[0]),
      symbol: decodeURIComponent(fields[1]),
      interval: fields[2] ? decodeURIComponent(fields[2]) : DEFAULT_INTERVAL,
    });
  })
  .filter(Boolean);

const serializeChart = ({ exchange, symbol, interval }) => {
  const parts = [safeEncode(exchange), safeEncode(symbol)];
  if (String(interval) !== DEFAULT_INTERVAL) parts.push(safeEncode(interval));
  return parts.join(":");
};

export const getState = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = getRawParam("charts");
    if (!encoded) return null;
    const charts = encoded.startsWith("%5B") || encoded.startsWith("[")
      ? parseJsonCharts(encoded)
      : parseCompactCharts(encoded);
    if (!charts.length) return null;
    return { charts, grid: parseGridSpec(params.get("grid")) };
  } catch (err) {
    console.warn("Could not parse charts from URL:", err);
    return null;
  }
};

export const update = charts => {
  try {
    const parts = charts.map(serializeChart);
    const grid = dimensions.getGrid();
    const url = new URL(window.location.href);
    url.search = parts.length ? `?charts=${parts.join(",")}&grid=${grid.x}x${grid.y}` : "";
    history.replaceState(null, "", url.toString());
  } catch (err) {
    console.warn("Could not update URL with charts:", err);
  }
};
