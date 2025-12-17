# AdminCap 緊急恢復機制使用指南

## 概述

本機制為 MGC 模組的 `AdminCap` 提供緊急恢復功能。當 AdminCap 遺失或轉移到無法存取的地址時，可透過預設的 `recovery_address` 創建新的 AdminCap。

---

## 核心結構

```move
public struct EmergencyRecovery has key {
    id: UID,
    recovery_address: address,  // 備份恢復地址
    cooldown: u64,              // 下次可恢復的時間戳（毫秒）
}
```

---

## 函數說明

### 1. set_recovery_address

設定緊急恢復地址（僅 Admin 可用）

**函數簽名：**
```move
public entry fun set_recovery_address(
    _admin_cap: &AdminCap,
    recovery: &mut EmergencyRecovery,
    new_recovery_address: address,
)
```

**CLI 呼叫：**
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function set_recovery_address \
  --args <ADMIN_CAP_ID> <EMERGENCY_RECOVERY_ID> <NEW_RECOVERY_ADDRESS>
```

---

### 2. emergency_create_admin

緊急創建新的 AdminCap（僅 recovery_address 可用）

**函數簽名：**
```move
public entry fun emergency_create_admin(
    recovery: &mut EmergencyRecovery,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext
)
```

**CLI 呼叫：**
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module mgc \
  --function emergency_create_admin \
  --args <EMERGENCY_RECOVERY_ID> <RECIPIENT_ADDRESS> 0x6
```

**注意：** `0x6` 是系統 Clock 物件的地址。

---

### 3. 查詢函數

```move
// 查詢當前恢復地址
public fun get_recovery_address(recovery: &EmergencyRecovery): address

// 查詢下次可恢復的時間戳
public fun get_recovery_cooldown(recovery: &EmergencyRecovery): u64
```

---

## 錯誤碼

| 錯誤碼 | 常數名稱 | 說明 |
|--------|----------|------|
| `100` | `E_COOLDOWN_NOT_PASSED` | 冷卻期尚未結束（需等待 30 天） |
| `101` | `E_NOT_RECOVERY_ADDRESS` | 呼叫者不是恢復地址 |

---

## 常數

| 常數名稱 | 值 | 說明 |
|----------|-----|------|
| `RECOVERY_COOLDOWN_MS` | `2592000000` | 30 天（毫秒） |

---

## 操作流程

### 場景 A：部署後設定備份地址

```
┌─────────────────────────────────────────────────────┐
│ 1. 部署合約                                          │
│    └─ 自動創建 EmergencyRecovery                     │
│       └─ recovery_address = 部署者                   │
│       └─ cooldown = 0                               │
├─────────────────────────────────────────────────────┤
│ 2. Admin 設定備份地址                                │
│    └─ 呼叫 set_recovery_address()                   │
│       └─ 建議：使用 Multi-Sig 或冷錢包               │
└─────────────────────────────────────────────────────┘
```

### 場景 B：AdminCap 遺失後恢復

```
┌─────────────────────────────────────────────────────┐
│ 1. Recovery Address 呼叫 emergency_create_admin     │
│    └─ 指定 recipient（可以是自己或其他地址）          │
├─────────────────────────────────────────────────────┤
│ 2. 系統檢查                                          │
│    ├─ 驗證呼叫者 == recovery_address                 │
│    └─ 驗證 current_time >= cooldown                 │
├─────────────────────────────────────────────────────┤
│ 3. 執行恢復                                          │
│    ├─ 創建新的 AdminCap                              │
│    ├─ 轉移給 recipient                              │
│    └─ 更新 cooldown = current_time + 30 天          │
├─────────────────────────────────────────────────────┤
│ 4. 後續步驟                                          │
│    └─ 新 Admin 重新設定 recovery_address（建議）     │
└─────────────────────────────────────────────────────┘
```

---

## 查詢物件 ID

部署後，使用以下命令查詢共享物件 ID：

```bash
# 查詢 EmergencyRecovery 物件
iota client objects --filter <PACKAGE_ID>::mgc::EmergencyRecovery

# 查詢 AdminCap 物件
iota client objects --filter <PACKAGE_ID>::mgc::AdminCap
```

---

## 安全設計

| 機制 | 說明 |
|------|------|
| **30 天冷卻期** | 每次恢復後需等待 30 天才能再次恢復，防止濫用 |
| **單一恢復地址** | 只有指定的 `recovery_address` 可以觸發恢復 |
| **可更新恢復地址** | Admin 可隨時更換備份地址 |
| **新舊並存** | 恢復不會銷毀舊的 AdminCap（如果還存在） |

---

## 最佳實踐

### 部署後立即設定備份地址
- 不要使用與主要 Admin 相同的地址
- 建議使用 Multi-Sig 錢包或硬體錢包

### 定期驗證備份地址
- 確認備份地址仍可存取
- 在測試網測試恢復流程

### 恢復後的步驟
- 立即更換 `recovery_address` 為新的備份地址
- 審查是否有未授權的 `admin_mint` 操作

---

## 範例腳本

### 設定恢復地址

```bash
#!/bin/bash
PACKAGE_ID="0x..."
ADMIN_CAP_ID="0x..."
RECOVERY_ID="0x..."
NEW_RECOVERY="0x..."

iota client call \
  --package $PACKAGE_ID \
  --module mgc \
  --function set_recovery_address \
  --args $ADMIN_CAP_ID $RECOVERY_ID $NEW_RECOVERY \
  --gas-budget 10000000
```

### 緊急恢復

```bash
#!/bin/bash
PACKAGE_ID="0x..."
RECOVERY_ID="0x..."
RECIPIENT="0x..."

iota client call \
  --package $PACKAGE_ID \
  --module mgc \
  --function emergency_create_admin \
  --args $RECOVERY_ID $RECIPIENT 0x6 \
  --gas-budget 10000000
```

---

*文件版本: 1.0*
*最後更新: 2025-12-18*
