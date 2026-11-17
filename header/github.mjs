import { loadSvg } from "../utilities.mjs?v=51666aa8d9a2";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=51666aa8d9a2");
github?.addEventListener("click", event => event.stopPropagation());
