import { loadSvg } from "../utilities.mjs?v=28d787534369";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=28d787534369");
github?.addEventListener("click", event => event.stopPropagation());
