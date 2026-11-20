import { loadSvg } from "../utilities.mjs?v=6a88367c3ca9";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=6a88367c3ca9");
github?.addEventListener("click", event => event.stopPropagation());
