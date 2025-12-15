# Move Object Model

> 此文件將在學習過程中自動填充

## 核心概念

### UID (Unique Identifier)
- 每個 Object 都有唯一的 UID
- UID 在創建時自動生成，不可更改
- 用於識別和追蹤 Object

### Ownership 類型

| 類型 | 說明 | 使用場景 |
|------|------|----------|
| **Owned** | 屬於特定地址 | 使用者資產（NFT、Token） |
| **Shared** | 所有人可訪問 | 全域配置、公共資源 |
| **Immutable** | 凍結，不可更改 | 常量配置 |

### 範例

```move
// Owned Object
struct MyNFT has key, store {
    id: UID,
    name: String,
}

// Shared Object
struct GlobalConfig has key {
    id: UID,
    admin: address,
}
```

## 專案中的應用

<!-- 學習過程中自動填充 -->

## 常見陷阱

1. **忘記 UID**: 每個 `has key` 的 struct 必須有 `id: UID` 作為第一個欄位
2. **Shared vs Owned 混淆**: Shared Object 需要特別小心並發訪問

## 延伸閱讀

- [IOTA Object Model](https://docs.iota.org/)
