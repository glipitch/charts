import { loadSvg } from "../utilities.mjs?v=75b6f4773e20";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=75b6f4773e20");
github?.addEventListener("click", event => event.stopPropagation());
