# 部署檢查清單

## 最新部署記錄

**網路**: testnet
**部署時間**: 2025-12-18
**部署者**: `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594`
**Transaction Digest**: `4ZLG3FLyVUNbkWh2y7GnEBgNgSzyPp1usKeJKdBUoDKb`

### 合約版本
- 首次簽到獎勵: 100 MGC（新用戶禮包）
- 每日簽到獎勵: 20 MGC

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
| 部署時間 | 2025-12-18 |
| 部署者地址 | `0x82e38888fb72afd3bd452cd72e7db77196969b9edb8edc7f4321b0c9b3cf6594` |
| Transaction Digest | `4ZLG3FLyVUNbkWh2y7GnEBgNgSzyPp1usKeJKdBUoDKb` |

### Package

| 項目 | Object ID |
|------|-----------|
| **Package ID** | `0xa6b3c3f1e412013e40ba5970855ec586dbdacfc430128a7e99f9590894cb903c` |

### Shared Objects

| 項目 | Object ID |
|------|-----------|
| **MGCTreasury** | `0x6a417dff4eb7b7a62cf3a42ee1e28062bce87ad41b1b51065f59122801d4066e` |
| **NFTConfig** | `0xc73f87f05b1deadbb2a83a1f3fcadb1bfa5da691e5de4d96dec270f5fc7302a5` |
| EmergencyRecovery | `0xd590036658e91a15bdc77181ba82259b9f85bfe15e0bd8140c49ba272006ecd6` |

### Admin Objects（部署者擁有）

| 項目 | Object ID |
|------|-----------|
| **AdminCap** | `0x902765001e3cfac620e4e7dd9e5c16e53e6198118715db0a903cb4af3bce46e9` |
| Publisher | `0x829c7a4d01e1028f1db76c7c82e1369f018aeb4fb5d2ca984bb78c26664107b0` |
| Display | `0x445774b0ffe70a1f08f319c13031a17323929fe311ccda53155603a3265ea7ab` |

### Immutable Objects

| 項目 | Object ID |
|------|-----------|
| CoinMetadata | `0x90384585589be70a3436b587459c4b738c76abc03a97e2f6b1e846e9f2ab8992` |

---

## 前端設定

部署完成後，在 `frontend/.env.local` 設定：

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xa6b3c3f1e412013e40ba5970855ec586dbdacfc430128a7e99f9590894cb903c
NEXT_PUBLIC_MGC_TREASURY_ID=0x6a417dff4eb7b7a62cf3a42ee1e28062bce87ad41b1b51065f59122801d4066e
NEXT_PUBLIC_NFT_CONFIG_ID=0xc73f87f05b1deadbb2a83a1f3fcadb1bfa5da691e5de4d96dec270f5fc7302a5
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## 驗證部署

- [ ] 前端可以正常連接合約
- [ ] 簽到功能正常（首次 100 MGC，每日 20 MGC）
- [ ] 抽籤功能正常
- [ ] NFT 鑄造功能正常
- [ ] AdminCap 可以執行 admin_mint

---

## 安全提醒

- [x] AdminCap Object ID 已安全記錄
- [x] 部署者錢包已妥善保管
- [x] 部署記錄已備份（testnet.json）

---

## Explorer 連結

- [Transaction](https://explorer.iota.org/testnet/txblock/4ZLG3FLyVUNbkWh2y7GnEBgNgSzyPp1usKeJKdBUoDKb)
- [Package](https://explorer.iota.org/testnet/object/0xa6b3c3f1e412013e40ba5970855ec586dbdacfc430128a7e99f9590894cb903c)
- [MGCTreasury](https://explorer.iota.org/testnet/object/0x6a417dff4eb7b7a62cf3a42ee1e28062bce87ad41b1b51065f59122801d4066e)
