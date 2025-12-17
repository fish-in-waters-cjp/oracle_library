# 學習報告：AdminCap 管理員發幣功能實作

**執行日期**: 2025-12-18
**學習模式**: 完整學習模式
**狀態**: 已完成

---

## 摘要統計

| 指標 | 數值 |
|------|------|
| 完成任務數 | 5 |
| 修改檔案數 | 2 |
| 學習概念數 | 4 |
| 新增測試數 | 3 |
| 安全檢查通過 | ✅ |

---

## 學習內容

### 1. Capability Pattern（能力模式）

#### 1.1 什麼是 Capability Pattern？

Capability Pattern 是 Move 語言中最重要的權限控制設計模式之一。它使用一個特殊的「能力物件」（Capability Object）來代表某種權限，只有持有該物件的地址才能執行特定操作。

**核心概念**：
```
權限 = 物件的擁有權
誰擁有 Capability 物件，誰就擁有對應的權限
```

#### 1.2 為什麼不用傳統的「管理員地址」？

❌ **傳統方式（不推薦）**：
```move
// 不安全：硬編碼管理員地址
const ADMIN: address = @0x123...;

public entry fun admin_mint(..., ctx: &mut TxContext) {
    assert!(tx_context::sender(ctx) == ADMIN, E_NOT_ADMIN);
    // ...
}
```

問題：
- 地址寫死無法更換
- 多管理員需要維護列表
- 無法安全地轉移管理權限

✅ **Capability Pattern（推薦）**：
```move
// 安全：使用 Capability 物件
public struct AdminCap has key, store {
    id: UID,
}

public entry fun admin_mint(
    _admin_cap: &AdminCap,  // 只需傳入 Capability
    // ...
) {
    // 能執行到這裡，代表調用者一定擁有 AdminCap
}
```

優點：
- 權限可轉移
- 支持多管理員（創建多個 AdminCap）
- 權限可被銷毀
- Move 編譯器自動驗證

#### 1.3 專案中的應用

在 `mgc.move` 中，我們實作了：

```move
/// 管理員權限憑證 - 只有持有者可以直接 mint MGC
public struct AdminCap has key, store {
    id: UID,
}
```

---

### 2. Ability System（能力系統）

#### 2.1 四種 Ability 詳解

Move 語言有四種 Ability，決定了值可以做什麼：

| Ability | 說明 | 用途 |
|---------|------|------|
| `key` | 可作為全局儲存的鍵 | 讓 struct 成為 Object，可以存在鏈上 |
| `store` | 可存放在其他結構體中 | 允許嵌套存儲、跨模組轉移 |
| `copy` | 可被複製 | 通常用於純數據，不用於資產 |
| `drop` | 可被丟棄 | 允許自動銷毀，不用於重要資產 |

#### 2.2 AdminCap 的 Ability 選擇

```move
public struct AdminCap has key, store {
    id: UID,
}
```

- ✅ `key`: 讓 AdminCap 成為鏈上物件，有唯一 ID
- ✅ `store`: 允許使用 `public_transfer` 轉移給其他地址
- ❌ `copy`: **不能複製**，否則權限可被無限複製
- ❌ `drop`: **不能丟棄**，防止意外失去權限

#### 2.3 為什麼 AdminCap 需要 `store`？

```move
// 有 store：可以使用 public_transfer
public entry fun transfer_admin_cap(admin_cap: AdminCap, new_admin: address) {
    transfer::transfer(admin_cap, new_admin);  // ✅ 可以轉移
}

// 如果沒有 store：只能在模組內部轉移
// transfer::transfer(admin_cap, new_admin);  // ❌ 編譯錯誤
```

---

### 3. Init Function 與 One-Time Witness

#### 3.1 Init 函數的特殊性

`init` 函數是 Move 模組的初始化函數，具有以下特性：

1. **只執行一次**：在模組部署時自動調用
2. **不能手動調用**：沒有人可以再次調用它
3. **創建初始物件**：適合創建 Capability、Treasury 等

```move
fun init(witness: MGC, ctx: &mut TxContext) {
    // 創建 Treasury（共享物件）
    let treasury = MGCTreasury { /* ... */ };
    transfer::share_object(treasury);

    // 創建 AdminCap（僅給部署者）
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}
```

#### 3.2 為什麼 AdminCap 在 init 中創建？

```
部署合約
    ↓
init() 自動執行
    ↓
AdminCap 創建並轉移給部署者
    ↓
只有部署者擁有 AdminCap
    ↓
只有部署者可以 admin_mint
```

這確保了：
- AdminCap 的數量可控（部署時創建多少就是多少）
- 初始權限明確歸屬部署者
- 沒有後門可以創建新的 AdminCap

---

### 4. Entry Function 設計

#### 4.1 什麼是 Entry Function？

`entry` 關鍵字標記的函數可以被交易直接調用：

```move
public entry fun admin_mint(
    _admin_cap: &AdminCap,      // 驗證身份
    treasury: &mut MGCTreasury, // 共享物件
    recipient: address,         // 接收者
    amount: u64,                // 數量
    ctx: &mut TxContext
) {
    let coin = coin::mint(&mut treasury.treasury_cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

#### 4.2 參數設計要點

| 參數 | 類型 | 說明 |
|------|------|------|
| `_admin_cap` | `&AdminCap` | 使用引用（`&`）：不消耗，可重複使用 |
| `treasury` | `&mut MGCTreasury` | 可變引用：需要修改 supply |
| `recipient` | `address` | 純值：接收者地址 |
| `amount` | `u64` | 純值：發放數量 |

**為什麼 `_admin_cap` 用 `&` 而不是直接傳入？**

```move
// ✅ 使用引用：AdminCap 不會被消耗
public entry fun admin_mint(_admin_cap: &AdminCap, ...) { }

// ❌ 直接傳入：每次調用都會消耗 AdminCap
public entry fun admin_mint(admin_cap: AdminCap, ...) {
    // 需要轉回去，很麻煩
    transfer::transfer(admin_cap, sender);
}
```

---

## 實作步驟詳解

### 步驟 1：新增 AdminCap 結構

**檔案**: `contracts/sources/mgc.move`

```move
// ============ Structs ============

/// 管理員權限憑證 - 只有持有者可以直接 mint MGC
/// 在合約部署時創建並轉移給部署者
public struct AdminCap has key, store {
    id: UID,
}
```

**關鍵點**：
- 放在 Structs 區塊
- 有 `key` 和 `store` 能力
- 包含 `UID` 作為唯一識別

---

### 步驟 2：修改 init 函數

**檔案**: `contracts/sources/mgc.move`

在 `init` 函數的最後加入：

```move
fun init(witness: MGC, ctx: &mut TxContext) {
    // ... 原有的 Treasury 創建代碼 ...

    // 創建 AdminCap 並轉移給部署者
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}
```

**關鍵點**：
- 使用 `object::new(ctx)` 創建唯一 ID
- 使用 `transfer::transfer` 轉移給部署者
- `tx_context::sender(ctx)` 取得部署者地址

---

### 步驟 3：新增 admin_mint Entry 函數

**檔案**: `contracts/sources/mgc.move`

```move
// ============ Admin Functions ============

/// 管理員直接發幣
///
/// 只有持有 AdminCap 的地址才能調用此函數
/// 用於 Demo 或空投等場景
public entry fun admin_mint(
    _admin_cap: &AdminCap,
    treasury: &mut MGCTreasury,
    recipient: address,
    amount: u64,
    ctx: &mut TxContext
) {
    let coin = coin::mint(&mut treasury.treasury_cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

**關鍵點**：
- `_admin_cap` 前綴 `_` 表示僅用於驗證，不使用其值
- 使用 `coin::mint` 鑄造代幣
- 使用 `transfer::public_transfer` 轉移給接收者

---

### 步驟 4：新增 transfer_admin_cap 函數（可選）

```move
/// 轉移管理員權限給其他地址
public entry fun transfer_admin_cap(
    admin_cap: AdminCap,
    new_admin: address,
) {
    transfer::transfer(admin_cap, new_admin);
}
```

**關鍵點**：
- 直接傳入 `AdminCap`（不是引用），所以會消耗它
- 轉移後原持有者失去權限

---

### 步驟 5：新增測試用 Helper 函數

**檔案**: `contracts/sources/mgc.move`

```move
#[test_only]
/// Create AdminCap for testing
public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
    AdminCap {
        id: object::new(ctx),
    }
}
```

---

### 步驟 6：新增測試案例

**檔案**: `contracts/tests/mgc_tests.move`

```move
#[test]
fun test_admin_mint_to_recipient() {
    let mut scenario = setup_test();

    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
        let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

        // Admin mints 100 MGC to USER1
        mgc::admin_mint(&admin_cap, &mut treasury, USER1, 100, ts::ctx(&mut scenario));
        assert!(mgc::total_supply(&treasury) == 100, 1);

        ts::return_to_sender(&scenario, admin_cap);
        ts::return_shared(treasury);
    };

    // Verify USER1 received the coins
    ts::next_tx(&mut scenario, USER1);
    {
        let coin = ts::take_from_sender<Coin<MGC>>(&scenario);
        assert!(coin::value(&coin) == 100, 2);
        transfer::public_transfer(coin, USER1);
    };

    ts::end(scenario);
}
```

---

## 安全性考量

### 安全檢查清單

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| Capability 不可複製 | ✅ | AdminCap 沒有 `copy` 能力 |
| Capability 不可丟棄 | ✅ | AdminCap 沒有 `drop` 能力 |
| 權限可轉移 | ✅ | 提供 `transfer_admin_cap` 函數 |
| Init 只執行一次 | ✅ | Move 語言保證 |
| 無後門創建權限 | ✅ | 沒有公開的 AdminCap 創建函數 |

### 潛在風險與緩解

1. **AdminCap 遺失**
   - 風險：如果 AdminCap 轉移到無法存取的地址，將永久失去管理權
   - 緩解：謹慎使用 `transfer_admin_cap`

2. **多管理員場景**
   - 風險：目前只有一個 AdminCap
   - 緩解：可以修改 init 創建多個，或新增 `create_admin_cap` 函數（需謹慎設計權限）

---

## 部署與使用指南

### 1. 部署合約

```bash
cd contracts
iota client publish --gas-budget 100000000
```

記錄輸出中的：
- `PACKAGE_ID`
- `ADMIN_CAP_ID`
- `MGC_TREASURY_ID`

### 2. 發幣給指定地址

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function admin_mint \
  --args <ADMIN_CAP_ID> <MGC_TREASURY_ID> <RECIPIENT_ADDRESS> <AMOUNT> \
  --gas-budget 10000000
```

### 3. 批量發幣

```bash
iota client ptb \
  --move-call "<PACKAGE_ID>::mgc::admin_mint" \
    "@<ADMIN_CAP_ID>" "@<MGC_TREASURY_ID>" "@<ADDRESS_1>" "u64:500" \
  --move-call "<PACKAGE_ID>::mgc::admin_mint" \
    "@<ADMIN_CAP_ID>" "@<MGC_TREASURY_ID>" "@<ADDRESS_2>" "u64:500" \
  --gas-budget 20000000
```

### 4. 轉移管理權限

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function transfer_admin_cap \
  --args <ADMIN_CAP_ID> <NEW_ADMIN_ADDRESS> \
  --gas-budget 10000000
```

---

## 前端整合範例

### TypeScript SDK

```typescript
import { Transaction } from '@iota/iota-sdk/transactions';

async function adminMint(
  packageId: string,
  adminCapId: string,
  treasuryId: string,
  recipient: string,
  amount: number
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::mgc::admin_mint`,
    arguments: [
      tx.object(adminCapId),       // AdminCap 引用
      tx.object(treasuryId),       // Treasury 引用
      tx.pure.address(recipient),  // 接收者地址
      tx.pure.u64(amount),         // 數量
    ],
  });

  return await signAndExecuteTransaction({ transaction: tx });
}
```

---

## 延伸資源

### 官方文件
- [IOTA Move 文件](https://docs.iota.org/developer/iota-move-ctf/introduction)
- [Move Language Book](https://move-language.github.io/move/)

### 設計模式參考
- [Capability Pattern in Move](https://examples.sui.io/patterns/capability.html)
- [IOTA Move Examples](https://github.com/iotaledger/iota/tree/develop/examples/move)

---

## 下一步建議

1. **立即可做**:
   - 部署到 testnet 進行實際測試
   - 在前端整合 admin_mint 功能

2. **進階學習**:
   - 學習 PTB（Programmable Transaction Block）批量操作
   - 研究多簽管理員模式

3. **功能擴展**:
   - 新增 mint 事件以便追蹤
   - 考慮新增 mint 上限或冷卻時間

---

*報告生成時間: 2025-12-18*
