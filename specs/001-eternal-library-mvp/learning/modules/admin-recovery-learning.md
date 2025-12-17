# 學習報告：AdminCap 緊急恢復機制

**Session ID**: admin-recovery-20251218
**執行日期**: 2025-12-18
**學習模式**: 功能實作 + 安全設計
**狀態**: ✅ 完成

---

## 摘要統計

| 指標 | 數值 |
|------|------|
| 完成任務數 | 9 |
| 新增程式碼行數 | 339 |
| 學習概念數 | 5 |
| 新增測試數 | 6 |
| 安全檢查通過 | ✅ |

---

## 學習內容

### 1. Capability 模式進階

#### 1.1 問題背景
- **AdminCap 遺失風險**：如果 AdminCap 轉移到無法存取的地址，將永久失去管理權
- **單點故障**：目前只有一個 AdminCap，無備份機制

#### 1.2 業界最佳實踐

| 方案 | 複雜度 | 適用階段 |
|------|--------|----------|
| 單一 AdminCap + Multi-Sig | 低 | MVP/生產 |
| Timelock 機制 | 中 | 生產 |
| 緊急恢復機制 | 中 | MVP/生產 |
| Role-Based + AdminRegistry | 高 | 企業級 |

#### 1.3 本次選擇
採用**緊急恢復機制**（最小化改動），原因：
- MVP 階段足夠使用
- 不破壞現有功能
- 實作成本低

---

### 2. 時間控制模式

#### 2.1 Clock 物件使用

```move
use iota::clock::{Self, Clock};

// 獲取當前時間戳（毫秒）
let current_time = clock::timestamp_ms(clock);

// 設定冷卻期
recovery.cooldown = current_time + RECOVERY_COOLDOWN_MS;

// 檢查冷卻期
assert!(current_time >= recovery.cooldown, E_COOLDOWN_NOT_PASSED);
```

#### 2.2 Entry 函數中傳入 Clock
```move
public entry fun emergency_create_admin(
    recovery: &mut EmergencyRecovery,
    recipient: address,
    clock: &Clock,  // 以不可變引用傳入，系統 Clock 地址為 0x6
    ctx: &mut TxContext
)
```

#### 2.3 測試中模擬時間

```move
// 創建測試用 Clock
let clock = clock::create_for_testing(ts::ctx(&mut scenario));
clock::share_for_testing(clock);

// 推進時間
clock::increment_for_testing(&mut clock, RECOVERY_COOLDOWN_MS + 1000);

// 設定特定時間
clock::set_for_testing(&mut clock, 0);
```

---

### 3. 共享物件設計

#### 3.1 EmergencyRecovery 結構

```move
public struct EmergencyRecovery has key {
    id: UID,
    recovery_address: address,  // 備份恢復地址
    cooldown: u64,              // 下次可恢復的時間戳
}
```

**設計決策**：
- `has key` 但無 `store`：防止被任意轉移
- 作為共享物件：任何人可讀取，但寫入需權限驗證

#### 3.2 初始化為共享物件

```move
fun init(witness: MGC, ctx: &mut TxContext) {
    // ...
    let recovery = EmergencyRecovery {
        id: object::new(ctx),
        recovery_address: tx_context::sender(ctx),
        cooldown: 0,
    };
    transfer::share_object(recovery);  // 共享，非轉移
}
```

---

### 4. 安全性考量

#### 4.1 權限控制層級

| 操作 | 權限要求 | 說明 |
|------|----------|------|
| `set_recovery_address` | AdminCap | 只有 Admin 可更改備份地址 |
| `emergency_create_admin` | recovery_address | 只有備份地址可恢復 |
| `get_recovery_address` | 無 | 公開查詢 |

#### 4.2 防濫用機制

```move
const RECOVERY_COOLDOWN_MS: u64 = 2592000000;  // 30 天

// 每次恢復後更新冷卻期
recovery.cooldown = current_time + RECOVERY_COOLDOWN_MS;
```

#### 4.3 安全檢查清單

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| 權限驗證 | ✅ | sender 必須為 recovery_address |
| 時間鎖定 | ✅ | 30 天冷卻期防止連續恢復 |
| 錯誤碼定義 | ✅ | E_COOLDOWN_NOT_PASSED, E_NOT_RECOVERY_ADDRESS |
| 測試覆蓋 | ✅ | 正常流程 + 錯誤情況 |

---

### 5. 測試模式

#### 5.1 測試 Clock 的正確用法

```move
#[test]
fun test_emergency_create_admin_after_cooldown_success() {
    let mut scenario = setup_test();

    // 1. 創建 Clock
    ts::next_tx(&mut scenario, ADMIN);
    {
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::share_for_testing(clock);
    };

    // 2. 第一次恢復
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);
        mgc::emergency_create_admin(&mut recovery, USER1, &clock, ts::ctx(&mut scenario));
        ts::return_shared(clock);
        ts::return_shared(recovery);
    };

    // 3. 推進時間（30 天 + 1 秒）
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut clock = ts::take_shared<Clock>(&scenario);
        clock::increment_for_testing(&mut clock, RECOVERY_COOLDOWN_MS + 1000);
        ts::return_shared(clock);
    };

    // 4. 第二次恢復（應成功）
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);
        mgc::emergency_create_admin(&mut recovery, USER2, &clock, ts::ctx(&mut scenario));
        ts::return_shared(clock);
        ts::return_shared(recovery);
    };

    ts::end(scenario);
}
```

#### 5.2 測試預期失敗

```move
#[test]
#[expected_failure(abort_code = mgc::E_NOT_RECOVERY_ADDRESS)]
fun test_emergency_create_admin_wrong_sender_fails() {
    // 非 recovery_address 呼叫應失敗
}

#[test]
#[expected_failure(abort_code = mgc::E_COOLDOWN_NOT_PASSED)]
fun test_emergency_create_admin_cooldown_fails() {
    // 冷卻期內再次恢復應失敗
}
```

---

## 實作記錄

| 任務 | 執行時間 | 狀態 |
|------|----------|------|
| 新增 import 和常數 | 02:50 | ✅ |
| 新增 EmergencyRecovery 結構 | 02:51 | ✅ |
| 修改 init 函數 | 02:51 | ✅ |
| 實作 set_recovery_address | 02:52 | ✅ |
| 實作 emergency_create_admin | 02:52 | ✅ |
| 新增測試用函數 | 02:53 | ✅ |
| 撰寫測試案例 | 02:54 | ✅ |
| 執行測試確認 | 02:55 | ✅ |

---

## 程式碼變更摘要

### mgc.move 新增內容

```move
// 常數
const RECOVERY_COOLDOWN_MS: u64 = 2592000000;  // 30 天
const E_COOLDOWN_NOT_PASSED: u64 = 100;
const E_NOT_RECOVERY_ADDRESS: u64 = 101;

// 結構
public struct EmergencyRecovery has key { ... }

// 函數
public entry fun set_recovery_address(_admin_cap, recovery, new_address)
public entry fun emergency_create_admin(recovery, recipient, clock, ctx)
public fun get_recovery_address(recovery): address
public fun get_recovery_cooldown(recovery): u64

// 測試用
#[test_only]
public fun create_recovery_for_testing(recovery_address, cooldown, ctx)
```

---

## CLI 使用指南

### 設定恢復地址
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function set_recovery_address \
  --args <ADMIN_CAP_ID> <EMERGENCY_RECOVERY_ID> <NEW_RECOVERY_ADDRESS>
```

### 緊急恢復
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function emergency_create_admin \
  --args <EMERGENCY_RECOVERY_ID> <RECIPIENT_ADDRESS> 0x6
```

### 查詢物件
```bash
iota client objects --filter <PACKAGE_ID>::mgc::EmergencyRecovery
```

---

## 延伸學習

### 進階主題
- [ ] Multi-Sig 錢包整合
- [ ] Timelock 轉移機制
- [ ] Role-Based 多管理員設計
- [ ] AdminRegistry 追蹤模式

### 官方文件
- [IOTA Move Clock](https://docs.iota.org/developer/iota-move-ctf/introduction)
- [Move Object Model](https://move-language.github.io/move/)

---

## 下一步建議

1. **立即可做**:
   - 部署後設定 recovery_address 為 Multi-Sig 或冷錢包
   - 在測試網驗證恢復流程

2. **進階學習**:
   - 研究 Timelock 機制實作
   - 學習 Multi-Sig 整合方式

3. **生產準備**:
   - 考慮事件日誌（emit Event）追蹤恢復操作
   - 評估是否需要多管理員機制

---

*報告生成時間: 2025-12-18 02:56*
