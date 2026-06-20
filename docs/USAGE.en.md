# Usage Guide

## Install The Unpacked Extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the project folder.
5. Pin the extension if you want quick access to the popup.

## First Setup

1. Open the extension options page.
2. Check the monitored site list. `zhihu.com` is included by default.
3. Add or remove domains as needed.
4. Set the session limit, per-site daily limit, and all-sites daily limit.
5. Choose a mode.
6. Enable tracking and blocking.
7. Save settings.

## Modes

- Gentle: closes the current monitored tab when the session limit is reached.
- Block: redirects monitored sites to the internal blocked page after a limit is reached.
- Strict: applies blocking behavior and delays relaxed setting changes.

## Toolbar Popup

Click the extension icon to see live usage:

- Session: current continuous visit.
- Current site today: today's total for the current monitored site.
- All monitored today: today's total across all monitored sites.

## Notifications

The extension sends Chrome notifications near limits, including countdown milestones at 30, 20, 10, and the final seconds.

## Safety Notes

- The extension is disabled by default.
- Non-monitored sites are ignored.
- Browser internal pages such as `chrome://extensions` are not blocked.
- Usage data stays in local browser storage.