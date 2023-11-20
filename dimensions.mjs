import * as constants from "./constants.mjs";
import * as visibility from "./current-markets/visibility.mjs";
import * as utilities from "./utilities.mjs";
export const manage = () => {
  manageDimension("x");
  manageDimension("y");
  visibility.setVisibility();
}
const getValidDimension = raw => {
  const value = Number(raw);
  const isValid = value && Number.isInteger(value)
    && value >= constants.MIN_DIMENSION
    && value <= constants.MAX_DIMENSION;
  return isValid ? raw : constants.DEFAULT_DIMENSION;
};
const applyDimensions = (key, value) => {
  utilities.setProperty(key, value);
  localStorage.setItem(key, value);
  visibility.setVisibility();
};
const manageDimension = (key) => {
  const input = document.getElementById(key);
  const value = getValidDimension(localStorage.getItem(key));
  input.value = value;
  utilities.setProperty(key, value);
  input.addEventListener("input", () => applyDimensions(key, getValidDimension(input.value)));
  input.parentElement.querySelector(".plus").addEventListener("click", async () => {
    const value = parseInt(input.value);
    if (value < constants.MAX_DIMENSION) {
      const nextValue = value + 1;
      input.value = nextValue;
      applyDimensions(key, nextValue);
    }
  });
  input.parentElement.querySelector(".minus").addEventListener("click", () => {
    const value = parseInt(utilities.getProperty(key));
    if (value > 1) {
      const nextValue = value - 1;
      input.value = nextValue;
      applyDimensions(key, nextValue);
    }
  });
}
