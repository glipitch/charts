import { open } from "./header/dialog.mjs";
import { searchFor } from "./available-markets/available.mjs";

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
