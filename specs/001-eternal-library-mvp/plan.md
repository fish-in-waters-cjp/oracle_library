# 實作計畫：永恆圖書館 MVP

**分支**：`001-eternal-library-mvp` | **日期**：2025-12-15 | **規格**：[spec.md](./spec.md)
**輸入**：功能規格書 `/specs/001-eternal-library-mvp/spec.md`

## 摘要

永恆圖書館是一個基於 IOTA Testnet 的 Web3 問答遊戲。使用者透過每日簽到獲得 MGC（智慧碎片），用於抽取解答之書，並可將答案鑄造成 NFT 永久保存。

**核心功能**：
1. 錢包連接（IOTA Wallet）
2. 每日簽到（首次 100 MGC，後續 20 MGC）
3. 抽取解答（消耗 10 MGC）
4. NFT 鑄造（消耗 5 MGC + Gas）
5. 收藏展示

**技術方案**：
- 前端：Next.js 16 + React 19 + @iota/dapp-kit
- 遊戲引擎：Phaser 3（抽卡動畫、慶祝特效）
- 動畫：Framer Motion（UI 動畫）
- 合約：IOTA Move（多模組設計）
- 儲存：鏈上狀態 + IPFS（NFT 資源）

## 技術上下文

**語言/版本**：TypeScript 5.x（前端）、Move（合約）
**主要依賴**：
- @iota/dapp-kit ^0.8.0
- @iota/iota-sdk ^1.9.0
- @tanstack/react-query ^5.90.12
- next 16.0.7
- react 19.2.0
- tailwindcss ^4
- phaser ^3.90.0（遊戲引擎，懶載入）
- framer-motion ^11.x（UI 動畫）

**儲存**：IOTA 鏈上狀態 + IPFS（圖片/metadata）
**測試**：
- Move：`iota move test`
- 前端：Vitest + React Testing Library
**目標平台**：Web（桌面/平板/手機瀏覽器）
**專案類型**：Web 應用（前端 + 智能合約，無後端）
**效能目標**：
- 首頁載入 < 3 秒
- 交易確認 < 5 秒
- 動畫流暢（60 fps）
**限制**：
- 首頁 Bundle Size < 500KB gzipped（不含 Phaser）
- 完整 Bundle Size < 800KB gzipped（含 Phaser 懶載入）
- IPFS 圖片載入 < 3 秒（有骨架屏）
**規模**：MVP 階段，5 個 User Story，50 個答案

## 憲章檢查

*關卡：Phase 0 研究前必須通過。Phase 1 設計後重新檢查。*

### I. 程式碼品質 ✓

| 原則 | 合規方式 |
|------|----------|
| 可讀性優先 | 有意義的命名、自說明程式碼 |
| SOLID 原則 | Hooks 分離關注點、單一職責 |
| 型別安全 | TypeScript strict mode、Move 型別系統 |
| 錯誤處理 | 自定義 OracleError、使用者友善訊息 |

### II. 測試紀律 ✓

| 測試類型 | 覆蓋範圍 |
|----------|----------|
| 單元測試 | Move 合約邏輯、工具函數 |
| 整合測試 | 交易流程、Hooks 互動 |
| 合約測試 | Move entry functions |

### III. 使用者體驗一致性 ✓

| UX 原則 | 實作方式 |
|---------|----------|
| 回饋 | Toast 通知、動畫效果 |
| 錯誤訊息 | 中文、可操作、非技術性 |
| 載入狀態 | 骨架屏、按鈕載入狀態 |
| 響應式 | Tailwind CSS 響應式設計 |

### IV. 效能標準 ✓

| 指標 | 目標 |
|------|------|
| 回應時間 | < 100ms（UI 操作）|
| 頁面載入 | < 3 秒 |
| 首頁 Bundle | < 500KB gzipped |
| 完整 Bundle | < 800KB gzipped（含 Phaser）|

### V. 文件語言 ✓

所有文件使用繁體中文（zh-TW）。

## 畫面技術分級

### 分級原則

| 等級 | 技術 | 適用場景 | 載入策略 |
|------|------|----------|----------|
| **S 級** | Phaser 3 | 核心遊戲體驗、粒子/物理效果 | 懶載入 |
| **A 級** | React + Framer Motion | 中等動畫、轉場效果 | 即時載入 |
| **B 級** | React + CSS/Tailwind | 靜態 UI、表單、列表 | 即時載入 |

### 完整畫面分級表

#### 登入頁（B/A 級）

| 元件 | 等級 | 技術 | 說明 |
|------|------|------|------|
| 圖書館入口視覺 | A | Framer Motion | 漸入動畫 |
| 連接錢包按鈕 | B | React | 基礎按鈕 |
| 連接成功轉場 | A | Framer Motion | 頁面轉場 |

#### 主頁面（混合）

| 元件 | 等級 | 技術 | 說明 |
|------|------|------|------|
| 導航列 | B | React + Tailwind | 純 UI |
| MGC 餘額顯示 | A | Framer Motion | 數字跳動動畫 |
| +100/+20/-10 MGC 動畫 | A | Framer Motion | 獲得/消耗動畫 |
| 簽到訪客簿 | A | Framer Motion | 書本翻頁效果 |
| 簽名動畫 | A | Framer Motion | 手寫效果 |
| 倒計時 | B | React | 純文字 |
| 連續天數徽章 | B | React + CSS | 靜態徽章 |
| 問題輸入框 | B | React | 表單元件 |
| 抽取按鈕 | A | Framer Motion | hover 效果 |
| **抽取動畫場景** | **S** | **Phaser 3** | **卡牌飛入、能量粒子、3D 翻轉、稀有度爆發** |
| **答案卡片展示** | **S** | **Phaser 3** | **持續光效/粒子環繞** |
| 答案文字覆蓋層 | B | React | 疊在 Phaser 上方 |
| 稀有度標籤 | B | React | 靜態標籤 |
| 鑄造 NFT 按鈕 | A | Framer Motion | hover/loading 效果 |
| **鑄造成功慶祝** | **S** | **Phaser 3** | **煙火、金幣飛散** |

#### 收藏頁（B/A 級）

| 元件 | 等級 | 技術 | 說明 |
|------|------|------|------|
| 統計卡片 | A | Framer Motion | 數字動畫 |
| NFT 網格 | B | React Grid | 響應式列表 |
| NFT 卡片 hover | A | Framer Motion | scale 效果 |
| 骨架屏 | B | CSS | pulse 動畫 |
| NFT 詳情彈窗 | A | Framer Motion | 開啟/關閉動畫 |
| 稀有度光效 | A | CSS | glow + animation |

#### 全域元件

| 元件 | 等級 | 技術 | 說明 |
|------|------|------|------|
| Toast 通知 | A | Framer Motion | 滑入/滑出 |
| 載入 Spinner | B | CSS | animation |
| 確認對話框 | A | Framer Motion | 彈出動畫 |

### Phaser 使用範圍（僅 3 個場景）

| 場景 | 持續時間 | 效果需求 |
|------|----------|----------|
| **DrawScene** | 3-5 秒 | 卡牌飛入、能量粒子聚集、3D 翻轉、稀有度爆發 |
| **CardRevealScene** | 持續 | 稀有度對應的持續光效/粒子環繞 |
| **CelebrationScene** | 2-3 秒 | 煙火、金幣飛散、光芒爆發 |

### React ↔ Phaser 通訊

```typescript
// React → Phaser 事件
START_DRAW        // 開始抽取動畫
REVEAL_CARD       // 揭示卡片（帶入稀有度）
START_CELEBRATION // 開始慶祝
STOP_SCENE        // 停止場景

// Phaser → React 事件
DRAW_COMPLETE     // 抽取動畫完成
CARD_REVEALED     // 卡片揭示完成
CELEBRATION_DONE  // 慶祝完成
```

### Bundle Size 預估

| 套件 | 大小 (gzipped) | 載入時機 |
|------|----------------|----------|
| Next.js + React | ~100KB | 首頁 |
| @iota/dapp-kit | ~150KB | 首頁 |
| Framer Motion | ~50KB | 首頁 |
| Tailwind CSS | ~30KB | 首頁 |
| **首頁總計** | **~330KB** | 即時 |
| Phaser 3 | ~400KB | 懶載入（進入抽取時）|
| **完整總計** | **~730KB** | 按需載入 |

## 專案結構

### 文件結構（本功能）

```text
specs/001-eternal-library-mvp/
├── plan.md              # 本檔案
├── research.md          # Phase 0 輸出
├── data-model.md        # Phase 1 輸出
├── quickstart.md        # Phase 1 輸出
├── contracts/           # Phase 1 輸出
│   ├── move-api.md      # Move 合約 API 規格
│   └── frontend-api.md  # 前端 API 規格
├── checklists/
│   └── requirements.md  # 需求檢查表
└── tasks.md             # Phase 2 輸出（/speckit.tasks 產生）
```

### 原始碼結構（根目錄）

```text
oracle_library/
├── frontend/                     # Next.js 前端
│   ├── app/                      # App Router 頁面
│   │   ├── layout.tsx           # 根佈局（Providers）
│   │   ├── page.tsx             # 首頁（登入前）
│   │   └── (app)/               # 登入後路由群組
│   │       ├── layout.tsx       # 應用佈局（導航）
│   │       ├── page.tsx         # 主頁（簽到/抽取）
│   │       └── collection/
│   │           └── page.tsx     # 收藏頁
│   ├── components/               # React 元件
│   │   ├── ui/                  # B 級：基礎 UI 元件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── skeleton.tsx
│   │   ├── animated/            # A 級：Framer Motion 元件
│   │   │   ├── balance-display.tsx    # 餘額跳動
│   │   │   ├── check-in-book.tsx      # 簽到書本
│   │   │   ├── page-transition.tsx    # 頁面轉場
│   │   │   └── toast.tsx              # 通知
│   │   ├── phaser/              # S 級：Phaser 遊戲場景
│   │   │   ├── PhaserContainer.tsx    # Phaser 容器（懶載入）
│   │   │   ├── PhaserGame.tsx         # Phaser 遊戲實例
│   │   │   ├── EventBridge.ts         # React ↔ Phaser 通訊
│   │   │   └── scenes/                # 遊戲場景
│   │   │       ├── DrawScene.ts       # 抽取動畫場景
│   │   │       ├── CardRevealScene.ts # 卡片揭示場景
│   │   │       └── CelebrationScene.ts # 慶祝場景
│   │   ├── providers.tsx        # IOTA Provider 設定
│   │   ├── connect-wallet.tsx   # 連接錢包元件
│   │   ├── check-in-card.tsx    # 簽到卡片
│   │   ├── draw-section.tsx     # 抽取區塊（整合 Phaser）
│   │   ├── draw-result.tsx      # 抽取結果覆蓋層
│   │   ├── nft-grid.tsx         # NFT 網格
│   │   └── nft-detail-modal.tsx # NFT 詳情彈窗
│   ├── hooks/                    # 自定義 Hooks
│   │   ├── use-wallet-connection.ts
│   │   ├── use-mgc-balance.ts
│   │   ├── use-check-in.ts
│   │   ├── use-oracle-draw.ts
│   │   ├── use-mint-nft.ts
│   │   ├── use-oracle-nfts.ts
│   │   └── use-answers.ts
│   ├── lib/                      # 工具函數
│   │   ├── utils.ts
│   │   ├── time.ts              # 時間計算
│   │   ├── random.ts            # 隨機函數
│   │   └── ipfs.ts              # IPFS 工具
│   ├── public/
│   │   ├── data/
│   │   │   └── answers.json     # 答案資料
│   │   └── game/                # Phaser 遊戲資源
│   │       ├── particles/       # 粒子特效圖
│   │       ├── cards/           # 卡牌圖片
│   │       └── effects/         # 特效素材
│   ├── consts.ts                # 常數定義
│   ├── .env.local               # 環境變數
│   └── package.json
├── contracts/                    # Move 合約
│   ├── sources/
│   │   ├── mgc.move             # MGC Token
│   │   ├── check_in.move        # 每日簽到
│   │   ├── oracle_draw.move     # 抽取解答
│   │   └── oracle_nft.move      # NFT 鑄造
│   ├── tests/
│   │   ├── mgc_tests.move
│   │   ├── check_in_tests.move
│   │   ├── oracle_draw_tests.move
│   │   └── oracle_nft_tests.move
│   └── Move.toml
└── specs/                        # 規格文件
```

**結構決策**：
- 採用 Monorepo 結構，前端與合約在同一儲存庫
- 前端使用 Next.js App Router，合約使用 Move 多模組設計
- 元件按技術分級組織：`ui/`（B 級）、`animated/`（A 級）、`phaser/`（S 級）
- Phaser 資源放在 `public/game/`，支援靜態載入

## 複雜度追蹤

> 無違規需要說明

本專案遵循憲章所有原則，無需額外複雜度說明。

## 相關文件

- [research.md](./research.md) - 技術研究報告
- [data-model.md](./data-model.md) - 資料模型定義
- [quickstart.md](./quickstart.md) - 快速入門指南
- [contracts/move-api.md](./contracts/move-api.md) - Move 合約 API
- [contracts/frontend-api.md](./contracts/frontend-api.md) - 前端 API

## 下一步

執行 `/speckit.tasks` 產生具體實作任務清單。
