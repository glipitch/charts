import * as current from "../current-markets/current.mjs?v=f85cc399f4fb";
import { loadSvg } from "../utilities.mjs?v=f85cc399f4fb";

const theme = document.querySelector(".theme");
const choices = document.querySelectorAll('.theme-settings input[name="theme"]');

const applyTheme = nextTheme => {
  if (nextTheme === document.documentElement.dataset.theme) return;
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  choices.forEach(choice => { choice.checked = choice.value === nextTheme; });
  current.reloadWidgets();
};

choices.forEach(choice => {
  choice.checked = choice.value === document.documentElement.dataset.theme;
  choice.addEventListener("change", () => { if (choice.checked) applyTheme(choice.value); });
});

// Keep the previous button working for a cached older page.
if (theme) {
  loadSvg(".theme", "svg/theme.svg?v=f85cc399f4fb");
  theme.addEventListener("click", event => {
    event.stopPropagation();
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  });
}
