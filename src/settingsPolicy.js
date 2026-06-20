const MODE_STRENGTH = {
  gentle: 1,
  block: 2,
  strict: 3
};

export function classifySettingsChange(currentSettings, nextSettings) {
  const removedSite = currentSettings.sites.some((site) => !nextSettings.sites.includes(site));
  const addedSite = nextSettings.sites.some((site) => !currentSettings.sites.includes(site));
  const increasedSession = nextSettings.sessionLimitMinutes > currentSettings.sessionLimitMinutes;
  const decreasedSession = nextSettings.sessionLimitMinutes < currentSettings.sessionLimitMinutes;
  const increasedDaily = nextSettings.dailyLimitMinutes > currentSettings.dailyLimitMinutes;
  const decreasedDaily = nextSettings.dailyLimitMinutes < currentSettings.dailyLimitMinutes;
  const currentMode = MODE_STRENGTH[currentSettings.mode] ?? 1;
  const nextMode = MODE_STRENGTH[nextSettings.mode] ?? 1;

  if (removedSite || increasedSession || increasedDaily || nextMode < currentMode) {
    return "relaxing";
  }

  if (addedSite || decreasedSession || decreasedDaily || nextMode > currentMode) {
    return "tightening";
  }

  return "neutral";
}

export function shouldDelaySettingsChange(currentSettings, nextSettings) {
  return currentSettings.mode === "strict" && classifySettingsChange(currentSettings, nextSettings) === "relaxing";
}

export function createPendingSettings(settings, now = Date.now(), delayMinutes = 10) {
  return {
    settings,
    effectiveAt: now + delayMinutes * 60 * 1000
  };
}
