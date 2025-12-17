# Move 合約 API 規格

**功能分支**：`001-eternal-library-mvp`
**建立日期**：2025-12-15
**狀態**：完成

## 概述

本文件定義永恆圖書館 MVP 的 Move 合約 API，包含所有模組的 entry function 和 public function 規格。

---

## 模組 1：mgc（智慧碎片 Token）

### 初始化

```move
/// 合約部署時自動執行
fun init(witness: MGC, ctx: &mut TxContext)
```

**行為**：
1. 建立 MGC Token 類型
2. 建立 MGCTreasury 共享物件
3. 凍結 CoinMetadata

---

### mint（內部函數）

```move
/// 鑄造 MGC（僅限 friend module）
public(friend) fun mint(
    treasury: &mut MGCTreasury,
    amount: u64,
    ctx: &mut TxContext
): Coin<MGC>
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `treasury` | `&mut MGCTreasury` | Treasury 共享物件 |
| `amount` | `u64` | 鑄造數量 |
| `ctx` | `&mut TxContext` | 交易上下文 |

**回傳**：`Coin<MGC>` - 新鑄造的代幣

**權限**：僅限 `check_in` 模組呼叫

---

### burn（內部函數）

```move
/// 銷毀 MGC（僅限 friend module）
public(friend) fun burn(
    treasury: &mut MGCTreasury,
    coin: Coin<MGC>
)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `treasury` | `&mut MGCTreasury` | Treasury 共享物件 |
| `coin` | `Coin<MGC>` | 要銷毀的代幣 |

**權限**：僅限 `oracle_draw` 和 `oracle_nft` 模組呼叫

---

## 模組 2：check_in（每日簽到）

### first_check_in

```move
/// 首次簽到（建立 UserCheckInRecord）
public entry fun first_check_in(
    mgc_treasury: &mut MGCTreasury,
    ctx: &mut TxContext
)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `mgc_treasury` | `&mut MGCTreasury` | MGC Treasury |
| `ctx` | `&mut TxContext` | 交易上下文 |

**前置條件**：
- 使用者未擁有 UserCheckInRecord

**後置條件**：
- 建立 UserCheckInRecord 並轉移給使用者
- 鑄造 100 MGC 給使用者（新用戶禮包）
- 發出 CheckInEvent

**錯誤碼**：
- `E_ALREADY_HAS_RECORD` (1)：已有簽到記錄

---

### check_in

```move
/// 每日簽到
public entry fun check_in(
    record: &mut UserCheckInRecord,
    mgc_treasury: &mut MGCTreasury,
    ctx: &mut TxContext
)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `record` | `&mut UserCheckInRecord` | 使用者簽到記錄 |
| `mgc_treasury` | `&mut MGCTreasury` | MGC Treasury |
| `ctx` | `&mut TxContext` | 交易上下文 |

**前置條件**：
- 今天（UTC+8）尚未簽到

**後置條件**：
- 更新 last_check_in_day
- 增加 total_check_ins
- 鑄造 20 MGC 給使用者
- 發出 CheckInEvent

**錯誤碼**：
- `E_ALREADY_CHECKED_IN_TODAY` (2)：今天已簽到

---

### 查詢函數

```move
public fun get_last_check_in_day(record: &UserCheckInRecord): u64
public fun get_total_check_ins(record: &UserCheckInRecord): u64
```

---

## 模組 3：oracle_draw（抽取解答）

### draw

```move
/// 抽取解答
public entry fun draw(
    answer_id: u8,
    question_hash: vector<u8>,
    payment: Coin<MGC>,
    mgc_treasury: &mut MGCTreasury,
    ctx: &mut TxContext
)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `answer_id` | `u8` | 答案編號（0-49，前端隨機產生）|
| `question_hash` | `vector<u8>` | 問題 hash（可選）|
| `payment` | `Coin<MGC>` | 支付的 MGC（≥10）|
| `mgc_treasury` | `&mut MGCTreasury` | MGC Treasury |
| `ctx` | `&mut TxContext` | 交易上下文 |

**前置條件**：
- `answer_id` ≤ 49
- `payment` 價值 ≥ 10

**後置條件**：
- 銷毀 10 MGC
- 建立 DrawRecord 並轉移給使用者
- 多餘的 MGC 退還給使用者
- 發出 DrawEvent

**錯誤碼**：
- `E_INVALID_ANSWER_ID` (1)：答案 ID 無效
- `E_INSUFFICIENT_MGC` (2)：MGC 不足

---

### 查詢函數

```move
public fun get_owner(record: &DrawRecord): address
public fun get_answer_id(record: &DrawRecord): u8
public fun get_timestamp(record: &DrawRecord): u64
```

---

### destroy_for_mint（內部函數）

```move
/// 銷毀 DrawRecord 並回傳資料（供 NFT 鑄造使用）
public(friend) fun destroy_for_mint(record: DrawRecord): (u8, u64)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `record` | `DrawRecord` | 抽取記錄（會被銷毀）|

**回傳**：`(answer_id, timestamp)`

**權限**：僅限 `oracle_nft` 模組呼叫

---

## 模組 4：oracle_nft（NFT 鑄造）

### 初始化

```move
/// 合約部署時自動執行
fun init(otw: ORACLE_NFT, ctx: &mut TxContext)
```

**行為**：
1. 建立 Publisher 物件
2. 建立 Display 物件（設定 NFT 顯示模板）
3. 建立 NFTConfig 共享物件

---

### mint

```move
/// 鑄造 NFT（銷毀 DrawRecord）
public entry fun mint(
    record: DrawRecord,
    rarity: u8,
    payment: Coin<MGC>,
    config: &NFTConfig,
    mgc_treasury: &mut MGCTreasury,
    ctx: &mut TxContext
)
```

**參數**：
| 名稱 | 型別 | 說明 |
|------|------|------|
| `record` | `DrawRecord` | 抽取記錄（會被銷毀）|
| `rarity` | `u8` | 稀有度（0-3，前端查表）|
| `payment` | `Coin<MGC>` | 支付的 MGC（≥5）|
| `config` | `&NFTConfig` | NFT 設定 |
| `mgc_treasury` | `&mut MGCTreasury` | MGC Treasury |
| `ctx` | `&mut TxContext` | 交易上下文 |

**前置條件**：
- 呼叫者是 DrawRecord 的擁有者
- `rarity` ≤ 3
- `payment` 價值 ≥ 5

**後置條件**：
- 銷毀 5 MGC
- 銷毀 DrawRecord
- 建立 OracleNFT 並轉移給使用者
- 多餘的 MGC 退還給使用者
- 發出 NFTMintedEvent

**錯誤碼**：
- `E_NOT_OWNER` (1)：非擁有者
- `E_INVALID_RARITY` (2)：稀有度無效
- `E_INSUFFICIENT_MGC` (3)：MGC 不足

---

### 查詢函數

```move
public fun get_name(nft: &OracleNFT): &String
public fun get_answer_id(nft: &OracleNFT): u8
public fun get_rarity(nft: &OracleNFT): u8
public fun get_image_url(nft: &OracleNFT): &Url
public fun get_drawn_at(nft: &OracleNFT): u64
public fun get_minted_at(nft: &OracleNFT): u64
```

---

## 前端交易範例

### 首次簽到

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::check_in::first_check_in`,
  arguments: [
    tx.object(MGC_TREASURY_ID),
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

### 每日簽到

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::check_in::check_in`,
  arguments: [
    tx.object(checkInRecordId),
    tx.object(MGC_TREASURY_ID),
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

### 抽取解答

```typescript
const tx = new Transaction();

// 準備 10 MGC 支付
const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [10]);

tx.moveCall({
  target: `${PACKAGE_ID}::oracle_draw::draw`,
  arguments: [
    tx.pure.u8(answerId),                    // 前端隨機 0-49
    tx.pure.vector('u8', questionHashBytes), // 問題 hash
    paymentCoin,
    tx.object(MGC_TREASURY_ID),
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

### 鑄造 NFT

```typescript
const tx = new Transaction();

// 準備 5 MGC 支付
const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [5]);

tx.moveCall({
  target: `${PACKAGE_ID}::oracle_nft::mint`,
  arguments: [
    tx.object(drawRecordId),
    tx.pure.u8(rarity),  // 從 answers.json 查表
    paymentCoin,
    tx.object(NFT_CONFIG_ID),
    tx.object(MGC_TREASURY_ID),
  ],
});

const result = await signAndExecuteTransaction({
  transaction: tx,
  options: { showObjectChanges: true },
});

// 從結果取得 NFT Object ID
const createdNFT = result.objectChanges?.find(
  (change) => change.type === 'created' &&
              change.objectType.includes('OracleNFT')
);
```

---

## 事件規格

### CheckInEvent

```move
public struct CheckInEvent has copy, drop {
    user: address,
    timestamp: u64,
    day_number: u64,
}
```

**用途**：計算連續簽到天數

---

### DrawEvent

```move
public struct DrawEvent has copy, drop {
    user: address,
    draw_record_id: address,
    answer_id: u8,
    timestamp: u64,
}
```

**用途**：追蹤抽取歷史

---

### NFTMintedEvent

```move
public struct NFTMintedEvent has copy, drop {
    minter: address,
    nft_id: address,
    answer_id: u8,
    rarity: u8,
    timestamp: u64,
}
```

**用途**：追蹤鑄造記錄

---

## 共享物件 ID

部署後需要記錄以下共享物件 ID：

| 物件 | 用途 | 環境變數 |
|------|------|----------|
| MGCTreasury | MGC mint/burn | `NEXT_PUBLIC_MGC_TREASURY_ID` |
| NFTConfig | IPFS URL 設定 | `NEXT_PUBLIC_NFT_CONFIG_ID` |

**Package ID** 儲存於 `NEXT_PUBLIC_PACKAGE_ID`
