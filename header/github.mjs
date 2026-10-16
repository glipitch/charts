import { loadSvg } from "../utilities.mjs?v=6e45d42513a5";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=6e45d42513a5");
github?.addEventListener("click", event => event.stopPropagation());
