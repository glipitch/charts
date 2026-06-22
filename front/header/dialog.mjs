import { loadSvg } from "../utilities.mjs";

const dialog = document.querySelector("dialog");
const chevron = document.querySelector(".dialog-visibility");

const setCurrentVisibility = value => {
  document.documentElement.dataset.current = value;
};

const close = () => {
  setCurrentVisibility("hidden");
  dialog.close();
};

const toggle = () => {
  if (dialog.open) {
    close();
  } else {
    open();
  }
};

export const open = () => {
  setCurrentVisibility("visible");
  dialog.show();
  setTimeout(() => document.querySelector(".search")?.focus(), 50);
};

setCurrentVisibility("hidden");
chevron.title = "Toggle options (Esc)";
chevron.addEventListener("click", toggle);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") toggle();
});

loadSvg(".dialog-visibility", "svg/chevron.svg");
