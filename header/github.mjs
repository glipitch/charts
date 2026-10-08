import { loadSvg } from "../utilities.mjs?v=e5e8dd98c0fa";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=e5e8dd98c0fa");
github.addEventListener("click", event => event.stopPropagation());
