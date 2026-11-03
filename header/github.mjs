import { loadSvg } from "../utilities.mjs?v=1833beb78338";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=1833beb78338");
github?.addEventListener("click", event => event.stopPropagation());
