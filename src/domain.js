const DOMAIN_PATTERN = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;

export function normalizeSiteInput(input) {
  const rawValue = String(input ?? "").trim().toLowerCase();
  if (!rawValue) {
    return null;
  }

  const valueWithProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    const url = new URL(valueWithProtocol);
    let host = url.hostname.replace(/\.$/, "");
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }

    return isValidDomain(host) ? host : null;
  } catch {
    return null;
  }
}

export function isValidDomain(domain) {
  return DOMAIN_PATTERN.test(String(domain ?? "").trim());
}

export function getMatchedSite(urlValue, sites) {
  let hostname;

  try {
    hostname = new URL(urlValue).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }

  return sites.find((site) => hostname === site || hostname.endsWith(`.${site}`)) ?? null;
}
