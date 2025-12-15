# 永恆圖書館 - 互動原型文檔

**設計風格**: Style 10 - 高端奢華 (Luxury Premium)
**版本**: 1.0
**整合技術**: Phaser 3.90 + HTML5 + CSS3

## 📋 目錄

- [專案概覽](#專案概覽)
- [檔案結構](#檔案結構)
- [核心功能](#核心功能)
- [技術架構](#技術架構)
- [本地開發](#本地開發)
- [Phaser 整合](#phaser-整合)
- [設計系統](#設計系統)
- [瀏覽器支援](#瀏覽器支援)

## 專案概覽

這是永恆圖書館 MVP 的高保真互動原型，展示完整的使用者體驗流程，包含：

- ✅ 錢包連接介面
- ✅ MGC 餘額管理
- ✅ 每日簽到功能
- ✅ **Phaser 3 抽取動畫**（卡牌飛入、粒子特效、3D 翻轉）
- ✅ **Phaser 3 卡片揭示**（持續光效、環繞粒子）
- ✅ **Phaser 3 慶祝動畫**（煙火、金幣飛散）
- ✅ NFT 收藏展示
- ✅ 響應式設計（桌面/平板/手機）

### 設計風格特徵

| 特徵 | 說明 |
|------|------|
| **色彩** | 金色 (#d4af37) + 銀色 (#c0c0c0) + 純黑背景 (#000000) |
| **字體** | Playfair Display（標題）+ Inter（內文）|
| **風格** | 極簡奢華、細微發光、大量留白、低調精緻 |
| **動畫** | Phaser 3 粒子系統 + CSS Transitions |

## 檔案結構

```
prototype/
├── index.html                     # 原型總覽入口
├── css/
│   ├── tokens.css                 # Design Tokens（色彩、字體、間距）
│   ├── base.css                   # Reset 和基礎樣式
│   ├── components.css             # 可重用元件樣式
│   ├── utilities.css              # 工具類別
│   └── pages.css                  # 頁面特定樣式
├── js/
│   ├── phaser-loader.js           # Phaser 懶載入器
│   └── phaser/
│       ├── event-bridge.js        # React ↔ Phaser 通訊橋接
│       ├── game-config.js         # Phaser 遊戲配置
│       └── scenes/
│           ├── DrawScene.js       # 抽取動畫場景（3-5秒）
│           ├── CardRevealScene.js # 卡片揭示場景（持續）
│           └── CelebrationScene.js # 慶祝場景（2-3秒）
├── pages/
│   ├── login.html                 # 登入頁面
│   ├── home.html                  # 主頁面（整合 Phaser）
│   ├── collection.html            # 收藏頁面
│   └── demo-phaser.html           # Phaser 效果演示
└── README.md                      # 本檔案
```

## 核心功能

### 1. 登入頁面 (`pages/login.html`)

**功能**:
- IOTA Wallet 連接介面
- 模擬錢包連接流程（90% 成功率，演示用）
- 動態生成模擬錢包地址
- 錯誤訊息提示（通用格式）
- 連接成功後跳轉主頁
- 原型模擬模式說明

**User Story 對應**: User Story 1 - 錢包連接與身份驗證

**技術**:
- 純 HTML/CSS/JavaScript（原型階段）
- LocalStorage 儲存錢包地址
- 實際開發將整合 @iota/dapp-kit

### 2. 主頁面 (`pages/home.html`) ⭐

**功能**:
- MGC 餘額顯示（可更新）
- 每日簽到（獲得 5 MGC）
- 問題輸入框
- **抽取解答流程**（整合 Phaser 3）

**Phaser 整合流程**:

```
1. 使用者輸入問題 → 點擊「抽取解答」
2. 扣除 10 MGC
3. 懶載入 Phaser.js（首次使用時）
4. 顯示 Phaser 容器（全螢幕）
5. 執行 DrawScene（3-5 秒）
   ├─ 卡牌飛入動畫
   ├─ 能量粒子聚集
   ├─ 3D 翻轉效果
   └─ 稀有度爆發
6. 切換到 CardRevealScene（持續）
   ├─ 光環動畫
   ├─ 環繞粒子
   └─ 稀有度特殊效果
7. React 覆蓋層顯示答案文字
8. 使用者點擊「鑄造 NFT」
9. 扣除 5 MGC
10. 執行 CelebrationScene（2-3 秒）
    ├─ 煙火效果
    ├─ 金幣飛散
    └─ 成功文字
11. 跳轉到收藏頁
```

### 3. 收藏頁面 (`pages/collection.html`)

**功能**:
- 統計卡片（總數、各稀有度數量）
- NFT 網格（響應式）
- NFT 詳情 Modal

**資料**:
- 使用 `mockNFTs` 陣列模擬 12 個 NFT

### 4. Phaser 演示頁面 (`pages/demo-phaser.html`)

**功能**:
- 獨立測試所有 Phaser 場景
- 按稀有度分別測試 DrawScene 和 CardRevealScene
- 測試 CelebrationScene
- 事件日誌（顯示 React ↔ Phaser 通訊）
- 匯出事件日誌（JSON）

## 技術架構

### Phaser 3 懶載入策略

**首頁 Bundle Size**:
- React + CSS + 主邏輯: ~100KB (gzipped)
- **不含 Phaser**: 首次載入快速

**Phaser 懶載入**:
- 只在使用者點擊「抽取解答」時載入
- Phaser 3.90: ~400KB (gzipped)
- 使用 CDN: `https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js`

**程式碼**:

```javascript
// js/phaser-loader.js
async function loadPhaser() {
    if (phaserLoaded) return true;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js';
        script.onload = () => {
            phaserLoaded = true;
            resolve(true);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
```

### React ↔ Phaser 事件通訊

**事件橋接** (`js/phaser/event-bridge.js`):

```javascript
class EventBridge {
    // React → Phaser
    emit(eventName, data) {
        this.game.events.emit(eventName, data);
    }

    // Phaser → React
    on(eventName, callback) {
        this.listeners[eventName].push(callback);
    }

    // Phaser 觸發 React
    trigger(eventName, data) {
        this.listeners[eventName].forEach(cb => cb(data));
    }
}
```

**事件定義**:

| 事件名稱 | 方向 | 說明 |
|---------|------|------|
| `START_DRAW` | React → Phaser | 開始抽取動畫 |
| `REVEAL_CARD` | React → Phaser | 揭示卡片 |
| `START_CELEBRATION` | React → Phaser | 開始慶祝 |
| `STOP_SCENE` | React → Phaser | 停止場景 |
| `DRAW_COMPLETE` | Phaser → React | 抽取完成 |
| `CARD_REVEALED` | Phaser → React | 卡片揭示完成 |
| `CELEBRATION_DONE` | Phaser → React | 慶祝完成 |

### Phaser 場景設計

#### DrawScene（抽取動畫）

**持續時間**: 3-5 秒
**效果**:

1. **卡牌飛入** (0-1s)
   - 從螢幕外飛入中心
   - Back.easeOut 緩動
   - 落地震動效果

2. **能量粒子聚集** (0-1.5s)
   - 從四周向中心聚集
   - 粒子數量根據稀有度變化
   - 使用 Phaser Particles

3. **3D 翻轉** (1.2-2s)
   - scaleX 動畫模擬翻轉
   - 翻到背面再翻回來

4. **稀有度爆發** (2-3.5s)
   - 光芒擴散（Circle + Tween）
   - 星星粒子爆炸
   - 相機閃白效果

#### CardRevealScene（卡片揭示）

**持續時間**: 直到使用者點擊「鑄造」
**效果**:

1. **光環動畫**
   - 3 層光環循環呼吸
   - 不同稀有度不同顏色

2. **環繞粒子**
   - 持續發射粒子
   - 頻率根據稀有度調整

3. **特殊效果**
   - **傳說級**: 旋轉光線 + 星星環繞
   - **史詩級**: 紫色能量波

#### CelebrationScene（慶祝）

**持續時間**: 2-3 秒
**效果**:

1. **光芒爆發** (0-1s)
   - 中心光芒擴散
   - 相機閃白
   - 震動效果

2. **煙火** (0.3-2.5s)
   - 5 發煙火隨機位置
   - 金色/銀色混合
   - 粒子爆炸 + 重力

3. **金幣飛散** (0.5-2s)
   - 從上方噴灑金幣
   - 旋轉 + 重力效果

4. **成功文字** (0.8-2.3s)
   - 「鑄造成功！」彈出
   - Back.easeOut 動畫

## 本地開發

### 啟動方式

由於原型使用純 HTML/CSS/JavaScript，需要本地伺服器以避免 CORS 問題。

**方法 1: Python HTTP Server**

```bash
# Python 3
cd prototype
python -m http.server 8000

# 瀏覽器訪問
# http://localhost:8000
```

**方法 2: VS Code Live Server**

1. 安裝 Live Server 擴充功能
2. 右鍵點擊 `index.html`
3. 選擇「Open with Live Server」

**方法 3: Node.js http-server**

```bash
npm install -g http-server
cd prototype
http-server -p 8000
```

### 瀏覽流程

1. 開啟 `http://localhost:8000/index.html` - 原型總覽
2. 點擊「登入頁面」→ 模擬錢包連接
3. 點擊「主頁面」→ 測試簽到和抽取流程
4. 點擊「Phaser 效果演示」→ 獨立測試所有場景

### 除錯技巧

**開啟 Chrome DevTools Console**:

```javascript
// 所有 Phaser 事件都會 console.log
// 搜尋關鍵字:
// [DrawScene]
// [CardRevealScene]
// [CelebrationScene]
// [EventBridge]
// [Phaser Loader]
```

**事件日誌**:
- 訪問 `demo-phaser.html`
- 查看「事件日誌」區塊
- 匯出 JSON 檔案分析

## Phaser 整合

### 懶載入實作

**為什麼懶載入？**
- Phaser 3 體積 ~400KB
- 首頁不需要立即載入
- 提升首次載入速度

**何時載入？**
- 使用者點擊「抽取解答」時
- `loadPhaser()` 返回 Promise
- 載入完成後初始化遊戲

### 效能優化

**粒子系統優化**:

```javascript
// 限制粒子數量
emitter.setFrequency(100); // 每秒 10 個粒子
emitter.maxParticles = 50;  // 最多 50 個粒子

// 使用 BlendMode.ADD 提升視覺效果
emitter.setBlendMode(Phaser.BlendModes.ADD);
```

**記憶體管理**:

```javascript
// 場景切換時銷毀粒子
this.time.delayedCall(3000, () => {
    particles.destroy();
});

// 停止場景時清理
shutdown() {
    this.events.off(EVENTS.STOP_SCENE);
}
```

### 除錯模式

**開啟物理除錯**:

```javascript
// game-config.js
physics: {
    default: 'arcade',
    arcade: {
        debug: true  // 顯示碰撞框和速度向量
    }
}
```

**開啟 FPS 顯示**:

在 Chrome DevTools 中按下 `Shift+Ctrl+P`，輸入「FPS」，選擇「Show frames per second (FPS) meter」。

## 設計系統

### Design Tokens

所有設計變數定義在 `css/tokens.css`：

```css
:root {
    /* 色彩 */
    --color-primary: #d4af37;        /* 金色 */
    --color-secondary: #c0c0c0;      /* 銀色 */
    --color-background-main: #000000; /* 黑色背景 */

    /* 字體 */
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;

    /* 間距 */
    --space-4: 1rem;
    --space-8: 2rem;

    /* 陰影 */
    --shadow-glow-gold: 0 0 20px rgba(212, 175, 55, 0.5);
}
```

### 元件庫

**按鈕** (`css/components.css`):

```html
<button class="btn btn-primary">主要按鈕</button>
<button class="btn btn-secondary">次要按鈕</button>
<button class="btn btn-large">大按鈕</button>
<button class="btn btn-loading">載入中</button>
```

**卡片**:

```html
<div class="card">
    <h2 class="card-title">標題</h2>
    <div class="card-body">內容</div>
</div>
```

**徽章**:

```html
<span class="badge badge-common">普通</span>
<span class="badge badge-rare">稀有</span>
<span class="badge badge-epic">史詩</span>
<span class="badge badge-legendary">傳說</span>
```

### 響應式斷點

| 斷點 | 寬度 | 裝置 |
|------|------|------|
| 桌面 | ≥ 1280px | 大螢幕 |
| 平板 | 768px - 1279px | iPad 等 |
| 手機 | < 768px | iPhone 等 |

**使用方式**:

```css
/* 桌面優先 */
.element {
    font-size: var(--text-xl);
}

/* 平板 */
@media (max-width: 768px) {
    .element {
        font-size: var(--text-lg);
    }
}

/* 手機 */
@media (max-width: 480px) {
    .element {
        font-size: var(--text-base);
    }
}
```

## 瀏覽器支援

| 瀏覽器 | 最低版本 | 說明 |
|--------|---------|------|
| Chrome | 90+ | ✅ 完全支援 |
| Safari | 14+ | ✅ 完全支援 |
| Firefox | 88+ | ✅ 完全支援 |
| Edge | 90+ | ✅ 完全支援 |
| Mobile Safari | iOS 14+ | ✅ 完全支援 |
| Chrome Android | 90+ | ✅ 完全支援 |

**必要功能**:
- ✅ ES6+ (async/await, arrow functions)
- ✅ CSS Custom Properties (CSS Variables)
- ✅ CSS Grid
- ✅ Flexbox
- ✅ Canvas API (Phaser 需要)
- ✅ WebGL (Phaser 加速)

## 常見問題

### Q: Phaser 載入失敗怎麼辦？

**A**: 檢查網路連線，確認可以訪問 CDN：
```
https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js
```

**重要**: 本原型已修正載入順序問題：

1. **問題**: 場景 JS 檔案（DrawScene.js 等）需要 `Phaser` 全域物件，但在 CDN 載入前就執行會報錯
2. **解決方案**: 使用動態腳本載入，場景檔案在 Phaser CDN 載入完成後才載入
3. **實作位置**: `pages/home.html` 和 `pages/demo-phaser.html` 中的 `loadSceneScripts()` 函數

**載入流程**:
```javascript
// 1. 載入 Phaser CDN
await loadPhaser();

// 2. 動態載入場景腳本
await loadSceneScripts();

// 3. 建立遊戲實例
const game = new Phaser.Game(config);
```

可以改用本地 Phaser 檔案：

```html
<!-- 下載 phaser.min.js 到 js/ 目錄 -->
<script src="../js/phaser.min.js"></script>
```

### Q: 為什麼 Phaser 場景看不到？

**A**: 可能原因：

1. **容器未顯示**: 檢查 `.phaser-container` 是否有 `hidden` class
2. **Canvas 尺寸問題**: 檢查 `#phaser-game` 的 CSS
3. **場景未啟動**: 在 Console 查看是否有 `[DrawScene]` 日誌

### Q: 如何調整 Phaser 畫布大小？

**A**: 修改 `game-config.js`：

```javascript
{
    width: 800,   // 改為你想要的寬度
    height: 600,  // 改為你想要的高度
    scale: {
        mode: Phaser.Scale.FIT,        // 自動縮放以適應容器
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}
```

### Q: 如何新增自訂粒子圖片？

**A**: 在 `DrawScene.preload()` 中：

```javascript
preload() {
    // 方法 1: 載入外部圖片
    this.load.image('custom-particle', '../assets/particles/custom.png');

    // 方法 2: 使用 Graphics 生成
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('custom-particle', 32, 32);
    graphics.destroy();
}
```

### Q: createEmitter 錯誤怎麼處理？

**A**: Phaser 3.60+ 版本已移除 `createEmitter()` 方法。使用新的 API：

```javascript
// ❌ 舊 API (會報錯)
const particles = this.add.particles('particle');
const emitter = particles.createEmitter({
    x: 100, y: 100,
    speed: 200
});

// ✅ 新 API (正確)
const emitter = this.add.particles(100, 100, 'particle', {
    speed: 200,
    // 其他配置...
});
```

**重要變更**：
- 粒子系統直接在 `add.particles()` 創建時配置發射器
- 不再需要分兩步驟（創建系統 → 創建發射器）
- 位置參數 (x, y) 移到第一和第二個參數
- 材質名稱移到第三個參數
- 配置對象移到第四個參數

## 授權

本原型僅供永恆圖書館專案內部使用。

---

## 變更歷史

### v1.1 (2025-12-16)
- 🐛 修復 Phaser 載入順序問題（場景腳本現在動態載入）
- 🐛 修復 DrawScene 中 `fillStar` API 不存在的問題（改用手動繪製五角星）
- 🐛 修復 Phaser 3.60+ 粒子系統 API 變更（`createEmitter` → `add.particles`）
  - 修復 DrawScene.js 中 2 處粒子發射器創建
  - 修復 CardRevealScene.js 中 2 處粒子發射器創建
  - 修復 CelebrationScene.js 中 2 處粒子發射器創建
  - 修復 DrawScene.js 中變數引用錯誤（`particles.destroy()` → `emitter.destroy()`）
- ✨ 更新錢包連接介面以符合 User Story 1 規格
  - 移除 Aptos 錢包（Petra、Martian、Pontem）
  - 改用 IOTA Wallet（符合 spec.md 技術決策）
  - 新增原型模擬模式提示
  - 動態生成模擬錢包地址
  - 錯誤訊息改為通用格式（符合 AC 5）
- 📝 更新文檔，新增載入流程說明

### v1.0 (2025-12-16)
- 🎉 初版發布
- ✅ 完整 Phaser 3 整合
- ✅ 三個遊戲場景（DrawScene、CardRevealScene、CelebrationScene）
- ✅ React ↔ Phaser 事件橋接

---

**版本**: 1.1
**最後更新**: 2025-12-16
**維護者**: UI 設計團隊
