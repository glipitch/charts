import { loadSvg } from "../utilities.mjs?v=2781777c8fa3";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=2781777c8fa3");
github?.addEventListener("click", event => event.stopPropagation());
