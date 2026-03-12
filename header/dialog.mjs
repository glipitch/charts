const dialog = document.querySelector("dialog");
document.documentElement.dataset.current = "hidden";

import { loadSvg } from './../utilities.mjs';
await loadSvg('.dialog-visibility', 'svg/chevron.svg');

const chevron = document.querySelector(".dialog-visibility");
chevron.title = "Toggle options (Esc)";
chevron.addEventListener("click", () => {
  if (dialog.open) {
    document.documentElement.dataset.current = "hidden";
    dialog.close();
  } else {
    open();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (dialog.open) {
      document.documentElement.dataset.current = "hidden";
      dialog.close();
    } else {
      open();
    }
  }
});

export const open = () => {
  document.documentElement.dataset.current = "visible";
  dialog.show();
  setTimeout(() => document.querySelector(".search")?.focus(), 50);
}
