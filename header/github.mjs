import { loadSvg } from "../utilities.mjs?v=4a1ba037781b";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=4a1ba037781b");
github?.addEventListener("click", event => event.stopPropagation());
