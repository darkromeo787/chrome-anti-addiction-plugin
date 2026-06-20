export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDefaultUsage(date = getTodayKey()) {
  return {
    date,
    dailySeconds: 0,
    siteDailySeconds: {},
    activeSite: null,
    sessionStartedAt: null,
    sessionSeconds: 0,
    notified: {
      session: false,
      siteDaily: false,
      daily: false,
      countdowns: {}
    }
  };
}

export function resetUsageForDate(usage, date = getTodayKey()) {
  if (usage?.date === date) {
    return normalizeUsage(usage);
  }
  return createDefaultUsage(date);
}

export function startSession(usage, site, now = Date.now()) {
  const isSameActiveSite = usage.activeSite === site && usage.sessionStartedAt != null;

  return {
    ...usage,
    activeSite: site,
    sessionStartedAt: isSameActiveSite ? usage.sessionStartedAt : now,
    sessionSeconds: usage.activeSite === site ? usage.sessionSeconds : 0
  };
}

export function stopSession(usage) {
  return {
    ...usage,
    activeSite: null,
    sessionStartedAt: null,
    sessionSeconds: 0
  };
}

export function tickUsage(usage, now = Date.now()) {
  if (!usage.activeSite || usage.sessionStartedAt == null) {
    return usage;
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - usage.sessionStartedAt) / 1000));
  if (elapsedSeconds === 0) {
    return usage;
  }

  return {
    ...usage,
    dailySeconds: usage.dailySeconds + elapsedSeconds,
    siteDailySeconds: {
      ...(usage.siteDailySeconds ?? {}),
      [usage.activeSite]: (usage.siteDailySeconds?.[usage.activeSite] ?? 0) + elapsedSeconds
    },
    sessionSeconds: usage.sessionSeconds + elapsedSeconds,
    sessionStartedAt: now
  };
}

export function shouldSendWarning(usage, settings) {
  const warningSeconds = settings.warningMinutesBefore * 60;
  const sessionLimitSeconds = settings.sessionLimitMinutes * 60;
  const siteDailyLimitSeconds = settings.siteDailyLimitMinutes * 60;
  const dailyLimitSeconds = settings.dailyLimitMinutes * 60;
  const siteDailySeconds = usage.activeSite ? (usage.siteDailySeconds?.[usage.activeSite] ?? 0) : 0;

  return {
    session: !usage.notified.session && sessionLimitSeconds - usage.sessionSeconds <= warningSeconds,
    siteDaily: !usage.notified.siteDaily && usage.activeSite != null && siteDailyLimitSeconds - siteDailySeconds <= warningSeconds,
    daily: !usage.notified.daily && dailyLimitSeconds - usage.dailySeconds <= warningSeconds
  };
}

export function normalizeUsage(usage) {
  return {
    ...createDefaultUsage(usage?.date),
    ...(usage ?? {}),
    siteDailySeconds: usage?.siteDailySeconds ?? {},
    notified: {
      session: false,
      siteDaily: false,
      daily: false,
      countdowns: {},
      ...(usage?.notified ?? {})
    }
  };
}
