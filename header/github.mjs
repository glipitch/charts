import { loadSvg } from "../utilities.mjs?v=2fa4e15c47b1";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=2fa4e15c47b1");
github?.addEventListener("click", event => event.stopPropagation());
