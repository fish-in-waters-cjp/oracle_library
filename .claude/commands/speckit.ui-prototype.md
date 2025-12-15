---
description: Generate complete interactive HTML prototype by integrating design system, wireframes, and components into a functional prototype.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### 1. Prerequisites Check

Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR.

Verify required files exist:
- `FEATURE_DIR/spec.md` - **REQUIRED**
- `FEATURE_DIR/ui/design/design-tokens.css` - **REQUIRED**
- `FEATURE_DIR/ui/design/wireframes/` - **REQUIRED**
- `FEATURE_DIR/ui/design/components/` - **REQUIRED**

If design system doesn't exist, prompt user to run `/speckit.ui-design` first.

### 2. Load Context

Read and analyze:
- `spec.md` - Feature requirements and user stories
- `design-tokens.css` - Design system tokens
- All wireframes in `wireframes/`
- All components in `components/`
- `user-flow.html` - Navigation structure

### 3. Create Prototype Directory Structure

```
FEATURE_DIR/ui/prototype/
├── index.html                     # Entry point / Home page
├── css/
│   ├── tokens.css                 # Design tokens (copied)
│   ├── base.css                   # Reset and base styles
│   ├── components.css             # Component styles
│   ├── utilities.css              # Utility classes
│   └── pages.css                  # Page-specific styles
├── js/
│   ├── main.js                    # Main JavaScript
│   ├── navigation.js              # Navigation handling
│   └── interactions.js            # UI interactions
├── pages/
│   ├── [page-name].html           # Each page
│   └── ...
├── assets/
│   ├── images/                    # Placeholder images
│   └── icons/                     # Icon set (SVG)
└── README.md                      # Prototype documentation
```

### 4. Generate Base CSS Files

**css/base.css**:
```css
/**
 * Base Styles
 * Reset and foundational styles
 */

*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    font-family: var(--font-body);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    color: var(--color-text);
    background-color: var(--color-bg);
    min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 600;
    line-height: var(--leading-tight);
    color: var(--color-text);
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }
h4 { font-size: var(--text-xl); }
h5 { font-size: var(--text-lg); }
h6 { font-size: var(--text-base); }

a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
}

a:hover {
    color: var(--color-primary-dark);
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}

button {
    font-family: inherit;
    cursor: pointer;
}

input, textarea, select {
    font-family: inherit;
    font-size: inherit;
}

/* Focus styles for accessibility */
:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

**css/utilities.css**:
```css
/**
 * Utility Classes
 * Single-purpose helper classes
 */

/* Display */
.hidden { display: none !important; }
.block { display: block; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }

/* Flexbox */
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }

/* Spacing - Margin */
.m-0 { margin: 0; }
.m-auto { margin: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }

/* Spacing - Padding */
.p-0 { padding: 0; }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.px-6 { padding-left: var(--space-6); padding-right: var(--space-6); }
.py-2 { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.py-8 { padding-top: var(--space-8); padding-bottom: var(--space-8); }

/* Width */
.w-full { width: 100%; }
.max-w-sm { max-width: 24rem; }
.max-w-md { max-width: 28rem; }
.max-w-lg { max-width: 32rem; }
.max-w-xl { max-width: 36rem; }
.max-w-2xl { max-width: 42rem; }
.max-w-4xl { max-width: 56rem; }
.max-w-6xl { max-width: 72rem; }

/* Text */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.text-muted { color: var(--color-text-muted); }

/* Background */
.bg-primary { background-color: var(--color-primary); }
.bg-surface { background-color: var(--color-bg-elevated); }
.bg-muted { background-color: var(--color-bg-muted); }

/* Border */
.rounded { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-full { border-radius: var(--radius-full); }
.border { border: var(--border-width) solid var(--color-border); }

/* Shadow */
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }

/* Container */
.container {
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
}

/* Screen reader only */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

### 5. Generate Component CSS

**css/components.css**: Consolidate all component styles from the design system's component library into a single CSS file with organized sections.

### 6. Generate JavaScript Files

**js/main.js**:
```javascript
/**
 * Main JavaScript
 * Initialize all modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    if (typeof initNavigation === 'function') {
        initNavigation();
    }

    // Initialize interactions
    if (typeof initInteractions === 'function') {
        initInteractions();
    }

    console.log('Prototype initialized');
});
```

**js/navigation.js**:
```javascript
/**
 * Navigation Module
 * Handle mobile menu, active states, page transitions
 */

function initNavigation() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Set active nav item based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('[data-nav-link]');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath ||
            currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('is-active');
        }
    });
}
```

**js/interactions.js**:
```javascript
/**
 * Interactions Module
 * Handle UI interactions: modals, tabs, accordions, etc.
 */

function initInteractions() {
    initModals();
    initTabs();
    initAccordions();
    initToasts();
}

// Modal handling
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-open]');
    const modalClosers = document.querySelectorAll('[data-modal-close]');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal-open');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    modalClosers.forEach(closer => {
        closer.addEventListener('click', () => {
            const modal = closer.closest('.modal');
            if (modal) {
                modal.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    });
}

// Tab handling
function initTabs() {
    const tabGroups = document.querySelectorAll('[data-tabs]');

    tabGroups.forEach(group => {
        const tabs = group.querySelectorAll('[data-tab]');
        const panels = group.querySelectorAll('[data-tab-panel]');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('is-active'));
                panels.forEach(p => p.classList.remove('is-active'));

                tab.classList.add('is-active');
                const targetPanel = group.querySelector(`[data-tab-panel="${targetId}"]`);
                if (targetPanel) targetPanel.classList.add('is-active');
            });
        });
    });
}

// Accordion handling
function initAccordions() {
    const accordions = document.querySelectorAll('[data-accordion]');

    accordions.forEach(accordion => {
        const trigger = accordion.querySelector('[data-accordion-trigger]');
        const content = accordion.querySelector('[data-accordion-content]');

        if (trigger && content) {
            trigger.addEventListener('click', () => {
                const isOpen = accordion.classList.toggle('is-open');
                trigger.setAttribute('aria-expanded', isOpen);
            });
        }
    });
}

// Toast notifications
function initToasts() {
    window.showToast = function(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.toast-container') ||
            createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('is-leaving');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}
```

### 7. Generate Page Templates

For each wireframe, create a corresponding page in `pages/`:

**Page template structure**:
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Page Title] - [Feature Name]</title>

    <!-- Design System -->
    <link rel="stylesheet" href="../css/tokens.css">
    <link rel="stylesheet" href="../css/base.css">
    <link rel="stylesheet" href="../css/components.css">
    <link rel="stylesheet" href="../css/utilities.css">
    <link rel="stylesheet" href="../css/pages.css">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=[Fonts]&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header Navigation -->
    <header class="header">
        <nav class="nav container">
            <a href="../index.html" class="nav-logo">[Logo]</a>
            <ul class="nav-menu">
                <li><a href="[page].html" data-nav-link>[Link]</a></li>
            </ul>
            <button class="nav-toggle" data-menu-toggle aria-label="選單">
                <span class="hamburger"></span>
            </button>
        </nav>
    </header>

    <!-- Main Content -->
    <main class="main">
        <!-- Page-specific content based on wireframe -->
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <!-- Footer content -->
        </div>
    </footer>

    <!-- Scripts -->
    <script src="../js/navigation.js"></script>
    <script src="../js/interactions.js"></script>
    <script src="../js/main.js"></script>
</body>
</html>
```

### 8. Generate Index (Entry Point)

Create `index.html` as the prototype entry point:
- Include navigation to all pages
- Show prototype overview
- Quick links to key flows

### 9. Generate Placeholder Assets

**assets/images/**:
- Generate placeholder images using CSS gradients or link to placeholder services
- Include common sizes: avatar, card thumbnail, hero image

**assets/icons/**:
- Include essential SVG icons or use icon font
- Common icons: menu, close, check, arrow, home, user, settings

### 10. Generate README

Create `README.md`:
```markdown
# [Feature Name] - Interactive Prototype

## 概覽

此原型基於以下設計系統產出：
- **設計風格**: Style [XX] - [Name]
- **產出日期**: [Date]

## 頁面列表

| 頁面 | 路徑 | 描述 |
|------|------|------|
| 首頁 | index.html | 原型入口 |
| [Page] | pages/[name].html | [Description] |
| ... | ... | ... |

## 使用方式

1. 在瀏覽器中開啟 `index.html`
2. 使用導航瀏覽各頁面
3. 測試互動元素（按鈕、表單、Modal 等）

## 檔案結構

```
prototype/
├── index.html          # 入口頁面
├── css/                # 樣式檔案
├── js/                 # JavaScript
├── pages/              # 各頁面
└── assets/             # 靜態資源
```

## 支援的互動

- ✅ 響應式設計 (Mobile / Tablet / Desktop)
- ✅ 導航選單（含手機版）
- ✅ Modal 對話框
- ✅ Tabs 切換
- ✅ Accordion 摺疊
- ✅ Toast 通知
- ✅ 表單互動

## 注意事項

- 此為靜態 HTML 原型，不包含後端功能
- 表單提交為模擬，不會實際送出資料
- 建議使用現代瀏覽器查看（Chrome, Firefox, Safari, Edge）
```

### 11. Completion Summary

```
═══════════════════════════════════════════════════════════════
✅ 互動原型產出完成
═══════════════════════════════════════════════════════════════

📁 原型結構：

prototype/
├── index.html              # 入口頁面
├── css/
│   ├── tokens.css          # 設計代幣
│   ├── base.css            # 基礎樣式
│   ├── components.css      # 元件樣式
│   ├── utilities.css       # 工具類別
│   └── pages.css           # 頁面樣式
├── js/
│   ├── main.js             # 主程式
│   ├── navigation.js       # 導航
│   └── interactions.js     # 互動
├── pages/
│   ├── [page-1].html
│   ├── [page-2].html
│   └── ... ([N] 個頁面)
└── assets/
    ├── images/
    └── icons/

📁 檔案位置：FEATURE_DIR/ui/prototype/

🔗 開啟原型：
   file://FEATURE_DIR/ui/prototype/index.html

✨ 功能支援：
   ✓ 響應式設計
   ✓ 頁面導航
   ✓ Modal 對話框
   ✓ Tabs / Accordion
   ✓ 表單互動
   ✓ Toast 通知

═══════════════════════════════════════════════════════════════
```

## Notes

- All pages should be fully navigable
- Include realistic placeholder content
- Ensure all interactive elements work
- Test responsive breakpoints
- Use the ui-prototype-generator agent for HTML generation
