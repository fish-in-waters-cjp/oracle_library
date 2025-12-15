# 實作計畫：永恆圖書館 MVP

**分支**：`001-eternal-library-mvp` | **日期**：2025-12-15 | **規格**：[spec.md](./spec.md)
**輸入**：功能規格書 `/specs/001-eternal-library-mvp/spec.md`

## 摘要

永恆圖書館是一個基於 IOTA Testnet 的 Web3 問答遊戲。使用者透過每日簽到獲得 MGC（智慧碎片），用於抽取解答之書，並可將答案鑄造成 NFT 永久保存。

**核心功能**：
1. 錢包連接（IOTA Wallet）
2. 每日簽到（獲得 5 MGC）
3. 抽取解答（消耗 10 MGC）
4. NFT 鑄造（消耗 5 MGC + Gas）
5. 收藏展示

**技術方案**：
- 前端：Next.js 16 + React 19 + @iota/dapp-kit
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
- Bundle Size < 500KB gzipped
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
| Bundle Size | < 500KB gzipped |

### V. 文件語言 ✓

所有文件使用繁體中文（zh-TW）。

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
│   │   ├── ui/                  # 基礎 UI 元件
│   │   ├── providers.tsx        # IOTA Provider 設定
│   │   ├── connect-wallet.tsx   # 連接錢包元件
│   │   ├── check-in-card.tsx    # 簽到卡片
│   │   ├── draw-form.tsx        # 抽取表單
│   │   ├── draw-result.tsx      # 抽取結果
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
│   │   └── data/
│   │       └── answers.json     # 答案資料
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

**結構決策**：採用 Monorepo 結構，前端與合約在同一儲存庫。由於無後端，使用 `frontend/` 和 `contracts/` 兩個主要目錄。前端使用 Next.js App Router，合約使用 Move 多模組設計。

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
