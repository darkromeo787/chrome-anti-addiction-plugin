import { createDefaultUsage, normalizeUsage } from "./usage.js";

export const DEFAULT_SETTINGS = {
  enabled: false,
  sites: ["zhihu.com"],
  sessionLimitMinutes: 15,
  siteDailyLimitMinutes: 30,
  dailyLimitMinutes: 45,
  mode: "block",
  warningMinutesBefore: 2,
  strictDelayMinutes: 10
};

export async function loadState(chromeStorage = chrome.storage) {
  const result = await chromeStorage.local.get(["settings", "usage", "pendingSettings"]);

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...(result.settings ?? {})
    },
    usage: result.usage ? normalizeUsage(result.usage) : createDefaultUsage(),
    pendingSettings: result.pendingSettings ?? null
  };
}

export async function saveState(chromeStorage = chrome.storage, state) {
  await chromeStorage.local.set({
    settings: state.settings,
    usage: state.usage,
    pendingSettings: state.pendingSettings
  });
}

export async function saveSettings(chromeStorage = chrome.storage, settings, pendingSettings = null) {
  await chromeStorage.local.set({ settings, pendingSettings });
}

export async function saveUsage(chromeStorage = chrome.storage, usage) {
  await chromeStorage.local.set({ usage });
}

export async function resetUsage(chromeStorage = chrome.storage, date) {
  const usage = createDefaultUsage(date);
  await saveUsage(chromeStorage, usage);
  return usage;
}
