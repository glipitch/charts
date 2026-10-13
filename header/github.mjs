import { loadSvg } from "../utilities.mjs?v=0433dce4f8d8";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=0433dce4f8d8");
github?.addEventListener("click", event => event.stopPropagation());
