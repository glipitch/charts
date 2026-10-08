export const getNewId = (len = 32) => {
  return Array
    .from(window.crypto.getRandomValues(
      new Uint8Array(Math.ceil(len / 2))),
      b => ("0" + (b & 0xff).toString(16))
        .slice(-2)).join("");
}
export const setProperty = (key, value) => document.documentElement.style.setProperty(`--${key}`, value);

export const debounce = (func, delay = 250) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
export const loadSvg = async (selector, path) => {
  const res = await fetch(path);
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');
  const svg = (typeof selector === "string" ? document.querySelector(selector) : selector).querySelector('svg');
  doc.querySelectorAll('path').forEach(p => svg.appendChild(p.cloneNode(true)));
};
