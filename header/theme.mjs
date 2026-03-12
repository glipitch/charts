import * as current from ".././current-markets/current.mjs";
import { loadSvg } from './../utilities.mjs';
const theme = document.querySelector(".theme");
export const getTheme = () => document.documentElement.dataset.theme;
await loadSvg('.theme', 'svg/theme.svg');
theme.addEventListener("click", (event) => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  event.stopPropagation();
  current.reloadWidgets();
});
