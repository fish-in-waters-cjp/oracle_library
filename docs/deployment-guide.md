# IOTA Move 合約部署指南

## 學習報告：部署後需要保存的資訊

### 概述

當 Move 合約部署到 IOTA 網路（testnet/mainnet）時，會產生多種不同類型的物件。理解這些物件的用途與保存方式，對於前後端整合和系統維護至關重要。

---

## 物件類型說明

### 1. Package（套件）

部署合約後獲得的主要識別碼，所有合約函數呼叫都需要這個 ID 作為前綴。

```
${PACKAGE_ID}::module_name::function_name
```

**範例：**
```
0xabc123...::mgc::admin_mint
0xabc123...::check_in::first_check_in
```

---

### 2. Shared Object（共享物件）

任何人都可以存取的物件，通常用於儲存全域狀態。

| 特性 | 說明 |
|------|------|
| 存取權限 | 所有使用者都可讀取/互動 |
| 所有權 | 無特定擁有者 |
| 用途 | 全域狀態、資源池、設定檔 |

**本專案的 Shared Objects：**

| 物件 | 模組 | 用途 |
|------|------|------|
| `MGCTreasury` | `mgc.move` | 包裝 TreasuryCap，控制 MGC 代幣的鑄造與銷毀 |
| `NFTConfig` | `oracle_nft.move` | NFT 鑄造的基本設定（如 base_url） |
| `EmergencyRecovery` | `mgc.move` | 緊急恢復機制，用於 AdminCap 遺失時的恢復 |

---

### 3. Owned Object（擁有物件）

只有特定地址可以使用的物件，通常代表權限或資產。

| 特性 | 說明 |
|------|------|
| 存取權限 | 僅擁有者可使用 |
| 所有權 | 屬於特定錢包地址 |
| 用途 | 權限憑證、個人資產 |

**本專案的 Owned Objects（部署者擁有）：**

| 物件 | 模組 | 用途 |
|------|------|------|
| `AdminCap` | `mgc.move` | 管理員權限，可執行 `admin_mint` 發放代幣 |
| `Publisher` | `oracle_nft.move` | 套件發布者身份，用於建立 Display |
| `Display<OracleNFT>` | `oracle_nft.move` | NFT 顯示模板，定義 NFT 在錢包中的呈現方式 |

---

### 4. Immutable Object（不可變物件）

一旦建立就無法修改的物件。

| 特性 | 說明 |
|------|------|
| 存取權限 | 任何人可讀取 |
| 可修改性 | 永久凍結，無法變更 |
| 用途 | 元資料、常數設定 |

**本專案的 Immutable Objects：**

| 物件 | 模組 | 用途 |
|------|------|------|
| `CoinMetadata<MGC>` | `mgc.move` | MGC 代幣的元資料（名稱、符號、精度等） |

---

## 合約 init 函數分析

### mgc.move

```move
fun init(witness: MGC, ctx: &mut TxContext) {
    // 1. 建立 MGC 代幣
    let (treasury_cap, metadata) = coin::create_currency(...);

    // 2. 凍結元資料（變成 Immutable）
    transfer::public_freeze_object(metadata);

    // 3. 建立 MGCTreasury（Shared Object）
    let treasury = MGCTreasury { ... };
    transfer::share_object(treasury);

    // 4. 建立 AdminCap（轉給部署者）
    let admin_cap = AdminCap { ... };
    transfer::transfer(admin_cap, tx_context::sender(ctx));

    // 5. 建立 EmergencyRecovery（Shared Object）
    let recovery = EmergencyRecovery { ... };
    transfer::share_object(recovery);
}
```

### oracle_nft.move

```move
fun init(otw: ORACLE_NFT, ctx: &mut TxContext) {
    // 1. 建立 Publisher（轉給部署者）
    let publisher = package::claim(otw, ctx);

    // 2. 建立 Display 模板（轉給部署者）
    let mut display = display::new<OracleNFT>(&publisher, ctx);
    // ... 設定顯示欄位
    transfer::public_transfer(display, ctx.sender());

    // 3. 建立 NFTConfig（Shared Object）
    let config = NFTConfig { ... };
    transfer::share_object(config);
}
```

---

## 前端整合需求

### 環境變數配置

前端需要以下環境變數才能正確呼叫合約：

```env
# 網路設定
NEXT_PUBLIC_NETWORK=testnet

# 合約地址
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_MGC_TREASURY_ID=0x...
NEXT_PUBLIC_NFT_CONFIG_ID=0x...

# 其他設定
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 型別字串生成

前端會根據 Package ID 動態生成型別字串：

```typescript
export const MGC_COIN_TYPE = `${PACKAGE_ID}::mgc::MGC`;
export const CHECK_IN_RECORD_TYPE = `${PACKAGE_ID}::check_in::UserCheckInRecord`;
export const DRAW_RECORD_TYPE = `${PACKAGE_ID}::oracle_draw::DrawRecord`;
export const ORACLE_NFT_TYPE = `${PACKAGE_ID}::oracle_nft::OracleNFT`;
```

---

## 物件保存責任歸屬

| 物件 | 保存位置 | 責任人 |
|------|----------|--------|
| Package ID | 前端 `.env` + 部署記錄 | 開發團隊 |
| MGCTreasury | 前端 `.env` + 部署記錄 | 開發團隊 |
| NFTConfig | 前端 `.env` + 部署記錄 | 開發團隊 |
| AdminCap | 部署記錄 + 安全保管 | **管理員（重要！）** |
| EmergencyRecovery | 部署記錄 | 開發團隊 |
| Publisher | 部署記錄 | 管理員 |
| Display | 部署記錄 | 管理員 |
| CoinMetadata | 部署記錄（參考用） | - |

---

## 安全注意事項

### AdminCap 安全

- `AdminCap` 擁有者可以無限制發放 MGC 代幣
- **務必使用硬體錢包或多簽錢包保管**
- 如果遺失，需透過 `EmergencyRecovery` 機制恢復（有 30 天冷卻期）

### 部署者錢包

- 部署時使用的錢包會自動獲得 `AdminCap`、`Publisher`、`Display`
- 建議使用專門的管理員錢包進行部署
- 不要使用日常使用的錢包

---

## 部署指令參考

```bash
# 1. 切換到合約目錄
cd contracts

# 2. 編譯合約
iota move build

# 3. 部署到 testnet
iota client publish --gas-budget 100000000

# 4. 查看部署結果，記錄所有物件 ID
```

---

## 相關檔案

- 部署模板：`deployments/testnet.template.json`
- 前端環境變數範例：`frontend/.env.example`
- 前端常數定義：`frontend/consts.ts`
