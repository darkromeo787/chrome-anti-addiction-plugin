import { normalizeSiteInput } from "./domain.js";
import { applyI18n, msg } from "./i18n.js";
import { classifySettingsChange, createPendingSettings, shouldDelaySettingsChange } from "./settingsPolicy.js";
import { loadState, resetUsage, saveSettings } from "./storage.js";

let state;

const elements = {
  usageText: document.querySelector("#usageText"),
  pendingText: document.querySelector("#pendingText"),
  siteList: document.querySelector("#siteList"),
  siteForm: document.querySelector("#siteForm"),
  siteInput: document.querySelector("#siteInput"),
  siteError: document.querySelector("#siteError"),
  enabled: document.querySelector("#enabled"),
  sessionLimit: document.querySelector("#sessionLimit"),
  siteDailyLimit: document.querySelector("#siteDailyLimit"),
  dailyLimit: document.querySelector("#dailyLimit"),
  mode: document.querySelector("#mode"),
  resetUsageButton: document.querySelector("#resetUsageButton"),
  saveButton: document.querySelector("#saveButton"),
  saveMessage: document.querySelector("#saveMessage")
};

init();

async function init() {
  applyI18n();
  state = await loadState();
  render();
  elements.siteForm.addEventListener("submit", handleAddSite);
  elements.resetUsageButton.addEventListener("click", handleResetUsage);
  elements.saveButton.addEventListener("click", handleSave);
}

function render() {
  elements.usageText.textContent = msg("todayUsed", [formatSeconds(state.usage.dailySeconds)]);
  elements.pendingText.textContent = state.pendingSettings
    ? msg("pendingSettings", [new Date(state.pendingSettings.effectiveAt).toLocaleTimeString()])
    : "";

  elements.siteList.innerHTML = "";
  for (const site of state.settings.sites) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const button = document.createElement("button");
    label.textContent = site;
    button.type = "button";
    button.textContent = msg("remove");
    button.addEventListener("click", () => {
      state.settings.sites = state.settings.sites.filter((current) => current !== site);
      render();
    });
    item.append(label, button);
    elements.siteList.append(item);
  }

  elements.enabled.checked = Boolean(state.settings.enabled);
  elements.sessionLimit.value = state.settings.sessionLimitMinutes;
  elements.siteDailyLimit.value = state.settings.siteDailyLimitMinutes;
  elements.dailyLimit.value = state.settings.dailyLimitMinutes;
  elements.mode.value = state.settings.mode;
}

function handleAddSite(event) {
  event.preventDefault();
  elements.siteError.textContent = "";

  const site = normalizeSiteInput(elements.siteInput.value);
  if (!site) {
    elements.siteError.textContent = msg("validDomainError");
    return;
  }

  if (!state.settings.sites.includes(site)) {
    state.settings.sites = [...state.settings.sites, site].sort();
  }
  elements.siteInput.value = "";
  render();
}

async function handleSave() {
  const nextSettings = {
    ...state.settings,
    enabled: elements.enabled.checked,
    sessionLimitMinutes: Number(elements.sessionLimit.value),
    siteDailyLimitMinutes: Number(elements.siteDailyLimit.value),
    dailyLimitMinutes: Number(elements.dailyLimit.value),
    mode: elements.mode.value
  };

  if (nextSettings.sessionLimitMinutes <= 0 || nextSettings.siteDailyLimitMinutes <= 0 || nextSettings.dailyLimitMinutes <= 0) {
    elements.saveMessage.textContent = msg("limitsGreaterThanZero");
    return;
  }

  const changeKind = classifySettingsChange(state.settings, nextSettings);
  const shouldDelay = shouldDelaySettingsChange(state.settings, nextSettings);
  const pendingSettings = shouldDelay
    ? createPendingSettings(nextSettings, Date.now(), state.settings.strictDelayMinutes)
    : null;
  const settingsToSave = shouldDelay ? state.settings : nextSettings;

  await saveSettings(undefined, settingsToSave, pendingSettings);
  state.settings = settingsToSave;
  state.pendingSettings = pendingSettings;
  elements.saveMessage.textContent = shouldDelay
    ? msg("relaxedSettingsDelayed")
    : changeKind === "neutral"
      ? msg("settingsSaved")
      : msg("settingsSavedActive");
  render();
}

async function handleResetUsage() {
  state.usage = await resetUsage(undefined);
  elements.saveMessage.textContent = msg("todayUsageReset");
  render();
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}