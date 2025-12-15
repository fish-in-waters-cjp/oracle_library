---
description: Generate complete design system based on selected style, including design tokens, user flows, wireframes, and component library.
---

## User Input

```text
$ARGUMENTS
```

Parse the following from user input:

| 參數 | 格式 | 說明 |
|------|------|------|
| `--style` | `--style=3` 或 `--style=1,3,5` | 選擇的風格編號（單選或多選） |
| `--merge` | `--merge` | 多選時，將多個風格合併成一個設計系統 |

**使用範例**:
```bash
# 單選一個風格
/speckit.ui-design --style=3

# 選擇多個風格，分別產出（預設）
/speckit.ui-design --style=1,3,5

# 選擇多個風格，合併產出
/speckit.ui-design --style=1,3,5 --merge
```

If style number is not provided, ask user to select one.

## Outline

### 1. Prerequisites Check

Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR.

Verify required files exist:
- `FEATURE_DIR/spec.md` - **REQUIRED**
- `FEATURE_DIR/ui/explore/style-[XX]-*/tokens.css` - **REQUIRED** (selected style)

### 2. Load Context

Read and analyze:
- `spec.md` - User Stories, features, requirements
- Selected style's `tokens.css` - Design tokens to use
- Selected style's `moodboard.html` - Visual reference

Extract from spec:
- All User Stories and their flows
- Required pages/screens
- Key interactions and states
- Data entities and their display needs

### 3. Create Design Directory Structure

**單選模式** (`--style=3`):
```
FEATURE_DIR/ui/design/
├── design-tokens.css              # Design tokens
├── design-tokens.json             # JSON format
├── user-flow.html                 # User flow diagram
├── wireframes/
│   └── [page].html
├── components/
│   └── [component].html
└── README.md
```

**多選分別模式** (`--style=1,3,5`):
```
FEATURE_DIR/ui/design/
├── style-01-[name]/               # 風格 1 的完整設計系統
│   ├── design-tokens.css
│   ├── wireframes/
│   └── components/
├── style-03-[name]/               # 風格 3 的完整設計系統
│   ├── design-tokens.css
│   ├── wireframes/
│   └── components/
├── style-05-[name]/               # 風格 5 的完整設計系統
│   ├── design-tokens.css
│   ├── wireframes/
│   └── components/
├── comparison.html                # 風格比較頁面
└── README.md
```

**多選合併模式** (`--style=1,3,5 --merge`):
```
FEATURE_DIR/ui/design/
├── design-tokens.css              # 合併的 design tokens（含切換機制）
├── design-tokens.json
├── theme-switcher.js              # 主題切換 JavaScript
├── user-flow.html
├── wireframes/
│   └── [page].html                # 每個頁面支援主題切換
├── components/
│   └── [component].html
└── README.md
```

---

**Original single-style structure**:
```
FEATURE_DIR/ui/design/
├── design-tokens.css              # Consolidated design tokens
├── design-tokens.json             # JSON format for tooling
├── user-flow.html                 # Interactive user flow diagram
├── wireframes/
│   ├── index.html                 # Wireframe gallery
│   ├── [page-name].html           # Each page wireframe
│   └── ...
├── components/
│   ├── index.html                 # Component library overview
│   ├── buttons.html               # Button variants
│   ├── forms.html                 # Form elements
│   ├── cards.html                 # Card variants
│   ├── navigation.html            # Navigation components
│   ├── feedback.html              # Alerts, toasts, loaders
│   └── data-display.html          # Tables, lists, stats
└── README.md                      # Design system documentation
```

### 4. Generate Design Tokens

Copy and enhance selected style's tokens to `design-tokens.css`:

```css
/**
 * Design Tokens - [Feature Name]
 * Generated from: Style [XX] - [Style Name]
 * Date: [Generated Date]
 */

:root {
    /* ═══════════════════════════════════════
       COLOR TOKENS
       ═══════════════════════════════════════ */

    /* Brand Colors */
    --color-primary: ...;
    --color-primary-light: ...;
    --color-primary-dark: ...;
    --color-secondary: ...;
    --color-accent: ...;

    /* Background Colors */
    --color-bg: ...;
    --color-bg-elevated: ...;
    --color-bg-muted: ...;

    /* Text Colors */
    --color-text: ...;
    --color-text-secondary: ...;
    --color-text-muted: ...;
    --color-text-inverse: ...;

    /* Border Colors */
    --color-border: ...;
    --color-border-light: ...;

    /* Semantic Colors */
    --color-success: ...;
    --color-success-bg: ...;
    --color-warning: ...;
    --color-warning-bg: ...;
    --color-error: ...;
    --color-error-bg: ...;
    --color-info: ...;
    --color-info-bg: ...;

    /* ═══════════════════════════════════════
       TYPOGRAPHY TOKENS
       ═══════════════════════════════════════ */

    --font-heading: ...;
    --font-body: ...;
    --font-mono: ...;

    --text-xs: 0.75rem;     /* 12px */
    --text-sm: 0.875rem;    /* 14px */
    --text-base: 1rem;      /* 16px */
    --text-lg: 1.125rem;    /* 18px */
    --text-xl: 1.25rem;     /* 20px */
    --text-2xl: 1.5rem;     /* 24px */
    --text-3xl: 1.875rem;   /* 30px */
    --text-4xl: 2.25rem;    /* 36px */
    --text-5xl: 3rem;       /* 48px */

    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;

    --tracking-tight: -0.025em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;

    /* ═══════════════════════════════════════
       SPACING TOKENS
       ═══════════════════════════════════════ */

    --space-0: 0;
    --space-1: 0.25rem;     /* 4px */
    --space-2: 0.5rem;      /* 8px */
    --space-3: 0.75rem;     /* 12px */
    --space-4: 1rem;        /* 16px */
    --space-5: 1.25rem;     /* 20px */
    --space-6: 1.5rem;      /* 24px */
    --space-8: 2rem;        /* 32px */
    --space-10: 2.5rem;     /* 40px */
    --space-12: 3rem;       /* 48px */
    --space-16: 4rem;       /* 64px */
    --space-20: 5rem;       /* 80px */
    --space-24: 6rem;       /* 96px */

    /* ═══════════════════════════════════════
       BORDER TOKENS
       ═══════════════════════════════════════ */

    --radius-none: 0;
    --radius-sm: ...;
    --radius-md: ...;
    --radius-lg: ...;
    --radius-xl: ...;
    --radius-2xl: ...;
    --radius-full: 9999px;

    --border-width: 1px;
    --border-width-2: 2px;

    /* ═══════════════════════════════════════
       SHADOW TOKENS
       ═══════════════════════════════════════ */

    --shadow-xs: ...;
    --shadow-sm: ...;
    --shadow-md: ...;
    --shadow-lg: ...;
    --shadow-xl: ...;
    --shadow-2xl: ...;
    --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

    /* ═══════════════════════════════════════
       ANIMATION TOKENS
       ═══════════════════════════════════════ */

    --duration-fast: 150ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;

    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

    /* ═══════════════════════════════════════
       BREAKPOINTS (for reference)
       ═══════════════════════════════════════ */

    /* --breakpoint-sm: 640px; */
    /* --breakpoint-md: 768px; */
    /* --breakpoint-lg: 1024px; */
    /* --breakpoint-xl: 1280px; */

    /* ═══════════════════════════════════════
       Z-INDEX SCALE
       ═══════════════════════════════════════ */

    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-fixed: 1200;
    --z-modal-backdrop: 1300;
    --z-modal: 1400;
    --z-popover: 1500;
    --z-tooltip: 1600;
}
```

Also generate `design-tokens.json` for tooling integration.

### 5. Generate User Flow Diagram

Create `user-flow.html` based on spec's User Stories:

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Feature Name] - 使用者流程</title>
    <link rel="stylesheet" href="design-tokens.css">
    <style>
        /* User flow diagram styles */
        .flow-container { padding: 2rem; }
        .flow-title { margin-bottom: 2rem; }

        .user-flow {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .flow-row {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .flow-node {
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            font-weight: 500;
            min-width: 150px;
            text-align: center;
        }

        .flow-start {
            background: var(--color-success);
            color: white;
            border-radius: var(--radius-full);
        }

        .flow-end {
            background: var(--color-error);
            color: white;
            border-radius: var(--radius-full);
        }

        .flow-action {
            background: var(--color-primary);
            color: white;
        }

        .flow-page {
            background: var(--color-bg-elevated);
            border: 2px solid var(--color-border);
        }

        .flow-decision {
            background: var(--color-warning);
            color: var(--color-text);
            transform: rotate(0deg);
            clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
            padding: 2rem;
        }

        .flow-arrow {
            font-size: 1.5rem;
            color: var(--color-text-muted);
        }

        .flow-branch {
            display: flex;
            gap: 2rem;
        }

        .flow-label {
            font-size: var(--text-sm);
            color: var(--color-text-muted);
        }

        .flow-section {
            margin-bottom: 3rem;
            padding: 1.5rem;
            background: var(--color-bg-muted);
            border-radius: var(--radius-lg);
        }

        .flow-section-title {
            font-size: var(--text-lg);
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-text);
        }
    </style>
</head>
<body>
    <div class="flow-container">
        <h1 class="flow-title">[Feature Name] - 使用者流程圖</h1>

        <!-- Generate flow sections for each User Story -->
        <div class="flow-section">
            <h2 class="flow-section-title">US1: [User Story Title]</h2>
            <div class="user-flow">
                <!-- Flow nodes -->
            </div>
        </div>

        <!-- Repeat for each User Story -->
    </div>
</body>
</html>
```

### 6. Generate Wireframes

For each page identified in spec, create a wireframe in `wireframes/`:

**Wireframe includes**:
- Page layout structure
- Component placement
- Content hierarchy
- Interactive elements marked
- Responsive notes
- Annotations for developers

**Common pages to generate**:
- Home/Landing page
- Main feature pages (based on User Stories)
- Forms and input pages
- Results/confirmation pages
- Error states
- Loading states

### 7. Generate Component Library

Create component documentation in `components/`:

**buttons.html**:
- Primary, Secondary, Ghost, Link buttons
- Icon buttons
- Button groups
- Loading state
- Disabled state
- Size variants (sm, md, lg)

**forms.html**:
- Text inputs
- Password inputs
- Textareas
- Select dropdowns
- Checkboxes
- Radio buttons
- Toggle switches
- Form validation states
- Form layouts

**cards.html**:
- Basic card
- Card with image
- Card with actions
- Horizontal card
- Interactive card

**navigation.html**:
- Header navigation
- Mobile navigation (hamburger menu)
- Bottom navigation
- Breadcrumbs
- Tabs
- Sidebar

**feedback.html**:
- Alert variants (success, warning, error, info)
- Toast notifications
- Loading spinners
- Progress bars
- Skeleton loaders
- Empty states

**data-display.html**:
- Stats cards
- List items
- Tables
- Badges and tags

### 8. Generate README

Create `README.md` documenting the design system:

```markdown
# [Feature Name] Design System

## 風格基礎
- **選用風格**: Style [XX] - [Name]
- **調性**: [Tone description]
- **產出日期**: [Date]

## 設計代幣

### 色彩
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | [hex] | 主要按鈕、連結 |
| ... | ... | ... |

### 字體
| Token | Value | Usage |
|-------|-------|-------|
| --font-heading | [font] | 標題 |
| ... | ... | ... |

## 元件清單
- [x] Buttons
- [x] Forms
- [x] Cards
- [x] Navigation
- [x] Feedback
- [x] Data Display

## 頁面 Wireframes
- [x] [Page 1]
- [x] [Page 2]
- ...

## 使用方式

1. 引入 design-tokens.css
2. 使用 CSS 變數
3. 參考 components/ 中的元件範例

## 下一步

執行 `/speckit.ui-prototype` 產出完整互動原型
```

### 9. Completion Summary

```
═══════════════════════════════════════════════════════════════
✅ 設計系統產出完成
═══════════════════════════════════════════════════════════════

基於風格: Style [XX] - [Style Name]

📁 產出內容：

設計代幣:
  ├── design-tokens.css
  └── design-tokens.json

使用者流程:
  └── user-flow.html ([N] 個流程)

Wireframes:
  ├── [page-1].html
  ├── [page-2].html
  └── ... ([N] 個頁面)

元件庫:
  ├── buttons.html
  ├── forms.html
  ├── cards.html
  ├── navigation.html
  ├── feedback.html
  └── data-display.html

📁 檔案位置：FEATURE_DIR/ui/design/

📌 下一步：
   執行 /speckit.ui-prototype 產出完整互動原型

═══════════════════════════════════════════════════════════════
```

## Notes

- All wireframes should use the design tokens
- Include responsive breakpoint annotations
- Mark interactive elements clearly
- Use the ui-prototype-generator agent for HTML generation
- Ensure all pages link to design-tokens.css

---

## Multi-Style Mode Details

### 多選分別模式 (`--style=1,3,5`)

為每個選擇的風格產出獨立的設計系統，方便比較：

**comparison.html** - 風格比較頁面：
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <title>風格比較</title>
</head>
<body>
    <h1>風格比較</h1>
    <div class="comparison-grid">
        <div class="style-column">
            <h2>Style 01: [Name]</h2>
            <iframe src="style-01-[name]/wireframes/home.html"></iframe>
        </div>
        <div class="style-column">
            <h2>Style 03: [Name]</h2>
            <iframe src="style-03-[name]/wireframes/home.html"></iframe>
        </div>
        <div class="style-column">
            <h2>Style 05: [Name]</h2>
            <iframe src="style-05-[name]/wireframes/home.html"></iframe>
        </div>
    </div>
</body>
</html>
```

### 多選合併模式 (`--style=1,3,5 --merge`)

合併多個風格為一個支援主題切換的設計系統：

**design-tokens.css** - 合併的 tokens：
```css
/* 預設主題 (Style 01) */
:root {
    --color-primary: #...;
    --color-secondary: #...;
    /* ... */
}

/* Style 03 主題 */
[data-theme="style-03"] {
    --color-primary: #...;
    --color-secondary: #...;
    /* ... */
}

/* Style 05 主題 */
[data-theme="style-05"] {
    --color-primary: #...;
    --color-secondary: #...;
    /* ... */
}
```

**theme-switcher.js** - 主題切換器：
```javascript
/**
 * Theme Switcher
 * 切換不同的設計風格主題
 */

const themes = ['style-01', 'style-03', 'style-05'];

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
}

function initThemeSwitcher() {
    // 從 localStorage 讀取已選主題
    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // 綁定切換按鈕
    const switcher = document.querySelector('[data-theme-switcher]');
    if (switcher) {
        themes.forEach(theme => {
            const btn = document.createElement('button');
            btn.textContent = theme;
            btn.onclick = () => setTheme(theme);
            switcher.appendChild(btn);
        });
    }
}

document.addEventListener('DOMContentLoaded', initThemeSwitcher);
```

**Wireframe 頁面加入主題切換器**：
```html
<header>
    <nav>...</nav>
    <div data-theme-switcher class="theme-switcher">
        <span>切換風格：</span>
    </div>
</header>
```

### 完成摘要（多選模式）

**分別模式**：
```
═══════════════════════════════════════════════════════════════
✅ 設計系統產出完成（多風格分別模式）
═══════════════════════════════════════════════════════════════

已產出 3 套設計系統：

| 風格 | 目錄 | 頁面數 | 元件數 |
|------|------|--------|--------|
| Style 01 - [Name] | style-01-[name]/ | N | 6 |
| Style 03 - [Name] | style-03-[name]/ | N | 6 |
| Style 05 - [Name] | style-05-[name]/ | N | 6 |

🔗 開啟比較頁面：
   file://FEATURE_DIR/ui/design/comparison.html

📌 下一步：
   1. 在 comparison.html 中比較各風格
   2. 選定最終風格後，執行：
      /speckit.ui-prototype --style=[number]

═══════════════════════════════════════════════════════════════
```

**合併模式**：
```
═══════════════════════════════════════════════════════════════
✅ 設計系統產出完成（多風格合併模式）
═══════════════════════════════════════════════════════════════

已合併 3 個風格為可切換主題系統：
- Style 01: [Name] (預設)
- Style 03: [Name]
- Style 05: [Name]

📁 產出內容：
  ├── design-tokens.css    # 含 3 個主題的 tokens
  ├── theme-switcher.js    # 主題切換器
  ├── wireframes/          # 支援主題切換
  └── components/          # 支援主題切換

🔗 開啟預覽：
   file://FEATURE_DIR/ui/design/wireframes/index.html
   （使用頁面右上角的切換器切換風格）

📌 下一步：
   執行 /speckit.ui-prototype 產出完整互動原型（含主題切換）

═══════════════════════════════════════════════════════════════
```
