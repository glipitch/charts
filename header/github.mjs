import { loadSvg } from "../utilities.mjs?v=fba6b13b20ea";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=fba6b13b20ea");
github?.addEventListener("click", event => event.stopPropagation());
