import { loadSvg } from "../utilities.mjs?v=29d236d31bea";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=29d236d31bea");
github?.addEventListener("click", event => event.stopPropagation());
