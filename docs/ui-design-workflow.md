# UI/UX 設計工作流程

本文件說明如何使用 spec-kit 的 UI 設計工作流程，從風格探索到完整 HTML 原型產出。

## 流程概覽

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: 風格探索                                               │
│  /speckit.ui-explore                                             │
│                                                                   │
│  輸入：spec.md                                                    │
│  輸出：10 個 UI 風格選項（HTML moodboard）                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ 選擇風格編號
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: 設計系統                                               │
│  /speckit.ui-design --style=[number]                             │
│                                                                   │
│  輸入：選定的風格 + spec.md                                       │
│  輸出：                                                           │
│       - design-tokens.css / .json                                │
│       - user-flow.html                                           │
│       - wireframes/*.html                                        │
│       - components/*.html                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: 互動原型                                               │
│  /speckit.ui-prototype                                           │
│                                                                   │
│  輸入：設計系統 + wireframes                                      │
│  輸出：完整可互動的 HTML 原型                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 使用方式

### Step 1: 風格探索

```bash
/speckit.ui-explore
```

AI 會根據 `spec.md` 中的：
- 目標用戶
- 產品定位
- 功能特性
- 情感目標

自動產出 10 個不同風格的 UI 方案，每個風格包含：
- 色彩方案
- 字體組合
- 元件風格預覽
- 整體調性描述

### Step 2: 選擇風格並產出設計系統

```bash
/speckit.ui-design --style=3
```

根據選定的風格產出完整設計系統：
- **Design Tokens**: CSS 變數和 JSON 格式
- **User Flow**: 互動式使用者流程圖
- **Wireframes**: 每個頁面的 HTML 線框稿
- **Component Library**: 可複用的元件庫

### Step 3: 產出互動原型

```bash
/speckit.ui-prototype
```

整合設計系統產出完整可互動的 HTML 原型，包含：
- 響應式設計（Mobile / Tablet / Desktop）
- 頁面導航
- 表單互動
- Modal / Tabs / Accordion
- Toast 通知

## 輸出目錄結構

```
specs/[feature]/ui/
├── explore/                        # Phase 1: 風格探索
│   ├── index.html                  # 風格總覽頁
│   ├── style-01-modern-minimal/
│   │   ├── moodboard.html
│   │   └── tokens.css
│   ├── style-02-web3-crypto/
│   │   ├── moodboard.html
│   │   └── tokens.css
│   └── ... (共 10 個風格)
│
├── design/                         # Phase 2: 設計系統
│   ├── design-tokens.css           # 設計代幣
│   ├── design-tokens.json          # JSON 格式
│   ├── user-flow.html              # 使用者流程圖
│   ├── wireframes/                 # 線框稿
│   │   ├── index.html
│   │   └── [page].html
│   ├── components/                 # 元件庫
│   │   ├── index.html
│   │   ├── buttons.html
│   │   ├── forms.html
│   │   ├── cards.html
│   │   ├── navigation.html
│   │   ├── feedback.html
│   │   └── data-display.html
│   └── README.md
│
└── prototype/                      # Phase 3: 互動原型
    ├── index.html                  # 入口頁面
    ├── css/
    │   ├── tokens.css
    │   ├── base.css
    │   ├── components.css
    │   ├── utilities.css
    │   └── pages.css
    ├── js/
    │   ├── main.js
    │   ├── navigation.js
    │   └── interactions.js
    ├── pages/
    │   └── [page].html
    ├── assets/
    │   ├── images/
    │   └── icons/
    └── README.md
```

## 風格調性類型

系統支援以下 10 種風格調性：

| 調性 | 中文名稱 | 特徵 |
|------|----------|------|
| Modern Minimal | 現代簡約 | 單色、無襯線字體、大量留白 |
| Web3/Crypto | Web3 科技 | 深色背景、漸層、霓虹色 |
| Playful | 活潑趣味 | 鮮豔色彩、圓角、動畫 |
| Corporate | 企業專業 | 藍灰色調、結構化佈局 |
| Gamified | 遊戲化 | 徽章、進度條、明亮色彩 |
| Luxurious | 高端奢華 | 深色+金色、細緻字體 |
| Organic | 自然有機 | 大地色系、有機形狀 |
| Retro | 復古懷舊 | 年代特定色彩、復古字體 |
| Brutalist | 粗獷主義 | 高對比、粗體字、不規則 |
| Soft UI | 柔和新擬物 | 淺色、柔和陰影、圓潤 |

## 元件庫內容

### 基礎元件
- Buttons（Primary / Secondary / Ghost / Icon）
- Input Fields（Text / Password / With Icon / Error State）
- Select Dropdowns
- Checkboxes / Radio Buttons
- Toggle Switches

### 佈局元件
- Cards（Basic / With Image / Interactive）
- Navigation（Header / Mobile / Bottom）
- Modal Dialogs
- Tabs
- Accordion

### 回饋元件
- Alerts（Success / Warning / Error / Info）
- Loading Spinners
- Progress Bars
- Badges / Tags
- Toast Notifications

### 資料展示
- Stats Cards
- List Items
- Tables
- Empty States

## 相關檔案

- **Agent**: `.claude/agents/ui-prototype-generator.md`
- **命令**:
  - `.claude/commands/speckit.ui-explore.md`
  - `.claude/commands/speckit.ui-design.md`
  - `.claude/commands/speckit.ui-prototype.md`

## 注意事項

1. 所有 HTML 檔案都是獨立的，可直接在瀏覽器中預覽
2. 使用 Google Fonts 確保字體一致性
3. 色彩對比符合 WCAG AA 標準
4. 包含響應式斷點註解
5. 所有互動元素支援鍵盤操作

## 參考資源

- [Prototyping Best Practices](https://redblink.com/best-practices-for-prototyping/)
- [UI/UX Design Tools 2024](https://medium.com/@info.wilsonwings/the-best-ui-ux-design-tools-for-designers-in-2024-1382f39fcc6f)
- [AI Moodboard Tools](https://arctouch.com/blog/ai-design-mood-boards)
