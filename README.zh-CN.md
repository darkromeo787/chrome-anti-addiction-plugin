# Chrome 防沉迷插件

一个注重隐私和安全边界的 Chrome 扩展，用来限制指定网站的使用时间。它只统计你配置的网站，数据保存在本地，并且默认关闭拦截功能。

语言：[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md)

## 功能

- 单次连续浏览限制。
- 单个网站每日限制。
- 所有受控网站每日总限制。
- 工具栏弹窗实时显示单次浏览、当前网站、总体用量。
- 接近限制时显示倒计时通知。
- 安全优先：默认关闭，不拦截浏览器内部页面，不影响非受控网站。
- 数据只保存在本地，没有账号系统，不上传浏览记录。
- 支持英文、简体中文、繁体中文和法语界面。

## 测试安装

1. 打开 `chrome://extensions`。
2. 开启开发者模式。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目文件夹。
5. 打开扩展设置页，确认受控网站和时间限制后再启用。

## 文档

- [使用帮助](docs/USAGE.zh-CN.md)
- [English Usage Guide](docs/USAGE.en.md)
- [使用說明（繁體中文）](docs/USAGE.zh-TW.md)
- [Guide d'utilisation](docs/USAGE.fr.md)
- [需求说明](docs/REQUIREMENTS.md)

## 开发

```bash
npm install
npm test
```

扩展基于 Chrome Manifest V3 和原生 JavaScript 模块开发，测试使用 Vitest。

## 隐私

扩展把设置和用量计数保存在 `chrome.storage.local`。不会把浏览数据发送到任何服务器。

## 许可证

暂未选择许可证。