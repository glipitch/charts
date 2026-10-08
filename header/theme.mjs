import * as current from "../current-markets/current.mjs?v=e5e8dd98c0fa";
import { loadSvg } from "../utilities.mjs?v=e5e8dd98c0fa";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=e5e8dd98c0fa");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
