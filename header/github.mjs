import { loadSvg } from "../utilities.mjs?v=297ad0c0252b";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=297ad0c0252b");
github?.addEventListener("click", event => event.stopPropagation());
