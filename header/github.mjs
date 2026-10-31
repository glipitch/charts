import { loadSvg } from "../utilities.mjs?v=aa1bcf55945e";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=aa1bcf55945e");
github?.addEventListener("click", event => event.stopPropagation());
