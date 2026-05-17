# 配图助手 — Image Finder

一个帮助公众号作者、自媒体人快速找到**真实配图**的浏览器插件（Chrome / Edge）。

输入文章段落或关键词，即可从 Unsplash、Pexels 等真实摄影图库中搜索高质量照片，告别 AI 假图。

---

## 功能特性

- **真实照片搜索** — 基于 Unsplash、Pexels 真实摄影图库，非 AI 生成
- **右键快捷搜索** — 选中文字 → 右键 → 「搜索配图」，一键查找
- **关键词自动提取** — 贴入长段落时自动提取核心关键词，结果更精准
- **一键复制 URL** — 点击图片自动复制到剪贴板，粘贴到编辑器中即可
- **中英文自适应** — 自动适配浏览器语言，支持中文 / English
- **多源聚合** — 支持 Unsplash、Pexels 单独或合并搜索

## 安装方式

### 从商店安装

- [Chrome Web Store]()（待上架）
- [Edge Add-ons]()（待上架）

### 开发者模式（本地加载）

1. 克隆或下载本项目
2. 打开浏览器扩展管理页：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目根目录

## 使用指南

### 1. 配置 API 密钥

安装后点击扩展图标 → 设置（⚙️），填入以下密钥（均为免费）：

| 服务 | 申请地址 | 免费额度 |
|------|---------|---------|
| Unsplash | https://unsplash.com/developers | 50 次 / 小时 |
| Pexels | https://pexels.com/api | 200 次 / 小时 |
| OpenRouter（可选） | https://openrouter.ai/keys | 按免费模型额度 |

OpenRouter 用于长文本自动提取关键词；不配置则直接使用原文搜索。

### 2. 搜索配图

**方式一：右键搜索**
在编辑器中选中文字 → 右键 → 「搜索配图」→ 自动弹出搜索结果

**方式二：手动输入**
点击工具栏图标 → 输入文字 → 选择图片来源 → 点击搜索

### 3. 使用图片

点击任意搜索结果图片 → 自动复制图片 URL → 粘贴到公众号编辑器即可

## 项目结构

```
├── manifest.json          # 扩展配置（Manifest V3）
├── background.js          # 后台服务（右键菜单）
├── shared.js              # 共享工具（国际化）
├── popup/
│   ├── popup.html         # 弹窗页面
│   ├── popup.js           # 搜索逻辑 + API 调用
│   └── popup.css          # 弹窗样式
├── options/
│   ├── options.html       # 设置页面
│   ├── options.js         # 密钥管理
│   └── options.css        # 设置页样式
├── icons/                 # 扩展图标
├── _locales/
│   ├── en/                # 英文翻译
│   └── zh_CN/             # 中文翻译（默认）
└── README.md
```

## 技术栈

- Manifest V3
- Chrome Extension API（contextMenus, storage, clipboard）
- Unsplash API / Pexels API
- OpenRouter API（关键词提取）
- 纯原生 JavaScript（无第三方框架）

## 开发

```bash
git clone https://github.com/chaoswong1981/-tool-ImageFinder.git
```

修改代码后在扩展管理页点击「重新加载」即可生效。

## 许可

[MIT](LICENSE)
