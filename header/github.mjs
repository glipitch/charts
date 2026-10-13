import { loadSvg } from "../utilities.mjs?v=e698ad81464a";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=e698ad81464a");
github?.addEventListener("click", event => event.stopPropagation());
