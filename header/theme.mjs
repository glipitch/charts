import * as current from "../current-markets/current.mjs?v=bbf9fbbdbabc";
import { loadSvg } from "../utilities.mjs?v=bbf9fbbdbabc";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=bbf9fbbdbabc");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
