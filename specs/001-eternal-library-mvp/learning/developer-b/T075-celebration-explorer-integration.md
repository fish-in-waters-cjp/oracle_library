# T075 學習報告：整合慶祝動畫與 Explorer 連結

**任務編號**: T075
**負責人**: Developer B (整合任務)
**完成日期**: 2024-12-18
**技術等級**: S 級（Phaser 3 整合）

---

## 1. 任務概述

### 目標
將 NFT 鑄造成功後的慶祝動畫（CelebrationScene）整合到主要流程中，並在動畫結束後顯示 Explorer 連結供使用者查看鏈上 NFT。

### 驗收標準
- [x] NFT 鑄造成功後自動播放慶祝動畫
- [x] 慶祝動畫播放完畢後返回結果頁面
- [x] 結果頁面顯示「在 Explorer 查看 NFT」連結
- [x] Mock 模式下可完整測試整個流程
- [x] Build 成功，無 TypeScript 錯誤

---

## 2. 技術實作

### 2.1 狀態機擴展

**原有狀態流程**:
```
idle → drawing → revealing → result
```

**新增狀態流程**:
```
idle → drawing → revealing → result → celebrating → result (with NFT ID)
```

**DrawPhase 類型擴展**:
```typescript
// 原本
type DrawPhase = 'idle' | 'drawing' | 'revealing' | 'result';

// 新增
type DrawPhase = 'idle' | 'drawing' | 'revealing' | 'result' | 'celebrating';
```

### 2.2 EventBridge 事件流

```
React (鑄造成功)
    │
    ├─→ setPhase('celebrating')
    ├─→ pendingCelebration.current = { rarity, nftId }
    │
    ▼
PhaserGame (遊戲準備好)
    │
    ├─→ 動態載入 CelebrationScene
    ├─→ game.scene.start('CelebrationScene', { rarity, nftId })
    │
    ▼
CelebrationScene (動畫播放 4 秒)
    │
    ├─→ 煙火、金幣、星星特效
    ├─→ 稀有度專屬效果 (Legendary/Epic)
    │
    ▼
EventBridge.trigger(CELEBRATION_DONE)
    │
    ├─→ React 監聽事件
    ├─→ setPhase('result')
    └─→ 顯示 Explorer 連結
```

### 2.3 關鍵程式碼片段

#### DrawSection 動態載入 CelebrationScene
```typescript
const handleGameReady = useCallback(async (game: PhaserGameType) => {
  gameRef.current = game;

  // 動態載入場景模組（含 CelebrationScene）
  const [
    { PreloadScene },
    { DrawScene },
    { CardRevealScene },
    { CelebrationScene },  // 新增
  ] = await Promise.all([
    import('./phaser/scenes/PreloadScene'),
    import('./phaser/scenes/DrawScene'),
    import('./phaser/scenes/CardRevealScene'),
    import('./phaser/scenes/CelebrationScene'),  // 新增
  ]);

  // 註冊場景
  game.scene.add('CelebrationScene', CelebrationScene, false);

  // 如果有待啟動的慶祝動畫，立即啟動
  if (pendingCelebration.current) {
    const { rarity, nftId } = pendingCelebration.current;
    game.scene.start('CelebrationScene', { rarity, nftId });
    pendingCelebration.current = null;
  }
}, []);
```

#### CELEBRATION_DONE 事件監聽
```typescript
useEffect(() => {
  const bridge = eventBridge.current;

  const handleCelebrationDone = (data: unknown) => {
    const { nftId } = data as { rarity: string; nftId: string };

    // 停止 Phaser 場景
    bridge.emit(EVENTS.STOP_SCENE);

    // 返回結果頁面
    setPhase('result');
  };

  bridge.on(EVENTS.CELEBRATION_DONE, handleCelebrationDone);

  return () => {
    bridge.off(EVENTS.CELEBRATION_DONE, handleCelebrationDone);
  };
}, []);
```

#### DrawResultOverlay Explorer 連結
```typescript
// Props 新增
interface DrawResultOverlayProps {
  // ... 原有 props
  mintedNftId?: string | null;
}

// Explorer URL 生成
const EXPLORER_BASE_URL = process.env.NEXT_PUBLIC_EXPLORER_URL
  || 'https://explorer.rebased.iota.org';

const explorerUrl = mintedNftId
  ? `${EXPLORER_BASE_URL}/object/${mintedNftId}`
  : null;

// 條件渲染按鈕
{hasMintedNFT ? (
  <motion.a
    href={explorerUrl}
    target="_blank"
    rel="noopener noreferrer"
    style={{ /* 金色按鈕樣式 */ }}
  >
    🔗 在 Explorer 查看 NFT
  </motion.a>
) : (
  <Button onClick={handleMintClick}>
    🎨 鑄造 NFT (5 MGC)
  </Button>
)}
```

---

## 3. Mock 模式支援

### 3.1 useMintNFT Hook 擴展

```typescript
// config/mock.ts 新增
export const MOCK_DATA = {
  // ... 其他配置
  mint: {
    delayMs: 1200, // 模擬鑄造延遲
  },
};

// hooks/use-mint-nft.ts
if (MOCK_ENABLED) {
  console.log('[useMintNFT] Mock 模式：模擬鑄造交易');

  setStatus('minting');
  await new Promise((resolve) => setTimeout(resolve, MOCK_DATA.mint.delayMs));

  const mintResult: MintResult = {
    nftId: `mock-nft-${Date.now()}`,
    answerId: 0,
    rarity,
    digest: `mock-mint-digest-${Date.now()}`,
    timestamp: Date.now(),
  };

  setLastResult(mintResult);
  setStatus('success');
  return mintResult;
}
```

### 3.2 Mock 測試流程

1. 確保 `config/mock.ts` 中 `MOCK_ENABLED = true`
2. 執行抽取動作
3. 在結果頁面點擊「鑄造 NFT」
4. 確認對話框確認鑄造
5. 等待 1.2 秒（模擬鑄造延遲）
6. 自動進入 `celebrating` 階段
7. CelebrationScene 播放 4 秒
8. 自動返回結果頁面
9. 確認顯示「在 Explorer 查看 NFT」連結

---

## 4. 修改檔案清單

| 檔案 | 修改內容 |
|------|----------|
| `components/draw-section.tsx` | 新增 celebrating 階段、CelebrationScene 整合、CELEBRATION_DONE 監聽 |
| `components/draw-result-overlay.tsx` | 新增 mintedNftId prop、Explorer 連結顯示 |
| `hooks/use-mint-nft.ts` | 新增 Mock 模式支援 |
| `config/mock.ts` | 新增 mint.delayMs 配置 |
| `components/phaser/scenes/CelebrationScene.ts` | 修復 TypeScript 型別錯誤 |

---

## 5. 學習重點

### 5.1 React ↔ Phaser 整合模式

**延遲場景啟動**:
由於 PhaserGame 使用 `dynamic` 懶載入，場景啟動時機需要特殊處理：

```typescript
// 使用 pendingCelebration ref 暫存資料
const pendingCelebration = useRef<{ rarity: string; nftId: string } | null>(null);

// 在 handleGameReady 中檢查並啟動
if (pendingCelebration.current) {
  game.scene.start('CelebrationScene', pendingCelebration.current);
  pendingCelebration.current = null;
}
```

### 5.2 事件驅動架構

**EventBridge 單例模式**:
```typescript
// 確保全域唯一實例
const eventBridge = useRef<EventBridge>(EventBridge.getInstance());
```

**事件清理**:
```typescript
useEffect(() => {
  const bridge = eventBridge.current;
  bridge.on(EVENTS.CELEBRATION_DONE, handler);

  return () => {
    bridge.off(EVENTS.CELEBRATION_DONE, handler);
  };
}, []);
```

### 5.3 條件渲染最佳實踐

```typescript
// 使用 computed value 提高可讀性
const hasMintedNFT = !!mintedNftId;
const explorerUrl = mintedNftId
  ? `${EXPLORER_BASE_URL}/object/${mintedNftId}`
  : null;

// JSX 中使用三元運算子
{hasMintedNFT ? <ExplorerLink /> : <MintButton />}
```

---

## 6. 後續優化建議

### 6.1 效能優化
- 考慮預載入 CelebrationScene（在抽取完成後就開始載入）
- 評估是否將 CelebrationScene 獨立成更小的 chunk

### 6.2 使用者體驗
- 在 CelebrationScene 中加入「跳過」按鈕
- 加入音效（煙火聲、金幣聲）
- 考慮根據稀有度調整動畫時長

### 6.3 錯誤處理
- 加入 CelebrationScene 載入失敗的 fallback
- 考慮在 CELEBRATION_DONE 事件中傳遞錯誤狀態

---

## 7. 總結

T075 任務成功將 CelebrationScene 整合到 NFT 鑄造流程中，實現了：

1. **完整的狀態管理**：新增 `celebrating` 階段到狀態機
2. **事件驅動整合**：利用 EventBridge 實現 React ↔ Phaser 雙向通訊
3. **延遲載入策略**：使用 `pendingCelebration` ref 處理異步場景啟動
4. **Mock 模式支援**：方便開發與測試
5. **Explorer 連結**：提供使用者查看鏈上 NFT 的入口

此任務展示了如何在 React 應用中優雅地整合 Phaser 遊戲引擎，並處理複雜的異步狀態流轉。
