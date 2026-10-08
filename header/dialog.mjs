import { loadAvailable } from "../available-markets/available.mjs";
const dialog = document.querySelector("dialog");
const toggle = document.querySelector(".dialog-visibility");
let previousFocus;
const update = () => toggle.setAttribute("aria-expanded", String(dialog.open));
const close = () => dialog.close();
export const open = () => {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.show();
  update();
  loadAvailable();
  document.querySelector(".search").focus({ preventScroll: true });
};
toggle.addEventListener("click", () => dialog.open ? close() : open());
document.querySelector(".close-panel").addEventListener("click", close);
document.querySelector(".open-markets").addEventListener("click", open);
dialog.addEventListener("close", () => { update(); if (!dialog.open) (previousFocus?.isConnected ? previousFocus : toggle).focus(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && dialog.open) { event.preventDefault(); close(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
});
const sizePanel = () => document.documentElement.style.setProperty("--viewport-height", `${window.visualViewport?.height || window.innerHeight}px`);
window.visualViewport?.addEventListener("resize", sizePanel);
window.addEventListener("resize", sizePanel);
sizePanel();
