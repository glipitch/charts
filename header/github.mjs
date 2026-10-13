import { loadSvg } from "../utilities.mjs?v=eab82fc427d2";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=eab82fc427d2");
github?.addEventListener("click", event => event.stopPropagation());
