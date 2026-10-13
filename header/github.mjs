import { loadSvg } from "../utilities.mjs?v=865e3d4657b9";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=865e3d4657b9");
github?.addEventListener("click", event => event.stopPropagation());
