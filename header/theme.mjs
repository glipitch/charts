import * as current from "../current-markets/current.mjs?v=61a7eebadd5c";
import { loadSvg } from "../utilities.mjs?v=61a7eebadd5c";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=61a7eebadd5c");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
