import { prepare, findMarkets, resolveMarkets } from "./search.mjs";
let loaded;
let latestId;
const load = () => loaded ||= fetch(new URL("catalogue.json", import.meta.url)).then(response => {
  if (!response.ok) throw new Error("Could not load markets");
  return response.json();
}).then(prepare);
self.addEventListener("message", async ({ data }) => {
  if (data.type === "search") latestId = data.id;
  try {
    const groups = await load();
    if (data.type === "load") self.postMessage({ type: "ready" });
    else if (data.type === "resolve") self.postMessage({ type: "resolved", charts: resolveMarkets(groups, data.charts) });
    else if (data.id === latestId) self.postMessage({ type: "results", id: data.id, ...findMarkets(groups, data.query) });
  } catch { loaded = undefined; self.postMessage({ type: "error" }); }
});
