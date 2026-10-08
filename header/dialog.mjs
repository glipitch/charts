import { loadAvailable } from "../available-markets/available.mjs";
import { isCompactViewport } from "../current-markets/state.mjs";
const dialog = document.querySelector("dialog");
const toggle = document.querySelector(".dialog-visibility");
let previousFocus;
let modal = false;
const update = () => toggle.setAttribute("aria-expanded", String(dialog.open));
const close = () => dialog.close();
export const open = () => {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  modal = isCompactViewport();
  if (modal) dialog.showModal();
  else dialog.show();
  update();
  loadAvailable();
  document.querySelector(".search").focus({ preventScroll: true });
};
toggle.addEventListener("click", () => dialog.open ? close() : open());
document.querySelector(".close-panel").addEventListener("click", close);
document.querySelector(".open-markets").addEventListener("click", open);
dialog.addEventListener("close", () => { update(); if (!dialog.open) (previousFocus?.isConnected ? previousFocus : toggle).focus(); });
dialog.addEventListener("click", event => { if (event.target === dialog && event.clientY < dialog.getBoundingClientRect().top) close(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && dialog.open) { event.preventDefault(); close(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); }
});
window.addEventListener("resize", () => {
  if (!dialog.open || modal === isCompactViewport()) return;
  const focused = document.activeElement;
  modal = isCompactViewport();
  dialog.close();
  if (modal) dialog.showModal(); else dialog.show();
  update(); focused?.focus({ preventScroll: true });
});
const sizePanel = () => document.documentElement.style.setProperty("--viewport-height", `${window.visualViewport?.height || window.innerHeight}px`);
window.visualViewport?.addEventListener("resize", sizePanel);
window.addEventListener("resize", sizePanel);
sizePanel();
