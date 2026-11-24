import { loadSvg } from "../utilities.mjs?v=c76b1df3feb1";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=c76b1df3feb1");
github?.addEventListener("click", event => event.stopPropagation());
