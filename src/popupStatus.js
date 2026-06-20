export function rememberPageUrl(url, previousUrl) {
  if (isWebPageUrl(url)) {
    return url;
  }
  return previousUrl ?? null;
}

function isWebPageUrl(url) {
  return /^https?:\/\//i.test(String(url ?? ""));
}