import { loadSvg } from "../utilities.mjs?v=910be8582395";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=910be8582395");
github?.addEventListener("click", event => event.stopPropagation());
