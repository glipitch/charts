import { open } from "./header/dialog.mjs?v=61a7eebadd5c";
import { searchFor } from "./available-markets/available.mjs?v=61a7eebadd5c";

document.querySelector(".welcome-search-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const query = document.querySelector("#welcome-search").value.trim();
  if (!query) return;
  searchFor(query);
  open();
  const search = document.querySelector("#search");
  search.focus({ preventScroll: true });
  search.scrollIntoView({ block: "center" });
});
