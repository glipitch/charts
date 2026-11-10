import { loadSvg } from "../utilities.mjs?v=58864121ca7f";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=58864121ca7f");
github?.addEventListener("click", event => event.stopPropagation());
