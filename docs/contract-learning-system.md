# 合約學習輔助系統

本文件說明如何使用 spec-kit 的合約學習輔助系統，在執行 Move 智能合約開發任務時同時學習相關概念。

## 功能概覽

當執行 `/speckit.implement` 時，系統會自動偵測合約相關任務，並提供：

1. **執行前教學** - 在每個合約任務執行前，解釋相關概念、設計決策、程式碼預覽
2. **執行後報告** - 任務完成後，提供實作摘要、安全檢查、測試建議
3. **學習報告累積** - 即時記錄學習內容到 `specs/[feature]/learning/` 目錄

## 使用方式

### 命令參數

```bash
# 完整學習模式（預設）
/speckit.implement --learn

# 簡潔學習模式 - 僅顯示關鍵概念
/speckit.implement --learn-brief

# 禁用學習模式 - 純執行，無教學內容
/speckit.implement --no-learn

# 匯出完整報告
/speckit.implement --export-report
```

### 互動流程

執行合約任務時：

```
═══════════════════════════════════════════════════════════════
📚 學習時刻：[任務名稱]
═══════════════════════════════════════════════════════════════

## 核心概念
[概念解釋]

## 設計決策
[為什麼要這樣設計]

## 程式碼預覽
[即將實作的程式碼結構]

## 常見陷阱
- ⚠️ [需要避免的錯誤]
═══════════════════════════════════════════════════════════════
準備好了嗎？請選擇：
- [yes] 理解了，繼續執行
- [skip] 跳過教學，直接執行
- [explain more] 需要更詳細的解說
═══════════════════════════════════════════════════════════════
```

## 學習報告結構

```
specs/001-eternal-library-mvp/learning/
├── index.md                           # 總索引
├── session-[timestamp].md             # 每次執行的學習報告
├── concepts/                          # 概念庫
│   ├── move-object-model.md           # Object Model 概念
│   ├── ability-system.md              # Ability System
│   ├── coin-standard.md               # Coin Standard
│   └── security-checklist.md          # 安全檢查清單
└── modules/                           # 模組學習筆記
    ├── mgc-learning.md                # MGC Token
    ├── check-in-learning.md           # 簽到模組
    ├── oracle-draw-learning.md        # 抽取模組
    └── oracle-nft-learning.md         # NFT 模組
```

## 教學領域

### Move 語言基礎
- **Object Model**: UID, ownership, shared objects, immutable objects
- **Ability System**: copy, drop, key, store
- **Module System**: public, public(friend), entry functions

### 安全性考量
- **權限控制**: friend modules, capability pattern
- **資產安全**: preventing accidental burns, ownership checks
- **常見漏洞**: reentrancy, integer overflow, front-running

### 設計模式
- **Token 設計**: Coin Standard, TreasuryCap, One-Time Witness
- **NFT 模式**: Display Standard, metadata
- **狀態管理**: shared vs owned objects

## 概念映射表

系統會根據任務內容自動判斷需要教學的概念：

| Module | 核心概念 | 安全議題 |
|--------|----------|----------|
| mgc.move | Coin Standard, TreasuryCap, OTW | 權限控制, 總量管理 |
| check_in.move | Entry Functions, Events, Time | 時間操控, 重複呼叫 |
| oracle_draw.move | Object Ownership, Coin Transfer | 隨機公平性, 資產安全 |
| oracle_nft.move | Display Standard, Destruction | NFT 安全, Metadata |

## 相關檔案

- **Agent 配置**: `.claude/agents/contract-tutor.md`
- **命令定義**: `.claude/commands/speckit.implement.md`
- **報告模板**: `.specify/templates/learning-report-template.md`

## 延伸學習資源

- [IOTA Move 官方文件](https://docs.iota.org/developer/iota-move-ctf/introduction)
- [Move Language Book](https://move-language.github.io/move/)
- [IOTA Move Examples](https://github.com/iotaledger/iota/tree/develop/examples/move)
