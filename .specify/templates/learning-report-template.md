# 學習報告：{{FEATURE_NAME}}

**Session ID**: {{SESSION_ID}}
**執行日期**: {{DATE}}
**學習模式**: {{LEARNING_MODE}}
**狀態**: {{STATUS}}

---

## 摘要統計

| 指標 | 數值 |
|------|------|
| 完成任務數 | {{TOTAL_TASKS}} |
| 合約任務數 | {{CONTRACT_TASKS}} |
| 學習概念數 | {{CONCEPTS_COUNT}} |
| 安全檢查通過 | {{SECURITY_PASS}} |
| 安全警告數 | {{SECURITY_WARN}} |

---

## 學習內容

### 1. Move 語言基礎

#### 1.1 Object Model
<!-- 自動填充：如果任務涉及 struct has key -->
- **什麼是 Object？**
- **UID 的作用**
- **專案中的應用**

#### 1.2 Ownership 模型
<!-- 自動填充：如果任務涉及 transfer -->
- **Owned vs Shared**
- **專案中的決策**

#### 1.3 Ability System
<!-- 自動填充：如果任務涉及 has key, store, copy, drop -->
- **四種 Ability**
- **專案中的應用**

---

### 2. 安全性考量

#### 2.1 權限控制
<!-- 自動填充：如果任務涉及 public(friend) -->
- **Friend Module 模式**
- **潛在風險**

#### 2.2 資產安全
<!-- 自動填充：如果任務涉及 Coin, burn, transfer -->
- **Coin 銷毀**
- **NFT 所有權**

---

### 3. 設計模式

#### 3.1 Token 設計
<!-- 自動填充：如果涉及 mgc.move -->
- **Coin vs Custom Token**
- **Treasury 模式**

#### 3.2 事件系統
<!-- 自動填充：如果涉及 event::emit -->
- **Event 設計**
- **前端查詢**

---

### 4. 測試與驗證

#### 4.1 單元測試
- **測試範例**
- **測試重點**

#### 4.2 整合測試建議
- **端到端流程**
- **手動驗證步驟**

---

## 任務執行記錄

<!-- 以下為每個合約任務的詳細記錄 -->

### {{TASK_ID}}: {{TASK_NAME}}

**執行時間**: {{TASK_TIMESTAMP}}

#### 執行前教學
- **核心概念**: {{PRE_CONCEPTS}}
- **設計決策**: {{PRE_DECISIONS}}
- **常見陷阱**: {{PRE_PITFALLS}}

#### 執行結果
- **狀態**: {{TASK_STATUS}}
- **修改檔案**: {{FILES_MODIFIED}}

#### 執行後複習
- **概念強化**: {{POST_CONCEPTS}}
- **安全檢查**:
  | 檢查項目 | 狀態 | 說明 |
  |----------|------|------|
  | {{CHECK_ITEM}} | {{CHECK_STATUS}} | {{CHECK_NOTE}} |
- **測試建議**: {{TEST_SUGGESTIONS}}

---

## 延伸資源

### 官方文件
- [IOTA Move 文件](https://docs.iota.org/developer/iota-move-ctf/introduction)
- [Move Language Book](https://move-language.github.io/move/)

### 範例專案
- [IOTA Move Examples](https://github.com/iotaledger/iota/tree/develop/examples/move)

### 進階主題
- VRF 隨機數
- 跨模組呼叫優化
- Gas 優化技巧

---

## 下一步建議

1. **立即可做**:
   - {{NEXT_IMMEDIATE}}

2. **進階學習**:
   - {{NEXT_ADVANCED}}

3. **社群資源**:
   - {{NEXT_COMMUNITY}}

---

*報告生成時間: {{GENERATED_AT}}*
