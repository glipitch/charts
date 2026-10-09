import { loadSvg } from "../utilities.mjs?v=4ae14f326071";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=4ae14f326071");
github.addEventListener("click", event => event.stopPropagation());
