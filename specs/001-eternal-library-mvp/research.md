# 技術研究報告：永恆圖書館 MVP

**功能分支**：`001-eternal-library-mvp`
**研究日期**：2025-12-15
**狀態**：完成

## 研究摘要

本報告針對永恆圖書館 MVP 的技術實作進行研究，主要參考 IOTA Move Workshop 2025 的範例專案，確定前端和智能合約的技術選型與實作模式。

## 技術決策

### 1. 區塊鏈平台

**決定**：IOTA Testnet（Move 語言）

**理由**：
- 使用者指定的目標平台
- Gas 費用接近零，適合高頻互動（每日簽到）
- Move 語言提供資源導向的安全模型

**替代方案評估**：
- Sui：Move 相容但生態不同
- EVM 鏈：Solidity 語言，Gas 費用較高

### 2. 前端框架

**決定**：Next.js 16 + React 19 + TypeScript

**理由**：
- 參考專案使用的技術棧
- App Router 提供良好的路由管理
- SSR/SSG 支援有助於 SEO 和首屏載入
- TypeScript 提供型別安全

**主要依賴**：
```json
{
  "@iota/dapp-kit": "^0.8.0",
  "@iota/iota-sdk": "^1.9.0",
  "@tanstack/react-query": "^5.90.12",
  "next": "16.0.7",
  "react": "19.2.0",
  "tailwindcss": "^4"
}
```

### 3. 錢包整合

**決定**：@iota/dapp-kit

**理由**：
- IOTA 官方提供的 React 整合套件
- 內建 `WalletProvider`、`ConnectModal`、`useCurrentAccount` 等 hooks
- 支援自動重連（`autoConnect`）

**關鍵元件**：
```tsx
// providers.tsx 結構
<QueryClientProvider>
  <IotaClientProvider networks={networks} defaultNetwork="testnet">
    <WalletProvider theme={darkTheme} autoConnect>
      {children}
    </WalletProvider>
  </IotaClientProvider>
</QueryClientProvider>
```

**主要 hooks**：
- `useCurrentAccount()` - 取得當前帳號
- `useCurrentWallet()` - 取得錢包狀態
- `useDisconnectWallet()` - 斷開連接
- `useSignAndExecuteTransaction()` - 簽署並執行交易
- `useIotaClient()` - 取得 IOTA 客戶端
- `useIotaClientQuery()` - 查詢鏈上資料
- `useIotaClientInfiniteQuery()` - 分頁查詢

### 4. Move 合約結構

**決定**：多模組設計

**模組規劃**：
```
oracle_library/
├── sources/
│   ├── mgc.move              # MGC Token (Coin 標準)
│   ├── check_in.move         # 每日簽到
│   ├── oracle_draw.move      # 抽取解答
│   └── oracle_nft.move       # NFT 鑄造
└── Move.toml
```

**理由**：
- 關注點分離，便於維護
- 符合 SOLID 單一職責原則
- 參考專案採用類似結構

### 5. Token 實作（MGC）

**決定**：使用 IOTA Coin 標準

**理由**：
- 參考 `coin_example.move` 的實作模式
- `TreasuryCap` 控制 mint/burn 權限
- 與 IOTA 生態系統相容

**關鍵程式碼模式**：
```move
module oracle_library::mgc;

use iota::coin::{Self, TreasuryCap, Coin};

public struct MGC has drop {}

fun init(witness: MGC, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency(
        witness,
        0,  // decimals = 0（整數代幣）
        b"MGC",
        b"Wisdom Shards",
        b"In-app currency for The Eternal Library",
        option::none(),
        ctx
    );
    // treasury_cap 由合約持有或共享
}
```

### 6. NFT 實作

**決定**：使用 IOTA Object 模型 + Display 標準

**理由**：
- 參考 `nft_example.move` 的實作模式
- `Display` 標準讓 NFT 在瀏覽器正確顯示
- `has key, store` 能力允許轉移和存儲

**關鍵程式碼模式**：
```move
module oracle_library::oracle_nft;

use iota::display;
use iota::url::{Self, Url};

public struct OracleNFT has key, store {
    id: UID,
    name: string::String,
    image_url: Url,
    // ... 其他欄位
}

public struct ORACLE_NFT has drop {}

fun init(otw: ORACLE_NFT, ctx: &mut TxContext) {
    let publisher = iota::package::claim(otw, ctx);
    let mut display = display::new<OracleNFT>(&publisher, ctx);
    display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
    display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
    display::update_version(&mut display);
    // transfer publisher and display
}
```

### 7. 鏈上查詢

**決定**：使用 `useIotaClientQuery` 和 `useIotaClientInfiniteQuery`

**查詢 Token 餘額**：
```typescript
const { data } = useIotaClientQuery(
  "getAllBalances",
  { owner: address },
  { refetchInterval: 15000, enabled: !!address }
);
```

**查詢使用者物件（NFT/DrawRecord）**：
```typescript
const { data } = useIotaClientInfiniteQuery(
  "getOwnedObjects",
  {
    owner: address,
    options: { showType: true, showContent: true },
    filter: {
      MatchAny: [
        { StructType: `${PACKAGE_ID}::oracle_nft::OracleNFT` },
        { StructType: `${PACKAGE_ID}::oracle_draw::DrawRecord` },
      ],
    },
  },
  { enabled: !!address }
);
```

### 8. 交易執行

**決定**：使用 `Transaction` 類別 + `useSignAndExecuteTransaction`

**關鍵程式碼模式**：
```typescript
import { Transaction } from "@iota/iota-sdk/transactions";
import { useSignAndExecuteTransaction, useIotaClient } from "@iota/dapp-kit";

const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
const client = useIotaClient();

async function executeTransaction() {
  const tx = new Transaction();

  // 準備支付代幣
  const [coin] = tx.splitCoins(tx.object(coinObjectId), [amount]);

  // 呼叫 Move 函數
  tx.moveCall({
    target: `${PACKAGE_ID}::module::function`,
    arguments: [tx.object("0x6"), coin],
  });

  const result = await signAndExecute({ transaction: tx });
  await client.waitForTransaction({ digest: result.digest });
}
```

### 9. 事件查詢（連續簽到計算）

**決定**：使用 `queryEvents` API

**理由**：
- 連續簽到天數不存在合約中，從 Event Log 計算
- 減少合約狀態存儲成本
- 前端計算邏輯更靈活

**實作模式**：
```typescript
const events = await client.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::check_in::CheckInEvent`,
  },
  order: 'descending',
  limit: 100,
});
```

### 10. 專案結構

**決定**：Monorepo（前端 + 合約）

**理由**：
- 前端與合約緊密關聯
- 便於統一版本管理
- 參考專案採用單一 repo

**目錄結構**：
```
oracle_library/
├── frontend/                 # Next.js 前端
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/
├── contracts/                # Move 合約
│   ├── sources/
│   ├── tests/
│   └── Move.toml
├── specs/                    # 規格文件
└── package.json
```

## 風險與緩解

### 風險 1：IOTA Testnet 不穩定

**緩解**：
- 前端實作 Optimistic UI
- 錯誤處理顯示友善訊息
- 考慮加入重試機制

### 風險 2：IPFS 載入緩慢

**緩解**：
- 使用骨架屏過渡
- 考慮多個 IPFS Gateway 備援
- 圖片最佳化（壓縮、適當尺寸）

### 風險 3：前端隨機不夠公平

**緩解**：
- 使用 `crypto.getRandomValues()`
- 此為休閒遊戲非高價值場景
- MVP 後可考慮 VRF 方案

## 參考資源

1. **IOTA Move Workshop 2025**
   - 路徑：`/Documents/github-projects/IOTA-move-workshop-2025/`
   - Lesson-3：Coin 和 NFT 範例
   - Lesson-6：完整 dApp 範例

2. **@iota/dapp-kit 文件**
   - Provider 設定
   - Hooks 使用方式
   - 交易執行模式

3. **IOTA Move 文件**
   - Object 模型
   - Coin 標準
   - Display 標準

## 結論

技術研究確認所有 NEEDS CLARIFICATION 項目已解決。專案將採用：

- **前端**：Next.js 16 + React 19 + @iota/dapp-kit
- **合約**：IOTA Move（多模組設計）
- **狀態管理**：TanStack Query（@iota/dapp-kit 內建）
- **樣式**：Tailwind CSS 4

下一步：進入 Phase 1 產生 data-model.md 和 contracts/。
