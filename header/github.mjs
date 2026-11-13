import { loadSvg } from "../utilities.mjs?v=e6b0ec3e8f0b";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=e6b0ec3e8f0b");
github?.addEventListener("click", event => event.stopPropagation());
