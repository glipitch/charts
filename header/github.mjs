import { loadSvg } from "../utilities.mjs?v=bed574eac4d1";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=bed574eac4d1");
github?.addEventListener("click", event => event.stopPropagation());
