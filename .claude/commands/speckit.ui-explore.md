---
description: Generate 10 UI style options (HTML moodboards) based on feature spec for style exploration and selection.
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

### 2. Analyze Spec for Style Direction

Read `spec.md` and extract:

- **Product Name**: 產品名稱
- **Target Users**: 目標用戶群體
- **Product Positioning**: 產品定位（娛樂、工具、社交等）
- **Key Features**: 核心功能
- **Emotional Goals**: 希望傳達的情感（信任、趣味、專業等）

Based on analysis, determine:
- Primary tone recommendations (2-3 main directions)
- Secondary tone variations
- Color mood suggestions

### 3. Generate 10 Style Options

Create 10 distinct UI styles, each with different combinations of:

**Tone Categories** (select appropriate mix based on spec):
1. 現代簡約 (Modern Minimal)
2. Web3 科技 (Web3/Crypto)
3. 活潑趣味 (Playful)
4. 企業專業 (Corporate)
5. 遊戲化 (Gamified)
6. 高端奢華 (Luxurious)
7. 自然有機 (Organic)
8. 復古懷舊 (Retro)
9. 粗獷主義 (Brutalist)
10. 柔和新擬物 (Soft UI/Neumorphism)

**For each style, vary**:
- Color scheme (light/dark, warm/cool, monochrome/colorful)
- Typography pairing (serif/sans-serif, classic/modern)
- Component style (rounded/sharp, flat/elevated, minimal/detailed)
- Visual density (spacious/compact)

### 4. Create Output Directory Structure

```
FEATURE_DIR/ui/explore/
├── index.html                      # Style gallery overview
├── style-01-[tone-name]/
│   ├── moodboard.html              # Full moodboard preview
│   └── tokens.css                  # Extractable design tokens
├── style-02-[tone-name]/
│   ├── moodboard.html
│   └── tokens.css
└── ... (10 styles total)
```

### 5. Generate Style Gallery (index.html)

Create `FEATURE_DIR/ui/explore/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Feature Name] - UI 風格探索</title>
    <style>
        /* Gallery styles */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            padding: 2rem;
        }
        h1 { text-align: center; margin-bottom: 0.5rem; }
        .subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        .style-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .style-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .style-preview {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            /* Each card has inline style with the style's colors */
        }
        .style-info { padding: 1rem; }
        .style-name { font-weight: 600; margin-bottom: 0.25rem; }
        .style-tone { font-size: 0.875rem; color: #666; margin-bottom: 0.5rem; }
        .style-colors { display: flex; gap: 0.25rem; }
        .color-dot { width: 20px; height: 20px; border-radius: 50%; }
        .view-btn {
            display: block;
            text-align: center;
            padding: 0.75rem;
            background: #000;
            color: white;
            text-decoration: none;
            font-weight: 500;
        }
        .view-btn:hover { background: #333; }
    </style>
</head>
<body>
    <h1>[Feature Name] - UI 風格探索</h1>
    <p class="subtitle">選擇一個風格作為設計基礎</p>

    <div class="gallery">
        <!-- Style cards generated here -->
        <div class="style-card">
            <div class="style-preview" style="background: [primary-color];">
                <!-- Mini preview of the style -->
            </div>
            <div class="style-info">
                <div class="style-name">Style 01: [Name]</div>
                <div class="style-tone">[調性標籤]</div>
                <div class="style-colors">
                    <div class="color-dot" style="background: [primary]"></div>
                    <div class="color-dot" style="background: [secondary]"></div>
                    <div class="color-dot" style="background: [accent]"></div>
                </div>
            </div>
            <a href="style-01-[name]/moodboard.html" class="view-btn">查看完整風格</a>
        </div>
        <!-- Repeat for all 10 styles -->
    </div>
</body>
</html>
```

### 6. Generate Each Moodboard

For each of the 10 styles, create `moodboard.html` containing:

**Header Section**:
- Style name and number
- Tone/mood tags
- Brief description of the style direction

**Color Palette Section**:
- Primary color with hex code
- Secondary color with hex code
- Accent color with hex code
- Background colors (main, surface, elevated)
- Text colors (primary, secondary, muted)
- Semantic colors (success, warning, error)

**Typography Section**:
- Heading font sample (H1-H4)
- Body text sample
- Font pairing rationale
- Use Google Fonts for web-safe options

**Component Samples**:
- Buttons (primary, secondary, ghost, disabled)
- Input fields (default, focus, error states)
- Cards (basic, with image)
- Badges/tags
- Navigation sample

**Layout Preview**:
- Mini mockup showing the style applied to a typical page layout

### 7. Generate Design Tokens (tokens.css)

For each style, extract tokens to `tokens.css`:

```css
:root {
    /* Colors */
    --color-primary: #...;
    --color-primary-hover: #...;
    --color-secondary: #...;
    --color-accent: #...;
    --color-background: #...;
    --color-surface: #...;
    --color-text: #...;
    --color-text-muted: #...;
    --color-border: #...;
    --color-success: #...;
    --color-warning: #...;
    --color-error: #...;

    /* Typography */
    --font-heading: '...', sans-serif;
    --font-body: '...', sans-serif;
    --font-mono: '...', monospace;

    /* Font Sizes */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;

    /* Border Radius */
    --radius-sm: ...;
    --radius-md: ...;
    --radius-lg: ...;
    --radius-xl: ...;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: ...;
    --shadow-md: ...;
    --shadow-lg: ...;
    --shadow-xl: ...;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;
    --transition-slow: 500ms ease;
}
```

### 8. Completion Summary

After generating all files, display:

```
═══════════════════════════════════════════════════════════════
✅ UI 風格探索完成
═══════════════════════════════════════════════════════════════

已產出 10 個 UI 風格選項：

| # | 風格名稱 | 調性 | 主色 |
|---|----------|------|------|
| 1 | [Name] | [Tone] | [Color] |
| 2 | [Name] | [Tone] | [Color] |
| ... | ... | ... | ... |

📁 檔案位置：FEATURE_DIR/ui/explore/

🔗 開啟風格總覽：
   file://FEATURE_DIR/ui/explore/index.html

📌 下一步：
   1. 在瀏覽器中開啟 index.html 預覽所有風格
   2. 選擇喜歡的風格編號
   3. 執行 /speckit.ui-design --style=[number] 產出完整設計系統

═══════════════════════════════════════════════════════════════
```

## Style Generation Guidelines

**Ensure diversity across the 10 styles**:
- At least 2 light themes and 2 dark themes
- Mix of warm and cool color palettes
- Variety in border-radius (from sharp to very rounded)
- Different shadow styles (flat, subtle, dramatic)
- Mix of serif and sans-serif typography

**Based on spec analysis, weight the styles**:
- If target users are young → more playful/gamified options
- If product is finance/Web3 → more professional/crypto options
- If product is creative → more organic/brutalist options
- Always include 2-3 "safe" options (modern minimal, corporate)

## Notes

- All HTML files should be self-contained and viewable in any browser
- Use Google Fonts CDN for typography
- Ensure color contrast meets WCAG AA standards
- Include both Chinese and English text samples
- Use the ui-prototype-generator agent for generating the actual HTML content
