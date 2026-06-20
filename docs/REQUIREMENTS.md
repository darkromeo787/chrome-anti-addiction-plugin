# Requirements

## Goal

Build a Chrome Manifest V3 extension that helps users limit time spent on selected websites while keeping all data local.

## Core Requirements

- The extension is disabled by default.
- The default monitored site list includes `zhihu.com`.
- Users can add and remove monitored domains.
- Users can configure three independent limits:
  - session limit for a continuous visit;
  - per-site daily limit;
  - all-sites daily limit.
- If any active limit is reached, enforcement starts for monitored sites.
- Non-monitored sites must not be blocked.
- Browser internal pages must not be blocked.
- Usage data must be stored locally in `chrome.storage.local`.
- The toolbar popup must show live status for session, current-site daily usage, and all monitored sites daily usage.
- The extension must show countdown notifications near limits.
- The user interface must follow the browser language when Chrome provides a supported locale.

## Supported Locales

- English
- Simplified Chinese
- Traditional Chinese
- French

## Non-Goals

- No account system.
- No cloud sync.
- No upload of browsing history.
- No mobile support.
- No system-level uninstall prevention.
- No support outside Chromium-based extension loading for the first release.

## Safety Rules

- Disabled means no tracking or blocking.
- Monitored-site matching must be domain based, not substring based.
- `chrome://`, `chrome-extension://`, and similar internal URLs must never be blocked.
- Temporary browser focus changes must not reset an active session.
- If Chrome notification creation fails, tracking and enforcement should continue.

## Testing

The project should keep automated tests for domain matching, usage tracking, enforcement decisions, settings policy, popup status helpers, tracking state, and locale key consistency.