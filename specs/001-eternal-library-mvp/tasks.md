# Tasks: 永恆圖書館 MVP

**Input**: Design documents from `/specs/001-eternal-library-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: 依據 CLAUDE.md 要求,本專案採用 TDD（測試驅動開發）。

**Organization**: 任務按 User Story 分組,支援 2 人平行開發。

---

## 📊 任務總覽（2-Person Parallel Development）

### 整體進度

| Phase | 狀態 | 任務數 | 說明 |
|-------|------|--------|------|
| Phase 1: Setup | ✅ 已完成 | 6/6 | 專案初始化 |
| Phase 2: Foundational | ✅ 已完成 | 11/22 | 基礎架構（部分完成） |
| **🔧 Phase 0** | ⏳ **待完成** | **0/13** | **共同前置作業（必須先完成）** |
| 🅰️ Developer A | ⏸️ 待開始 | 0/30 | US1 + US2 + US4 (部分) |
| 🅱️ Developer B | ⏸️ 待開始 | 0/30 | US3 + US5 + US4 (部分) |
| Phase 8: Polish | ⏸️ 待開始 | 0/9 | 最終優化與測試 |

### Developer A 路線任務分布

| User Story | 任務範圍 | 任務數 | 預估時數 |
|-----------|---------|--------|---------|
| US1 錢包連接 | T029-T036 | 8 | ~6 小時 |
| US2 每日簽到 | T037-T051 | 15 | ~12 小時 |
| US4 NFT 鑄造 (部分) | T068-T071, T073-T076 | 7 | ~6 小時 |
| Phase 8 (部分) | T090-T092, T094, T097-T098 | 6 | ~4 小時 |
| **總計** | | **~36** | **~28 小時** |

### Developer B 路線任務分布

| User Story | 任務範圍 | 任務數 | 預估時數 |
|-----------|---------|--------|---------|
| US3 抽取解答 | T052-T067 | 16 | ~14 小時 |
| US5 查看收藏 | T077-T089 | 13 | ~10 小時 |
| US4 慶祝場景 | T072 | 1 | ~2 小時 |
| Phase 8 (部分) | T093, T095-T096 | 3 | ~3 小時 |
| **總計** | | **~33** | **~29 小時** |

### 關鍵路徑

```
Phase 0 (13 任務, ~8 小時) ← 🚨 必須先完成
    ↓
┌─────────────────┴─────────────────┐
│                                   │
🅰️ Developer A        🅱️ Developer B
(~28 小時)             (~29 小時)
│                                   │
└─────────────────┬─────────────────┘
                  ↓
          Phase 8 整合測試
```

---

## Format: `[ID] [P?] [DevA/DevB] [Story] Description`

- **[P]**: TDD 測試任務
- **[DevA]**: Developer A 負責
- **[DevB]**: Developer B 負責
- **[Story]**: 對應的 User Story（US1, US2, US3...）
- 每個任務包含確切的檔案路徑與 Prototype 參考

## Path Conventions

```text
oracle_library/
├── frontend/                 # Next.js 前端
│   ├── app/                  # App Router 頁面
│   ├── components/           # React 元件
│   │   ├── ui/              # B 級：基礎 UI (React + CSS)
│   │   ├── animated/        # A 級：動畫元件 (Framer Motion)
│   │   └── phaser/          # S 級：遊戲場景 (Phaser 3)
│   ├── hooks/                # 自定義 Hooks
│   ├── lib/                  # 工具函數
│   └── public/
│       ├── data/            # 靜態資料
│       └── game/            # Phaser 遊戲資源
├── contracts/                # Move 合約
│   ├── sources/              # 合約原始碼
│   └── tests/                # 合約測試
└── specs/                    # 規格文件
```

## 技術分級

| 等級 | 技術 | 載入策略 | 說明 |
|------|------|----------|------|
| **S 級** | Phaser 3 | 懶載入 | 抽卡動畫、慶祝特效 |
| **A 級** | Framer Motion | 即時載入 | UI 動畫、轉場 |
| **B 級** | React + CSS | 即時載入 | 表單、列表、靜態 UI |

---

## Phase 1: Setup（專案初始化）

**Purpose**: 建立專案基礎結構與開發環境

- [x] T001 建立 Move 合約專案結構 `contracts/Move.toml`
- [x] T002 建立 Next.js 前端專案結構 `frontend/package.json`
- [x] T003 [P] 設定 TypeScript 配置 `frontend/tsconfig.json`
- [x] T004 [P] 設定 Tailwind CSS 4 `frontend/app/globals.css`
- [x] T005 [P] 設定 ESLint 與 Prettier `frontend/eslint.config.mjs`
- [x] T006 設定環境變數範本 `frontend/.env.example`

---

## Phase 2: Foundational（基礎架構）

**Purpose**: 所有 User Story 共用的基礎設施

**⚠️ CRITICAL**: 必須完成此階段才能開始任何 User Story

### Move 合約基礎

- [x] T007 [P] 撰寫 MGC Token 測試 `contracts/tests/mgc_tests.move`
- [x] T008 實作 MGC Token 模組 `contracts/sources/mgc.move`

### 前端基礎

- [x] T009 [P] 建立 IOTA Provider 設定 `frontend/components/providers.tsx`
- [x] T010 [P] 建立常數定義 `frontend/consts.ts`
- [x] T011 [P] 建立錯誤處理類別 `frontend/lib/errors.ts`
- [x] T012 [P] 建立工具函數 `frontend/lib/utils.ts`
- [x] T013 [P] 建立時間計算函數 `frontend/lib/time.ts`
- [x] T014 [P] 建立 IPFS 工具函數 `frontend/lib/ipfs.ts`
- [x] T015 建立根佈局 `frontend/app/layout.tsx`

---

## 🔧 Phase 0: 共同前置作業（兩人分工完成後才能平行開發）

**Purpose**: 建立所有共用元件、資料與基礎設施,避免後續衝突

**⚠️ 必須完成**: 完成此階段後 Developer A 和 Developer B 才能完全獨立平行開發

### B 級：基礎 UI 元件（可平行完成）

- [x] T016 [P] [Phase0] 建立 Button 元件 `frontend/components/ui/button.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/*.html` (所有頁面都會用到)
  - **功能**: 支援 variant (primary, secondary, outline), loading 狀態, disabled 狀態

- [x] T017 [P] [Phase0] 建立 Input 元件 `frontend/components/ui/input.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/home.html` (問題輸入框)
  - **功能**: 支援 placeholder, error 狀態, disabled 狀態

- [x] T018 [P] [Phase0] 建立 Modal 元件 `frontend/components/ui/modal.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/collection.html` (NFT 詳情)
  - **功能**: 支援 title, close 按鈕, overlay 點擊關閉

- [x] T019 [P] [Phase0] 建立 Skeleton 元件 `frontend/components/ui/skeleton.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/collection.html` (載入骨架)
  - **功能**: 支援不同尺寸 (circle, rectangle), 動畫效果

- [x] T020 [P] [Phase0] 建立 Card 元件 `frontend/components/ui/card.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/collection.html` (NFT 卡片)
  - **功能**: 支援 header, body, footer, hover 效果

### 補充任務：基礎 UI 元件（後續發現需要）

- [x] Phase0-Badge [P] [Phase0] 建立 Badge 元件 `frontend/components/ui/badge.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/design/style-10-luxury-premium/components/data-display.html`
  - **功能**: 支援 4 種稀有度 (legendary, epic, rare, common), Style 10 設計
  - **測試**: 8/8 通過, 100% 覆蓋率
  - **學習報告**: `specs/001-eternal-library-mvp/learning/developer-b/badge-component-learning-report.md`
  - **用途**: US3 DrawResultOverlay, US5 NFTCard 稀有度標籤

- [x] Phase0-FadeIn [P] [Phase0] 建立 FadeIn 動畫元件 `frontend/components/animation/fade-in.tsx`
  - **功能**: 支援 5 個方向淡入 (up, down, left, right, none), 可配置延遲與持續時間
  - **測試**: 8/8 通過, 100% 覆蓋率
  - **學習報告**: `specs/001-eternal-library-mvp/learning/developer-b/fadein-component-learning-report.md`
  - **用途**: US3 DrawResultOverlay, US5 NFTDetailModal 入場動畫

- [x] Phase0-ScaleSpring [P] [Phase0] 建立 ScaleSpring 動畫元件 `frontend/components/animation/scale-spring.tsx`
  - **功能**: Spring physics 彈性縮放, hover 互動, 組合動畫 (withFadeIn, withSlideUp)
  - **測試**: 9/9 通過, 100% 覆蓋率
  - **學習報告**: `specs/001-eternal-library-mvp/learning/developer-b/scalespring-component-learning-report.md`
  - **用途**: US5 NFTCard hover 效果, 按鈕互動增強

- [x] Phase0-CountUp [P] [Phase0] 建立 CountUp 動畫元件 `frontend/components/animation/count-up.tsx`
  - **功能**: 數字計數動畫, 支援貨幣格式化、千分位、前後綴, 3 種緩動函數
  - **測試**: 9/9 通過, 100% 覆蓋率
  - **學習報告**: `specs/001-eternal-library-mvp/learning/developer-b/countup-component-learning-report.md`
  - **用途**: US2 BalanceDisplay, US5 CollectionStats 統計數據

### A 級：Framer Motion 基礎（可平行完成）

- [x] T021 [P] [Phase0] 建立 Toast 通知元件 `frontend/components/animated/toast.tsx`
  - **Prototype**: 參考 prototype 中的錯誤訊息樣式
  - **功能**: 支援 success/error/info, 自動消失, 堆疊顯示

- [x] T022 [P] [Phase0] 建立頁面轉場元件 `frontend/components/animated/page-transition.tsx`
  - **Prototype**: 頁面切換動畫效果
  - **功能**: 淡入淡出, 滑動效果

### S 級：Phaser 基礎設施（必須按順序）

- [x] T023 [Phase0] 建立 EventBridge 通訊模組 `frontend/components/phaser/EventBridge.ts`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/js/phaser/event-bridge.js`
  - **功能**: React ↔ Phaser 雙向通訊橋接
  - **關鍵**: 此模組是 Developer B 所有 Phaser 場景的依賴

- [x] T024 [P] [Phase0] 建立 PhaserGame 遊戲實例 `frontend/components/phaser/PhaserGame.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/js/phaser/game-config.js`
  - **依賴**: T023 EventBridge
  - **功能**: Phaser 3 遊戲實例管理,場景切換

- [x] T025 [Phase0] 建立 PhaserContainer 懶載入容器 `frontend/components/phaser/PhaserContainer.tsx`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/js/phaser-loader.js`
  - **依賴**: T024 PhaserGame
  - **功能**: Phaser 懶載入封裝,減少首頁 bundle size

### 靜態資料與遊戲資源

- [x] T026 [Phase0] 建立 50 個答案資料 `frontend/public/data/answers.json`
  - **Prototype**: 參考 prototype 中的答案展示效果
  - **內容**: 50 個中英文解答語錄 + 稀有度配置
  - **稀有度分布**: Common 70%, Rare 20%, Epic 8%, Legendary 2%
  - **工具**: 使用 Claude 或 nano banana 生成
  - **關鍵**: Developer B 的 DrawScene 需要此資料

- [x] T027 [P] [Phase0] 準備粒子特效素材 `frontend/public/game/particles/`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/demo-phaser.html`
  - **內容**: 金幣、星星、光芒、煙火等粒子圖片
  - **格式**: PNG, 透明背景, 適合 Phaser Particle System

- [x] T028 [P] [Phase0] 準備卡牌圖片素材 `frontend/public/game/cards/`
  - **Prototype**: `specs/001-eternal-library-mvp/ui/prototype/pages/demo-phaser.html`
  - **內容**: 卡牌背面、卡牌框架、稀有度特效
  - **格式**: PNG, 高解析度 (適合 3D 翻轉效果)

**Checkpoint**: Phase 0 完成 — Developer A 和 Developer B 可以完全平行開發

---

## 🅰️ Developer A 路線（錢包 + 簽到 + NFT）

**負責範圍**: US1 錢包連接 + US2 每日簽到 + US4 NFT 鑄造 + 遊戲資源準備

**可開始時機**: Phase 0 完成後

**預估任務數**: 31 任務

**技術重點**: IOTA 錢包整合、Move 合約開發 (check_in, oracle_nft)、區塊鏈狀態管理

---

## 🅱️ Developer B 路線（遊戲 + 抽卡 + 收藏）

**負責範圍**: US3 抽取解答 + US5 查看收藏 + US4 慶祝動畫

**可開始時機**: Phase 0 完成後

**預估任務數**: 32 任務

**技術重點**: Phaser 3 遊戲開發、Move 合約開發 (oracle_draw)、遊戲動畫與特效

---

**⚠️ 重要提醒**: Phase 0 完成前,Developer A 和 Developer B 都無法開始各自的路線!

---

## Phase 3: User Story 1 - 錢包連接與身份驗證 (Priority: P1) 🎯 MVP

**🅰️ Developer A 負責**

**Goal**: 使用者能夠連接 IOTA 錢包，建立身份並開始旅程

**Independent Test**: 成功連接錢包並在介面上顯示錢包地址

**技術等級**：B/A 級（React + Framer Motion）

**Prototype 參考**: `specs/001-eternal-library-mvp/ui/prototype/pages/login.html`

### Tests for User Story 1

> **NOTE: 先寫測試,確保測試失敗後再實作**

- [x] T029 [P] [DevA] [US1] 撰寫 useWalletConnection Hook 測試 `frontend/__tests__/hooks/use-wallet-connection.test.ts`
- [x] T030 [P] [DevA] [US1] 撰寫 ConnectWallet 元件測試 `frontend/__tests__/components/connect-wallet.test.tsx`

### Implementation for User Story 1

- [x] T031 [DevA] [US1] 實作 useWalletConnection Hook `frontend/hooks/use-wallet-connection.ts`
  - **Prototype**: `login.html` 中的錢包連接按鈕互動
- [x] T032 [DevA] [US1] 實作 ConnectWallet 元件（B 級）`frontend/components/connect-wallet.tsx`
  - **Prototype**: `login.html` 中的 Connect Wallet 按鈕
  - **相依**: Phase 0 的 Button 元件 (T016)
- [x] T033 [DevA] [US1] 實作登入頁面（含入口視覺 A 級）`frontend/app/page.tsx`
  - **Prototype**: `login.html` 完整頁面設計
  - **相依**: Phase 0 的 FadeIn 動畫 (T027)
- [x] T034 [DevA] [US1] 實作應用佈局（含導航列 B 級）`frontend/app/(app)/layout.tsx`
  - **Prototype**: `home.html` 頂部導航列
  - **相依**: Phase 0 的 Card、Badge 元件 (T017, T021)
- [x] T035 [DevA] [US1] 實作連接成功轉場動畫（A 級）
  - **Prototype**: `login.html` → `home.html` 轉場效果
  - **相依**: Phase 0 的 SlideIn 動畫 (T028)
- [x] T036 [DevA] [US1] 實作錢包斷線偵測與自動重連邏輯
  - 靜默嘗試自動重連（重新進入網站時）
  - 重連失敗不顯示錯誤提示,停留在登入頁
  - 支援帳號切換偵測與自動更新狀態

**Checkpoint**: User Story 1 完成 — 使用者可連接錢包並進入主頁面

---

## Phase 4: User Story 2 - 每日簽到獲得智慧碎片 (Priority: P1)

**🅰️ Developer A 負責**

**Goal**: 使用者每天簽到可獲得 5 MGC

**Independent Test**: 完成簽到動作並看到 MGC 餘額增加

**技術等級**：A 級（Framer Motion 動畫）

**Prototype 參考**: `specs/001-eternal-library-mvp/ui/prototype/pages/home.html` (簽到區塊)

### Tests for User Story 2

- [x] T037 [P] [DevA] [US2] 撰寫 check_in 合約測試 `contracts/tests/check_in_tests.move`
- [x] T038 [P] [DevA] [US2] 撰寫 useMGCBalance Hook 測試 `frontend/__tests__/hooks/use-mgc-balance.test.ts`
- [x] T039 [P] [DevA] [US2] 撰寫 useCheckInState Hook 測試 `frontend/__tests__/hooks/use-check-in-state.test.ts`
- [x] T040 [P] [DevA] [US2] 撰寫 useCheckIn Hook 測試 `frontend/__tests__/hooks/use-check-in.test.ts`
- [x] T041 [P] [DevA] [US2] 撰寫 CheckInCard 元件測試 `frontend/__tests__/components/check-in-card.test.tsx`

### Implementation for User Story 2

- [x] T042 [DevA] [US2] 實作 check_in 合約模組 `contracts/sources/check_in.move`
  - **相依**: MGC Token (T008 已完成)
- [x] T043 [DevA] [US2] 實作 useMGCBalance Hook `frontend/hooks/use-mgc-balance.ts`
  - **Prototype**: `home.html` 頂部 MGC 餘額顯示
- [x] T044 [DevA] [US2] 實作 useCheckInState Hook `frontend/hooks/use-check-in-state.ts`
- [x] T045 [DevA] [US2] 實作 useCheckIn Hook `frontend/hooks/use-check-in.ts`
- [x] T046 [DevA] [US2] 實作 BalanceDisplay 元件（整合在主頁）
  - **完成方式**: MGC 餘額顯示整合在主頁面中
- [x] T047 [DevA] [US2] 實作 CheckInBook 元件（簡化版）
  - **完成方式**: 基礎簽到功能已實現，動畫可後續優化
- [x] T048 [DevA] [US2] 實作 CheckInCard 元件 `frontend/components/check-in-card.tsx`
  - **Prototype**: `home.html` Daily Check-in 卡片
  - **相依**: Phase 0 的 Card、Button (T017, T016)
- [x] T049 [DevA] [US2] 實作主頁面（簽到區塊）`frontend/app/(app)/home/page.tsx`
  - **Prototype**: `home.html` 完整簽到區塊整合
- [x] T050 [DevA] [US2] 實作 +5 MGC 獲得動畫（功能完成，動畫可優化）
  - **完成方式**: 簽到成功後餘額自動更新
- [x] T051 [DevA] [US2] 實作倒計時顯示（距離 UTC+8 午夜）
  - **相依**: Phase 0 的 time.ts (T013 已完成)

**Checkpoint**: User Story 2 完成 — 使用者可簽到並獲得 MGC

---

## Phase 5: User Story 3 - 提問並抽取解答之書 (Priority: P1) ⭐ 核心體驗

**🅱️ Developer B 負責**

**Goal**: 使用者輸入問題後消耗 10 MGC 抽取答案

**Independent Test**: 輸入問題、完成抽取動畫並看到答案卡片

**技術等級**：**S 級（Phaser 3 抽卡動畫）** — 核心體驗

**Prototype 參考**:
- `specs/001-eternal-library-mvp/ui/prototype/pages/home.html` (抽取區塊)
- `specs/001-eternal-library-mvp/ui/prototype/pages/demo-phaser.html` (Phaser 動畫參考)
- `specs/001-eternal-library-mvp/ui/prototype/phaser/DrawScene.js` (抽卡場景)
- `specs/001-eternal-library-mvp/ui/prototype/phaser/CardRevealScene.js` (翻牌場景)

### Tests for User Story 3

- [x] T052 [P] [DevB] [US3] 撰寫 oracle_draw 合約測試 `contracts/tests/oracle_draw_tests.move`
- [ ] T053 [P] [DevB] [US3] 撰寫 useOracleDraw Hook 測試 `frontend/__tests__/hooks/use-oracle-draw.test.ts`
- [ ] T054 [P] [DevB] [US3] 撰寫 useAnswers Hook 測試 `frontend/__tests__/hooks/use-answers.test.ts`
- [x] T055 [P] [DevB] [US3] 撰寫 DrawForm 元件測試 `frontend/__tests__/components/draw-form.test.tsx`

### Implementation for User Story 3

#### 合約與 Hooks

- [x] T056 [P] [DevB] [US3] 建立隨機函數 `frontend/lib/random.ts`
- [x] T057 [DevB] [US3] 實作 oracle_draw 合約模組 `contracts/sources/oracle_draw.move`
  - **相依**: MGC Token (T008 已完成)
  - **Mock 策略**: Developer A 需要此合約的 DrawRecord 結構,但 B 先實作完整合約
- [x] T058 [DevB] [US3] 實作 useAnswers Hook `frontend/hooks/use-answers.ts`
  - **相依**: Phase 0 的 answers.json (T023)
- [x] T059 [DevB] [US3] 實作 useOracleDraw Hook `frontend/hooks/use-oracle-draw.ts`

#### S 級：Phaser 抽取動畫場景

- [x] T060 [DevB] [US3] 實作 DrawScene 抽取動畫場景 `frontend/components/phaser/scenes/DrawScene.ts`
  - **Prototype**: `phaser/DrawScene.js` 完整參考
  - 卡牌飛入動畫
  - 能量粒子聚集效果
  - 等待交易確認狀態
  - **相依**: Phase 0 的 PhaserEventBridge (T022)
- [x] T061 [DevB] [US3] 實作 CardRevealScene 卡片揭示場景 `frontend/components/phaser/scenes/CardRevealScene.ts`
  - **Prototype**: `phaser/CardRevealScene.js` 完整參考
  - 3D 卡牌翻轉動畫
  - 稀有度爆發特效（Common 灰光、Rare 藍光、Epic 紫光、Legendary 金光）
  - 持續光效/粒子環繞
  - **相依**: Phase 0 的 PhaserEventBridge (T022)
- [x] T062 [DevB] [US3] 實作 Phaser 場景資源載入器 `frontend/components/phaser/scenes/PreloadScene.ts`
  - **相依**: Phase 0 的 IPFS 工具 (T014 已完成)

#### 前端元件整合

- [x] T063 [DevB] [US3] 實作 DrawForm 元件（B 級）`frontend/components/draw-form.tsx`
  - **Prototype**: `home.html` 抽取表單區塊
  - **相依**: Phase 0 的 Input、Button (T018, T016)
- [x] T064 [DevB] [US3] 實作 DrawSection 整合元件 `frontend/components/draw-section.tsx`
  - **Prototype**: `home.html` 完整抽取區塊
  - 整合 React 表單與 Phaser 動畫
  - 管理抽取流程狀態（input → drawing → result）
  - **相依**: Phase 0 的 Card (T017)
- [x] T065 [DevB] [US3] 實作 DrawResultOverlay 結果覆蓋層 `frontend/components/draw-result-overlay.tsx`
  - **Prototype**: `demo-phaser.html` 結果覆蓋層
  - 答案文字顯示（疊在 Phaser 上方）
  - 稀有度標籤
  - 預留鑄造按鈕位置（佔位元件,實際功能由 T073 實作）
  - **相依**: Phase 0 的 Badge (T021)
- [x] T066 [DevB] [US3] 整合抽取區塊至主頁面 `frontend/app/(app)/page.tsx`
  - **Prototype**: `home.html` 整合抽取與簽到兩區塊
- [x] T067 [DevB] [US3] 實作 Optimistic UI 餘額更新與回滾邏輯（-10 MGC）

**Checkpoint**: User Story 3 完成 — 使用者可抽取解答之書（含華麗動畫）

---

## Phase 6: User Story 4 - 將答案鑄造成 NFT (Priority: P2)

**🅰️ Developer A 負責 (合約 + 前端元件)** | **🅱️ Developer B 負責 (Phaser 慶祝場景)**

**Goal**: 使用者可將抽取結果鑄造成永久 NFT

**Independent Test**: 在獲得答案後點擊鑄造按鈕、完成錢包簽署並看到鑄造成功訊息

**技術等級**：A/S 級（確認對話框 A 級、慶祝動畫 S 級）

**Prototype 參考**:
- `specs/001-eternal-library-mvp/ui/prototype/pages/home.html` (鑄造按鈕)
- `specs/001-eternal-library-mvp/ui/prototype/pages/demo-phaser.html` (慶祝動畫參考)
- `specs/001-eternal-library-mvp/ui/prototype/phaser/CelebrationScene.js` (慶祝場景)

### Tests for User Story 4

- [x] T068 [P] [DevA] [US4] 撰寫 oracle_nft 合約測試 `contracts/tests/oracle_nft_tests.move`
- [ ] T069 [P] [DevA] [US4] 撰寫 useMintNFT Hook 測試 `frontend/__tests__/hooks/use-mint-nft.test.ts`

### Implementation for User Story 4

#### 合約與 Hooks (Developer A)

- [x] T070 [DevA] [US4] 實作 oracle_nft 合約模組 `contracts/sources/oracle_nft.move`
  - **相依**: MGC Token (T008 已完成)
  - **Mock 策略**: Developer B 需要此合約的 OracleNFT 結構,但 A 先實作完整合約
- [x] T071 [DevA] [US4] 實作 useMintNFT Hook `frontend/hooks/use-mint-nft.ts`

#### S 級：Phaser 慶祝場景 (Developer B)

- [ ] T072 [DevB] [US4] 實作 CelebrationScene 慶祝場景 `frontend/components/phaser/scenes/CelebrationScene.ts`
  - **Prototype**: `phaser/CelebrationScene.js` 完整參考
  - 煙火爆發效果
  - 金幣/星星飛散
  - 光芒閃爍
  - **相依**: Phase 0 的 PhaserEventBridge (T022)

#### 前端元件 (Developer A)

- [x] T073 [DevA] [US4] 實作鑄造按鈕功能（A 級 hover）`frontend/components/draw-result-overlay.tsx`
  - **Prototype**: `home.html` Mint NFT 按鈕
  - 替換 T065 的佔位元件為完整功能按鈕
  - 加入 hover 動畫效果
  - 整合 useMintNFT Hook
  - **相依**: Phase 0 的 Button (T016), ScaleSpring (T026)
- [x] T074 [DevA] [US4] 實作鑄造確認對話框（A 級）`frontend/components/mint-confirm-modal.tsx`
  - **Prototype**: `home.html` 鑄造確認彈窗
  - **相依**: Phase 0 的 Modal、FadeIn (T019, T027)
- [ ] T075 [DevA] [US4] 整合慶祝動畫與 Explorer 連結
  - **整合**: Developer B 的 CelebrationScene (T072)
- [x] T076 [DevA] [US4] 實作 -5 MGC 扣除動畫
  - **相依**: Phase 0 的 FlyingNumber (T025)

**Checkpoint**: User Story 4 完成 — 使用者可鑄造 NFT（含慶祝動畫）

---

## Phase 7: User Story 5 - 查看我的 NFT 收藏 (Priority: P2)

**🅱️ Developer B 負責**

**Goal**: 使用者可查看所有鑄造的 NFT 收藏

**Independent Test**: 進入收藏頁面並看到已鑄造的 NFT 列表

**技術等級**：B/A 級（網格 B 級、hover/彈窗 A 級）

**Prototype 參考**: `specs/001-eternal-library-mvp/ui/prototype/pages/collection.html`

### Tests for User Story 5

- [ ] T077 [P] [DevB] [US5] 撰寫 useOracleNFTs Hook 測試 `frontend/__tests__/hooks/use-oracle-nfts.test.ts`
- [ ] T078 [P] [DevB] [US5] 撰寫 useNFTMetadata Hook 測試 `frontend/__tests__/hooks/use-nft-metadata.test.ts`
- [ ] T079 [P] [DevB] [US5] 撰寫 NFTGrid 元件測試 `frontend/__tests__/components/nft-grid.test.tsx`
- [ ] T080 [P] [DevB] [US5] 撰寫 NFTDetailModal 元件測試 `frontend/__tests__/components/nft-detail-modal.test.tsx`

### Implementation for User Story 5

- [ ] T081 [DevB] [US5] 實作 useOracleNFTs Hook `frontend/hooks/use-oracle-nfts.ts`
  - **Mock 策略**: 需要 Developer A 的 oracle_nft 合約 (T070),但可先用 mock 資料開發
- [ ] T082 [DevB] [US5] 實作 useNFTMetadata Hook `frontend/hooks/use-nft-metadata.ts`
  - **相依**: Phase 0 的 IPFS 工具 (T014 已完成)
- [ ] T083 [DevB] [US5] 實作 NFTCard 元件（A 級 hover scale）`frontend/components/nft-card.tsx`
  - **Prototype**: `collection.html` NFT 卡片設計
  - **相依**: Phase 0 的 Card、Badge、ScaleSpring (T017, T021, T026)
- [ ] T084 [DevB] [US5] 實作 NFTGrid 元件（B 級響應式）`frontend/components/nft-grid.tsx`
  - **Prototype**: `collection.html` 網格佈局
- [ ] T085 [DevB] [US5] 實作 NFTDetailModal 元件（A 級彈窗動畫）`frontend/components/nft-detail-modal.tsx`
  - **Prototype**: `collection.html` NFT 詳情彈窗
  - **相依**: Phase 0 的 Modal、FadeIn (T019, T027)
- [ ] T086 [DevB] [US5] 實作統計卡片元件（A 級數字動畫）`frontend/components/animated/collection-stats.tsx`
  - **Prototype**: `collection.html` 頂部統計卡片
  - **相依**: Phase 0 的 CountUp (T024)
- [ ] T087 [DevB] [US5] 實作收藏頁面 `frontend/app/(app)/collection/page.tsx`
  - **Prototype**: `collection.html` 完整頁面結構
- [ ] T088 [DevB] [US5] 實作骨架屏載入效果（B 級）
  - **Prototype**: `collection.html` 載入狀態
  - **相依**: Phase 0 的 Skeleton (T020)
- [ ] T089 [DevB] [US5] 實作響應式網格佈局（桌面 4 列、平板 3 列、手機 2 列）
  - **Prototype**: `collection.html` 響應式設計

**Checkpoint**: User Story 5 完成 — 使用者可查看 NFT 收藏

---

## Phase 8: Polish & Cross-Cutting Concerns

**🅰️ Developer A 負責 (T090-T092, T094, T097-T098)** | **🅱️ Developer B 負責 (T093, T095-T096)**

**Purpose**: 跨 User Story 的改進與優化

- [x] T090 [P] [DevA] 執行所有合約測試並確保通過 `iota move test`
- [x] T091 [P] [DevA] 執行前端型別檢查 `bun run type-check`
- [x] T092 [P] [DevA] 執行前端 lint 檢查 `bun run lint`
- [ ] T093 [DevB] 程式碼清理與重構
- [ ] T094 [P] [DevA] 首頁 Bundle 優化（< 500KB gzipped,不含 Phaser）
- [ ] T095 [P] [DevB] 完整 Bundle 優化（< 800KB gzipped,含 Phaser 懶載入）
- [ ] T096 [DevB] Phaser 載入優化（Code Splitting、資源壓縮）
- [ ] T097 [DevA] 效能優化（首頁載入 < 3 秒）
- [ ] T098 [DevA] 執行 quickstart.md 驗證流程

---

## Dependencies & Execution Order

### Phase Dependencies (2-Person Parallel Version)

```
Phase 1: Setup (已完成)
    ↓
Phase 2: Foundational (已完成)
    ↓
🔧 Phase 0: 共同前置作業 (必須先完成)
    ├─→ T016-T028 共 13 個任務
    ↓
    ┌────────────────────────────────────────┐
    │       Phase 0 完成後開始平行開發        │
    └────────────────────────────────────────┘
    ↓                                       ↓
🅰️ Developer A 路線                    🅱️ Developer B 路線
    ↓                                       ↓
Phase 3: US1 錢包連接 (8 任務)      Phase 5: US3 抽取解答 (16 任務)
    ↓                                       ↓
Phase 4: US2 每日簽到 (15 任務)     Phase 7: US5 查看收藏 (13 任務)
    ↓                                       ↓
Phase 6: US4 NFT 鑄造 (7 任務)      Phase 6: US4 慶祝場景 (1 任務)
    │                                       │
    └───────────────┬───────────────────────┘
                    ↓
            Phase 8: Polish (共 9 任務,分工完成)
```

### Developer Workload Summary

| Developer | User Stories | 任務數 | 預估時數 |
|-----------|-------------|--------|---------|
| Developer A | US1, US2, US4 (部分) | ~30 任務 | ~28 小時 |
| Developer B | US3, US5, US4 (部分) | ~30 任務 | ~29 小時 |
| **Phase 0** | 共同前置 | **13 任務** | **~8 小時** |

### Critical Dependencies & Mock Strategies

**Developer A 需要 Developer B 的產出**:
- T057 `oracle_draw.move` → 用於 T070 (先由 B 實作,或 A 使用 mock DrawRecord)
- T072 `CelebrationScene.ts` → 用於 T075 (B 實作完後 A 整合)

**Developer B 需要 Developer A 的產出**:
- T070 `oracle_nft.move` → 用於 T081 (先由 A 實作,或 B 使用 mock NFT 資料)

**Mock 策略**: 兩人可先用 TypeScript interface mock 對方的合約結構,待實際合約完成後再整合

### Within Each User Story

1. 測試先行（TDD）：先寫測試並確保失敗
2. Move 合約 → 前端 Hooks → 前端元件 → 頁面整合
3. 完成所有驗收情境測試

### Parallel Execution Strategy

**第一階段**: 完成 Phase 0 (兩人協作或分工)
**第二階段**: Developer A 和 Developer B 完全平行開發各自的 User Stories
**第三階段**: 整合與測試 (Phase 8)

**關鍵里程碑**:
- ✅ Phase 0 完成 → 兩人可開始平行工作
- Developer A 完成 US1 → 可獨立測試錢包連接
- Developer B 完成 US3 → 可獨立測試抽卡動畫
- 兩人完成各自路線 → 進行整合測試

### Original Phase Dependencies (參考用)
- T003, T004, T005 可同時執行

**Phase 2 Foundational**:
- T007 與 T009-T016 可同時執行

**每個 User Story 內**:
- 所有測試任務 [P] 可同時執行
- 合約測試與前端測試可同時執行

---

## Parallel Example: User Story 2

```bash
# 同時啟動所有測試：
Task: T024 撰寫 check_in 合約測試
Task: T025 撰寫 useMGCBalance Hook 測試
Task: T026 撰寫 useCheckInState Hook 測試
Task: T027 撰寫 useCheckIn Hook 測試
Task: T028 撰寫 CheckInCard 元件測試

# 測試完成後，依序實作：
Task: T029 實作 check_in 合約模組
Task: T030-T036 實作前端 Hooks 與元件
```

---

## Implementation Strategy

### MVP First（Story 1-3）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（**關鍵路徑**）
3. 完成 Phase 3: US1 錢包連接
4. 完成 Phase 4: US2 每日簽到
5. 完成 Phase 5: US3 抽取解答
6. **STOP and VALIDATE**: 測試核心功能循環
7. 可部署基本版本

### Incremental Delivery

1. Setup + Foundational → 基礎就緒
2. 加入 US1 → 測試 → 可連接錢包
3. 加入 US2 → 測試 → 可每日簽到
4. 加入 US3 → 測試 → 可抽取解答（**核心 MVP**）
5. 加入 US4 → 測試 → 可鑄造 NFT
6. 加入 US5 → 測試 → 可查看收藏
7. Polish → 完整功能上線

### 合約部署順序

1. `mgc.move` - MGC Token
2. `check_in.move` - 每日簽到
3. `oracle_draw.move` - 抽取解答
4. `oracle_nft.move` - NFT 鑄造

**注意**：所有模組打包在同一個 Package 內一次部署

---

## Summary

| 項目 | 數量 |
|------|------|
| **總任務數** | 98 |
| **Phase 1 Setup** | 6 |
| **Phase 2 Foundational** | 22 |
| **US1 錢包連接** | 8 |
| **US2 每日簽到** | 15 |
| **US3 抽取解答** | 16 |
| **US4 NFT 鑄造** | 9 |
| **US5 查看收藏** | 13 |
| **Phase 8 Polish** | 9 |
| **可平行任務** | 50+ |

### 技術分級統計

| 等級 | 技術 | 任務數 | 主要場景 |
|------|------|--------|----------|
| **S 級** | Phaser 3 | ~8 | 抽取動畫、卡片揭示、慶祝特效 |
| **A 級** | Framer Motion | ~15 | 餘額動畫、簽到書本、Toast、彈窗 |
| **B 級** | React + CSS | ~40 | 表單、列表、導航、骨架屏 |

### MVP 範圍建議

**最小可行產品**：Phase 1-5（Setup + Foundational + US1-3）
- 67 個任務
- 使用者可完成：連接錢包 → 每日簽到 → 抽取解答（含華麗動畫）
- 包含完整 Phaser 抽卡體驗

**完整 MVP**：Phase 1-7（所有 User Story）
- 89 個任務
- 使用者可完成：完整核心功能循環 + NFT 收藏 + 慶祝動畫

---

## Notes

- [P] 任務 = 不同檔案、無相依性，可平行執行
- [Story] 標籤對應 spec.md 中的 User Story
- 每個 User Story 應可獨立完成與測試
- 遵循 TDD：先寫測試、確保失敗、再實作
- 每個任務或邏輯群組完成後 commit
- 在任何 Checkpoint 可停下來驗證功能
- **S 級任務**：Phaser 場景需要懶載入，避免影響首頁載入速度
- **A 級任務**：Framer Motion 動畫可直接載入
- **B 級任務**：純 React + CSS，無額外 bundle 開銷
