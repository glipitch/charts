import { loadSvg } from "../utilities.mjs?v=c2a4fb483601";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=c2a4fb483601");
github?.addEventListener("click", event => event.stopPropagation());
