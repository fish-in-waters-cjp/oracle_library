# IOTA Localnet 測試指南與學習報告

## 目錄

1. [概述](#概述)
2. [IOTA Localnet 介紹](#iota-localnet-介紹)
3. [環境準備](#環境準備)
4. [Localnet 啟動步驟](#localnet-啟動步驟)
5. [MGC Token 合約部署](#mgc-token-合約部署)
6. [合約功能測試](#合約功能測試)
7. [MGC Token 合約架構分析](#mgc-token-合約架構分析)
8. [Move 語言核心概念](#move-語言核心概念)
9. [安全性最佳實踐](#安全性最佳實踐)
10. [常見問題與解決方案](#常見問題與解決方案)
11. [延伸學習資源](#延伸學習資源)

---

## 概述

本報告提供 IOTA Localnet 的完整設置指南，並以永恆圖書館專案的 MGC Token 合約為範例，說明如何在本地測試環境中部署和測試 Move 智能合約。

**專案資訊：**
- **專案名稱**: Oracle Library (永恆圖書館)
- **合約路徑**: `contracts/`
- **主要模組**: `mgc.move` - MGC Token (Wisdom Shards / 智慧碎片)
- **測試狀態**: 6/6 單元測試全部通過

---

## IOTA Localnet 介紹

### 什麼是 Localnet？

IOTA Localnet 是一個完全在本地運行的 IOTA 區塊鏈網路，適合開發和測試用途。它具有以下特點：

| 特性 | 說明 |
|------|------|
| **完全隔離** | 不與主網或測試網連接 |
| **快速重置** | 可隨時重新生成全新狀態 |
| **內建水龍頭** | 提供無限測試代幣 |
| **低延遲** | 本地執行，交易確認極快 |
| **完整功能** | 支援所有 IOTA 功能 |

### Localnet vs 其他網路

| 網路 | 用途 | 代幣價值 | 持久性 |
|------|------|---------|--------|
| **Localnet** | 開發測試 | 無 | 可重置 |
| **Devnet** | 早期測試 | 無 | 定期重置 |
| **Testnet** | 整合測試 | 無 | 相對穩定 |
| **Mainnet** | 生產環境 | 有 | 永久 |

---

## 環境準備

### 1. 安裝 IOTA CLI

確保已安裝 IOTA CLI 工具。可通過以下命令確認：

```bash
iota --version
```

若未安裝，請參考 [IOTA 安裝指南](https://docs.iota.org/developer/getting-started/install-iota)。

### 2. 確認 Move 專案結構

```
contracts/
├── Move.toml          # 專案配置檔
├── sources/
│   └── mgc.move       # MGC Token 合約
└── tests/
    └── mgc_tests.move # 測試檔案
```

### 3. 編譯合約

```bash
cd contracts
iota move build
```

預期輸出：
```
UPDATING GIT DEPENDENCY https://github.com/iotaledger/iota.git
INCLUDING DEPENDENCY Iota
INCLUDING DEPENDENCY MoveStdlib
BUILDING oracle_library
```

### 4. 執行單元測試

```bash
iota move test
```

預期輸出：
```
Running Move unit tests
[ PASS    ] oracle_library::mgc_tests::test_burn_decreases_supply
[ PASS    ] oracle_library::mgc_tests::test_init_creates_treasury
[ PASS    ] oracle_library::mgc_tests::test_mint_and_burn_cycle
[ PASS    ] oracle_library::mgc_tests::test_mint_increases_supply
[ PASS    ] oracle_library::mgc_tests::test_multiple_mints
[ PASS    ] oracle_library::mgc_tests::test_total_supply_query
Test result: OK. Total tests: 6; passed: 6; failed: 0
```

---

## Localnet 啟動步驟

### 步驟 1：啟動 Localnet

**基本啟動（每次重新生成）：**
```bash
RUST_LOG="off,iota_node=info" iota start --force-regenesis --with-faucet
```

**持久化模式（保留數據）：**
```bash
iota start --network.config persisted-localnet --with-faucet --committee-size 2 --epoch-duration-ms 60000
```

**參數說明：**
| 參數 | 說明 |
|------|------|
| `--force-regenesis` | 強制重新生成創世區塊 |
| `--with-faucet` | 啟動內建水龍頭服務 |
| `--committee-size 2` | 驗證者數量 |
| `--epoch-duration-ms` | 紀元持續時間（毫秒） |

### 步驟 2：開啟新終端機，配置客戶端

```bash
# 建立本地環境配置
iota client new-env --alias local --rpc http://127.0.0.1:9000

# 切換到本地環境
iota client switch --env local

# 確認當前環境
iota client active-env
# 輸出: local

# 查看活躍地址
iota client active-address
```

### 步驟 3：獲取測試代幣

```bash
# 從水龍頭請求代幣
iota client faucet

# 等待約 10-30 秒，然後查看餘額
iota client gas
```

預期輸出：
```
╭────────────────────────────────────────────────────────────────────────────╮
│ gasCoinId                                                 | gasBalance     │
├────────────────────────────────────────────────────────────────────────────┤
│ 0x1234...abcd                                             | 10000000000    │
╰────────────────────────────────────────────────────────────────────────────╯
```

---

## MGC Token 合約部署

### 步驟 1：部署合約

```bash
cd contracts

iota client publish . --gas-budget 100000000
```

### 步驟 2：記錄部署結果

部署成功後會輸出重要資訊：

```
----- Transaction Digest -----
<TRANSACTION_DIGEST>

----- Object Changes -----
Created Objects:
  - ObjectID: 0x<PACKAGE_ID>      # 套件 ID
    ObjectType: package

  - ObjectID: 0x<TREASURY_ID>     # MGCTreasury 共享物件
    ObjectType: 0x<PACKAGE_ID>::mgc::MGCTreasury

  - ObjectID: 0x<METADATA_ID>     # CoinMetadata (已凍結)
    ObjectType: 0x2::coin::CoinMetadata<0x<PACKAGE_ID>::mgc::MGC>
```

**重要**：請記錄以下 ID，後續測試需要使用：
- `PACKAGE_ID`: 部署的套件 ID
- `TREASURY_ID`: MGCTreasury 共享物件 ID

### 步驟 3：設定環境變數（方便後續操作）

```bash
export PACKAGE_ID="0x<your_package_id>"
export TREASURY_ID="0x<your_treasury_id>"
```

---

## 合約功能測試

### 1. 查詢 MGCTreasury 物件

```bash
iota client object $TREASURY_ID
```

### 2. 查詢總供應量

由於 `total_supply` 是 `public fun`（非 entry），我們需要通過 PTB (Programmable Transaction Block) 來呼叫：

```bash
iota client ptb \
  --move-call "${PACKAGE_ID}::mgc::total_supply" @${TREASURY_ID} \
  --gas-budget 10000000
```

### 3. 測試 Mint 功能（注意：public(package) 限制）

`mint` 函數被標記為 `public(package)`，這意味著它只能被同一 package 內的其他模組呼叫，無法直接從外部呼叫。這是設計上的安全機制。

**為了測試目的，可以新增一個 entry function：**

```move
// 僅供測試使用，生產環境應移除或加上權限控制
#[test_only]
public entry fun mint_to_sender(
    treasury: &mut MGCTreasury,
    amount: u64,
    ctx: &mut TxContext
) {
    let coin = mint(treasury, amount, ctx);
    transfer::public_transfer(coin, tx_context::sender(ctx));
}
```

### 4. 查詢帳戶擁有的物件

```bash
iota client objects
```

### 5. 查詢特定類型的物件

```bash
iota client objects --type ${PACKAGE_ID}::mgc::MGC
```

---

## MGC Token 合約架構分析

### 完整合約結構

```
mgc.move
├── Structs
│   ├── MGC (One-Time Witness)
│   └── MGCTreasury (包裝 TreasuryCap)
├── Init Function
│   └── init() - 初始化代幣
├── Package Functions
│   ├── mint() - 鑄造代幣
│   └── burn() - 銷毀代幣
├── Public Functions
│   └── total_supply() - 查詢總供應量
└── Test-Only Functions
    ├── init_for_testing()
    ├── mint_for_testing()
    └── burn_for_testing()
```

### 合約程式碼詳解

**檔案位置**: `contracts/sources/mgc.move`

```move
module oracle_library::mgc {
    use iota::coin::{Self, TreasuryCap, Coin};
    use iota::url;

    // ============ Structs ============

    /// One-Time Witness for MGC token
    public struct MGC has drop {}

    /// Treasury that wraps the TreasuryCap for controlled minting/burning
    public struct MGCTreasury has key {
        id: UID,
        treasury_cap: TreasuryCap<MGC>,
    }

    // ============ Init Function ============

    fun init(witness: MGC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            0,  // decimals - MGC is indivisible
            b"MGC",
            b"Wisdom Shards",
            b"Magical currency earned through daily check-ins...",
            option::some(url::new_unsafe_from_bytes(b"https://ipfs.io/ipfs/QmMGCIcon")),
            ctx
        );

        transfer::public_freeze_object(metadata);

        let treasury = MGCTreasury {
            id: object::new(ctx),
            treasury_cap,
        };
        transfer::share_object(treasury);
    }

    // ============ Package Functions ============

    public(package) fun mint(...): Coin<MGC> { ... }
    public(package) fun burn(...): u64 { ... }

    // ============ Public Functions ============

    public fun total_supply(treasury: &MGCTreasury): u64 { ... }
}
```

---

## Move 語言核心概念

### 1. One-Time Witness (OTW) 模式

```move
public struct MGC has drop {}
```

**概念解析：**

One-Time Witness 是 IOTA Move 中建立代幣的關鍵機制。它確保：

| 特性 | 說明 |
|------|------|
| **唯一性** | 模組名稱與結構名稱相同（大寫），系統自動生成唯一實例 |
| **一次性** | 只有 `drop` ability，使用後自動銷毀 |
| **不可複製** | 沒有 `copy` ability，無法複製 |
| **不可儲存** | 沒有 `store` ability，無法保存 |

**為什麼需要 OTW？**

- 確保代幣創建只能在模組初始化時執行一次
- 防止偽造相同類型的代幣
- 是 IOTA Coin Standard 的強制要求

### 2. Ability System（能力系統）

Move 使用四種 abilities 來控制類型的行為：

| Ability | 說明 | MGC 使用 |
|---------|------|----------|
| `copy` | 可以複製值 | MGC struct: 無 |
| `drop` | 可以丟棄值（不需顯式銷毀） | MGC struct: 有 |
| `key` | 可以作為物件存在於全局儲存 | MGCTreasury: 有 |
| `store` | 可以儲存在其他物件中 | MGCTreasury: 無 |

**MGC 合約中的應用：**

```move
// OTW: 只有 drop，用完即棄
public struct MGC has drop {}

// Treasury: 只有 key，可作為物件但不可轉移到其他物件內部
public struct MGCTreasury has key {
    id: UID,
    treasury_cap: TreasuryCap<MGC>,
}
```

### 3. TreasuryCap 與 Coin 標準

IOTA 的 Coin 標準提供：

```move
// 創建新幣種
let (treasury_cap, metadata) = coin::create_currency<T>(
    witness,      // OTW
    decimals,     // 小數位數
    symbol,       // 符號
    name,         // 名稱
    description,  // 描述
    icon_url,     // 圖標 URL
    ctx
);
```

**TreasuryCap 的重要性：**

- 持有 `TreasuryCap<T>` 者才能 mint/burn 該代幣
- 通常由合約控制，不直接交給用戶
- MGC 將其包裝在 `MGCTreasury` 中作為共享物件

### 4. 物件所有權模型

IOTA 有三種物件類型：

| 類型 | 建立方式 | 存取方式 | 適用場景 |
|------|----------|----------|----------|
| **Owned** | `transfer::transfer` | 只有擁有者可用 | NFT、個人資產 |
| **Shared** | `transfer::share_object` | 任何人可用（需可變借用） | 流動池、公共金庫 |
| **Immutable** | `transfer::freeze_object` | 任何人可讀（不可變） | 元數據、配置 |

**MGC 的應用：**

```move
// Metadata 設為不可變（凍結）
transfer::public_freeze_object(metadata);

// Treasury 設為共享物件
transfer::share_object(treasury);
```

### 5. 函數可見性

```move
// 私有函數：只能在模組內呼叫
fun init(...) { ... }

// Package 函數：同一 package 內的模組可呼叫
public(package) fun mint(...) { ... }

// 公開函數：任何人可呼叫（但不能作為交易入口）
public fun total_supply(...) { ... }

// Entry 函數：可作為交易入口點
public entry fun some_entry_function(...) { ... }
```

### 6. TxContext（交易上下文）

```move
public(package) fun mint(
    treasury: &mut MGCTreasury,
    amount: u64,
    ctx: &mut TxContext  // 交易上下文
): Coin<MGC>
```

**TxContext 提供：**
- `tx_context::sender(ctx)` - 交易發送者地址
- `tx_context::epoch(ctx)` - 當前紀元
- `object::new(ctx)` - 建立新物件 UID

---

## 安全性最佳實踐

### 1. MGC 合約安全性檢查

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| **權限控制** | 良好 | `mint/burn` 使用 `public(package)` 限制存取 |
| **OTW 驗證** | 良好 | 正確實作 One-Time Witness 模式 |
| **Metadata 保護** | 良好 | 已凍結，無法被修改 |
| **Treasury 管理** | 良好 | 作為共享物件，但 mint/burn 需透過 package 函數 |
| **總供應量追蹤** | 良好 | 透過 TreasuryCap 自動追蹤 |

### 2. 設計決策分析

**為什麼將 TreasuryCap 包裝在 MGCTreasury 中？**

```move
public struct MGCTreasury has key {
    id: UID,
    treasury_cap: TreasuryCap<MGC>,
}
```

優點：
- **集中控制**：所有 mint/burn 操作必須經過 package 函數
- **可擴展性**：未來可以在 MGCTreasury 中加入更多欄位（如管理員列表）
- **共享存取**：作為 shared object，多個模組可以使用

替代方案：
- 直接將 TreasuryCap 轉移給管理員地址（較不安全）
- 將 TreasuryCap 設為不可變（無法 mint/burn）

### 3. 常見安全陷阱

| 陷阱 | 說明 | MGC 對策 |
|------|------|----------|
| **無限鑄造** | 任何人可呼叫 mint | 使用 `public(package)` 限制 |
| **代幣偽造** | 創建相同符號的假幣 | OTW 確保唯一性 |
| **權限洩漏** | TreasuryCap 被轉移給攻擊者 | 包裝在共享物件中，無 store ability |
| **重入攻擊** | 遞迴呼叫導致狀態不一致 | Move 的借用機制自動防護 |

### 4. 生產環境建議

```move
// 建議：加入管理員檢查
public struct MGCTreasury has key {
    id: UID,
    treasury_cap: TreasuryCap<MGC>,
    admin: address,  // 新增：管理員地址
}

// 建議：鑄造時驗證權限
public entry fun admin_mint(
    treasury: &mut MGCTreasury,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    assert!(tx_context::sender(ctx) == treasury.admin, E_NOT_ADMIN);
    let coin = mint(treasury, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

---

## 常見問題與解決方案

### Q1: 啟動 Localnet 時出現 port 被佔用

**錯誤訊息：**
```
Error: Address already in use (os error 48)
```

**解決方案：**
```bash
# 查找佔用 9000 port 的程序
lsof -i :9000

# 終止程序
kill -9 <PID>

# 或使用不同 port
iota start --network.config persisted-localnet --rpc.port 9001 --with-faucet
```

### Q2: 水龍頭請求失敗

**錯誤訊息：**
```
Error: Faucet service is not running
```

**解決方案：**
確保啟動 localnet 時包含 `--with-faucet` 參數：
```bash
iota start --force-regenesis --with-faucet
```

### Q3: 部署時 gas 不足

**錯誤訊息：**
```
Error: Insufficient gas
```

**解決方案：**
```bash
# 增加 gas budget
iota client publish . --gas-budget 500000000

# 或先獲取更多測試代幣
iota client faucet
```

### Q4: 找不到共享物件

**錯誤訊息：**
```
Error: Could not find shared object
```

**解決方案：**
```bash
# 查詢所有共享物件
iota client objects

# 確認物件類型
iota client object <OBJECT_ID>
```

### Q5: 環境切換問題

```bash
# 查看所有環境
iota client envs

# 切換到指定環境
iota client switch --env local

# 確認當前環境
iota client active-env
```

---

## 延伸學習資源

### 官方文檔

- [IOTA 本地開發指南](https://docs.iota.org/developer/getting-started/local-network)
- [IOTA CLI 參考](https://docs.iota.org/developer/references/cli/client)
- [Move 語言入門](https://docs.iota.org/developer/getting-started/build-test)
- [連接 IOTA 網路](https://docs.iota.org/developer/getting-started/connect)

### 教學資源

- [Getting Started with IOTA MoveVM - Medium](https://medium.com/@zizicrypt/getting-started-with-iota-movevm-a-beginners-guide-to-your-first-smart-contract-32e96bd51733)
- [How to Deploy Smart Contracts on IOTA - LogRocket](https://blog.logrocket.com/how-deploy-smart-contracts-iota/)

### 下一步學習

1. **實作 check_in.move** - 每日簽到模組
2. **實作 oracle_draw.move** - 抽籤模組
3. **實作 oracle_nft.move** - NFT 模組
4. **整合測試** - 多模組交互測試
5. **部署到 Testnet** - 在公開測試網驗證

---

## 附錄：完整命令速查表

### Localnet 管理

```bash
# 啟動 localnet
iota start --force-regenesis --with-faucet

# 持久化啟動
iota start --network.config persisted-localnet --with-faucet

# 停止 localnet
Ctrl+C
```

### 客戶端配置

```bash
# 新增環境
iota client new-env --alias local --rpc http://127.0.0.1:9000

# 切換環境
iota client switch --env local

# 查看環境
iota client envs

# 查看地址
iota client active-address

# 獲取代幣
iota client faucet

# 查看餘額
iota client gas
```

### 合約開發

```bash
# 編譯
iota move build

# 測試
iota move test

# 部署
iota client publish . --gas-budget 100000000

# 查詢物件
iota client objects
iota client object <OBJECT_ID>
```

---

**報告生成時間**：2025-12-16
**合約版本**：0.1.0
**IOTA Framework**：mainnet branch

---

## 學習報告摘要

本報告涵蓋了從零開始在 IOTA Localnet 上部署和測試 Move 智能合約的完整流程，特別針對永恆圖書館專案的 MGC Token 合約進行深入分析。

**核心學習重點：**

1. **Localnet 環境搭建** - 理解本地測試網路的優勢與使用方式
2. **Move 語言基礎** - One-Time Witness、Ability System、物件模型
3. **合約部署流程** - 從編譯到部署的完整步驟
4. **安全性考量** - 權限控制、代幣安全、最佳實踐
5. **實戰經驗** - 常見問題的解決方案

透過本指南，開發者可以快速上手 IOTA Move 開發，並建立安全、高效的智能合約應用。
