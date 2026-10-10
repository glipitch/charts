import { loadSvg } from "../utilities.mjs?v=376a75580552";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=376a75580552");
github.addEventListener("click", event => event.stopPropagation());
