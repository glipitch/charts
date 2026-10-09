import * as current from "../current-markets/current.mjs?v=4ae14f326071";
import { loadSvg } from "../utilities.mjs?v=4ae14f326071";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=4ae14f326071");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
