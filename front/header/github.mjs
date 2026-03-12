import { loadSvg } from './../utilities.mjs';
const github = document.querySelector(".github");
await loadSvg('.github', 'svg/github.svg');
github.addEventListener("click", (event) => event.stopPropagation());