# 部署檢查清單

## 部署前準備

- [ ] 確認錢包有足夠的 IOTA 支付 gas
- [ ] 確認使用正確的錢包（管理員錢包）
- [ ] 確認網路設定正確（testnet/mainnet）

## 部署指令

```bash
# 1. 切換到合約目錄
cd contracts

# 2. 編譯合約
iota move build

# 3. 部署（替換 gas-budget 視需求調整）
iota client publish --gas-budget 100000000
```

## 部署後記錄

從 CLI 輸出中找到以下資訊並填入：

### 基本資訊

| 項目 | 值 |
|------|-----|
| Network | testnet / mainnet |
| 部署時間 | |
| 部署者地址 | |
| Transaction Digest | |

### Package

| 項目 | Object ID |
|------|-----------|
| **Package ID** | `0x` |

### Shared Objects

| 項目 | Object ID |
|------|-----------|
| **MGCTreasury** | `0x` |
| **NFTConfig** | `0x` |
| EmergencyRecovery | `0x` |

### Admin Objects（部署者擁有）

| 項目 | Object ID |
|------|-----------|
| **AdminCap** | `0x` |
| Publisher | `0x` |
| Display | `0x` |

### Immutable Objects

| 項目 | Object ID |
|------|-----------|
| CoinMetadata | `0x` |

---

## 前端設定

部署完成後，在 `frontend/.env.local` 設定：

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x___填入 Package ID___
NEXT_PUBLIC_MGC_TREASURY_ID=0x___填入 MGCTreasury___
NEXT_PUBLIC_NFT_CONFIG_ID=0x___填入 NFTConfig___
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 驗證部署

- [ ] 前端可以正常連接合約
- [ ] 簽到功能正常
- [ ] 抽籤功能正常
- [ ] NFT 鑄造功能正常
- [ ] AdminCap 可以執行 admin_mint

---

## 安全提醒

- [ ] AdminCap Object ID 已安全記錄
- [ ] 部署者錢包已妥善保管
- [ ] 部署記錄已備份
