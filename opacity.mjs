import * as utilities from "./utilities.mjs";
const input = document.querySelector(".opacity-row > input");
const span = document.querySelector(".opacity-row > span");
const label = document.querySelector(".opacity-row > label");
const applyOpacity = (value) => {
    utilities.setProperty("opacity", value);
    span.textContent = parseFloat(value).toFixed(2);
};
const initialOpacity = localStorage.getItem("opacity") || .8;
input.value = initialOpacity;
applyOpacity(initialOpacity);
input.addEventListener("input", (event) => {
    const etv = event.target.value;
    applyOpacity(etv);
    localStorage.setItem("opacity", etv);
});
//create markers
markers.innerHTML = utilities
    .createValueOptions(utilities.createRangeDecimalSafe(.7, .05, 7, 100));

label.addEventListener("click", () => {
    input.value = input.min;
    applyOpacity(input.min);
    localStorage.setItem("opacity", input.min);
});
span.addEventListener("click", () => {
    input.value = input.max;
    applyOpacity(input.max);
    localStorage.setItem("opacity", input.max);
});