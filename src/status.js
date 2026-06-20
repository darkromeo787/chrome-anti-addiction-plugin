const COUNTDOWN_MILESTONES = new Set([30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

export function getLimitStatus(state, activeContext) {
  const matchedSite = activeContext ? activeContext.matchedSite : state.usage.activeSite ?? null;

  return {
    enabled: Boolean(state.settings.enabled),
    matchedSite,
    mode: state.settings.mode,
    session: buildLimit(state.usage.sessionSeconds, state.settings.sessionLimitMinutes),
    siteDaily: buildLimit(
      matchedSite ? (state.usage.siteDailySeconds?.[matchedSite] ?? 0) : 0,
      state.settings.siteDailyLimitMinutes
    ),
    daily: buildLimit(state.usage.dailySeconds, state.settings.dailyLimitMinutes)
  };
}

export function getCountdownMilestone(remainingSeconds) {
  return COUNTDOWN_MILESTONES.has(remainingSeconds) ? remainingSeconds : null;
}

export function getCountdownCandidates(limitStatus) {
  return [
    { type: "session", ...limitStatus.session },
    { type: "siteDaily", ...limitStatus.siteDaily },
    { type: "daily", ...limitStatus.daily }
  ].map((candidate) => ({
    ...candidate,
    milestone: getCountdownMilestone(candidate.remainingSeconds)
  })).filter((candidate) => candidate.milestone != null);
}

function buildLimit(usedSeconds, limitMinutes) {
  const limitSeconds = limitMinutes * 60;
  return {
    usedSeconds,
    limitSeconds,
    remainingSeconds: Math.max(0, limitSeconds - usedSeconds)
  };
}
