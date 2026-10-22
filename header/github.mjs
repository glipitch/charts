import { loadSvg } from "../utilities.mjs?v=12d6ec78545e";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=12d6ec78545e");
github?.addEventListener("click", event => event.stopPropagation());
