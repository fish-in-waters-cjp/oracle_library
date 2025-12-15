# 永恆圖書館 UI 設計系統

> 產出日期：2025-12-16
> 專案分支：`001-eternal-library-mvp`
> 選用風格：Style 01, 02, 10（多選分別模式）

## 📋 目錄

- [概述](#概述)
- [風格總覽](#風格總覽)
- [檔案結構](#檔案結構)
- [設計代幣](#設計代幣)
- [頁面 Wireframes](#頁面-wireframes)
- [元件清單](#元件清單)
- [使用方式](#使用方式)
- [風格比較](#風格比較)
- [下一步](#下一步)

---

## 概述

本設計系統為「永恆圖書館 MVP」專案產出三種不同視覺風格的完整設計方案，包含：

- ✅ **Design Tokens**（設計代幣）：CSS 變數 + JSON 格式
- ✅ **User Flow**（使用者流程圖）：5 個核心 User Story 的互動流程
- ✅ **Wireframes**（線框圖）：4 個關鍵頁面的佈局設計
- ✅ **Components**（元件庫）：可複用的 UI 元件展示

所有檔案均為**獨立可執行的 HTML**，無需任何建置工具即可在瀏覽器中預覽！

---

## 風格總覽

### Style 01 - Web3 暗黑科技 ✨

**風格定位**：賽博龐克 | 科技感 | 霓虹發光

| 特性 | 說明 |
|------|------|
| **主色** | 霓虹青 `#00f3ff` |
| **次色** | 霓虹粉 `#ff006e` |
| **強調色** | 紫色科技 `#8b5cf6` |
| **背景** | 深藍黑 `#0a0e27` |
| **字體** | Orbitron（標題）+ Inter（內文）|
| **特效** | 霓虹發光、脈衝動畫、高對比 |

**適用場景**：Web3 項目、科技產品、遊戲化應用、年輕用戶群

### Style 02 - 神秘圖書館 📚

**風格定位**：古典神秘 | 知識殿堂 | 金色光暈

| 特性 | 說明 |
|------|------|
| **主色** | 典雅金 `#d4af37` |
| **次色** | 神秘靛藍 `#6366f1` |
| **強調色** | 神秘紫 `#9333ea` |
| **背景** | 深紫黑 `#1a0b2e` |
| **字體** | Cinzel（標題）+ Noto Sans TC（內文）|
| **特效** | 金色光暈、柔和漸層、漂浮動畫 |

**適用場景**：文化教育、知識平台、藝術收藏、成熟用戶群

### Style 10 - 高端奢華 💎

**風格定位**：極簡奢華 | 高端質感 | 低調精緻

| 特性 | 說明 |
|------|------|
| **主色** | 金色 `#d4af37` |
| **次色** | 銀色 `#c0c0c0` |
| **強調色** | 棕色 `#8b7355` |
| **背景** | 純黑 `#000000` |
| **字體** | Playfair Display（標題）+ Inter（內文）|
| **特效** | 細微發光、優雅過渡、大量留白 |

**適用場景**：高端品牌、奢侈品、精品收藏、高淨值用戶

---

## 檔案結構

```
specs/001-eternal-library-mvp/ui/design/
│
├── comparison.html                    # 🔥 風格比較頁面（入口）
├── README.md                          # 📖 本說明文件
│
├── style-01-web3-dark-tech/           # ✅ 完整版
│   ├── design-tokens.css              # 設計代幣（CSS）
│   ├── design-tokens.json             # 設計代幣（JSON）
│   ├── user-flow.html                 # 使用者流程圖
│   ├── wireframes/
│   │   ├── index.html                 # Wireframes 總覽
│   │   ├── login.html                 # 登入頁
│   │   ├── home.html                  # 主頁
│   │   ├── draw-result.html           # 抽取結果頁
│   │   └── collection.html            # 收藏頁
│   └── components/
│       ├── index.html                 # 元件總覽
│       ├── buttons.html               # 按鈕元件
│       ├── forms.html                 # 表單元件
│       ├── cards.html                 # 卡片元件
│       ├── navigation.html            # 導航元件
│       ├── feedback.html              # 回饋元件
│       └── data-display.html          # 數據展示元件
│
├── style-02-mystic-library/           # ✅ 完整版
│   ├── design-tokens.css
│   ├── design-tokens.json
│   ├── user-flow.html
│   ├── wireframes/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── home.html
│   │   ├── draw-result.html
│   │   └── collection.html
│   └── components/
│       ├── index.html
│       ├── buttons.html
│       ├── forms.html
│       ├── cards.html
│       ├── navigation.html
│       ├── feedback.html
│       └── data-display.html
│
└── style-10-luxury-premium/           # ✅ 完整版
    ├── design-tokens.css
    ├── design-tokens.json
    ├── user-flow.html
    ├── wireframes/
    │   ├── index.html
    │   ├── login.html
    │   ├── home.html
    │   ├── draw-result.html
    │   └── collection.html
    └── components/
        ├── index.html
        ├── buttons.html
        ├── forms.html
        ├── cards.html
        ├── navigation.html
        ├── feedback.html
        └── data-display.html
```

### 完成度說明

| 風格 | Design Tokens | User Flow | Wireframes | Components | 狀態 |
|------|--------------|-----------|------------|------------|------|
| Style 01 | ✅ | ✅ | ✅ 4 頁面 | ✅ 6 類別 | **完整可用** |
| Style 02 | ✅ | ✅ | ✅ 4 頁面 | ✅ 6 類別 | **完整可用** |
| Style 10 | ✅ | ✅ | ✅ 4 頁面 | ✅ 6 類別 | **完整可用** |

> **✨ 所有三個風格都已完整產出**，包含 Design Tokens、User Flow、Wireframes 和 Components，可直接使用！

---

## 設計代幣

### 色彩系統

#### Style 01 - Web3 暗黑科技

```css
--color-primary: #00f3ff;              /* 霓虹青 */
--color-secondary: #ff006e;            /* 霓虹粉 */
--color-accent: #8b5cf6;               /* 紫色科技感 */
--color-background-main: #0a0e27;      /* 深藍黑底 */
```

#### Style 02 - 神秘圖書館

```css
--color-primary: #d4af37;              /* 典雅金色 */
--color-secondary: #6366f1;            /* 神秘靛藍 */
--color-accent: #9333ea;               /* 神秘紫 */
--color-background-main: #1a0b2e;      /* 深紫黑底 */
```

#### Style 10 - 高端奢華

```css
--color-primary: #d4af37;              /* 金色 */
--color-secondary: #c0c0c0;            /* 銀色 */
--color-accent: #8b7355;               /* 棕色 */
--color-background-main: #000000;      /* 純黑 */
```

### 稀有度色彩（通用）

所有風格均支援 NFT 稀有度系統：

| 稀有度 | 顏色 | Hex | 機率 |
|--------|------|-----|------|
| Common | 灰色 | `#6b7280` | 60% |
| Rare | 藍色 | `#3b82f6` | 30% |
| Epic | 紫色 | `#a855f7` | 8% |
| Legendary | 金色 | `#fbbf24` | 2% |

### 字體系統

| 風格 | 標題字體 | 內文字體 | 等寬字體 |
|------|---------|---------|---------|
| Style 01 | Orbitron | Inter | JetBrains Mono |
| Style 02 | Cinzel | Noto Sans TC | JetBrains Mono |
| Style 10 | Playfair Display | Inter | JetBrains Mono |

### 間距系統（統一）

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 頁面 Wireframes

### 已完成頁面（Style 01）

- ✅ **login.html** - 登入頁
  - 錢包連接卡片
  - Logo + 標題
  - 連接按鈕
  - 錯誤訊息區域

- ✅ **home.html** - 主頁
  - 頂部導航（錢包地址、斷開連接）
  - MGC 餘額顯示
  - 簽到卡片（按鈕 + 連續天數）
  - 抽取解答卡片（問題輸入 + 抽取按鈕）

- ✅ **draw-result.html** - 抽取結果頁
  - 答案卡片（含稀有度背景色）
  - 雙語答案（英文 + 中文）
  - 稀有度標籤
  - 鑄造 NFT 按鈕

- ✅ **collection.html** - 收藏頁
  - 統計卡片（總收藏數、稀有度分佈）
  - NFT 網格（響應式：4-3-2 列）
  - NFT 卡片（圖片、名稱、稀有度、日期）
  - 空狀態

### 響應式設計

| 裝置 | NFT 網格列數 | 斷點 |
|------|------------|------|
| 桌面 | 4 列 | ≥1024px |
| 平板 | 3 列 | 768px - 1023px |
| 手機 | 2 列 | <768px |

---

## 元件清單

### 已完成元件（所有風格）

#### Buttons 按鈕

- [x] Primary Button（主要按鈕）
- [x] Secondary Button（次要按鈕）
- [x] Ghost Button（幽靈按鈕）
- [x] Link Button（連結按鈕）
- [x] Icon Button（圖示按鈕）
- [x] Loading State（載入狀態）
- [x] Disabled State（禁用狀態）
- [x] Size Variants（sm, md, lg）

#### Cards 卡片

- [x] Basic Card（基礎卡片）
- [x] Rarity Cards（稀有度卡片 × 4）
  - Common（灰色）
  - Rare（藍色）
  - Epic（紫色）
  - Legendary（金色）
- [x] NFT Card（NFT 卡片）
- [x] Interactive Card（互動卡片，含 hover）

#### Forms 表單

- [x] Text Input（文字輸入框）
- [x] Textarea（多行文字）
- [x] Select Dropdown（下拉選單）
- [x] Checkbox（核取方塊）
- [x] Radio Button（單選按鈕）
- [x] Toggle Switch（切換開關）
- [x] Validation States（驗證狀態）

#### Navigation 導航

- [x] Header Navigation（頂部導航）
- [x] Mobile Menu（行動選單）
- [x] Breadcrumbs（麵包屑）
- [x] Tabs（分頁）
- [x] Wallet Address Display（錢包地址顯示）

#### Feedback 回饋

- [x] Alert Variants（提示框：success, warning, error, info）
- [x] Toast Notification（彈出通知）
- [x] Loading Spinner（載入動畫）
- [x] Progress Bar（進度條）
- [x] Skeleton Loader（骨架屏）
- [x] Empty State（空狀態）

#### Data Display 數據展示

- [x] Stats Card（統計卡片）
- [x] List Items（列表項目）
- [x] Badge/Tag（標籤，用於稀有度）
- [x] Countdown Timer（倒計時器）

---

## 使用方式

### 1. 快速預覽

**推薦：使用風格比較頁面**

```bash
# 在瀏覽器中打開
open specs/001-eternal-library-mvp/ui/design/comparison.html
```

這個頁面提供：
- 三種風格並列比較
- 可切換檢視：Wireframes、Components、User Flow、Tokens
- 嵌入式 iframe 預覽
- 快速導航連結

### 2. 查看單一風格

**預覽 Style 01 - Web3 暗黑科技**

```bash
# Wireframes 總覽
open specs/001-eternal-library-mvp/ui/design/style-01-web3-dark-tech/wireframes/index.html

# Components 總覽
open specs/001-eternal-library-mvp/ui/design/style-01-web3-dark-tech/components/index.html

# User Flow
open specs/001-eternal-library-mvp/ui/design/style-01-web3-dark-tech/user-flow.html
```

### 3. 在開發中使用

**引入 Design Tokens**

```html
<!-- 在 HTML 中引入 -->
<link rel="stylesheet" href="path/to/design-tokens.css">
```

```css
/* 在 CSS 中使用變數 */
.button-primary {
    background: var(--color-primary);
    color: var(--color-text-primary);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
}

.button-primary:hover {
    box-shadow: var(--shadow-glow-primary);
}
```

**讀取 JSON Tokens**

```javascript
// 在 JavaScript 中讀取
fetch('path/to/design-tokens.json')
    .then(res => res.json())
    .then(tokens => {
        console.log(tokens.colors.primary); // "#00f3ff"
    });
```

### 4. 擴展其他風格

如需為 Style 02 或 Style 10 產出完整的 Wireframes 和 Components：

1. **複製 Style 01 的檔案**
   ```bash
   cp -r style-01-web3-dark-tech/wireframes style-02-mystic-library/
   cp -r style-01-web3-dark-tech/components style-02-mystic-library/
   ```

2. **替換 CSS 引用**
   ```html
   <!-- 原本 -->
   <link rel="stylesheet" href="../design-tokens.css">

   <!-- 無需更改，因為路徑相對正確 -->
   ```

3. **調整特定視覺細節**
   - Style 02：移除霓虹發光效果，改為金色光暈
   - Style 10：移除複雜裝飾，增加留白

---

## 風格比較

### 視覺特效對比

| 特效 | Style 01 | Style 02 | Style 10 |
|------|---------|---------|---------|
| 發光效果 | 霓虹強烈 | 金色柔和 | 細微光暈 |
| 邊框 | 高對比亮邊框 | 金色裝飾邊 | 極簡細線 |
| 動畫 | 脈衝、glitch | 漂浮、淡入 | 優雅過渡 |
| 留白 | 緊湊 | 適中 | 大量 |
| 複雜度 | 高 | 中 | 低 |

### 適用場景建議

| 場景 | 推薦風格 | 理由 |
|------|---------|------|
| Web3 DApp | Style 01 | 符合區塊鏈科技氛圍 |
| 知識平台 | Style 02 | 古典神秘適合內容沉澱 |
| 高端品牌 | Style 10 | 低調奢華提升品牌價值 |
| 年輕用戶 | Style 01 | 炫酷視覺吸引目光 |
| 成熟用戶 | Style 10 | 簡約質感符合審美 |

---

## 下一步

### 立即可行

1. **選定最終風格**
   - 在 `comparison.html` 中比較各風格
   - 根據目標用戶和品牌定位選擇

2. **執行 UI Prototype**
   ```bash
   /speckit.ui-prototype --style=[number]
   ```
   產出完整互動原型

3. **開始實作**
   - 複用設計代幣
   - 參考 Wireframes 佈局
   - 使用 Components 元件

### 後續優化

1. **增加動畫效果**
   - 抽取解答的 Phaser 3 動畫
   - NFT 鑄造成功的慶祝動畫
   - 簽到成功的 MGC 跳動效果

2. **無障礙優化**
   - ARIA 標籤完善
   - 鍵盤導航支援
   - 色彩對比度檢查

3. **效能優化**
   - 圖片延遲載入
   - 骨架屏優化
   - CSS 動畫效能調整

4. **A/B 測試**
   - 使用三種風格進行用戶測試
   - 收集回饋並優化

---

## 技術規格

### 瀏覽器支援

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

### 響應式斷點

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

### 字體載入

所有字體均使用 Google Fonts CDN：

```html
<!-- Style 01 -->
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Style 02 -->
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Style 10 -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 授權與版權

© 2025 永恆圖書館專案
本設計系統僅供 `001-eternal-library-mvp` 專案內部使用

---

## 聯絡資訊

如有問題或建議，請聯繫專案團隊或提交 Issue。

**專案分支**：`001-eternal-library-mvp`
**設計系統版本**：v1.0.0
**最後更新**：2025-12-16

---

## 附錄

### 檔案清單

完整產出的檔案列表（共 41 個檔案）：

```
design/
├── comparison.html                                    # 風格比較頁面
├── README.md                                          # 本文件
│
├── style-01-web3-dark-tech/                           # 13 個檔案
│   ├── design-tokens.css
│   ├── design-tokens.json
│   ├── user-flow.html
│   ├── wireframes/ (5 個檔案)
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── home.html
│   │   ├── draw-result.html
│   │   └── collection.html
│   └── components/ (7 個檔案)
│       ├── index.html
│       ├── buttons.html
│       ├── forms.html
│       ├── cards.html
│       ├── navigation.html
│       ├── feedback.html
│       └── data-display.html
│
├── style-02-mystic-library/                           # 13 個檔案
│   ├── design-tokens.css
│   ├── design-tokens.json
│   ├── user-flow.html
│   ├── wireframes/ (5 個檔案)
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── home.html
│   │   ├── draw-result.html
│   │   └── collection.html
│   └── components/ (7 個檔案)
│       ├── index.html
│       ├── buttons.html
│       ├── forms.html
│       ├── cards.html
│       ├── navigation.html
│       ├── feedback.html
│       └── data-display.html
│
└── style-10-luxury-premium/                           # 13 個檔案
    ├── design-tokens.css
    ├── design-tokens.json
    ├── user-flow.html
    ├── wireframes/ (5 個檔案)
    │   ├── index.html
    │   ├── login.html
    │   ├── home.html
    │   ├── draw-result.html
    │   └── collection.html
    └── components/ (7 個檔案)
        ├── index.html
        ├── buttons.html
        ├── forms.html
        ├── cards.html
        ├── navigation.html
        ├── feedback.html
        └── data-display.html
```

### 相關文件

- [功能規格書](../../spec.md)
- [風格探索](../explore/)
- [實作計畫](../../plan.md)（待產出）

---

**🎨 設計系統已就緒，開始打造永恆圖書館吧！**
