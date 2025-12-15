# Move 合約安全檢查清單

> 此文件將在學習過程中自動填充

## 部署前必檢項目

### 1. 權限控制

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| [ ] TreasuryCap 保護 | - | mint/burn 權限是否受控 |
| [ ] friend module 限制 | - | public(friend) 是否正確設定 |
| [ ] admin 權限檢查 | - | 管理功能是否有權限驗證 |
| [ ] entry function 暴露 | - | 是否只暴露必要的 entry function |

### 2. 資產安全

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| [ ] Coin 轉移檢查 | - | 轉移前是否驗證餘額 |
| [ ] Object 所有權 | - | 操作前是否驗證擁有者 |
| [ ] 意外 burn 防護 | - | 是否有防止資產丟失的機制 |
| [ ] 重入攻擊防護 | - | 狀態更新是否在轉移前 |

### 3. 輸入驗證

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| [ ] 整數溢位 | - | 計算是否可能溢位 |
| [ ] 零值檢查 | - | 是否處理零值輸入 |
| [ ] 邊界條件 | - | 陣列索引、範圍是否正確 |
| [ ] 類型安全 | - | Generic 類型是否正確約束 |

### 4. 時間相關

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| [ ] 時間戳依賴 | - | 是否對時間戳過度依賴 |
| [ ] 時區處理 | - | 時區轉換是否正確 |
| [ ] 冷卻時間 | - | 重複操作是否有限制 |

### 5. 事件與日誌

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| [ ] 關鍵操作事件 | - | 重要操作是否有 emit event |
| [ ] 事件資訊完整 | - | 事件是否包含足夠資訊 |
| [ ] 敏感資訊 | - | 事件是否洩露敏感資訊 |

## 常見漏洞模式

### 1. 權限提升
```move
// 錯誤：任何人都可以 mint
public entry fun mint_public(...) {
    coin::mint(...)
}

// 正確：限制 mint 權限
public(friend) fun mint(...) {
    coin::mint(...)
}
```

### 2. 重入攻擊
```move
// 錯誤：先轉移後更新狀態
transfer::transfer(coin, recipient);
record.balance = record.balance - amount;

// 正確：先更新狀態後轉移
record.balance = record.balance - amount;
transfer::transfer(coin, recipient);
```

### 3. 整數溢位
```move
// 錯誤：可能溢位
let result = a + b;

// 正確：檢查或使用安全數學
assert!(a <= MAX - b, E_OVERFLOW);
let result = a + b;
```

## 專案特定檢查

### MGC Token
- [ ] mint 只能由 friend module 調用
- [ ] burn 只能由 friend module 調用
- [ ] TreasuryCap 保存在 Shared Object 中

### Check-in
- [ ] 同一天只能簽到一次
- [ ] 時區計算正確（UTC+8）
- [ ] MGC 獎勵數量正確

### Oracle Draw
- [ ] MGC 扣款在記錄創建前
- [ ] 隨機數無法預測
- [ ] 剩餘 MGC 正確退還

### Oracle NFT
- [ ] DrawRecord 在 mint 後銷毀
- [ ] 稀有度設定正確
- [ ] IPFS URL 格式正確

## 審計資源

- [Move Prover](https://github.com/move-language/move/tree/main/language/move-prover)
- [IOTA Security Best Practices](https://docs.iota.org/)
