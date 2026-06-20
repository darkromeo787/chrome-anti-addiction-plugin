import { getMatchedSite } from "./domain.js";
import { getEnforcementAction } from "./enforcement.js";
import { msg } from "./i18n.js";
import { getCountdownCandidates, getLimitStatus } from "./status.js";
import { loadState, saveState, saveUsage } from "./storage.js";
import { shouldKeepSessionActive } from "./tracking.js";
import { getTodayKey, resetUsageForDate, shouldSendWarning, startSession, stopSession, tickUsage } from "./usage.js";

const TICK_ALARM = "site-time-limiter-tick";
const TICK_PERIOD_MINUTES = 0.5;

ensureTickAlarm();

chrome.runtime.onInstalled.addListener(async () => {
  await ensureTickAlarm();
  await loadState();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== TICK_ALARM) {
    return;
  }
  await updateTracking();
});

chrome.tabs.onActivated.addListener(updateTracking);
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateTracking();
  }
});
chrome.windows.onFocusChanged.addListener(updateTracking);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "get-status") {
    return false;
  }

  getCurrentStatus({ tabUrl: message.tabUrl, tabId: message.tabId }).then(sendResponse);
  return true;
});

async function updateTracking() {
  const state = await prepareTrackingState();
  const activeContext = await updateActiveSession(state);

  await sendWarningsIfNeeded(state, activeContext);
  await enforceLimits(state, activeContext);
  await updateBadge(state);
  await saveUsage(undefined, state.usage);
}

async function getCurrentStatus({ tabUrl, tabId } = {}) {
  const state = await prepareTrackingState();
  const activeContext = tabUrl
    ? getContextFromUrl(tabUrl, state.settings.sites, tabId)
    : await getActiveContext(state.settings.sites);

  if (activeContext?.matchedSite) {
    state.usage = startSession(state.usage, activeContext.matchedSite);
  }

  await sendWarningsIfNeeded(state, activeContext);
  await enforceLimits(state, activeContext);
  await updateBadge(state);
  await saveUsage(undefined, state.usage);
  return getLimitStatus(state, activeContext);
}

async function prepareTrackingState() {
  const state = await loadState();
  state.usage = resetUsageForDate(state.usage, getTodayKey());
  state.usage = tickUsage(state.usage);
  await applyPendingSettingsIfReady(state);
  return state;
}

async function updateActiveSession(state) {
  const activeContext = await getActiveContext(state.settings.sites);
  if (state.settings.enabled && activeContext?.matchedSite) {
    state.usage = startSession(state.usage, activeContext.matchedSite);
  } else if (!shouldKeepSessionActive(state.settings, activeContext, state.usage.activeSite)) {
    state.usage = stopSession(state.usage);
  }
  return activeContext;
}

async function ensureTickAlarm() {
  const existingAlarm = await chrome.alarms.get(TICK_ALARM);
  if (!existingAlarm) {
    await chrome.alarms.create(TICK_ALARM, { periodInMinutes: TICK_PERIOD_MINUTES });
  }
}

function getContextFromUrl(url, sites, tabId = null) {
  return {
    tabId: typeof tabId === "number" ? tabId : null,
    url,
    matchedSite: getMatchedSite(url, sites)
  };
}

async function getActiveContext(sites) {
  const currentWindow = await chrome.windows.getLastFocused();
  if (!currentWindow?.focused || currentWindow.id == null) {
    return null;
  }

  const [tab] = await chrome.tabs.query({ active: true, windowId: currentWindow.id });
  if (!tab?.url || tab.id == null) {
    return null;
  }

  return {
    tabId: tab.id,
    url: tab.url,
    matchedSite: getMatchedSite(tab.url, sites)
  };
}

async function sendWarningsIfNeeded(state, activeContext) {
  if (!state.settings.enabled || !activeContext?.matchedSite) {
    return;
  }

  const warnings = shouldSendWarning(state.usage, state.settings);
  await sendCountdownNotifications(state, activeContext);

  if (warnings.session) {
    await notify("session-warning", msg("sessionWarningTitle"), msg("sessionWarningMessage"));
    state.usage.notified.session = true;
  }

  if (warnings.siteDaily) {
    await notify("site-daily-warning", msg("siteDailyWarningTitle"), msg("siteDailyWarningMessage"));
    state.usage.notified.siteDaily = true;
  }

  if (warnings.daily) {
    await notify("daily-warning", msg("dailyWarningTitle"), msg("dailyWarningMessage"));
    state.usage.notified.daily = true;
  }
}

async function sendCountdownNotifications(state, activeContext) {
  const limitStatus = getLimitStatus(state, activeContext);
  for (const candidate of getCountdownCandidates(limitStatus, state.usage.notified.countdowns ?? {})) {
    const key = `${candidate.type}:${candidate.milestone}`;
    if (state.usage.notified.countdowns[key]) {
      continue;
    }

    await notify(`countdown-${key}`, msg("countdownTitle", [String(candidate.milestone)]), msg("countdownMessage", [formatLimitType(candidate.type)]));
    state.usage.notified.countdowns[key] = true;
  }
}

function formatLimitType(type) {
  if (type === "siteDaily") {
    return msg("limitTypeSiteDaily");
  }
  if (type === "daily") {
    return msg("limitTypeDaily");
  }
  return msg("limitTypeSession");
}

async function notify(id, title, message) {
  try {
    await chrome.notifications.create(id, {
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/notification.svg"),
      title,
      message
    });
  } catch {
    // Notification failures should not block tracking or enforcement.
  }
}

async function enforceLimits(state, activeContext) {
  if (!activeContext?.tabId) {
    return;
  }

  const action = getEnforcementAction(state, activeContext);

  if (action.type === "close-tab") {
    try {
      await chrome.tabs.remove(activeContext.tabId);
    } catch {
      await redirectToBlocked(activeContext.tabId, activeContext.url);
    }
    return;
  }

  if (action.type === "redirect-blocked") {
    await redirectToBlocked(activeContext.tabId, activeContext.url);
  }
}

async function redirectToBlocked(tabId, originalUrl) {
  const blockedUrl = new URL(chrome.runtime.getURL("pages/blocked.html"));
  if (originalUrl) {
    blockedUrl.searchParams.set("url", originalUrl);
  }
  await chrome.tabs.update(tabId, { url: blockedUrl.toString() });
}

async function updateBadge(state) {
  if (!state.settings.enabled) {
    await chrome.action.setBadgeText({ text: "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: "#6b7280" });
    return;
  }

  const usedMinutes = Math.floor(state.usage.dailySeconds / 60);
  await chrome.action.setBadgeText({ text: String(usedMinutes) });
  await chrome.action.setBadgeBackgroundColor({ color: "#20343f" });
}

async function applyPendingSettingsIfReady(state) {
  if (!state.pendingSettings || Date.now() < state.pendingSettings.effectiveAt) {
    return;
  }

  state.settings = state.pendingSettings.settings;
  state.pendingSettings = null;
  await saveState(undefined, state);
}