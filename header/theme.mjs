import * as current from "../current-markets/current.mjs?v=376a75580552";
import { loadSvg } from "../utilities.mjs?v=376a75580552";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=376a75580552");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
