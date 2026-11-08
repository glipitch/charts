import { loadSvg } from "../utilities.mjs?v=570fc7bce8dd";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=570fc7bce8dd");
github?.addEventListener("click", event => event.stopPropagation());
