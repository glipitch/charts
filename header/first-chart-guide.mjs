const guide = document.querySelector(".first-chart-guide");
const chevron = document.querySelector(".dialog-visibility");
const learnedKey = "settingsHintLearned";
let learned = false;
try { learned = localStorage.getItem(learnedKey) === "true"; } catch {}

const hide = () => {
  if (!guide) return;
  guide.hidden = true;
  chevron?.removeAttribute("aria-describedby");
};

const finish = () => {
  learned = true;
  try { localStorage.setItem(learnedKey, "true"); } catch {}
  hide();
};

export const showFirstChartGuide = () => {
  if (!guide || learned || document.querySelector("#settings")?.open) return;
  guide.hidden = false;
  chevron?.setAttribute("aria-describedby", "settings-hint");
};

window.addEventListener("settingsopen", finish);
window.addEventListener("chartschange", ({ detail }) => { if (!detail.count) hide(); });
document.querySelector(".share")?.addEventListener("click", hide);
guide?.querySelector(".dismiss-guide")?.addEventListener("click", () => {
  finish();
  chevron?.focus({ preventScroll: true });
});
