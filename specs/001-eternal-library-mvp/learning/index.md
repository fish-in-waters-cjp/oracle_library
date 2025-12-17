# 永恆圖書館 MVP - 學習資源索引

本目錄包含在實作過程中產生的學習報告和概念文件。

## 目錄結構

```
learning/
├── index.md                    # 本索引檔案
├── session-*.md                # 每次執行的學習報告
├── concepts/                   # 概念庫（可複用）
│   ├── move-object-model.md    # Object Model 概念
│   ├── coin-standard.md        # Coin 標準
│   ├── ability-system.md       # Ability 系統
│   └── security-checklist.md   # 安全檢查清單
└── modules/                    # 模組專屬學習
    ├── mgc-learning.md         # MGC Token 學習筆記
    ├── check-in-learning.md    # 簽到模組學習筆記
    ├── oracle-draw-learning.md # 抽取模組學習筆記
    └── oracle-nft-learning.md  # NFT 模組學習筆記
```

## 學習報告列表

| Session | 日期 | 狀態 | 學習概念數 | 完成任務 |
|---------|------|------|------------|----------|
| [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md) | 2025-12-17 | ✅ 完成 | 15+ | US3 & US4 前端整合 |
| [Developer A Session](developer-a-session-20251217.md) | 2025-12-17 | ✅ 完成 | 10 | 4 個合約任務 |
| [Phase 0 Session](phase0-session-20251216.md) | 2025-12-16 | ⏳ 進行中 | 5+ | 前端基礎設施 |

## 概念庫

### Move 語言基礎
- [ ] [Object Model](concepts/move-object-model.md)
- [ ] [Ability System](concepts/ability-system.md)
- [ ] [Coin Standard](concepts/coin-standard.md)

### 安全性
- [ ] [Security Checklist](concepts/security-checklist.md)

## 模組學習進度

| 模組 | 學習狀態 | 核心概念 | 學習報告 |
|------|----------|----------|----------|
| mgc.move | ✅ 已完成 | Coin Standard, TreasuryCap, OTW | [Developer A Session](developer-a-session-20251217.md#t007t008---mgc-token-模組) |
| check_in.move | ✅ 已完成 | Entry Functions, Events, Time | [Developer A Session](developer-a-session-20251217.md#t037t042---check_in-模組) |
| oracle_draw.move | ✅ 已整合 | Object Ownership, Coin Transfer | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#四區塊鏈整合) |
| oracle_nft.move | ✅ 已整合 | Display Standard, Destruction | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#41-usemintnft-hook) |

## 前端整合學習進度

| 功能模組 | 學習狀態 | 核心概念 | 學習報告 |
|---------|----------|----------|----------|
| React + Phaser 整合 | ✅ 已完成 | EventBridge, Scene Lifecycle | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#21-react--phaser-整合架構) |
| Optimistic UI | ✅ 已完成 | State Management, UX Design | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#23-optimistic-ui-模式) |
| Transaction Building | ✅ 已完成 | Coin Splitting, Object Parsing | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#41-usemintnft-hook) |
| Animation Systems | ✅ 已完成 | Framer Motion, Flying Numbers | [Frontend US3 & US4 Session](frontend-us3-us4-session-20251217.md#34-flyingnumber---飛行數字動畫) |

## 使用方式

1. 執行 `/speckit.implement --learn` 開始學習導向的實作
2. 每個合約任務執行前會顯示教學內容
3. 執行後會顯示安全檢查和測試建議
4. 完成後查看此目錄的學習報告

## 延伸學習資源

- [IOTA Move 官方文件](https://docs.iota.org/developer/iota-move-ctf/introduction)
- [Move Language Book](https://move-language.github.io/move/)
- [IOTA Move Examples](https://github.com/iotaledger/iota/tree/develop/examples/move)
