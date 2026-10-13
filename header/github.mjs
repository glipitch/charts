import { loadSvg } from "../utilities.mjs?v=e3a2a6ceab3c";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=e3a2a6ceab3c");
github?.addEventListener("click", event => event.stopPropagation());
