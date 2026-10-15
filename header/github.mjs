import { loadSvg } from "../utilities.mjs?v=f85cc399f4fb";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=f85cc399f4fb");
github?.addEventListener("click", event => event.stopPropagation());
