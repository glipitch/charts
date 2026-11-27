import { loadSvg } from "../utilities.mjs?v=610a51f02dca";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=610a51f02dca");
github?.addEventListener("click", event => event.stopPropagation());
