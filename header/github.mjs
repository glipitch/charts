import { loadSvg } from "../utilities.mjs?v=cd8614d864f0";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=cd8614d864f0");
github?.addEventListener("click", event => event.stopPropagation());
