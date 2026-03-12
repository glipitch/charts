const dialog = document.querySelector("dialog");
document.documentElement.dataset.current = "hidden";

import { loadSvg } from './../utilities.mjs';
await loadSvg('.dialog-visibility', 'svg/chevron.svg');

document.querySelector(".dialog-visibility").addEventListener("click", () => {
  if (dialog.open) {
    document.documentElement.dataset.current = "hidden";
    dialog.close();
  } else {
    open();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && dialog.open) {
    document.documentElement.dataset.current = "hidden";
    dialog.close();
  }
});

export const open = () => {
  document.documentElement.dataset.current = "visible";
  dialog.show();
  setTimeout(() => document.querySelector(".search")?.focus(), 50);
}
