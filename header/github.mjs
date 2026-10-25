import { loadSvg } from "../utilities.mjs?v=96ca637f308a";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=96ca637f308a");
github?.addEventListener("click", event => event.stopPropagation());
