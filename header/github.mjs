import { loadSvg } from "../utilities.mjs?v=40fab349801d";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=40fab349801d");
github?.addEventListener("click", event => event.stopPropagation());
