# 學習報告：US3 & US4 前端整合開發

**開發者**：Developer A
**開發時間**：2025-12-17
**專案**：永恆圖書館 MVP (Eternal Library MVP)
**功能分支**：001-eternal-library-mvp
**完成任務**：T063-T067 (US3), T071, T073-T074, T076 (US4), T090-T092 (品質檢查)

---

## 一、開發摘要

本次開發完成了永恆圖書館 MVP 的兩個核心使用者故事：
- **US3**：提問並抽取解答之書（前端整合）
- **US4**：鑄造 NFT 收藏解答（前端功能）

實作包含 React 元件、Phaser 場景整合、區塊鏈交易處理、動畫效果和使用者體驗優化。

### 開發成果

#### 程式碼統計
- **新增元件**：6 個
- **修改檔案**：4 個
- **新增程式碼**：約 1,570 行
- **測試覆蓋**：合約測試 100% 通過（25/25）

#### Git 提交記錄
1. `feat(frontend): 完成 US3 前端整合 - 抽取解答功能` (8 files, +870 lines)
2. `feat(frontend): 實作 useMintNFT Hook` (3 files, +242 lines)
3. `feat(frontend): 完成 US4 鑄造確認對話框和動畫效果` (6 files, +456 lines)
4. `chore: 標記 T090-T092 品質檢查任務為完成` (1 file)

---

## 二、技術架構與設計模式

### 2.1 React + Phaser 整合架構

```
┌─────────────────────────────────────────┐
│         HomePage (React)                 │
│  ┌───────────────────────────────────┐  │
│  │  DrawSection (React Component)    │  │
│  │  ┌─────────────┐  ┌────────────┐ │  │
│  │  │  DrawForm   │  │  Phaser    │ │  │
│  │  │  (React)    │  │  Game      │ │  │
│  │  └─────────────┘  └────────────┘ │  │
│  │         ↓              ↓          │  │
│  │    EventBridge (雙向通訊)         │  │
│  │         ↓              ↓          │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  DrawResultOverlay (React)  │ │  │
│  │  └─────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**關鍵設計決策**：
- 使用 EventBridge 單例模式管理 React ↔ Phaser 通訊
- Phaser 場景僅負責視覺呈現，不處理業務邏輯
- React 元件管理狀態流程，Phaser 回報事件

### 2.2 狀態流程設計

#### DrawSection 階段管理
```typescript
type DrawPhase = 'idle' | 'drawing' | 'revealing' | 'result';

// 流程：
// idle (輸入問題)
//   → drawing (Phaser 抽取動畫)
//   → revealing (Phaser 揭示動畫)
//   → result (React 顯示結果)
```

**學習要點**：
- 使用明確的階段狀態避免競態條件
- 每個階段有對應的 UI 呈現
- 階段轉換由 Phaser 事件驅動（解耦合）

### 2.3 Optimistic UI 模式

```typescript
// 立即更新 UI
const handleDrawStart = () => {
  setOptimisticBalance(balance - DRAW_COST);
};

// 交易確認後重置
useEffect(() => {
  if (balance !== 0n) {
    setOptimisticBalance(null);
  }
}, [balance]);
```

**優勢**：
- 使用者感知速度大幅提升
- 避免區塊鏈延遲造成的 UI 卡頓
- 失敗時自動回滾到真實餘額

---

## 三、核心元件實作

### 3.1 DrawSection - 抽取流程整合

**檔案**：`frontend/components/draw-section.tsx` (313 lines)

**職責**：
1. 管理抽取流程的四個階段
2. 整合 DrawForm、Phaser 場景、DrawResultOverlay
3. 處理 Phaser 事件回調
4. 執行抽取和鑄造交易

**技術亮點**：
```typescript
// 動態添加 Phaser 場景
const handleGameReady = useCallback((game: Phaser.Game) => {
  game.scene.add('PreloadScene', PreloadScene, false);
  game.scene.add('DrawScene', DrawScene, false);
  game.scene.add('CardRevealScene', CardRevealScene, false);
}, []);

// 場景間參數傳遞
gameRef.current.scene.start('PreloadScene', { answerId: result.answerId });
```

**學到的經驗**：
- Phaser 場景的 `init(data)` 方法可以接收啟動參數
- 必須使用 `scene.add()` 而非 `scene.start()` 來註冊場景
- 場景之間可以串聯啟動（PreloadScene → DrawScene → CardRevealScene）

### 3.2 DrawResultOverlay - 結果顯示

**檔案**：`frontend/components/draw-result-overlay.tsx` (332 lines)

**職責**：
1. 美化顯示抽取結果
2. 根據稀有度動態調整樣式
3. 整合鑄造確認流程
4. 提供「再抽一次」和「鑄造 NFT」操作

**稀有度設計系統**：
```typescript
const RARITY_COLORS: Record<Rarity, string> = {
  Common: '#6B7280',    // 灰色
  Rare: '#3B82F6',      // 藍色
  Epic: '#8B5CF6',      // 紫色
  Legendary: '#F59E0B', // 金色
};

const RARITY_GRADIENTS: Record<Rarity, string> = {
  Common: 'from-gray-100 to-gray-200',
  Rare: 'from-blue-100 to-blue-200',
  Epic: 'from-purple-100 to-purple-200',
  Legendary: 'from-yellow-100 to-yellow-200',
};
```

**特殊效果**：
- Epic 以上：呼吸光暈效果
- Legendary：四角旋轉 emoji 裝飾（✨⭐💫🌟）

### 3.3 MintConfirmModal - 鑄造確認對話框

**檔案**：`frontend/components/mint-confirm-modal.tsx` (222 lines)

**職責**：
1. 顯示鑄造前確認資訊
2. 檢查 MGC 餘額是否足夠
3. 預覽鑄造後餘額
4. 處理確認/取消操作

**UX 設計**：
```typescript
const hasEnoughMGC = mgcBalance >= mintCost;

{!hasEnoughMGC && (
  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
    <p className="text-sm text-red-600">
      ⚠️ MGC 不足，無法鑄造 NFT
    </p>
  </div>
)}
```

**學習心得**：
- 在執行高成本操作前必須提供確認步驟
- 清楚顯示成本和後果（餘額變化）
- 餘額不足時禁用確認按鈕並說明原因

### 3.4 FlyingNumber - 飛行數字動畫

**檔案**：`frontend/components/animated/flying-number.tsx` (133 lines)

**職責**：
1. 顯示 MGC 變化的視覺回饋
2. 向上飛行並淡出效果
3. 自動清理動畫元素

**技術實作**：
```typescript
<motion.div
  initial={{ opacity: 1, y: 0, scale: 1 }}
  animate={{ opacity: 0, y: -80, scale: 1.2 }}
  transition={{ duration: 1.5, ease: 'easeOut' }}
  style={{ left: `${x}px`, top: `${y}px`, color: finalColor }}
>
  {sign}{value}
</motion.div>
```

**Hook 設計**：
```typescript
export function useFlyingNumbers() {
  const [numbers, setNumbers] = useState<Array<...>>([]);

  const showFlyingNumber = (value: number, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setNumbers(prev => [...prev, { id, value, x, y }]);
  };

  return { showFlyingNumber, flyingNumbers };
}
```

**學到的技巧**：
- 使用 `getBoundingClientRect()` 取得元素位置
- 固定定位（fixed）+ 指針事件禁用（pointer-events-none）
- 動畫完成後自動清理狀態避免記憶體洩漏

---

## 四、區塊鏈整合

### 4.1 useMintNFT Hook

**檔案**：`frontend/hooks/use-mint-nft.ts` (206 lines)

**交易構建**：
```typescript
const tx = new Transaction();

// 1. 分割付款
const MINT_COST_MIST = MINT_COST * 1_000_000_000; // 5 MGC
const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [MINT_COST_MIST]);

// 2. 呼叫合約
tx.moveCall({
  target: `${PACKAGE_ID}::oracle_nft::mint`,
  arguments: [
    tx.object(recordId),      // DrawRecord
    tx.pure.u8(rarity),       // 稀有度 (0-3)
    paymentCoin,              // 付款
    tx.object(NFT_CONFIG_ID), // NFT 配置
    tx.object(MGC_TREASURY_ID), // MGC 國庫
  ],
});

// 3. 執行交易
const result = await signAndExecuteTransaction({
  transaction: tx,
  options: { showObjectChanges: true },
});
```

**關鍵學習**：
1. **Payment Splitting**：使用 `splitCoins` 分割出精確金額
2. **找零處理**：剩餘金額自動退回使用者
3. **物件解析**：從 `objectChanges` 中提取新建立的 NFT ID

```typescript
// 解析 NFT ID
const nftObject = objectChanges?.find(
  (change) =>
    change.type === 'created' &&
    change.objectType.includes('::oracle_nft::OracleNFT')
);

if (nftObject && nftObject.type === 'created') {
  return {
    success: true,
    nftId: nftObject.objectId,
    digest: result.digest,
  };
}
```

### 4.2 useMGCCoins Hook

**檔案**：`frontend/hooks/use-mgc-coins.ts` (64 lines)

**用途**：查詢和選擇可用的 MGC Coin 物件

```typescript
const getCoinWithBalance = (minBalance: bigint): string | null => {
  const coin = coins.find((c) => c.balance >= minBalance);
  return coin?.objectId || null;
};

// 使用範例
const mgcCoinId = getCoinWithBalance(10_000_000_000n); // 10 MGC
```

**設計考量**：
- 選擇第一個餘額足夠的 Coin（簡單策略）
- 未來可優化：選擇餘額最接近的 Coin 以減少找零

---

## 五、Phaser 場景改進

### 5.1 PreloadScene 改進

**修改內容**：
```typescript
export class PreloadScene extends Phaser.Scene {
  private answerId = 0;

  // 新增：接收 answerId 參數
  init(data: { answerId?: number }) {
    this.answerId = data.answerId ?? 0;
  }

  create() {
    // 資源載入完成後，啟動 DrawScene 並傳遞 answerId
    this.scene.start('DrawScene', { answerId: this.answerId });
  }
}
```

### 5.2 DrawScene 改進

**修改內容**：
```typescript
export class DrawScene extends Phaser.Scene {
  private answerId = 0;

  // 新增：接收 answerId 參數
  init(data: { answerId?: number }) {
    this.answerId = data.answerId ?? 0;
  }

  create() {
    // ... 場景設置

    // 新增：自動開始抽取動畫
    this.startDrawAnimation({ answerId: this.answerId });
  }
}
```

**優勢**：
- 場景啟動即自動開始動畫（無需手動觸發）
- 參數透過 `init` 傳遞，保持場景間解耦
- 符合單一職責原則（場景不需知道 React 狀態）

---

## 六、使用者體驗優化

### 6.1 Optimistic UI 實作

**位置**：`frontend/app/(app)/home/page.tsx`

```typescript
// 1. 立即扣除（Optimistic）
const handleDrawStart = () => {
  setOptimisticBalance(balance - DRAW_COST);
};

// 2. 顯示更新中提示
{optimisticBalance !== null && (
  <span className="ml-3 text-sm opacity-75">
    (更新中...)
  </span>
)}

// 3. 交易確認後重置
useEffect(() => {
  if (balance !== 0n) {
    setOptimisticBalance(null);
  }
}, [balance]);
```

**使用者體驗提升**：
- 點擊「抽取」後立即看到 -10 MGC
- 避免 2-3 秒的等待空白期
- 失敗時自動回滾（透過 refetch 觸發）

### 6.2 飛行數字動畫

**觸發時機**：
```typescript
const handleMintSuccess = () => {
  // 在餘額數字位置顯示 -5 MGC 動畫
  if (balanceRef.current) {
    const rect = balanceRef.current.getBoundingClientRect();
    showFlyingNumber(-5, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  refetchBalance();
};
```

**效果**：
- 鑄造成功瞬間，從餘額數字飛出 "-5"
- 紅色文字向上飛行並淡出
- 視覺化金幣消耗，強化回饋感

### 6.3 載入狀態管理

**所有異步操作都有載入指示**：
```typescript
// 按鈕禁用 + 載入動畫
<button disabled={isDrawing}>
  {isDrawing ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-5 w-5">...</svg>
      抽取中...
    </span>
  ) : (
    '抽取解答 (10 MGC)'
  )}
</button>
```

**涵蓋範圍**：
- 抽取按鈕（isDrawing）
- 鑄造按鈕（isMinting）
- 餘額載入（skeleton loading）

---

## 七、遇到的挑戰與解決方案

### 7.1 React 與 Phaser 的生命週期衝突

**問題**：
- React 元件重新渲染可能導致 Phaser 場景重置
- Phaser 場景無法直接存取 React 狀態

**解決方案**：
1. 使用 `useRef` 儲存 Phaser Game 實例（避免重建）
2. 使用 EventBridge 單例模式作為通訊橋樑
3. Phaser 場景僅負責視覺，業務邏輯留在 React

```typescript
// EventBridge 單例
export class EventBridge extends Phaser.Events.EventEmitter {
  private static instance: EventBridge;

  public static getInstance(): EventBridge {
    if (!EventBridge.instance) {
      EventBridge.instance = new EventBridge();
    }
    return EventBridge.instance;
  }
}

// React 中使用
const eventBridge = useRef<EventBridge>(EventBridge.getInstance());

useEffect(() => {
  const bridge = eventBridge.current;
  bridge.on(EVENTS.DRAW_COMPLETE, handleDrawComplete);
  return () => bridge.off(EVENTS.DRAW_COMPLETE, handleDrawComplete);
}, []);
```

### 7.2 IOTA Transaction 的 Coin Splitting

**問題**：
- Move 合約需要精確金額的 Coin 物件
- 使用者的 MGC 可能分散在多個 Coin 中

**解決方案**：
```typescript
// 方案 1：Split 出精確金額
const [paymentCoin] = tx.splitCoins(tx.object(mgcCoinId), [COST_MIST]);
tx.moveCall({ arguments: [paymentCoin, ...] });

// 方案 2：Merge 多個 Coin（未使用，預留）
// const mergedCoin = tx.mergeCoins(tx.object(coin1), [tx.object(coin2)]);
```

**學習重點**：
- `splitCoins` 返回陣列，即使只分割一個也要解構
- 剩餘金額自動作為「找零」退回
- 交易失敗不會扣款（原子性保證）

### 7.3 稀有度映射

**問題**：
- 前端收到的 rarity 是字串（"Common", "Rare"...）
- 合約需要的是 u8 數字（0, 1, 2, 3）

**解決方案**：
```typescript
const rarityMap: Record<string, number> = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
};

const rarityValue = rarityMap[resultData.rarity] ?? 0;
await mint(lastResult.recordId, rarityValue, mintCoinId);
```

### 7.4 Framer Motion 的 AnimatePresence

**問題**：
- 階段切換時元件直接消失，沒有退出動畫

**解決方案**：
```typescript
<AnimatePresence mode="wait">
  {phase === 'idle' && (
    <motion.div
      key="draw-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <DrawForm />
    </motion.div>
  )}
</AnimatePresence>
```

**關鍵**：
- 必須使用 `<AnimatePresence>`
- 每個子元件需要唯一的 `key`
- `mode="wait"` 確保前一個動畫完成後才顯示下一個

---

## 八、測試與品質保證

### 8.1 合約測試結果

**執行命令**：
```bash
iota move test --path contracts
```

**結果**：
```
Test result: OK. Total tests: 25; passed: 25; failed: 0

包含：
- MGC 模組：6/6 通過
- Check-in 模組：6/6 通過
- Oracle Draw 模組：7/7 通過
- Oracle NFT 模組：6/6 通過
```

**測試覆蓋**：
- ✅ MGC 鑄造與轉帳
- ✅ 簽到邏輯與獎勵
- ✅ 抽取交易與隨機性
- ✅ NFT 鑄造與屬性

### 8.2 已完成的前端測試

**檔案列表**：
```
frontend/__tests__/hooks/
├── use-check-in-state.test.ts  (7246 bytes)
├── use-check-in.test.ts        (5320 bytes)
├── use-mgc-balance.test.ts     (4843 bytes)
└── use-wallet-connection.test.ts (4287 bytes)
```

### 8.3 待補完的測試

**T069: useMintNFT Hook 測試**（尚未完成）
- 測試鑄造成功流程
- 測試餘額不足情況
- 測試交易失敗處理

---

## 九、效能考量

### 9.1 Phaser 懶載入

**策略**：
- Phaser 場景僅在需要時動態添加
- 不使用時不佔用記憶體

```typescript
const handleGameReady = useCallback((game: Phaser.Game) => {
  game.scene.add('PreloadScene', PreloadScene, false);
  game.scene.add('DrawScene', DrawScene, false);
  game.scene.add('CardRevealScene', CardRevealScene, false);
}, []);
```

### 9.2 React 效能優化

**使用 useCallback 避免不必要的重建**：
```typescript
const handleGameReady = useCallback((game: Phaser.Game) => {
  // ...
}, []); // 空依賴陣列，函式只建立一次

const handleDraw = useCallback(async (question: string) => {
  // ...
}, [draw, mgcCoinId, onDrawStart]);
```

### 9.3 待優化項目

**T094: 首頁 Bundle 優化**
- 目標：< 500KB gzipped
- 可能手段：
  - Code splitting (dynamic import)
  - Tree shaking
  - Phaser 按需載入

**T097: 效能優化**
- 目標：頁面載入 < 3 秒
- 可能手段：
  - Image optimization
  - Lazy loading
  - Prefetch critical resources

---

## 十、學習心得與反思

### 10.1 技術成長

**React 狀態管理**：
- 學會使用階段式狀態管理複雜流程
- 理解 Optimistic UI 的實作與回滾機制
- 掌握 useRef 在避免重建場景中的應用

**Phaser 遊戲引擎**：
- 理解場景生命週期（init → preload → create）
- 學會場景間參數傳遞與事件通訊
- 實作 React 與 Phaser 的整合模式

**IOTA Move 智能合約**：
- 理解 Transaction 的 Coin 操作（split, merge）
- 學會解析 Transaction Result 中的 objectChanges
- 掌握 Object-based 架構的交易構建

**動畫與 UX**：
- 使用 Framer Motion 實作流暢的頁面轉場
- 理解飛行數字動畫的定位計算
- 學會稀有度系統的視覺設計

### 10.2 設計原則體會

**關注點分離**：
- React 管理狀態和業務邏輯
- Phaser 負責視覺呈現和動畫
- Hook 封裝區塊鏈互動細節

**使用者優先**：
- 立即回饋（Optimistic UI）
- 清晰的載入狀態
- 防呆設計（確認對話框）

**可維護性**：
- 元件職責單一清晰
- 型別安全（TypeScript）
- 註解清楚標示意圖

### 10.3 遇到的困難

**最困難的部分**：
1. **React ↔ Phaser 整合**：需要理解兩個不同框架的生命週期
2. **Transaction 構建**：IOTA 的 Transaction Builder API 學習曲線較陡
3. **動畫同步**：確保 Phaser 動畫和 React 狀態完美同步

**解決過程**：
- 仔細閱讀官方文件和範例
- 使用 console.log 追蹤事件流程
- 參考現有程式碼的設計模式

### 10.4 未來改進方向

**短期**：
1. 完成 useMintNFT Hook 測試（T069）
2. 整合 CelebrationScene（T075，等待 Developer B）
3. 執行 quickstart 驗證流程（T098）

**中期**：
1. Bundle 優化和效能調校（T094, T097）
2. 補充元件單元測試
3. E2E 測試覆蓋主要流程

**長期**：
1. 改進錯誤處理和使用者提示
2. 增加無障礙功能（Accessibility）
3. 支援多語言（i18n）

---

## 十一、程式碼品質

### 11.1 遵循的原則

**命名規範**：
- React 元件使用 PascalCase（DrawSection, MintConfirmModal）
- Hook 使用 use 前綴（useMintNFT, useMGCCoins）
- 常數使用 UPPER_SNAKE_CASE（MINT_COST, EVENTS）

**型別安全**：
```typescript
// 明確定義型別
type DrawPhase = 'idle' | 'drawing' | 'revealing' | 'result';

// 介面定義清晰
interface DrawSectionProps {
  mgcCoinId: string;
  onDrawStart?: () => void;
  onDrawSuccess?: (result: DrawResult) => void;
  onMintSuccess?: () => void;
}
```

**錯誤處理**：
```typescript
try {
  const result = await draw(question, mgcCoinId);
  if (!result) {
    console.error('[DrawSection] 抽取失敗');
    return;
  }
  // ...
} catch (err) {
  console.error('[DrawSection] 抽取錯誤', err);
  setPhase('idle');
}
```

### 11.2 程式碼審查要點

**可讀性**：
- ✅ 清晰的函式命名
- ✅ 適當的註解說明
- ✅ 邏輯分段清楚

**可維護性**：
- ✅ 元件職責單一
- ✅ 避免過深的巢狀
- ✅ 使用常數避免 Magic Number

**效能**：
- ✅ 使用 useCallback 避免不必要的重建
- ✅ 使用 useRef 儲存不變的參考
- ✅ 事件監聽器正確清理

---

## 十二、結論

### 12.1 達成目標

本次開發成功完成了永恆圖書館 MVP 的 US3 和 US4 前端整合：

✅ **US3 - 提問並抽取解答之書**
- DrawForm 問題輸入元件
- DrawSection 流程整合
- DrawResultOverlay 結果顯示
- Phaser 場景參數傳遞
- Optimistic UI 實作

✅ **US4 - 鑄造 NFT 收藏解答**
- useMintNFT Hook 交易處理
- MintConfirmModal 確認對話框
- 鑄造按鈕功能與動畫
- FlyingNumber 視覺回饋

✅ **品質保證**
- 25/25 合約測試通過
- 型別檢查完成
- Lint 檢查通過

### 12.2 技術收穫

**掌握的技術棧**：
- React 19 + Next.js 16 App Router
- Phaser 3 遊戲引擎整合
- Framer Motion 動畫庫
- IOTA Move 智能合約互動
- TypeScript 嚴格型別系統

**提升的能力**：
- 複雜狀態流程管理
- React 與非 React 框架整合
- 區塊鏈交易構建與解析
- 使用者體驗優化設計
- 程式碼品質與測試意識

### 12.3 專案進度

**Developer A 任務完成度**：32/36 (88.9%)

**已完成**：
- ✅ US1: 錢包連接與身份驗證 (100%)
- ✅ US2: 每日簽到獲得智慧碎片 (100%)
- ✅ US3: 提問並抽取解答之書 (100%)
- 🔄 US4: 鑄造 NFT 收藏解答 (85.7%, 1 項被阻塞)
- 🔄 Phase 8: 品質保證與部署準備 (50%)

**剩餘任務**：
- T069: useMintNFT Hook 測試
- T075: 整合慶祝動畫（等待 Developer B）
- T094, T097, T098: 效能優化與驗證

### 12.4 致謝

感謝這次開發機會，讓我能夠深入學習：
- 區塊鏈前端開發的最佳實踐
- React 高級狀態管理技巧
- 遊戲引擎與 Web 框架的整合
- 使用者體驗優化的實戰經驗

這些技術和經驗將對未來的開發工作產生深遠影響。

---

**報告完成日期**：2025-12-17
**開發者簽名**：Developer A
**專案狀態**：進行中（89% 完成）
