import { loadSvg } from "../utilities.mjs?v=bee61d58d306";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=bee61d58d306");
github?.addEventListener("click", event => event.stopPropagation());
