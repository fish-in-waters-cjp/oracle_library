# 部署檢查清單

## 最新部署記錄

**網路**: testnet
**部署時間**: 2025-12-18 (v2)
**部署者**: `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594`
**Transaction Digest**: `2LsbnoPNbTyw7ULPfn5gbiVFXsSKKjZ8LDgeShN6hbNo`

### 合約版本
- 首次簽到獎勵: 100 MGC（新用戶禮包）
- 每日簽到獎勵: 20 MGC
- **新增**: `update_base_url` 管理員函數（用於更新 NFT 圖片 URL）

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
| 部署時間 | 2025-12-18 (v2) |
| 部署者地址 | `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594` |
| Transaction Digest | `2LsbnoPNbTyw7ULPfn5gbiVFXsSKKjZ8LDgeShN6hbNo` |

### Package

| 項目 | Object ID |
|------|-----------|
| **Package ID** | `0x03d6285ccac25d0e103f63faac598f829ff3d375741012f19faff68289b9b4c4` |

### Shared Objects

| 項目 | Object ID |
|------|-----------|
| **MGCTreasury** | `0xe93e4ead0246195f95d673026f001eafcf68df4a39dd65e1bb362fd77101a72d` |
| **NFTConfig** | `0x8f8032ab8bf7d3c76f34158c413e44c3c654987cf7ec335bb4770532a614685b` |
| EmergencyRecovery | `0x7146ab79c89a524bb4d2cd63dfff90aa5357ea8162bc8902582b7311bed9186f` |

### Admin Objects（部署者擁有）

| 項目 | Object ID |
|------|-----------|
| **AdminCap** | `0x1c465beb5880fc319ce40c4d720b2db3addf8befbc8ffa6014a630250cf617c8` |
| Publisher | `0xcce868e392b36d899d687b84157dca15e236f3444b07a9edef55930ca58fc08c` |
| Display | `0xfae220a354208bf5a739ad66547e494edacb318dcabdf24a2b1d4f21dc32f3b0` |

### Immutable Objects

| 項目 | Object ID |
|------|-----------|
| CoinMetadata | `0x3ac2775c7f289dbb527b73550f4be6662e90d9d1ecc8e0f27b9e14d6453dfdab` |

---

## 前端設定

部署完成後，在 `frontend/.env.local` 設定：

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x03d6285ccac25d0e103f63faac598f829ff3d375741012f19faff68289b9b4c4
NEXT_PUBLIC_MGC_TREASURY_ID=0xe93e4ead0246195f95d673026f001eafcf68df4a39dd65e1bb362fd77101a72d
NEXT_PUBLIC_NFT_CONFIG_ID=0x8f8032ab8bf7d3c76f34158c413e44c3c654987cf7ec335bb4770532a614685b
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 更新 NFT 圖片 Base URL

部署後可使用以下指令更新 NFT 圖片的 base URL：

```bash
iota client call \
  --package 0x03d6285ccac25d0e103f63faac598f829ff3d375741012f19faff68289b9b4c4 \
  --module oracle_nft \
  --function update_base_url \
  --args \
    0x1c465beb5880fc319ce40c4d720b2db3addf8befbc8ffa6014a630250cf617c8 \
    0x8f8032ab8bf7d3c76f34158c413e44c3c654987cf7ec335bb4770532a614685b \
    "https://your-domain.com/nft-images/" \
  --gas-budget 10000000
```

---

## 驗證部署

- [ ] 前端可以正常連接合約
- [ ] 簽到功能正常（首次 100 MGC，每日 20 MGC）
- [ ] 抽籤功能正常
- [ ] NFT 鑄造功能正常
- [ ] AdminCap 可以執行 admin_mint
- [ ] update_base_url 可以更新 NFT 圖片路徑

---

## 安全提醒

- [x] AdminCap Object ID 已安全記錄
- [x] 部署者錢包已妥善保管
- [x] 部署記錄已備份（testnet.json）

---

## Explorer 連結

- [Transaction](https://explorer.iota.org/testnet/txblock/2LsbnoPNbTyw7ULPfn5gbiVFXsSKKjZ8LDgeShN6hbNo)
- [Package](https://explorer.iota.org/testnet/object/0x03d6285ccac25d0e103f63faac598f829ff3d375741012f19faff68289b9b4c4)
- [MGCTreasury](https://explorer.iota.org/testnet/object/0xe93e4ead0246195f95d673026f001eafcf68df4a39dd65e1bb362fd77101a72d)
