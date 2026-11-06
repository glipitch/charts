import { loadSvg } from "../utilities.mjs?v=a13bee668e78";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=a13bee668e78");
github?.addEventListener("click", event => event.stopPropagation());
