import { setProperty } from "./utilities.mjs";
const input = document.querySelector("#opacity-input");
const output = document.querySelector(".opacity-row output");
const apply = value => {
  const parsed = Number(value);
  const opacity = Number.isFinite(parsed) && parsed >= 0.8 && parsed <= 1 ? parsed : 0.8;
  input.value = opacity;
  output.value = `${Math.round(opacity * 100)}%`;
  setProperty("opacity", opacity);
};
apply(localStorage.getItem("opacity") ?? 0.8);
input.addEventListener("input", () => { apply(input.value); localStorage.setItem("opacity", input.value); });
