const COUNTDOWN_MILESTONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30];
const COUNTDOWN_MILESTONE_SET = new Set(COUNTDOWN_MILESTONES);

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
  return COUNTDOWN_MILESTONE_SET.has(remainingSeconds) ? remainingSeconds : null;
}

export function getCountdownCandidates(limitStatus, notifiedCountdowns = {}) {
  return [
    { type: "session", ...limitStatus.session },
    { type: "siteDaily", ...limitStatus.siteDaily },
    { type: "daily", ...limitStatus.daily }
  ].map((candidate) => {
    const milestone = getNextUnnotifiedMilestone(candidate.type, candidate.remainingSeconds, notifiedCountdowns);
    return { ...candidate, milestone };
  }).filter((candidate) => candidate.milestone != null);
}

function getNextUnnotifiedMilestone(type, remainingSeconds, notifiedCountdowns) {
  const milestone = COUNTDOWN_MILESTONES.find((candidate) => remainingSeconds <= candidate) ?? null;
  if (milestone == null || notifiedCountdowns[`${type}:${milestone}`]) {
    return null;
  }
  return milestone;
}

function buildLimit(usedSeconds, limitMinutes) {
  const limitSeconds = limitMinutes * 60;
  return {
    usedSeconds,
    limitSeconds,
    remainingSeconds: Math.max(0, limitSeconds - usedSeconds)
  };
}
