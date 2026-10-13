import { loadSvg } from "../utilities.mjs?v=2eeebaa694f4";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=2eeebaa694f4");
github.addEventListener("click", event => event.stopPropagation());
