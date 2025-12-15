# 快速入門指南：永恆圖書館 MVP

**功能分支**：`001-eternal-library-mvp`
**建立日期**：2025-12-15
**狀態**：完成

## 前置需求

### 開發環境

- **Node.js**：>= 20.x
- **Bun**：>= 1.0（推薦）或 npm/pnpm
- **IOTA CLI**：>= 1.x（用於 Move 合約部署）
- **Git**：>= 2.x

### 工具安裝

```bash
# 安裝 IOTA CLI
curl -fsSL https://raw.githubusercontent.com/iotaledger/iota/main/scripts/install.sh | bash

# 驗證安裝
iota --version

# 設定 IOTA Testnet
iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe
iota client switch --env testnet
```

### 錢包設定

```bash
# 建立或匯入錢包
iota client new-address ed25519

# 取得 Testnet 代幣
iota client faucet

# 確認餘額
iota client gas
```

---

## 專案設定

### 1. 克隆儲存庫

```bash
git clone <repository-url> oracle_library
cd oracle_library
```

### 2. 專案結構

```
oracle_library/
├── frontend/                 # Next.js 前端
│   ├── app/                  # App Router 頁面
│   ├── components/           # React 元件
│   ├── hooks/                # 自定義 Hooks
│   ├── lib/                  # 工具函數
│   ├── public/               # 靜態資源
│   │   └── data/
│   │       └── answers.json  # 答案資料
│   ├── .env.local            # 環境變數
│   └── package.json
├── contracts/                # Move 合約
│   ├── sources/
│   │   ├── mgc.move
│   │   ├── check_in.move
│   │   ├── oracle_draw.move
│   │   └── oracle_nft.move
│   ├── tests/
│   └── Move.toml
└── specs/                    # 規格文件
```

---

## Move 合約部署

### 1. 進入合約目錄

```bash
cd contracts
```

### 2. 編譯合約

```bash
iota move build
```

### 3. 執行測試

```bash
iota move test
```

### 4. 部署合約

```bash
iota client publish --gas-budget 100000000
```

**輸出範例**：
```
╭───────────────────────────────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                                                 │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                                               │
│  ┌──                                                                                          │
│  │ ObjectID: 0x1234...                                                                        │
│  │ ObjectType: 0x2::package::Publisher                                                        │
│  └──                                                                                          │
│  ┌──                                                                                          │
│  │ ObjectID: 0x5678...                                                                        │
│  │ ObjectType: 0xPACKAGE::mgc::MGCTreasury                                                    │
│  └──                                                                                          │
│  ┌──                                                                                          │
│  │ ObjectID: 0x9abc...                                                                        │
│  │ ObjectType: 0xPACKAGE::oracle_nft::NFTConfig                                               │
│  └──                                                                                          │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ Published Package:                                                                             │
│  PackageID: 0xdef0...                                                                          │
╰───────────────────────────────────────────────────────────────────────────────────────────────╯
```

### 5. 記錄部署資訊

從輸出中記錄以下 ID：

```env
# 複製到 frontend/.env.local
NEXT_PUBLIC_PACKAGE_ID=0xdef0...
NEXT_PUBLIC_MGC_TREASURY_ID=0x5678...
NEXT_PUBLIC_NFT_CONFIG_ID=0x9abc...
NEXT_PUBLIC_NETWORK=testnet
```

---

## 前端開發

### 1. 進入前端目錄

```bash
cd frontend
```

### 2. 安裝依賴

```bash
bun install
# 或
npm install
```

### 3. 設定環境變數

```bash
cp .env.example .env.local
# 編輯 .env.local 填入合約 ID
```

### 4. 啟動開發伺服器

```bash
bun dev
# 或
npm run dev
```

### 5. 開啟瀏覽器

```
http://localhost:3000
```

---

## 測試流程

### 1. 連接錢包

1. 安裝 IOTA Wallet 瀏覽器擴充功能
2. 建立或匯入錢包
3. 切換至 Testnet
4. 點擊「連接錢包」

### 2. 首次簽到

1. 確認錢包已連接
2. 點擊「在訪客簿上簽名」
3. 在錢包中確認交易
4. 等待交易確認
5. 確認獲得 5 MGC

### 3. 抽取解答

1. 確認 MGC ≥ 10
2. 輸入問題
3. 點擊「抽取解答」
4. 觀看抽取動畫
5. 確認答案顯示

### 4. 鑄造 NFT

1. 在抽取結果頁面
2. 確認 MGC ≥ 5
3. 點擊「鑄造 NFT」
4. 在錢包中確認交易
5. 等待交易確認
6. 確認 NFT 鑄造成功

### 5. 查看收藏

1. 點擊導航列「我的收藏」
2. 確認 NFT 顯示在網格中
3. 點擊 NFT 查看詳情

---

## 開發指令

### 前端

```bash
# 開發模式
bun dev

# 建置
bun run build

# 啟動生產伺服器
bun start

# 程式碼檢查
bun run lint

# 型別檢查
bun run type-check
```

### 合約

```bash
# 編譯
iota move build

# 測試
iota move test

# 部署（Testnet）
iota client publish --gas-budget 100000000

# 查詢物件
iota client object <OBJECT_ID>

# 查詢交易
iota client transaction <TX_DIGEST>
```

---

## 常見問題

### Q: 簽到失敗顯示「今天已簽到」

**A**: 簽到以 UTC+8 日曆日計算，請等到 UTC+8 午夜後再試。

### Q: 抽取失敗顯示「MGC 不足」

**A**: 請確認 MGC 餘額 ≥ 10。可透過每日簽到獲得 5 MGC。

### Q: 鑄造 NFT 失敗

**A**:
1. 確認 MGC ≥ 5
2. 確認錢包有足夠 IOTA 支付 Gas
3. 使用 Faucet 取得 Testnet IOTA

### Q: NFT 圖片載入緩慢

**A**: IPFS 載入可能較慢，請等待骨架屏消失。若持續失敗，可能是 IPFS Gateway 問題。

### Q: 連接錢包失敗

**A**:
1. 確認已安裝 IOTA Wallet
2. 確認錢包已解鎖
3. 重新整理頁面

---

## 部署至生產環境

### 1. 建置前端

```bash
cd frontend
bun run build
```

### 2. 部署至 Vercel

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入並部署
vercel
```

### 3. 設定環境變數

在 Vercel Dashboard 設定：
- `NEXT_PUBLIC_PACKAGE_ID`
- `NEXT_PUBLIC_MGC_TREASURY_ID`
- `NEXT_PUBLIC_NFT_CONFIG_ID`
- `NEXT_PUBLIC_NETWORK`

---

## 資源連結

- **IOTA 文件**：https://docs.iota.org/
- **IOTA Move 文件**：https://docs.iota.org/move
- **IOTA Wallet**：https://wallet.iota.org/
- **IOTA Explorer (Testnet)**：https://explorer.iota.org/testnet
- **Testnet Faucet**：https://faucet.iota.org/
