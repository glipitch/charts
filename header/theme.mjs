import { reloadWidgets } from "../current-markets/current.mjs";
import { loadSvg } from "../utilities.mjs";
const buttons = document.querySelectorAll(".theme");
const update = () => buttons.forEach(button => button.setAttribute("aria-label", `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} theme`));
buttons.forEach(button => {
  loadSvg(button, "svg/theme.svg");
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    update(); reloadWidgets();
  });
});
update();
