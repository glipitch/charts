import { loadSvg } from "../utilities.mjs?v=658f15b7b7d1";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=658f15b7b7d1");
github?.addEventListener("click", event => event.stopPropagation());
