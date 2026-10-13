import { loadSvg } from "../utilities.mjs?v=4f5e1c356323";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=4f5e1c356323");
github.addEventListener("click", event => event.stopPropagation());
