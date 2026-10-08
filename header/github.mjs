import { loadSvg } from "../utilities.mjs?v=2df584b8f1cb";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=2df584b8f1cb");
github.addEventListener("click", event => event.stopPropagation());
