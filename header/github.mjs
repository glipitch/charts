import { loadSvg } from "../utilities.mjs?v=61a7eebadd5c";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=61a7eebadd5c");
github.addEventListener("click", event => event.stopPropagation());
