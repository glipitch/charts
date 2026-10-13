import { loadSvg } from "../utilities.mjs?v=7d0691b8c6f8";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=7d0691b8c6f8");
github?.addEventListener("click", event => event.stopPropagation());
