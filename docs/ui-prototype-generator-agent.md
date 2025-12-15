# UI Prototype Generator Agent

本文件說明 `ui-prototype-generator` Agent 的使用方式和功能。

## 概覽

`ui-prototype-generator` 是一個專門產出 HTML-based 設計交付物的 Agent，包括：
- Moodboards（風格預覽）
- Wireframes（線框稿）
- Component Library（元件庫）
- Interactive Prototypes（互動原型）

## Agent 配置

**位置**: `.claude/agents/ui-prototype-generator.md`

```yaml
name: ui-prototype-generator
tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
model: sonnet
```

## 使用場景

### 1. 由 spec-kit 命令自動調用

Agent 主要由以下命令調用：

```bash
# 風格探索時調用
/speckit.ui-explore

# 設計系統產出時調用
/speckit.ui-design --style=[number]

# 原型產出時調用
/speckit.ui-prototype
```

### 2. 直接使用 Task 工具調用

你也可以直接透過 Task 工具調用 Agent：

```
請使用 ui-prototype-generator agent 幫我產出一個現代簡約風格的登入頁面 wireframe
```

## 核心能力

### 風格探索 (Style Exploration)

根據專案需求產出多種 UI 風格選項：

| 調性 | 中文名稱 | 視覺特徵 |
|------|----------|----------|
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

### 設計系統產出 (Design System)

產出完整的設計代幣和元件：

**Design Tokens**:
- 色彩系統（主色、輔色、語意色）
- 字體系統（標題、內文、等寬）
- 間距系統（0-24 級距）
- 圓角系統
- 陰影系統
- 動畫時間

**元件庫**:
- Buttons（按鈕）
- Forms（表單元素）
- Cards（卡片）
- Navigation（導航）
- Feedback（回饋元件）
- Data Display（資料展示）

### 原型開發 (Prototype)

產出完整可互動的 HTML 原型：

- 響應式設計（Mobile / Tablet / Desktop）
- 頁面導航
- Modal 對話框
- Tabs 切換
- Accordion 摺疊
- Toast 通知
- 表單互動

## HTML 輸出標準

### Moodboard 結構

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[風格名稱] - 風格預覽</title>
    <style>
        :root {
            /* Design Tokens */
            --color-primary: #...;
            --color-secondary: #...;
            --font-heading: '...', sans-serif;
            --radius-md: ...;
            --shadow-md: ...;
        }
    </style>
</head>
<body>
    <header>風格名稱和調性標籤</header>
    <section class="color-palette">色彩方案</section>
    <section class="typography">字體排版</section>
    <section class="components">元件預覽</section>
    <section class="sample-layout">版面範例</section>
</body>
</html>
```

### Design Tokens 格式

```css
:root {
    /* Color Tokens */
    --color-primary: #...;
    --color-primary-light: #...;
    --color-primary-dark: #...;
    --color-secondary: #...;
    --color-accent: #...;
    --color-bg: #...;
    --color-text: #...;
    --color-success: #...;
    --color-warning: #...;
    --color-error: #...;

    /* Typography Tokens */
    --font-heading: '...', sans-serif;
    --font-body: '...', sans-serif;
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;

    /* Spacing Tokens */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

## 無障礙標準

所有產出的 HTML 都符合以下標準：

1. **語意化 HTML**: 正確的標題層級、語意標籤
2. **ARIA 標籤**: 互動元素的無障礙標籤
3. **色彩對比**: WCAG AA 標準（4.5:1 文字對比）
4. **焦點狀態**: 可見的焦點指示器
5. **鍵盤導航**: 所有互動元素可鍵盤操作

## 輸出目錄結構

```
specs/[feature]/ui/
├── explore/                    # 風格探索
│   ├── index.html             # 風格選擇總覽
│   └── style-[N]-[name]/
│       ├── moodboard.html
│       └── tokens.css
│
├── design/                     # 設計系統
│   ├── design-tokens.css
│   ├── design-tokens.json
│   ├── user-flow.html
│   ├── wireframes/
│   │   └── [page].html
│   └── components/
│       └── [component].html
│
└── prototype/                  # 完整原型
    ├── index.html
    ├── css/
    ├── js/
    ├── pages/
    └── assets/
```

## 與其他 Agent 的區別

| Agent | 用途 | 產出 |
|-------|------|------|
| `ui-ux-designer` | UX 研究、使用者流程設計、設計策略 | 文件、規格、建議 |
| `ui-prototype-generator` | HTML 原型產出 | 可預覽的 HTML 檔案 |

## 常見用法範例

### 範例 1: 產出單一元件

```
請使用 ui-prototype-generator agent 產出一個帶有圖片的卡片元件，
使用現代簡約風格，包含標題、描述和操作按鈕。
```

### 範例 2: 產出特定頁面 wireframe

```
請使用 ui-prototype-generator agent 根據 spec.md 中的 US2（每日簽到）
產出簽到頁面的 HTML wireframe。
```

### 範例 3: 產出完整風格方案

```
請使用 ui-prototype-generator agent 為「永恆圖書館」專案產出一個
Web3 科技風格的完整 moodboard，包含色彩、字體和元件預覽。
```

## 注意事項

1. **語言**: 所有 UI 標籤和註解使用繁體中文（zh-TW）
2. **字體**: 使用 Google Fonts 確保跨平台一致性
3. **獨立性**: 所有 HTML 檔案可獨立在瀏覽器中預覽
4. **響應式**: 預設支援 Mobile / Tablet / Desktop 三種斷點

## 相關資源

- [UI 設計工作流程](./ui-design-workflow.md)
- [spec-kit 命令說明](./init.md)
