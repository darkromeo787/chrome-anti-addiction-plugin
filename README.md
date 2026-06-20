# Chrome Anti-Addiction Plugin

A privacy-friendly Chrome extension that helps limit time on selected websites. It tracks only configured sites, stores usage locally, and is disabled by default for safety.

Languages: [English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md)

## Features

- Session limit for a single continuous visit.
- Per-site daily limit.
- All monitored sites daily limit.
- Toolbar popup with live status for session, current site, and all monitored sites.
- Countdown notifications near the limit.
- Safety-first behavior: disabled by default, internal browser pages are never blocked, and non-monitored sites are ignored.
- Local-only storage with no account system and no browsing history upload.
- Interface localization for English, Simplified Chinese, Traditional Chinese, and French.

## Installation For Testing

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this project folder.
5. Open the extension options page and enable tracking only after checking your monitored sites and limits.

## Documentation

- [Usage Guide](docs/USAGE.en.md)
- [使用帮助（简体中文）](docs/USAGE.zh-CN.md)
- [使用說明（繁體中文）](docs/USAGE.zh-TW.md)
- [Guide d'utilisation](docs/USAGE.fr.md)
- [Requirements](docs/REQUIREMENTS.md)

## Development

```bash
npm install
npm test
```

The extension uses Chrome Manifest V3 and plain JavaScript modules. Tests use Vitest.

## Privacy

The extension stores settings and usage counters in `chrome.storage.local`. It does not send browsing data to any server.

## License

No license has been selected yet.