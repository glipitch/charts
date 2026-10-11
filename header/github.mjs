import { loadSvg } from "../utilities.mjs?v=bbf9fbbdbabc";

const github = document.querySelector(".github");
loadSvg(".github", "svg/github.svg?v=bbf9fbbdbabc");
github.addEventListener("click", event => event.stopPropagation());
