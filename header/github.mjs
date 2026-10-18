import { loadSvg } from "../utilities.mjs?v=ef01fe13c1eb";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=ef01fe13c1eb");
github?.addEventListener("click", event => event.stopPropagation());
