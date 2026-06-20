export function shouldKeepSessionActive(settings, activeContext, activeSite) {
  if (!settings.enabled) {
    return false;
  }
  if (activeContext == null) {
    return activeSite != null;
  }
  return activeContext.matchedSite != null;
}