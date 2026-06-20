export function getEnforcementAction(state, activeContext) {
  if (!state.settings.enabled || !activeContext?.matchedSite || !isEnforceableUrl(activeContext.url)) {
    return { type: "none" };
  }

  const sessionLimitSeconds = state.settings.sessionLimitMinutes * 60;
  const siteDailyLimitSeconds = state.settings.siteDailyLimitMinutes * 60;
  const dailyLimitSeconds = state.settings.dailyLimitMinutes * 60;
  const siteDailySeconds = state.usage.siteDailySeconds?.[activeContext.matchedSite] ?? 0;

  if (state.settings.mode === "gentle" && state.usage.sessionSeconds >= sessionLimitSeconds) {
    return { type: "close-tab" };
  }

  if ((state.settings.mode === "block" || state.settings.mode === "strict") && state.usage.sessionSeconds >= sessionLimitSeconds) {
    return { type: "redirect-blocked" };
  }

  if ((state.settings.mode === "block" || state.settings.mode === "strict") && state.usage.dailySeconds >= dailyLimitSeconds) {
    return { type: "redirect-blocked" };
  }

  if ((state.settings.mode === "block" || state.settings.mode === "strict") && siteDailySeconds >= siteDailyLimitSeconds) {
    return { type: "redirect-blocked" };
  }

  return { type: "none" };
}

export function isEnforceableUrl(urlValue) {
  try {
    const url = new URL(urlValue);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
