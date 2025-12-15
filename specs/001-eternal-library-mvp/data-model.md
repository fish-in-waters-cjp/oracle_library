# 資料模型：永恆圖書館 MVP

**功能分支**：`001-eternal-library-mvp`
**建立日期**：2025-12-15
**狀態**：完成

## 概述

本文件定義永恆圖書館 MVP 的資料模型，包含 Move 合約的 Object 結構和前端的 TypeScript 型別定義。

## Move Object 模型

### 1. MGC Token（智慧碎片）

```move
module oracle_library::mgc {
    /// One-Time Witness
    public struct MGC has drop {}

    /// Treasury 管理 MGC 的 mint/burn
    public struct MGCTreasury has key {
        id: UID,
        cap: TreasuryCap<MGC>,
    }
}
```

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `UID` | Object 唯一識別碼 |
| `cap` | `TreasuryCap<MGC>` | 鑄造權限控制 |

**Token 規格**：
- 名稱：Wisdom Shards
- 符號：MGC
- 精度：0（無小數）
- 用途：應用內積分

---

### 2. UserCheckInRecord（使用者簽到記錄）

```move
module oracle_library::check_in {
    /// 使用者簽到記錄（每個使用者一個）
    public struct UserCheckInRecord has key, store {
        id: UID,
        owner: address,
        last_check_in_day: u64,  // UTC+8 日期編號
        total_check_ins: u64,
    }

    /// 簽到事件
    public struct CheckInEvent has copy, drop {
        user: address,
        timestamp: u64,
        day_number: u64,
    }
}
```

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `id` | `UID` | Object 唯一識別碼 | - |
| `owner` | `address` | 擁有者地址 | 不可變更 |
| `last_check_in_day` | `u64` | 上次簽到的 UTC+8 日期編號 | 必須 < 今天 |
| `total_check_ins` | `u64` | 累積簽到次數 | 單調遞增 |

**日期編號計算**：
```
day_number = (timestamp + 28800) / 86400
// 28800 = 8 * 3600 (UTC+8 offset)
// 86400 = 24 * 3600 (seconds per day)
```

**狀態轉換**：
```
[不存在] --first_check_in--> [存在, last_check_in_day = 今天]
[存在] --check_in--> [last_check_in_day = 今天, total + 1]
```

---

### 3. DrawRecord（抽取記錄）

```move
module oracle_library::oracle_draw {
    /// 抽取記錄（鑄造 NFT 時銷毀）
    public struct DrawRecord has key, store {
        id: UID,
        owner: address,
        answer_id: u8,           // 0-49
        question_hash: vector<u8>,
        timestamp: u64,
    }

    /// 抽取事件
    public struct DrawEvent has copy, drop {
        user: address,
        draw_record_id: address,
        answer_id: u8,
        timestamp: u64,
    }
}
```

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `id` | `UID` | Object 唯一識別碼 | - |
| `owner` | `address` | 擁有者地址 | 不可變更 |
| `answer_id` | `u8` | 答案編號 | 0-49 |
| `question_hash` | `vector<u8>` | 問題 hash（隱私） | 可為空 |
| `timestamp` | `u64` | 抽取時間戳 | 不可變更 |

**生命週期**：
```
[建立] --mint_nft--> [銷毀]
```

---

### 4. OracleNFT（神諭 NFT）

```move
module oracle_library::oracle_nft {
    /// One-Time Witness
    public struct ORACLE_NFT has drop {}

    /// NFT 物件
    public struct OracleNFT has key, store {
        id: UID,
        name: String,           // "Oracle #042"
        description: String,
        image_url: Url,         // IPFS
        metadata_url: Url,      // IPFS
        answer_id: u8,
        rarity: u8,             // 0-3
        drawn_at: u64,
        minted_at: u64,
    }

    /// 鑄造事件
    public struct NFTMintedEvent has copy, drop {
        minter: address,
        nft_id: address,
        answer_id: u8,
        rarity: u8,
        timestamp: u64,
    }
}
```

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `id` | `UID` | Object 唯一識別碼 | - |
| `name` | `String` | NFT 名稱 | 格式：`Oracle #XXX` |
| `description` | `String` | NFT 描述 | 固定文字 |
| `image_url` | `Url` | IPFS 圖片連結 | 有效 URL |
| `metadata_url` | `Url` | IPFS metadata 連結 | 有效 URL |
| `answer_id` | `u8` | 答案編號 | 0-49 |
| `rarity` | `u8` | 稀有度 | 0-3 |
| `drawn_at` | `u64` | 抽取時間 | 不可變更 |
| `minted_at` | `u64` | 鑄造時間 | 不可變更 |

**稀有度對照**：
| 值 | 名稱 | 機率 | 顏色 |
|----|------|------|------|
| 0 | Common | 60% | 灰色 |
| 1 | Rare | 30% | 藍色 |
| 2 | Epic | 8% | 紫色 |
| 3 | Legendary | 2% | 金色 |

---

### 5. NFTConfig（NFT 設定）

```move
module oracle_library::oracle_nft {
    /// NFT 設定（共享物件）
    public struct NFTConfig has key {
        id: UID,
        image_base_url: String,     // IPFS gateway
        metadata_base_url: String,  // IPFS gateway
    }
}
```

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `UID` | Object 唯一識別碼 |
| `image_base_url` | `String` | IPFS 圖片 base URL |
| `metadata_base_url` | `String` | IPFS metadata base URL |

---

## 前端 TypeScript 型別

### 1. 錢包狀態

```typescript
interface WalletState {
  isConnected: boolean;
  address: string | null;
  truncatedAddress: string | null;  // "0x1234...5678"
}
```

### 2. MGC 餘額

```typescript
interface MGCBalance {
  coinType: string;
  balance: bigint;
  displayBalance: string;  // 格式化顯示
}
```

### 3. 簽到狀態

```typescript
interface CheckInState {
  hasRecord: boolean;
  lastCheckInDay: number | null;
  totalCheckIns: number;
  consecutiveDays: number;  // 從 Event 計算
  canCheckIn: boolean;
  nextCheckInTime: Date | null;  // UTC+8 午夜
}

interface CheckInRecord {
  objectId: string;
  owner: string;
  lastCheckInDay: number;
  totalCheckIns: number;
}
```

### 4. 答案資料

```typescript
interface Answer {
  id: number;        // 0-49
  en: string;        // 英文答案
  zh: string;        // 中文答案
  rarity: Rarity;
  category: string;
}

type Rarity = 0 | 1 | 2 | 3;

const RARITY_INFO: Record<Rarity, { name: string; color: string }> = {
  0: { name: 'Common', color: 'gray' },
  1: { name: 'Rare', color: 'blue' },
  2: { name: 'Epic', color: 'purple' },
  3: { name: 'Legendary', color: 'gold' },
};
```

### 5. 抽取記錄

```typescript
interface DrawRecord {
  objectId: string;
  owner: string;
  answerId: number;
  questionHash: string;
  timestamp: number;
  // 前端擴展
  answer?: Answer;
}
```

### 6. NFT

```typescript
interface OracleNFT {
  objectId: string;
  name: string;
  description: string;
  imageUrl: string;
  metadataUrl: string;
  answerId: number;
  rarity: Rarity;
  drawnAt: number;
  mintedAt: number;
  // 從 IPFS metadata 擴展
  answer?: {
    en: string;
    zh: string;
  };
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  answer_en: string;
  answer_zh: string;
}
```

### 7. 收藏統計

```typescript
interface CollectionStats {
  total: number;
  distribution: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}
```

---

## 前端靜態資料

### answers.json 結構

```json
[
  {
    "id": 0,
    "en": "The journey of a thousand miles begins with a single step.",
    "zh": "千里之行，始於足下。",
    "rarity": 0,
    "category": "wisdom"
  },
  {
    "id": 1,
    "en": "When one door closes, another opens.",
    "zh": "當一扇門關閉，另一扇門會開啟。",
    "rarity": 0,
    "category": "hope"
  }
  // ... 共 50 個答案
]
```

**稀有度分配**：
- Common (0): 30 個（id 0-29）
- Rare (1): 15 個（id 30-44）
- Epic (2): 4 個（id 45-48）
- Legendary (3): 1 個（id 49）

---

## 合約常數

```move
// check_in.move
const CHECK_IN_REWARD: u64 = 5;
const SECONDS_PER_DAY: u64 = 86400;
const UTC8_OFFSET: u64 = 28800;

// oracle_draw.move
const DRAW_COST: u64 = 10;
const MAX_ANSWER_ID: u8 = 49;

// oracle_nft.move
const MINT_COST: u64 = 5;
```

---

## 前端常數

```typescript
// consts.ts
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
export const MGC_TREASURY_ID = process.env.NEXT_PUBLIC_MGC_TREASURY_ID!;
export const NFT_CONFIG_ID = process.env.NEXT_PUBLIC_NFT_CONFIG_ID!;

export const CHECK_IN_REWARD = 5;
export const DRAW_COST = 10;
export const MINT_COST = 5;

export const MGC_COIN_TYPE = `${PACKAGE_ID}::mgc::MGC`;
export const CHECK_IN_RECORD_TYPE = `${PACKAGE_ID}::check_in::UserCheckInRecord`;
export const DRAW_RECORD_TYPE = `${PACKAGE_ID}::oracle_draw::DrawRecord`;
export const ORACLE_NFT_TYPE = `${PACKAGE_ID}::oracle_nft::OracleNFT`;
```

---

## 關係圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        使用者錢包                                │
│                       (address)                                 │
└─────────────────────────────────────────────────────────────────┘
          │
          │ 擁有
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Coin<MGC>   │  │UserCheckIn   │  │ DrawRecord   │          │
│  │  (餘額)      │  │  Record      │  │ (未鑄造)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                              │                  │
│                                              │ mint_nft         │
│                                              ▼ (銷毀)           │
│                                      ┌──────────────┐          │
│                                      │  OracleNFT   │          │
│                                      │  (已鑄造)    │          │
│                                      └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
          │
          │ 查詢
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      共享物件                                    │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ MGCTreasury  │  │  NFTConfig   │                            │
│  │ (mint/burn)  │  │ (IPFS URLs)  │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 事件流

### 簽到流程
```
User -> check_in() -> CheckInEvent
                   -> Coin<MGC> minted
```

### 抽取流程
```
User -> draw() -> DrawEvent
              -> Coin<MGC> burned
              -> DrawRecord created
```

### 鑄造流程
```
User -> mint_nft() -> NFTMintedEvent
                   -> Coin<MGC> burned
                   -> DrawRecord destroyed
                   -> OracleNFT created
```
