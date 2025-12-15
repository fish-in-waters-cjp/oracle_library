# Tasks: 永恆圖書館 MVP

**Input**: Design documents from `/specs/001-eternal-library-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: 依據 CLAUDE.md 要求，本專案採用 TDD（測試驅動開發）。

**Organization**: 任務按 User Story 分組，以支援獨立實作與測試。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無相依性）
- **[Story]**: 對應的 User Story（US1, US2, US3...）
- 每個任務包含確切的檔案路徑

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

- [ ] T001 建立 Move 合約專案結構 `contracts/Move.toml`
- [ ] T002 建立 Next.js 前端專案結構 `frontend/package.json`
- [ ] T003 [P] 設定 TypeScript 配置 `frontend/tsconfig.json`
- [ ] T004 [P] 設定 Tailwind CSS 4 `frontend/app/globals.css`
- [ ] T005 [P] 設定 ESLint 與 Prettier `frontend/.eslintrc.json`
- [ ] T006 設定環境變數範本 `frontend/.env.example`

---

## Phase 2: Foundational（基礎架構）

**Purpose**: 所有 User Story 共用的基礎設施

**⚠️ CRITICAL**: 必須完成此階段才能開始任何 User Story

### Move 合約基礎

- [ ] T007 [P] 撰寫 MGC Token 測試 `contracts/tests/mgc_tests.move`
- [ ] T008 實作 MGC Token 模組 `contracts/sources/mgc.move`

### 前端基礎

- [ ] T009 [P] 建立 IOTA Provider 設定 `frontend/components/providers.tsx`
- [ ] T010 [P] 建立常數定義 `frontend/consts.ts`
- [ ] T011 [P] 建立錯誤處理類別 `frontend/lib/errors.ts`
- [ ] T012 [P] 建立工具函數 `frontend/lib/utils.ts`
- [ ] T013 [P] 建立時間計算函數 `frontend/lib/time.ts`
- [ ] T014 [P] 建立 IPFS 工具函數 `frontend/lib/ipfs.ts`
- [ ] T015 建立根佈局 `frontend/app/layout.tsx`

### B 級：基礎 UI 元件

- [ ] T016 [P] 建立 Button 元件 `frontend/components/ui/button.tsx`
- [ ] T017 [P] 建立 Input 元件 `frontend/components/ui/input.tsx`
- [ ] T018 [P] 建立 Modal 元件 `frontend/components/ui/modal.tsx`
- [ ] T019 [P] 建立 Skeleton 元件 `frontend/components/ui/skeleton.tsx`
- [ ] T020 [P] 建立 Card 元件 `frontend/components/ui/card.tsx`

### A 級：Framer Motion 基礎

- [ ] T021 [P] 建立 Toast 通知元件 `frontend/components/animated/toast.tsx`
- [ ] T022 [P] 建立頁面轉場元件 `frontend/components/animated/page-transition.tsx`

### S 級：Phaser 基礎設施

- [ ] T023 [P] 建立 EventBridge 通訊模組 `frontend/components/phaser/EventBridge.ts`
- [ ] T024 [P] 建立 PhaserGame 遊戲實例 `frontend/components/phaser/PhaserGame.tsx`
- [ ] T025 建立 PhaserContainer 懶載入容器 `frontend/components/phaser/PhaserContainer.tsx`

### 靜態資料與遊戲資源

- [ ] T026 建立 50 個答案資料 `frontend/public/data/answers.json`
- [ ] T027 [P] 準備粒子特效素材 `frontend/public/game/particles/`
- [ ] T028 [P] 準備卡牌圖片素材 `frontend/public/game/cards/`

**Checkpoint**: 基礎架構就緒 — 可開始 User Story 實作

---

## Phase 3: User Story 1 - 錢包連接與身份驗證 (Priority: P1) 🎯 MVP

**Goal**: 使用者能夠連接 IOTA 錢包，建立身份並開始旅程

**Independent Test**: 成功連接錢包並在介面上顯示錢包地址

**技術等級**：B/A 級（React + Framer Motion）

### Tests for User Story 1

> **NOTE: 先寫測試，確保測試失敗後再實作**

- [ ] T029 [P] [US1] 撰寫 useWalletConnection Hook 測試 `frontend/__tests__/hooks/use-wallet-connection.test.ts`
- [ ] T030 [P] [US1] 撰寫 ConnectWallet 元件測試 `frontend/__tests__/components/connect-wallet.test.tsx`

### Implementation for User Story 1

- [ ] T031 [US1] 實作 useWalletConnection Hook `frontend/hooks/use-wallet-connection.ts`
- [ ] T032 [US1] 實作 ConnectWallet 元件（B 級）`frontend/components/connect-wallet.tsx`
- [ ] T033 [US1] 實作登入頁面（含入口視覺 A 級）`frontend/app/page.tsx`
- [ ] T034 [US1] 實作應用佈局（含導航列 B 級）`frontend/app/(app)/layout.tsx`
- [ ] T035 [US1] 實作連接成功轉場動畫（A 級）
- [ ] T036 [US1] 實作錢包斷線偵測與自動重連邏輯

**Checkpoint**: User Story 1 完成 — 使用者可連接錢包並進入主頁面

---

## Phase 4: User Story 2 - 每日簽到獲得智慧碎片 (Priority: P1)

**Goal**: 使用者每天簽到可獲得 5 MGC

**Independent Test**: 完成簽到動作並看到 MGC 餘額增加

**技術等級**：A 級（Framer Motion 動畫）

### Tests for User Story 2

- [ ] T037 [P] [US2] 撰寫 check_in 合約測試 `contracts/tests/check_in_tests.move`
- [ ] T038 [P] [US2] 撰寫 useMGCBalance Hook 測試 `frontend/__tests__/hooks/use-mgc-balance.test.ts`
- [ ] T039 [P] [US2] 撰寫 useCheckInState Hook 測試 `frontend/__tests__/hooks/use-check-in-state.test.ts`
- [ ] T040 [P] [US2] 撰寫 useCheckIn Hook 測試 `frontend/__tests__/hooks/use-check-in.test.ts`
- [ ] T041 [P] [US2] 撰寫 CheckInCard 元件測試 `frontend/__tests__/components/check-in-card.test.tsx`

### Implementation for User Story 2

- [ ] T042 [US2] 實作 check_in 合約模組 `contracts/sources/check_in.move`
- [ ] T043 [US2] 實作 useMGCBalance Hook `frontend/hooks/use-mgc-balance.ts`
- [ ] T044 [US2] 實作 useCheckInState Hook `frontend/hooks/use-check-in-state.ts`
- [ ] T045 [US2] 實作 useCheckIn Hook `frontend/hooks/use-check-in.ts`
- [ ] T046 [US2] 實作 BalanceDisplay 元件（A 級數字跳動）`frontend/components/animated/balance-display.tsx`
- [ ] T047 [US2] 實作 CheckInBook 元件（A 級書本翻頁）`frontend/components/animated/check-in-book.tsx`
- [ ] T048 [US2] 實作 CheckInCard 元件 `frontend/components/check-in-card.tsx`
- [ ] T049 [US2] 實作主頁面（簽到區塊）`frontend/app/(app)/page.tsx`
- [ ] T050 [US2] 實作 +5 MGC 獲得動畫（A 級）
- [ ] T051 [US2] 實作倒計時顯示（距離 UTC+8 午夜）

**Checkpoint**: User Story 2 完成 — 使用者可簽到並獲得 MGC

---

## Phase 5: User Story 3 - 提問並抽取解答之書 (Priority: P1) ⭐ 核心體驗

**Goal**: 使用者輸入問題後消耗 10 MGC 抽取答案

**Independent Test**: 輸入問題、完成抽取動畫並看到答案卡片

**技術等級**：**S 級（Phaser 3 抽卡動畫）** — 核心體驗

### Tests for User Story 3

- [ ] T052 [P] [US3] 撰寫 oracle_draw 合約測試 `contracts/tests/oracle_draw_tests.move`
- [ ] T053 [P] [US3] 撰寫 useOracleDraw Hook 測試 `frontend/__tests__/hooks/use-oracle-draw.test.ts`
- [ ] T054 [P] [US3] 撰寫 useAnswers Hook 測試 `frontend/__tests__/hooks/use-answers.test.ts`
- [ ] T055 [P] [US3] 撰寫 DrawForm 元件測試 `frontend/__tests__/components/draw-form.test.tsx`

### Implementation for User Story 3

#### 合約與 Hooks

- [ ] T056 [P] [US3] 建立隨機函數 `frontend/lib/random.ts`
- [ ] T057 [US3] 實作 oracle_draw 合約模組 `contracts/sources/oracle_draw.move`
- [ ] T058 [US3] 實作 useAnswers Hook `frontend/hooks/use-answers.ts`
- [ ] T059 [US3] 實作 useOracleDraw Hook `frontend/hooks/use-oracle-draw.ts`

#### S 級：Phaser 抽取動畫場景

- [ ] T060 [US3] 實作 DrawScene 抽取動畫場景 `frontend/components/phaser/scenes/DrawScene.ts`
  - 卡牌飛入動畫
  - 能量粒子聚集效果
  - 等待交易確認狀態
- [ ] T061 [US3] 實作 CardRevealScene 卡片揭示場景 `frontend/components/phaser/scenes/CardRevealScene.ts`
  - 3D 卡牌翻轉動畫
  - 稀有度爆發特效（Common 灰光、Rare 藍光、Epic 紫光、Legendary 金光）
  - 持續光效/粒子環繞
- [ ] T062 [US3] 實作 Phaser 場景資源載入器 `frontend/components/phaser/scenes/PreloadScene.ts`

#### 前端元件整合

- [ ] T063 [US3] 實作 DrawForm 元件（B 級）`frontend/components/draw-form.tsx`
- [ ] T064 [US3] 實作 DrawSection 整合元件 `frontend/components/draw-section.tsx`
  - 整合 React 表單與 Phaser 動畫
  - 管理抽取流程狀態（input → drawing → result）
- [ ] T065 [US3] 實作 DrawResultOverlay 結果覆蓋層 `frontend/components/draw-result-overlay.tsx`
  - 答案文字顯示（疊在 Phaser 上方）
  - 稀有度標籤
  - 鑄造按鈕入口
- [ ] T066 [US3] 整合抽取區塊至主頁面 `frontend/app/(app)/page.tsx`
- [ ] T067 [US3] 實作 Optimistic UI 餘額更新與回滾邏輯（-10 MGC）

**Checkpoint**: User Story 3 完成 — 使用者可抽取解答之書（含華麗動畫）

---

## Phase 6: User Story 4 - 將答案鑄造成 NFT (Priority: P2)

**Goal**: 使用者可將抽取結果鑄造成永久 NFT

**Independent Test**: 在獲得答案後點擊鑄造按鈕、完成錢包簽署並看到鑄造成功訊息

**技術等級**：A/S 級（確認對話框 A 級、慶祝動畫 S 級）

### Tests for User Story 4

- [ ] T068 [P] [US4] 撰寫 oracle_nft 合約測試 `contracts/tests/oracle_nft_tests.move`
- [ ] T069 [P] [US4] 撰寫 useMintNFT Hook 測試 `frontend/__tests__/hooks/use-mint-nft.test.ts`

### Implementation for User Story 4

#### 合約與 Hooks

- [ ] T070 [US4] 實作 oracle_nft 合約模組 `contracts/sources/oracle_nft.move`
- [ ] T071 [US4] 實作 useMintNFT Hook `frontend/hooks/use-mint-nft.ts`

#### S 級：Phaser 慶祝場景

- [ ] T072 [US4] 實作 CelebrationScene 慶祝場景 `frontend/components/phaser/scenes/CelebrationScene.ts`
  - 煙火爆發效果
  - 金幣/星星飛散
  - 光芒閃爍

#### 前端元件

- [ ] T073 [US4] 在 DrawResultOverlay 加入鑄造按鈕（A 級 hover）`frontend/components/draw-result-overlay.tsx`
- [ ] T074 [US4] 實作鑄造確認對話框（A 級）`frontend/components/mint-confirm-modal.tsx`
- [ ] T075 [US4] 整合慶祝動畫與 Explorer 連結
- [ ] T076 [US4] 實作 -5 MGC 扣除動畫

**Checkpoint**: User Story 4 完成 — 使用者可鑄造 NFT（含慶祝動畫）

---

## Phase 7: User Story 5 - 查看我的 NFT 收藏 (Priority: P2)

**Goal**: 使用者可查看所有鑄造的 NFT 收藏

**Independent Test**: 進入收藏頁面並看到已鑄造的 NFT 列表

**技術等級**：B/A 級（網格 B 級、hover/彈窗 A 級）

### Tests for User Story 5

- [ ] T077 [P] [US5] 撰寫 useOracleNFTs Hook 測試 `frontend/__tests__/hooks/use-oracle-nfts.test.ts`
- [ ] T078 [P] [US5] 撰寫 useNFTMetadata Hook 測試 `frontend/__tests__/hooks/use-nft-metadata.test.ts`
- [ ] T079 [P] [US5] 撰寫 NFTGrid 元件測試 `frontend/__tests__/components/nft-grid.test.tsx`
- [ ] T080 [P] [US5] 撰寫 NFTDetailModal 元件測試 `frontend/__tests__/components/nft-detail-modal.test.tsx`

### Implementation for User Story 5

- [ ] T081 [US5] 實作 useOracleNFTs Hook `frontend/hooks/use-oracle-nfts.ts`
- [ ] T082 [US5] 實作 useNFTMetadata Hook `frontend/hooks/use-nft-metadata.ts`
- [ ] T083 [US5] 實作 NFTCard 元件（A 級 hover scale）`frontend/components/nft-card.tsx`
- [ ] T084 [US5] 實作 NFTGrid 元件（B 級響應式）`frontend/components/nft-grid.tsx`
- [ ] T085 [US5] 實作 NFTDetailModal 元件（A 級彈窗動畫）`frontend/components/nft-detail-modal.tsx`
- [ ] T086 [US5] 實作統計卡片元件（A 級數字動畫）`frontend/components/animated/collection-stats.tsx`
- [ ] T087 [US5] 實作收藏頁面 `frontend/app/(app)/collection/page.tsx`
- [ ] T088 [US5] 實作骨架屏載入效果（B 級）
- [ ] T089 [US5] 實作響應式網格佈局（桌面 4 列、平板 3 列、手機 2 列）

**Checkpoint**: User Story 5 完成 — 使用者可查看 NFT 收藏

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 跨 User Story 的改進與優化

- [ ] T090 [P] 執行所有合約測試並確保通過 `iota move test`
- [ ] T091 [P] 執行前端型別檢查 `bun run type-check`
- [ ] T092 [P] 執行前端 lint 檢查 `bun run lint`
- [ ] T093 程式碼清理與重構
- [ ] T094 [P] 首頁 Bundle 優化（< 500KB gzipped，不含 Phaser）
- [ ] T095 [P] 完整 Bundle 優化（< 800KB gzipped，含 Phaser 懶載入）
- [ ] T096 Phaser 載入優化（Code Splitting、資源壓縮）
- [ ] T097 效能優化（首頁載入 < 3 秒）
- [ ] T098 執行 quickstart.md 驗證流程

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
    ├─→ Phase 3: US1 錢包連接 (P1)
    │       ↓
    ├─→ Phase 4: US2 每日簽到 (P1) ← 需要錢包連接
    │       ↓
    ├─→ Phase 5: US3 抽取解答 (P1) ← 需要 MGC
    │       ↓
    ├─→ Phase 6: US4 NFT 鑄造 (P2) ← 需要 DrawRecord
    │       ↓
    └─→ Phase 7: US5 查看收藏 (P2) ← 需要 NFT
            ↓
        Phase 8: Polish
```

### User Story Dependencies

| Story | 相依 | 說明 |
|-------|------|------|
| US1 | Phase 2 | 無其他相依 |
| US2 | US1 | 需要錢包連接 |
| US3 | US2 | 需要 MGC 餘額 |
| US4 | US3 | 需要 DrawRecord |
| US5 | US4 | 需要 OracleNFT |

### Within Each User Story

1. 測試先行（TDD）：先寫測試並確保失敗
2. Move 合約 → 前端 Hooks → 前端元件 → 頁面整合
3. 完成所有驗收情境測試

### Parallel Opportunities

**Phase 1 Setup**:
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
