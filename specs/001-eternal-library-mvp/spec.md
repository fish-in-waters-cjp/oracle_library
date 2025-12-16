# 功能規格書：永恆圖書館 MVP

**功能分支**：`001-eternal-library-mvp`
**建立日期**：2025-12-15
**狀態**：已審閱
**輸入**：產品需求規格書 (PRD) v1.0 MVP
**最後更新**：2025-12-16（技術決策補充遊戲引擎、US4 AC 對齊）

## 技術決策摘要

| 項目 | 決定 |
|------|------|
| 區塊鏈 | IOTA Testnet（Move 語言）|
| 錢包 | IOTA Wallet + @iota/dapp-kit |
| 架構 | 純前端 + 智能合約（無後端）|
| 前端框架 | Next.js 16 + React 19 |
| 遊戲引擎 | Phaser 3（抽卡動畫、慶祝特效，懶載入）|
| UI 動畫 | Framer Motion（一般 UI 動效）|
| Token | MGC（Coin 標準，不可交易）|
| NFT | Move Object with UID |
| 儲存 | On-chain 指標 + IPFS（圖片/metadata）|
| 時區 | UTC+8（簽到日期計算）|
| 隨機 | 前端 `crypto.getRandomValues()` |

## 使用者情境與測試 *(必要)*

### User Story 1 - 錢包連接與身份驗證 (Priority: P1)

身為一位求知者，我希望能夠連接我的 IOTA 錢包，以便在永恆圖書館中建立身份並開始我的旅程。

**為何此優先級**：錢包連接是所有區塊鏈互動的前提，沒有錢包連接，使用者無法進行簽到、抽取或鑄造 NFT 等任何核心功能。

**獨立測試**：可透過成功連接錢包並在介面上顯示錢包地址來完整測試，此功能獨立提供「進入圖書館」的價值。

**技術決策**：
- 錢包：IOTA Wallet（官方錢包）
- 整合：@iota/dapp-kit
- 自動重連：靜默嘗試，失敗不提示
- 連接失敗：僅顯示錯誤訊息，無重試按鈕
- 帳號切換：支援，自動更新狀態
- 連接入口：僅登入頁面顯示

**驗收情境**：

1. **Given** 使用者首次進入永恆圖書館網站，**When** 在登入頁點擊「連接錢包」按鈕，**Then** 系統喚起 IOTA Wallet 連接介面
2. **Given** 使用者在錢包介面確認連接，**When** 連接成功，**Then** 介面顯示使用者錢包地址（格式：`0x1234...5678`）並導航至主頁面
3. **Given** 使用者的錢包已連接，**When** 重新進入網站，**Then** 系統靜默嘗試自動重連，成功則直接進入主頁面，失敗則停留在登入頁
4. **Given** 使用者想要斷開連接，**When** 點擊「斷開連接」，**Then** 錢包連接中斷並返回登入頁面
5. **Given** 錢包連接過程中發生錯誤，**When** 連接失敗，**Then** 顯示通用錯誤訊息「連接失敗，請稍後再試」
6. **Given** 使用者在錢包中切換帳號，**When** 帳號變更，**Then** 前端自動偵測並更新顯示的地址與相關資料

---

### User Story 2 - 每日簽到獲得智慧碎片 (Priority: P1)

身為一位求知者，我希望能夠每天在訪客簿上簽名，以便獲得智慧碎片 (MGC) 用於抽取解答之書。

**為何此優先級**：每日簽到是使用者獲得 MGC 的主要途徑，是整個遊戲經濟循環的起點，直接影響使用者回訪率。

**獨立測試**：可透過完成簽到動作並看到 MGC 餘額增加來完整測試，此功能獨立提供「每日互動」的價值。

**技術決策**：
- 時間制度：UTC+8 日曆日（每日 00:00 UTC+8 重置）
- 連續天數：不存合約，從 Event Log 計算
- 連續獎勵：無（固定 5 MGC）
- 簽到中斷網：顯示錯誤訊息
- 斷線時簽到：中止操作，顯示提示

**驗收情境**：

1. **Given** 使用者錢包已連接且今天（UTC+8）尚未簽到，**When** 點擊「在訪客簿上簽名」按鈕，**Then** 發起鏈上交易，成功後獲得 5 MGC，餘額數字跳動更新並顯示 +5 MGC 動畫
2. **Given** 新使用者第一次簽到，**When** 簽到成功，**Then** 系統建立 UserCheckInRecord 物件並顯示歡迎訊息
3. **Given** 使用者已連續簽到多天，**When** 完成今日簽到，**Then** 前端從 Event Log 計算連續天數並顯示「已連續簽到 X 天」
4. **Given** 使用者今天（UTC+8）已經簽到過，**When** 再次點擊簽到按鈕，**Then** 按鈕為禁用狀態，顯示「今天已經簽到過了」與距離 UTC+8 午夜的倒計時
5. **Given** 簽到交易進行中，**When** 網路發生錯誤，**Then** 顯示錯誤訊息「簽到失敗，請稍後再試」
6. **Given** 使用者正在簽到，**When** 錢包斷線，**Then** 中止操作並顯示「錢包已斷線」

**Move 合約介面**：
```move
module oracle_library::check_in {
    // 首次簽到（建立 UserCheckInRecord）
    public entry fun first_check_in(mgc_treasury: &mut MGCTreasury, ctx: &mut TxContext);

    // 後續簽到
    public entry fun check_in(record: &mut UserCheckInRecord, mgc_treasury: &mut MGCTreasury, ctx: &mut TxContext);

    // 事件
    struct CheckInEvent has copy, drop {
        user: address,
        timestamp: u64,
        day_number: u64,  // UTC+8 日期編號
    }
}
```

---

### User Story 3 - 提問並抽取解答之書 (Priority: P1)

身為一位求知者，我希望能夠提出人生問題並抽取解答之書，以便獲得啟發與指引。

**為何此優先級**：抽取解答之書是產品的核心價值體驗，是使用者消耗 MGC 的主要途徑，直接提供「獲得人生問題解答」的核心價值主張。

**獨立測試**：可透過輸入問題、完成抽取動畫並看到答案卡片來完整測試，此功能獨立提供「問答體驗」的核心價值。

**技術決策**：
- 隨機來源：前端 `crypto.getRandomValues()`
- 答案儲存：前端靜態 JSON 檔案（50 個答案）
- 重複抽取：允許（同一答案可抽多次）
- 問題限制：無字數限制
- UI 更新：Optimistic UI（先更新餘額，失敗回滾）
- 歷史記錄：全部上鏈（DrawRecord 物件）
- 錯誤處理：通用錯誤訊息

**驗收情境**：

1. **Given** 使用者擁有 ≥10 MGC，**When** 輸入問題並點擊「抽取解答」按鈕，**Then** 前端隨機選擇 answer_id (0-49)，立即更新餘額 -10 MGC（Optimistic），發起鏈上交易，播放抽取動畫
2. **Given** 抽取動畫播放完畢，**When** 鏈上交易成功，**Then** 顯示答案卡片：答案文字（英文 + 中文，從靜態 JSON 取得）、稀有度標籤、對應稀有度的背景顏色（Common 灰、Rare 藍、Epic 紫、Legendary 金）
3. **Given** 鏈上交易失敗，**When** 錯誤發生，**Then** 回滾餘額顯示，顯示通用錯誤「抽取失敗，請稍後再試」
4. **Given** 使用者 MGC < 10，**When** 點擊抽取按鈕，**Then** 顯示「智慧碎片不足！需要 10 MGC，你目前有 X MGC」並提示「完成每日簽到獲得更多碎片」
5. **Given** 使用者未輸入問題，**When** 點擊抽取按鈕，**Then** 顯示「請先在心中默念你的問題」並將輸入框高亮提示

**Move 合約介面**：
```move
module oracle_library::oracle_draw {
    // 抽取解答
    public entry fun draw(
        answer_id: u8,           // 前端隨機產生 (0-49)
        question_hash: vector<u8>, // 問題 hash（隱私）
        payment: Coin<MGC>,      // 10 MGC
        mgc_treasury: &mut MGCTreasury,
        ctx: &mut TxContext
    );

    // DrawRecord 物件（使用者持有）
    struct DrawRecord has key, store {
        id: UID,
        owner: address,
        answer_id: u8,
        question_hash: vector<u8>,
        timestamp: u64,
    }
}
```

---

### User Story 4 - 將答案鑄造成 NFT (Priority: P2)

身為一位求知者，我希望能夠將獲得的答案鑄造成 NFT，以便永久保存這次問答體驗在區塊鏈上。

**為何此優先級**：NFT 鑄造是產品差異化價值的體現，讓答案具有永久性和所有權，但需要先有抽取答案的功能才能運作。

**獨立測試**：可透過在獲得答案後點擊鑄造按鈕、完成錢包簽署並看到鑄造成功訊息來完整測試。

**技術決策**：
- 鑄造時機：僅限抽取結果頁面（離開後不可補鑄）
- 鑄造費用：Gas + 5 MGC
- Metadata 存儲：On-chain 指標 + IPFS（圖片/JSON）
- NFT 名稱格式：`Oracle #042`
- 問題隱私：問題不上鏈
- DrawRecord 處理：銷毀換 NFT（使用者只持有 NFT）
- 顯示連結：IOTA Explorer Object 頁面

**驗收情境**：

1. **Given** 使用者在抽取結果頁面，擁有 ≥5 MGC，錢包有足夠 Gas，**When** 點擊「鑄造 NFT」按鈕，**Then** 顯示確認對話框：「鑄造將消耗 5 MGC + Gas 費用」，確認後喚起錢包簽署，按鈕變為「鑄造中...」
2. **Given** 錢包交易確認完成，**When** 鑄造成功，**Then** 播放慶祝動畫（Phaser 3：煙火爆發、金幣/星星飛散、光芒閃爍），顯示成功訊息，按鈕變為「已鑄造 ✓」（禁用），顯示「查看 NFT ↗」連結（IOTA Explorer），MGC 餘額更新 -5
3. **Given** 使用者 MGC < 5，**When** 點擊鑄造按鈕，**Then** 顯示「智慧碎片不足！鑄造需要 5 MGC，你目前有 X MGC」
4. **Given** 錢包簽署介面已開啟，**When** 使用者拒絕簽署，**Then** 顯示「交易已取消」，鑄造按鈕恢復可用
5. **Given** 使用者錢包 IOTA 餘額不足，**When** 發起鑄造，**Then** 顯示「Gas 費用不足，請先取得一些 IOTA」並提供 Testnet Faucet 連結
6. **Given** 使用者在結果頁但尚未鑄造，**When** 離開頁面，**Then** DrawRecord 保留但無 UI 入口補鑄造

**Move 合約介面**：
```move
module oracle_library::oracle_nft {
    // 將 DrawRecord 銷毀並鑄造成 NFT
    public entry fun mint(
        record: DrawRecord,      // 會被銷毀
        rarity: u8,              // 前端查表得到
        payment: Coin<MGC>,      // 5 MGC
        config: &NFTConfig,
        mgc_treasury: &mut MGCTreasury,
        ctx: &mut TxContext
    );

    // NFT 物件
    struct OracleNFT has key, store {
        id: UID,
        name: String,            // "Oracle #042"
        image_url: Url,          // IPFS
        metadata_url: Url,       // IPFS
        answer_id: u8,
        rarity: u8,
        drawn_at: u64,
        minted_at: u64,
    }
}
```

---

### User Story 5 - 查看我的 NFT 收藏 (Priority: P2)

身為一位求知者，我希望能夠查看我收藏的所有 NFT，以便回顧過去的問答歷程。

**為何此優先級**：收藏功能讓使用者的努力成果有展示和回顧的空間，增強長期黏著度，但需要先有鑄造功能才有內容可展示。

**獨立測試**：可透過進入收藏頁面並看到已鑄造的 NFT 列表來完整測試。

**技術決策**：
- 收藏頁入口：導航列固定項目「我的收藏」
- NFT 卡片顯示：圖片 + 名稱 + 稀有度標籤 + 鑄造日期
- 詳情彈窗：完整答案雙語（從 IPFS 取得）+ 時間 + Explorer 連結
- 排序功能：固定新→舊，無切換
- 統計卡片：頁面頂部顯示
- 空狀態：簡單提示文字，無導向按鈕
- 圖片載入：骨架屏（灰色佔位 + 脈衝動畫）

**驗收情境**：

1. **Given** 使用者已鑄造 ≥1 個 NFT，**When** 點擊導航列「我的收藏」，**Then** 頁面頂部顯示統計卡片（總收藏數、稀有度分佈），下方以網格展示所有 NFT，排序固定為新→舊
2. **Given** 收藏頁已載入，**When** NFT 卡片渲染完成，**Then** 每張卡片顯示：NFT 圖片、名稱（`Oracle #042`）、稀有度標籤（顏色對應）、鑄造日期
3. **Given** IPFS 圖片尚未載入，**When** 卡片渲染中，**Then** 顯示骨架屏（灰色佔位 + 脈衝動畫）
4. **Given** 收藏頁顯示列表，**When** 點擊任一 NFT 卡片，**Then** 打開詳情彈窗：NFT 大圖、名稱、稀有度、答案英文、答案中文、抽取時間、鑄造時間、「查看 NFT ↗」連結
5. **Given** 使用者尚未鑄造任何 NFT，**When** 進入收藏頁，**Then** 顯示空狀態插圖與提示「你還沒有收藏任何答案」
6. **Given** 不同裝置，**When** 載入收藏頁，**Then** 響應式網格：桌面 4 列、平板 3 列、手機 2 列

---

### User Story 6 - 查看個人統計 (Priority: P3) — MVP 暫緩

> **注意**：此 Story 於 MVP 階段暫不實作，保留於規格書供後續參考。

身為一位求知者，我希望能夠查看我的圖書館活動統計，以便了解自己的參與程度。

**為何此優先級**：統計功能增強使用者的成就感和進度追蹤，屬於錦上添花功能，可在核心功能完成後實作。

**驗收情境**：

1. **Given** 使用者已有活動記錄，**When** 進入統計頁面，**Then** 顯示連續簽到天數、累積簽到總數、總抽取次數、當前 MGC 餘額、NFT 收藏數量
2. **Given** 統計數據載入中，**When** 數字開始顯示，**Then** 重要數字有動態計數動畫效果

---

### 邊界情況

| 情境 | 處理方式 |
|------|----------|
| 抽取動畫中關閉頁面 | Optimistic UI 已扣除 MGC，重開後從鏈上讀取實際餘額 |
| NFT 鑄造中網路中斷 | 交易可能已送出，重開後查詢鏈上狀態確認 |
| 錢包連接逾時 | 顯示通用錯誤，使用者可重試 |
| 多裝置同時登入 | MGC 為鏈上 Coin，餘額以鏈上為準 |
| 重複抽取同答案 | 允許，每次都產生新的 DrawRecord |

## 需求 *(必要)*

### 功能需求

**錢包與身份**

- **FR-001**：系統必須支援 IOTA Wallet 連接（透過 @iota/dapp-kit）
- **FR-002**：系統必須在錢包連接成功後顯示縮寫形式的錢包地址（`0x1234...5678`）
- **FR-003**：系統必須支援使用者主動斷開錢包連接
- **FR-004**：系統必須支援靜默自動重連（重新進入網站時）
- **FR-005**：系統必須支援錢包帳號切換偵測與自動更新

**每日簽到**

- **FR-006**：系統必須允許已連接錢包的使用者每日（UTC+8）簽到一次
- **FR-007**：系統必須在簽到成功時發放固定 5 個 MGC（鏈上 Coin）
- **FR-008**：系統必須從 Event Log 計算並顯示連續簽到天數
- **FR-009**：系統必須在使用者今日已簽到時禁用按鈕並顯示 UTC+8 午夜倒計時

**抽取解答**

- **FR-010**：系統必須允許使用者輸入任意文字作為問題（無字數限制）
- **FR-011**：系統必須在抽取時扣除固定 10 MGC
- **FR-012**：系統必須使用前端 `crypto.getRandomValues()` 從 50 個答案中隨機選擇
- **FR-013**：系統必須以雙語（英文 + 中文）顯示答案（從靜態 JSON 讀取）
- **FR-014**：系統必須根據稀有度顯示對應視覺樣式（Common 灰、Rare 藍、Epic 紫、Legendary 金）
- **FR-015**：系統必須在 MGC 不足時阻止抽取並顯示提示
- **FR-016**：系統必須使用 Optimistic UI 更新餘額（失敗時回滾）
- **FR-017**：系統必須將每次抽取記錄上鏈（DrawRecord 物件）

**NFT 鑄造**

- **FR-018**：系統必須允許在抽取結果頁將答案鑄造成 NFT
- **FR-019**：系統必須在鑄造時扣除 5 MGC + Gas 費用
- **FR-020**：系統必須銷毀 DrawRecord 並產生 OracleNFT 物件
- **FR-021**：NFT 必須包含：名稱（`Oracle #042`）、IPFS 圖片連結、IPFS metadata 連結、answer_id、稀有度、時間戳
- **FR-022**：系統必須在鑄造成功後顯示 IOTA Explorer Object 連結

**收藏展示**

- **FR-023**：系統必須在導航列提供「我的收藏」入口
- **FR-024**：系統必須以網格佈局展示使用者的所有 OracleNFT
- **FR-025**：系統必須支援點擊 NFT 卡片查看詳情（含 IPFS 答案全文）
- **FR-026**：系統必須在頁面頂部顯示統計（總數、稀有度分佈）
- **FR-027**：系統必須提供響應式網格（桌面 4 列、平板 3 列、手機 2 列）
- **FR-028**：系統必須在圖片載入時顯示骨架屏

### 關鍵實體（Move Object Model）

```
┌─────────────────────────────────────────────────────────────┐
│  MGCTreasury (Shared)                                       │
│  - 管理 MGC Token 的 mint/burn                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Coin<MGC> (Owned by User)                                  │
│  - 使用者持有的 MGC 餘額                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UserCheckInRecord (Owned by User)                          │
│  - owner: address                                           │
│  - last_check_in_day: u64 (UTC+8 日期編號)                  │
│  - total_check_ins: u64                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DrawRecord (Owned by User) → 鑄造時銷毀                    │
│  - owner: address                                           │
│  - answer_id: u8 (0-49)                                     │
│  - question_hash: vector<u8>                                │
│  - timestamp: u64                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  OracleNFT (Owned by User)                                  │
│  - name: String ("Oracle #042")                             │
│  - image_url: Url (IPFS)                                    │
│  - metadata_url: Url (IPFS)                                 │
│  - answer_id: u8                                            │
│  - rarity: u8 (0=Common, 1=Rare, 2=Epic, 3=Legendary)       │
│  - drawn_at: u64                                            │
│  - minted_at: u64                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NFTConfig (Shared)                                         │
│  - image_base_url: String (IPFS gateway)                    │
│  - metadata_base_url: String (IPFS gateway)                 │
└─────────────────────────────────────────────────────────────┘
```

### 前端靜態資料

**answers.json**（50 個答案）：
```json
[
  {
    "id": 0,
    "en": "The journey of a thousand miles begins with a single step.",
    "zh": "千里之行，始於足下。",
    "rarity": 0,
    "category": "wisdom"
  },
  ...
]
```

**稀有度分佈**：
- Common (0): 60% — 30 個答案
- Rare (1): 30% — 15 個答案
- Epic (2): 8% — 4 個答案
- Legendary (3): 2% — 1 個答案

## 成功標準 *(必要)*

### 可衡量成果

**使用者體驗**

- **SC-001**：新使用者在 5 分鐘內完成首次簽到並理解核心玩法
- **SC-002**：使用者完成每日簽到的時間不超過 30 秒（含鏈上交易）
- **SC-003**：使用者從輸入問題到看到答案的完整體驗不超過 1 分鐘（含動畫）
- **SC-004**：90% 的使用者在首次使用時成功完成主要任務

**系統效能**

- **SC-005**：首頁載入時間不超過 3 秒
- **SC-006**：簽到交易確認時間不超過 5 秒（IOTA Testnet）
- **SC-007**：錢包連接成功率達 95% 以上
- **SC-008**：抽取動畫播放流暢，無明顯卡頓
- **SC-009**：IPFS 圖片載入時間不超過 3 秒（有骨架屏過渡）

**業務指標**

- **SC-010**：連續簽到 7 天的使用者比例達 50%
- **SC-011**：連續簽到 30 天的使用者比例達 20%
- **SC-012**：累積鑄造 10 個 NFT 的使用者比例達 30%

## 假設

- IOTA Testnet 網路穩定可用，Gas 費用接近零
- 使用者已安裝 IOTA Wallet 瀏覽器擴充功能
- 50 個預設答案已準備完成並上傳至 IPFS
- 稀有度機率分佈：Common 60%、Rare 30%、Epic 8%、Legendary 2%
- 每次簽到獎勵固定為 5 MGC，每次抽取消耗固定為 10 MGC
- NFT 鑄造額外消耗 5 MGC + Gas 費用
- 使用者可以重複抽取到相同的答案
- 前端隨機足夠公平（非高價值賭博場景）

## MVP 範圍確認

| Story | 狀態 | 說明 |
|-------|------|------|
| Story 1 - 錢包連接 | ✅ 包含 | IOTA Wallet + @iota/dapp-kit |
| Story 2 - 每日簽到 | ✅ 包含 | UTC+8 日期制，5 MGC |
| Story 3 - 抽取解答 | ✅ 包含 | 前端隨機，10 MGC |
| Story 4 - NFT 鑄造 | ✅ 包含 | 結果頁限定，5 MGC + Gas |
| Story 5 - 查看收藏 | ✅ 包含 | 導航列入口，IPFS |
| Story 6 - 個人統計 | ⏸️ 暫緩 | MVP 後再做 |
