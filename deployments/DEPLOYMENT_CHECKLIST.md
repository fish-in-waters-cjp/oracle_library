# 部署檢查清單

## 最新部署記錄

**網路**: testnet
**部署時間**: 2025-12-18 (v3)
**部署者**: `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594`
**Transaction Digest**: `J7mRdSc8aHxFbwQkD2gCC6s2e5Xz358inemqZDLzidGv`

### 合約版本
- 首次簽到獎勵: 100 MGC（新用戶禮包）
- 每日簽到獎勵: 20 MGC
- `update_base_url` 管理員函數（用於更新 NFT 圖片 URL）
- **新增 v3**: `rarity` 現在存入 DrawRecord 鏈上（安全性改進）

---

## 部署前準備

- [x] 確認錢包有足夠的 IOTA 支付 gas
- [x] 確認使用正確的錢包（管理員錢包）
- [x] 確認網路設定正確（testnet）

## 部署指令

```bash
# 1. 切換到 testnet
iota client switch --env testnet

# 2. 確認錢包餘額
iota client gas

# 3. 切換到合約目錄
cd contracts

# 4. 編譯合約
iota move build

# 5. 部署（替換 gas-budget 視需求調整）
iota client publish --gas-budget 100000000
```

## 部署後記錄

### 基本資訊

| 項目 | 值 |
|------|-----|
| Network | testnet |
| 部署時間 | 2025-12-18 (v3) |
| 部署者地址 | `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594` |
| Transaction Digest | `J7mRdSc8aHxFbwQkD2gCC6s2e5Xz358inemqZDLzidGv` |

### Package

| 項目 | Object ID |
|------|-----------|
| **Package ID** | `0xbcf99ecd98c9af2bd31b7977a6c218d860caef638533b60b906c237b63a44782` |

### Shared Objects

| 項目 | Object ID |
|------|-----------|
| **MGCTreasury** | `0xd939413ef61db7b3510d7680c06e0b80719994bebe57af9d9998dd9417002f9b` |
| **NFTConfig** | `0x2ac2ed3327c46cc88bce8c24ceee3f18584b027758fc1cf89f6ad582b9951803` |
| EmergencyRecovery | `0x24a1361c1baf5479364a69f80a94c482aebba87ea3a4960638eaebd8b06600c8` |

### Admin Objects（部署者擁有）

| 項目 | Object ID |
|------|-----------|
| **AdminCap** | `0x300fcb0f491c25bdcd1c02ab634ad19ede568fa07d1114f64c02d161838af5ca` |
| Publisher | `0xbe818dde3f088ae74760bebb9be257b29670b1fb46cb84a220de98e200472167` |
| Display | `0xb138f8faaadef8ad6ce031af7d7396682360b0f16587a8ea4416a8cd4726d59a` |

### Immutable Objects

| 項目 | Object ID |
|------|-----------|
| CoinMetadata | `0xc33a0f357fee5b8fc6d7e294f36e16604dbe2231bb3d03569505c4b6b6ad5cc6` |

---

## 前端設定

部署完成後，在 `frontend/.env.local` 設定：

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xbcf99ecd98c9af2bd31b7977a6c218d860caef638533b60b906c237b63a44782
NEXT_PUBLIC_MGC_TREASURY_ID=0xd939413ef61db7b3510d7680c06e0b80719994bebe57af9d9998dd9417002f9b
NEXT_PUBLIC_NFT_CONFIG_ID=0x2ac2ed3327c46cc88bce8c24ceee3f18584b027758fc1cf89f6ad582b9951803
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 更新 NFT 圖片 Base URL

部署後可使用以下指令更新 NFT 圖片的 base URL：

```bash
iota client call \
  --package 0xbcf99ecd98c9af2bd31b7977a6c218d860caef638533b60b906c237b63a44782 \
  --module oracle_nft \
  --function update_base_url \
  --args \
    0x300fcb0f491c25bdcd1c02ab634ad19ede568fa07d1114f64c02d161838af5ca \
    0x2ac2ed3327c46cc88bce8c24ceee3f18584b027758fc1cf89f6ad582b9951803 \
    "https://your-domain.com/nft-images/" \
  --gas-budget 10000000
```

---

## 驗證部署

- [ ] 前端可以正常連接合約
- [ ] 簽到功能正常（首次 100 MGC，每日 20 MGC）
- [ ] 抽籤功能正常（rarity 存入 DrawRecord）
- [ ] NFT 鑄造功能正常（rarity 從 DrawRecord 取得）
- [ ] AdminCap 可以執行 admin_mint
- [ ] update_base_url 可以更新 NFT 圖片路徑

---

## 安全提醒

- [x] AdminCap Object ID 已安全記錄
- [x] 部署者錢包已妥善保管
- [x] 部署記錄已備份（testnet.json）

---

## Explorer 連結

- [Transaction](https://explorer.iota.org/testnet/txblock/J7mRdSc8aHxFbwQkD2gCC6s2e5Xz358inemqZDLzidGv)
- [Package](https://explorer.iota.org/testnet/object/0xbcf99ecd98c9af2bd31b7977a6c218d860caef638533b60b906c237b63a44782)
- [MGCTreasury](https://explorer.iota.org/testnet/object/0xd939413ef61db7b3510d7680c06e0b80719994bebe57af9d9998dd9417002f9b)
