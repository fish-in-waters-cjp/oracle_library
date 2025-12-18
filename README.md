# 永恆圖書館 (Eternal Library)

一個結合 Web3 區塊鏈技術的全棧應用，部署在 IOTA 網絡上。使用者可以每日簽到獲得 MGC 代幣，向神諭提問並抽取答案，再將答案鑄造成獨特的 NFT 收藏品。

## 目錄

- [技術架構](#技術架構)
- [前端架構](#前端架構)
- [智能合約架構](#智能合約架構)
- [遊戲經濟學](#遊戲經濟學)
- [快速開始](#快速開始)
- [部署資訊](#部署資訊)

---

## 技術架構

```
oracle_library/
├── contracts/          # Move 智能合約（IOTA 區塊鏈）
├── frontend/           # Next.js 前端應用
├── deployments/        # 合約部署配置和資訊
├── docs/               # 專案文件
└── specs/              # 專案規格文件
```

---

## 前端架構

### 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 區塊鏈 | @iota/dapp-kit, @iota/iota-sdk |
| 錢包 | IOTA Snap for MetaMask |
| 狀態管理 | TanStack React Query |
| 動畫 | Framer Motion, Phaser 3 |
| 樣式 | Tailwind CSS 4 |
| 測試 | Vitest + Testing Library |

### 目錄結構

```
frontend/
├── app/                      # Next.js App Router
│   ├── (app)/               # 認證使用者路由群組
│   │   ├── home/            # 主頁（簽到、抽取、鑄造）
│   │   ├── collection/      # NFT 收藏頁
│   │   └── layout.tsx       # 應用佈局
│   ├── page.tsx             # 登入頁面
│   └── globals.css          # 全域樣式
│
├── components/              # React 元件
│   ├── animated/            # 動畫元件
│   │   ├── flying-number.tsx
│   │   ├── page-transition.tsx
│   │   └── toast.tsx
│   ├── phaser/              # Phaser 遊戲引擎元件
│   ├── ui/                  # 基礎 UI 元件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── check-in-card.tsx    # 簽到卡片
│   ├── connect-wallet.tsx   # 錢包連接
│   ├── draw-section.tsx     # 抽取區塊
│   ├── mint-confirm-modal.tsx # NFT 鑄造確認
│   ├── nft-card.tsx         # NFT 卡片
│   └── nft-grid.tsx         # NFT 網格
│
├── hooks/                   # 自訂 Hooks
│   ├── use-wallet-connection.ts    # 錢包連接狀態
│   ├── use-check-in.ts             # 簽到交易
│   ├── use-check-in-state.ts       # 簽到狀態查詢
│   ├── use-mgc-balance.ts          # MGC 餘額查詢
│   ├── use-oracle-draw.ts          # 抽取交易
│   ├── use-owned-oracle-nfts.ts    # 使用者 NFT 查詢
│   └── use-mint-nft.ts             # NFT 鑄造交易
│
├── lib/                     # 工具函式
├── consts.ts                # 常數定義（合約 ID 等）
└── package.json             # 依賴管理
```

### 頁面說明

| 路徑 | 功能 |
|------|------|
| `/` | 登入頁 - 錢包連接、品牌展示 |
| `/home` | 主頁 - 簽到、抽取答案、鑄造 NFT |
| `/collection` | 收藏頁 - 檢視已擁有的 NFT |

### 設計風格

- **Style 10 - 高端奢華設計**
- 暗黑主題搭配金色調
- Framer Motion 流暢動畫
- Optimistic UI 預測性更新

---

## 智能合約架構

### 技術棧

| 類別 | 技術 |
|------|------|
| 區塊鏈 | IOTA Network |
| 語言 | Move (2024.beta) |
| 框架 | IOTA Framework |

### 合約模組

```
contracts/sources/
├── mgc.move           # MGC 代幣系統
├── check_in.move      # 每日簽到系統
├── oracle_draw.move   # 神諭抽取系統
└── oracle_nft.move    # NFT 鑄造系統
```

### 模組說明

#### 1. MGC 代幣 (`mgc.move`)

管理遊戲內代幣 MGC (Managed Game Currency)。

```move
public struct MGCTreasury has key {
    treasury_cap: TreasuryCap<MGC>
}

public struct AdminCap has key, store {}

public struct EmergencyRecovery has key {
    recovery_address: address,
    cooldown: u64
}
```

**主要功能：**
- MGC 代幣鑄造與管理
- AdminCap 管理員權限
- 緊急恢復機制

#### 2. 簽到系統 (`check_in.move`)

每日簽到獲取 MGC 獎勵。

```move
public struct UserCheckInRecord has key, store {
    owner: address,
    last_check_in_day: u64,   // UTC+8 日期
    total_check_ins: u64
}
```

**主要功能：**
- 首次簽到獎勵：100 MGC
- 每日簽到獎勵：20 MGC
- UTC+8 時區時間計算
- 防重複簽到機制

#### 3. 抽取系統 (`oracle_draw.move`)

向神諭提問並抽取答案。

```move
public struct DrawRecord has key, store {
    owner: address,
    answer_id: u8,          // 0-49（50 個答案）
    rarity: u8,             // 0-3 稀有度
    timestamp: u64,
    question_hash: vector<u8>
}
```

**稀有度機率：**

| 稀有度 | 值 | 機率 |
|--------|-----|------|
| Common | 0 | 35% |
| Rare | 1 | 30% |
| Epic | 2 | 20% |
| Legendary | 3 | 15% |

#### 4. NFT 系統 (`oracle_nft.move`)

將 DrawRecord 鑄造成永久 NFT。

```move
public struct OracleNFT has key, store {
    name: String,
    answer_id: u8,
    rarity: u8,
    image_url: Url,
    timestamp: u64
}

public struct NFTConfig has key {
    base_url: String
}
```

**NFT 圖片格式：**
```
{base_url}{answer_id}.png
例：https://oracle-library.zeabur.app/0.png
```

### 測試

```
contracts/tests/
├── mgc_tests.move           # MGC 代幣測試
├── check_in_tests.move      # 簽到功能測試
├── oracle_draw_tests.move   # 抽取功能測試
├── oracle_nft_tests.move    # NFT 鑄造測試
└── contracts_tests.move     # 整合測試
```

---

## 遊戲經濟學

### 代幣流動

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   簽到       │     │   抽取       │     │   鑄造       │
│  +20/100 MGC │ ──> │  -10 MGC    │ ──> │  -5 MGC     │
│             │     │ +DrawRecord  │     │ +OracleNFT  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 成本與獎勵

| 操作 | MGC 消耗 | 獲得 |
|------|----------|------|
| 首次簽到 | - | 100 MGC |
| 每日簽到 | - | 20 MGC |
| 抽取答案 | 10 MGC | DrawRecord |
| 鑄造 NFT | 5 MGC | OracleNFT |

---

## 快速開始

### 前置需求

- Node.js 18+
- pnpm / npm / yarn
- IOTA CLI（合約部署用）

### 前端開發

```bash
cd frontend

# 安裝依賴
pnpm install

# 開發伺服器
pnpm dev

# 建置
pnpm build

# 測試
pnpm test
```

### 環境變數

在 `frontend/.env` 設定：

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_MGC_TREASURY_ID=0x...
NEXT_PUBLIC_NFT_CONFIG_ID=0x...
```

### 合約部署

```bash
cd contracts

# 編譯
iota move build

# 測試
iota move test

# 部署（需要 IOTA CLI 設定）
iota client publish --gas-budget 100000000
```

---

## 部署資訊

### Testnet (v4)

**Package ID:**
```
0xd8247f0e7713dfb531e28fa9686dcc3689ef1287a440916de958da5860b5de07
```

**共享物件：**

| 名稱 | Object ID |
|------|-----------|
| MGC Treasury | `0x10c4bf72...` |
| NFT Config | `0xa29beb63...` |
| Emergency Recovery | `0xf79612c3...` |

詳細部署資訊請參閱 `deployments/testnet.json`。

---

## 使用者流程

```
1. 連接錢包（MetaMask + IOTA Snap）
        ↓
2. 每日簽到獲取 MGC
        ↓
3. 輸入問題，消耗 10 MGC 抽取答案
        ↓
4. 檢視抽取結果與稀有度
        ↓
5. 決定是否消耗 5 MGC 鑄造 NFT
        ↓
6. 在收藏頁檢視所有 NFT
```

---

## 文件

- [部署指南](docs/deployment-guide.md)
- [UI 設計工作流](docs/ui-design-workflow.md)
- [合約學習系統](docs/contract-learning-system.md)

---

## 授權

MIT License
