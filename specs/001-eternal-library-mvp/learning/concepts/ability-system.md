# Move Ability System

> 此文件將在學習過程中自動填充

## 四種 Ability

| Ability | 說明 | 使用場景 |
|---------|------|----------|
| **key** | 可作為全域儲存的 key | 所有需要存儲的 Object |
| **store** | 可存儲在其他 struct 中 | 可轉移的資產 |
| **copy** | 可複製 | 基本類型、純數據 |
| **drop** | 可丟棄 | 臨時數據、不需追蹤的資源 |

## 常見組合

### `has key`
- 基本 Object，可存儲但不可轉移給其他地址
- 例如：使用者配置

### `has key, store`
- 可轉移的 Object
- 例如：NFT、Token

### `has copy, drop`
- 純數據，無需特別管理
- 例如：事件、臨時計算結果

### `has key, store, drop`
- 可轉移且可銷毀
- 例如：一次性憑證

## 專案中的應用

<!-- 學習過程中自動填充 -->

| Struct | Abilities | 原因 |
|--------|-----------|------|
| `OracleNFT` | key, store | 需要可轉移的 NFT |
| `DrawRecord` | key | 暫存記錄，不需轉移 |
| `MGCTreasury` | key | Shared Object |

## 常見陷阱

1. **缺少 store**: 無法轉移給其他地址
2. **意外的 drop**: 資產可能被意外丟棄
3. **copy 的資產**: 資產不應該有 copy，會導致複製

## 延伸閱讀

- [Move Abilities](https://move-language.github.io/move/abilities.html)
