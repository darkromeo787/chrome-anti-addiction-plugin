# Chrome 防沉迷外掛

一個重視隱私與安全邊界的 Chrome 擴充功能，用來限制指定網站的使用時間。它只統計你設定的網站，資料保存在本機，並且預設關閉攔截功能。

語言：[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md)

## 功能

- 單次連續瀏覽限制。
- 單一網站每日限制。
- 所有受控網站每日總限制。
- 工具列彈窗即時顯示單次瀏覽、目前網站、總體用量。
- 接近限制時顯示倒數通知。
- 安全優先：預設關閉，不攔截瀏覽器內部頁面，不影響非受控網站。
- 資料只保存在本機，沒有帳號系統，不上傳瀏覽記錄。
- 支援英文、簡體中文、繁體中文和法語介面。

## 測試安裝

1. 開啟 `chrome://extensions`。
2. 開啟開發人員模式。
3. 點選「載入未封裝項目」。
4. 選擇本專案資料夾。
5. 開啟擴充功能設定頁，確認受控網站和時間限制後再啟用。

## 文件

- [使用說明](docs/USAGE.zh-TW.md)
- [English Usage Guide](docs/USAGE.en.md)
- [使用帮助（简体中文）](docs/USAGE.zh-CN.md)
- [Guide d'utilisation](docs/USAGE.fr.md)
- [需求說明](docs/REQUIREMENTS.md)

## 開發

```bash
npm install
npm test
```

擴充功能基於 Chrome Manifest V3 和原生 JavaScript 模組開發，測試使用 Vitest。

## 隱私

擴充功能會把設定和用量計數保存在 `chrome.storage.local`。不會把瀏覽資料傳送到任何伺服器。

## 授權

尚未選擇授權條款。