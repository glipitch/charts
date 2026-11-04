import { loadSvg } from "../utilities.mjs?v=6dfa1c2132e8";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=6dfa1c2132e8");
github?.addEventListener("click", event => event.stopPropagation());
