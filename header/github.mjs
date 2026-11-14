import { loadSvg } from "../utilities.mjs?v=4fa19015470d";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=4fa19015470d");
github?.addEventListener("click", event => event.stopPropagation());
