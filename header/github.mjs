import { loadSvg } from "../utilities.mjs?v=d85cde1d93d9";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=d85cde1d93d9");
github?.addEventListener("click", event => event.stopPropagation());
