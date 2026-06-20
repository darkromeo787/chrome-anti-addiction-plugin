import { getMatchedSite } from "./domain.js";
import { applyI18n, msg } from "./i18n.js";
import { loadState } from "./storage.js";

const summary = document.querySelector("#summary");

init();

async function init() {
  applyI18n();
  const state = await loadState();
  const currentUrl = new URLSearchParams(location.search).get("url") ?? "";
  const matchedSite = getMatchedSite(currentUrl, state.settings.sites);
  const siteSeconds = matchedSite ? (state.usage.siteDailySeconds?.[matchedSite] ?? 0) : 0;
  const siteText = matchedSite
    ? msg("blockedSiteSummary", [matchedSite, formatSeconds(siteSeconds), String(state.settings.siteDailyLimitMinutes)])
    : msg("currentSiteUnavailable");
  const allSitesText = msg("blockedAllSitesSummary", [formatSeconds(state.usage.dailySeconds), String(state.settings.dailyLimitMinutes)]);

  summary.textContent = `${siteText} ${allSitesText}`;
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}