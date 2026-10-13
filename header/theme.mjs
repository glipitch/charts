import * as current from "../current-markets/current.mjs?v=4f5e1c356323";
import { loadSvg } from "../utilities.mjs?v=4f5e1c356323";

const theme = document.querySelector(".theme");

loadSvg(".theme", "svg/theme.svg?v=4f5e1c356323");
theme.addEventListener("click", event => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
