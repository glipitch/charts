export const copyLayoutLink = async (url, clipboard) => {
  if (!clipboard?.writeText) return false;
  try { await clipboard.writeText(url); return true; } catch { return false; }
};

const button = document.querySelector(".share");
const status = document.querySelector(".share-status");
const fallback = document.querySelector(".share-fallback");
const input = document.querySelector("#share-url");
let statusTimer;
let copying = false;
let chartCount = 0;

const closeFallback = () => { fallback.hidden = true; button.focus({ preventScroll: true }); };
const announce = message => {
  clearTimeout(statusTimer);
  status.textContent = message;
  statusTimer = setTimeout(() => { status.textContent = ""; }, 4000);
};

button?.addEventListener("click", async () => {
  if (!chartCount || copying) return;
  copying = true;
  button.disabled = true;
  const url = window.location.href;
  const copied = await copyLayoutLink(url, navigator.clipboard);
  copying = false;
  button.disabled = !chartCount;
  if (!chartCount) return;
  if (copied) {
    fallback.hidden = true;
    announce("Link copied");
  } else {
    input.value = url;
    fallback.hidden = false;
    input.focus();
    input.select();
    announce("Copy the selected link.");
  }
});

document.querySelector(".close-share")?.addEventListener("click", closeFallback);
fallback?.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  event.stopPropagation();
  closeFallback();
});
window.addEventListener("chartschange", ({ detail }) => {
  if (!button) return;
  chartCount = detail.count;
  button.disabled = copying || !chartCount;
  button.title = chartCount ? "Copy layout link" : "Add a chart to share a layout";
  if (!chartCount) { fallback.hidden = true; status.textContent = ""; }
});
