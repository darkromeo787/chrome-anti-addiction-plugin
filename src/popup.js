import { applyI18n, msg } from "./i18n.js";
import { rememberPageUrl } from "./popupStatus.js";

const elements = {
  siteName: document.querySelector("#siteName"),
  modeText: document.querySelector("#modeText"),
  sessionText: document.querySelector("#sessionText"),
  sessionMeter: document.querySelector("#sessionMeter"),
  siteDailyText: document.querySelector("#siteDailyText"),
  siteDailyMeter: document.querySelector("#siteDailyMeter"),
  dailyText: document.querySelector("#dailyText"),
  dailyMeter: document.querySelector("#dailyMeter")
};

let currentPageUrl = null;

init();

function init() {
  applyI18n();
  refreshStatus();
  setInterval(refreshStatus, 1000);
}

async function refreshStatus() {
  currentPageUrl = rememberPageUrl(await getActiveTabUrl(), currentPageUrl);
  const status = await chrome.runtime.sendMessage({ type: "get-status", tabUrl: currentPageUrl });
  render(status);
}

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? null;
}

function render(status) {
  elements.siteName.textContent = status.matchedSite ?? msg("noMonitoredSite");
  elements.modeText.textContent = status.enabled ? msg("enabledMode", [status.mode]) : msg("disabled");

  renderLimit(elements.sessionText, elements.sessionMeter, status.session);
  renderLimit(elements.siteDailyText, elements.siteDailyMeter, status.siteDaily);
  renderLimit(elements.dailyText, elements.dailyMeter, status.daily);
}

function renderLimit(textElement, meterElement, limit) {
  textElement.textContent = msg("timeLeft", [formatSeconds(limit.usedSeconds), formatSeconds(limit.limitSeconds), formatSeconds(limit.remainingSeconds)]);
  meterElement.value = limit.limitSeconds > 0 ? Math.min(100, Math.round((limit.usedSeconds / limit.limitSeconds) * 100)) : 0;
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}