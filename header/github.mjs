import { loadSvg } from "../utilities.mjs?v=621928549cbe";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=621928549cbe");
github?.addEventListener("click", event => event.stopPropagation());
