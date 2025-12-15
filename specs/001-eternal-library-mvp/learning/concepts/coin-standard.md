# IOTA Coin Standard

> 此文件將在學習過程中自動填充

## 核心概念

### One-Time Witness (OTW)
- 只在模組初始化時創建一次的特殊類型
- 用於證明「這是第一次且唯一一次」
- 確保 Token 的唯一性

```move
// OTW 必須是：
// 1. 與模組同名（大寫）
// 2. 只有 drop ability
// 3. 無欄位
struct MGC has drop {}
```

### TreasuryCap
- Token 的鑄造權限憑證
- 持有者可以 mint 新 Token
- 通常保存為 Shared Object 或由管理者持有

### CoinMetadata
- Token 的元數據（名稱、符號、精度、描述）
- 在初始化時設定，不可更改

## 初始化流程

```move
fun init(witness: MGC, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        0,  // decimals
        b"MGC",  // symbol
        b"Magic Crystal",  // name
        b"...",  // description
        option::none(),  // icon url
        ctx,
    );

    // 保存 treasury（通常 share）
    transfer::share_object(MGCTreasury {
        id: object::new(ctx),
        cap: treasury
    });

    // 凍結 metadata
    transfer::freeze_object(metadata);
}
```

## 專案中的應用

<!-- 學習過程中自動填充 -->

### MGC Token
- **精度**: 0（整數）
- **用途**: 應用內計點
- **特殊規則**: 不可交易（soulbound 概念）

## Mint 和 Burn

### Mint（鑄造）
```move
public(friend) fun mint(
    treasury: &mut MGCTreasury,
    amount: u64,
    ctx: &mut TxContext
): Coin<MGC> {
    coin::mint(&mut treasury.cap, amount, ctx)
}
```

### Burn（銷毀）
```move
public(friend) fun burn(
    treasury: &mut MGCTreasury,
    coin: Coin<MGC>
): u64 {
    coin::burn(&mut treasury.cap, coin)
}
```

## 常見陷阱

1. **OTW 重用**: OTW 只能使用一次，用完即銷毀
2. **TreasuryCap 洩露**: 不要讓任何人都能 mint
3. **精度計算**: 注意 decimals 對數量的影響

## 延伸閱讀

- [IOTA Coin Standard](https://docs.iota.org/)
