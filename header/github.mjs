import { loadSvg } from "../utilities.mjs?v=2e9671392e45";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=2e9671392e45");
github?.addEventListener("click", event => event.stopPropagation());
