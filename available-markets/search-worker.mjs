import { prepare, findMarkets, resolveMarkets } from "./search.mjs?v=28d787534369";
let loaded;
const latestIds = new Map();
const load = () => loaded ||= fetch(new URL("catalogue.json?v=28d787534369", import.meta.url)).then(response => {
  if (!response.ok) throw new Error("Could not load markets");
  return response.json();
}).then(prepare);
self.addEventListener("message", async ({ data }) => {
  if (data.type === "search") latestIds.set(data.channel, data.id);
  try {
    const groups = await load();
    if (data.type === "load") self.postMessage({ type: "ready" });
    else if (data.type === "resolve") self.postMessage({ type: "resolved", charts: resolveMarkets(groups, data.charts) });
    else if (data.id === latestIds.get(data.channel)) self.postMessage({ type: "results", channel: data.channel, id: data.id, ...findMarkets(groups, data.query, data.limit) });
  } catch { loaded = undefined; self.postMessage({ type: "error" }); }
});
