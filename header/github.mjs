import { loadSvg } from "../utilities.mjs?v=b2fc3fb3165c";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=b2fc3fb3165c");
github?.addEventListener("click", event => event.stopPropagation());
