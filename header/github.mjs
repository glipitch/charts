import { loadSvg } from "../utilities.mjs?v=3dc27d15579f";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=3dc27d15579f");
github?.addEventListener("click", event => event.stopPropagation());
