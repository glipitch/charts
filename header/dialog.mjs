import { loadSvg } from "../utilities.mjs?v=2df584b8f1cb";

const dialog = document.querySelector("dialog");
const chevron = document.querySelector(".dialog-visibility");
let previousFocus;

const setCurrentVisibility = value => {
  document.documentElement.dataset.current = value;
  chevron.setAttribute("aria-expanded", String(value === "visible"));
};

const close = () => {
  setCurrentVisibility("hidden");
  dialog.close();
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
};

const toggle = () => {
  if (dialog.open) {
    close();
  } else {
    open();
  }
};

export const open = () => {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  setCurrentVisibility("visible");
  dialog.show();
  const compact = window.innerWidth <= 800 || (window.innerWidth <= 1000 && window.innerHeight <= 500) || window.matchMedia('(pointer: coarse)').matches;
  if (compact) {
    dialog.querySelector(".dialog-content").scrollTop = 0;
    dialog.focus({ preventScroll: true });
  } else document.querySelector(".search")?.focus({ preventScroll: true });
};

setCurrentVisibility("hidden");
chevron.title = "Toggle options (Esc)";
chevron.addEventListener("click", toggle);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { event.preventDefault(); toggle(); }
});

const sizeWindow = () => document.documentElement.style.setProperty("--viewport-height", `${window.visualViewport?.height || window.innerHeight}px`);
window.visualViewport?.addEventListener("resize", sizeWindow);
window.addEventListener("resize", sizeWindow);
sizeWindow();

loadSvg(".dialog-visibility", "svg/chevron.svg?v=2df584b8f1cb");
