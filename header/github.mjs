import { loadSvg } from "../utilities.mjs?v=98c895101b74";

const github = document.querySelector(".github");
if (github?.querySelector("svg")) loadSvg(".github", "svg/github.svg?v=98c895101b74");
github?.addEventListener("click", event => event.stopPropagation());
