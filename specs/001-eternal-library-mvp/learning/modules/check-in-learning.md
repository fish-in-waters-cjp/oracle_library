# Check-in 模組學習筆記

> 此文件將在學習過程中自動填充

## 模組概覽

**檔案**: `contracts/sources/check_in.move`
**用途**: 實作每日簽到功能，使用者可以每天簽到獲得 MGC 獎勵

## 核心概念

### 學習的概念
- [ ] Entry Functions
- [ ] Shared Objects
- [ ] Events (event::emit)
- [ ] Time handling (clock::timestamp_ms)
- [ ] UTC+8 時區計算

### 涉及的安全議題
- [ ] 防止同一天重複簽到
- [ ] 時間操控攻擊防護
- [ ] MGC mint 權限

## 設計決策

### 為什麼用 Event 計算連續天數而不是存在合約？
<!-- 學習過程中填充 -->

### UTC+8 日期計算
```move
// day_number = (timestamp + 28800) / 86400
// 28800 = 8 * 60 * 60 (UTC+8 offset in seconds)
```

### UserCheckInRecord 設計
<!-- 學習過程中填充 -->

## 程式碼解析

### 首次簽到
```move
// 待學習時填充
```

### 後續簽到
```move
// 待學習時填充
```

### 事件設計
```move
// 待學習時填充
```

## 實作記錄

| 任務 ID | 執行時間 | 狀態 |
|---------|----------|------|
| - | - | - |

## 常見問題

<!-- 學習過程中收集的問題和解答 -->

## 延伸學習

- [ ] 理解 Clock Object 的使用
- [ ] 學習 Event 查詢機制
- [ ] 研究時間相關的安全考量
