import * as constants from "./constants.mjs";
import * as utilities from "./utilities.mjs";
export const manage = () => {
  manageDimension("x");
  manageDimension("y");
};
export const getValidDimension = raw => {
  const value = Number(raw);
  const isValid = value && Number.isInteger(value)
    && value >= constants.MIN_DIMENSION
    && value <= constants.MAX_DIMENSION;
  return isValid ? value : constants.DEFAULT_DIMENSION;
};
export const getGrid = () => ({
  x: getValidDimension(utilities.getProperty("x") || localStorage.getItem("x")),
  y: getValidDimension(utilities.getProperty("y") || localStorage.getItem("y")),
});

const getGridScore = ({ x, y, cells, count, targetRatio }) => {
  const emptyCells = cells - count;
  const ratioDifference = Math.abs((x / y) - targetRatio);
  const emptyCellCost = emptyCells / count * 1.25 + emptyCells * 0.001;
  const exactFitBonus = emptyCells === 0 ? 0.05 : 0;
  const stripPenalty = count > 2 && (x === 1 || y === 1) ? 1 : 0;
  const imbalanceCost = Math.abs(x - y) * 0.02;
  return ratioDifference + emptyCellCost + stripPenalty + imbalanceCost - exactFitBonus;
};

export const getReasonableGrid = chartCount => {
  const count = Math.max(1, Math.min(Number(chartCount) || 1, constants.MAX_DIMENSION * constants.MAX_DIMENSION));
  const targetRatio = window.innerWidth && window.innerHeight
    ? window.innerWidth / window.innerHeight
    : 1;
  let best = { x: constants.DEFAULT_DIMENSION, y: constants.DEFAULT_DIMENSION };
  let bestScore = Number.POSITIVE_INFINITY;
  for (let x = constants.MIN_DIMENSION; x <= constants.MAX_DIMENSION; x++) {
    for (let y = constants.MIN_DIMENSION; y <= constants.MAX_DIMENSION; y++) {
      const cells = x * y;
      if (cells < count) continue;
      const score = getGridScore({ x, y, cells, count, targetRatio });
      if (score < bestScore) {
        best = { x, y };
        bestScore = score;
      }
    }
  }
  return best;
};
const notifyGridChanged = () => window.dispatchEvent(new CustomEvent("gridchange"));
const setDimension = (key, value, notify = true) => {
  const validValue = getValidDimension(value);
  utilities.setProperty(key, validValue);
  localStorage.setItem(key, validValue);
  const input = document.getElementById(key);
  if (input) input.value = validValue;
  if (notify) notifyGridChanged();
  return validValue;
};
export const setGrid = (x, y, notify = true) => {
  setDimension("x", x, false);
  setDimension("y", y, false);
  if (notify) notifyGridChanged();
};
const manageDimension = key => {
  const input = document.getElementById(key);
  const value = getValidDimension(localStorage.getItem(key));
  input.value = value;
  utilities.setProperty(key, value);
  input.addEventListener("input", () => setDimension(key, input.value));
  input.parentElement.querySelector(".plus").addEventListener("click", () => {
    const value = Number(input.value);
    if (value < constants.MAX_DIMENSION) {
      const nextValue = value + 1;
      setDimension(key, nextValue);
    }
  });
  input.parentElement.querySelector(".minus").addEventListener("click", () => {
    const value = Number(utilities.getProperty(key));
    if (value > constants.MIN_DIMENSION) {
      const nextValue = value - 1;
      setDimension(key, nextValue);
    }
  });
};
