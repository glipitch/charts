export const getNewId = (len = 32) => {
  return Array
    .from(window.crypto.getRandomValues(
      new Uint8Array(Math.ceil(len / 2))),
      b => ("0" + (b & 0xff).toString(16))
        .slice(-2)).join("");
}
const addCell = (row, text) => row.insertCell().appendChild(document.createTextNode(text));
export const addRow = (table, texts) => {
  const row = table.insertRow();
  texts.forEach(text => addCell(row, text));
  return row;
}
export const setProperty = (key, value) => document.documentElement.style.setProperty(`--${key}`, value);
export const getProperty = (key) => document.documentElement.style.getPropertyValue(`--${key}`);
export const createRangeDecimalSafe
  = (first, step, length, multiplier) =>
    Array.from({ length: length },
      (_, index) =>
        (first * multiplier + index * step * multiplier)
        / multiplier);
export const createValueOptions = (ar) => ar.map(item => `<option value="${item}" />`).join("");

export const debounce = (func, delay = 250) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
export const includesCaseInsensitive = (haystack, needle) => {
  return haystack.toUpperCase().includes(needle.toUpperCase());
};