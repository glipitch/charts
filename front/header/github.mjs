import { loadSvg } from "../utilities.mjs";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg");
github.addEventListener("click", event => event.stopPropagation());
