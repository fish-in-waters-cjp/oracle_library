# T024 學習報告：PhaserGame 遊戲實例

**任務編號**：T024
**技術等級**：S 級（Phaser 3）
**完成時間**：2025-12-16
**學習模式**：完整學習模式（`--learn`）

---

## 📚 前置學習內容

### 1. Phaser 3 遊戲引擎架構

**Phaser 3 是什麼？**
- 開源的 HTML5 Canvas 遊戲引擎
- 支援 WebGL 和 Canvas 渲染
- 模組化設計，支援多場景管理

**核心概念**：

1. **遊戲實例（Game）**：
   ```typescript
   const game = new Phaser.Game(config);
   ```
   - 整個遊戲的根容器
   - 管理場景、渲染器、輸入系統
   - 生命週期：創建 → 運行 → 銷毀

2. **場景管理器（Scene Manager）**：
   - 每個遊戲可以有多個場景
   - 場景切換：`this.scene.start('DrawScene')`
   - 場景生命週期：`preload()` → `create()` → `update()`

3. **配置物件（GameConfig）**：
   ```typescript
   {
     type: Phaser.AUTO,        // 自動選擇 WebGL 或 Canvas
     width: 800,               // 畫布寬度
     height: 600,              // 畫布高度
     physics: { ... },         // 物理系統
     scene: [Scene1, Scene2],  // 場景清單
   }
   ```

---

### 2. React 與 Phaser 整合策略

**挑戰**：
- React：聲明式 UI，虛擬 DOM
- Phaser：命令式遊戲引擎，直接操作 Canvas

**解決方案**：

1. **生命週期管理**：
   ```typescript
   useEffect(() => {
     // Mount: 創建 Phaser 實例
     const game = new Phaser.Game(config);

     return () => {
       // Unmount: 銷毀 Phaser 實例
       game.destroy(true);
     };
   }, []); // 空依賴陣列，只執行一次
   ```

2. **避免重複創建**：
   - 使用 `useRef` 儲存 Phaser 實例
   - 防止 React 重渲染時重複創建遊戲

3. **容器元素管理**：
   - 使用 `useRef` 取得 DOM 元素
   - 傳遞給 Phaser 作為 `parent`

---

### 3. EventBridge 整合

**為什麼需要 EventBridge？**
- React 無法直接呼叫 Phaser 場景方法
- Phaser 無法直接觸發 React 狀態更新
- EventBridge 提供雙向通訊橋接

**整合方式**：
```typescript
const bridge = EventBridge.getInstance();
bridge.setGame(game); // 設定遊戲實例

// React → Phaser
bridge.emit('START_DRAW');

// Phaser → React
bridge.trigger('DRAW_COMPLETE', { answer });
```

---

## 🛠️ 實作過程

### 第 1 步：TDD Red Light（測試先行）

**建立測試檔案**：`__tests__/components/phaser/phaser-game.test.tsx`

**測試案例設計**（6 個測試）：

1. **渲染測試**：
   ```typescript
   test('渲染時創建容器元素', () => {
     const { container } = render(<PhaserGame />);
     const gameContainer = container.querySelector('[data-phaser-container]');
     expect(gameContainer).toBeInTheDocument();
   });
   ```

2. **Phaser.Game 創建測試**：
   ```typescript
   test('創建 Phaser.Game 實例', async () => {
     const Phaser = await import('phaser');
     render(<PhaserGame />);
     expect(Phaser.default.Game).toHaveBeenCalled();
   });
   ```

3. **EventBridge 設定測試**：
   ```typescript
   test('設定 EventBridge 的 game 實例', async () => {
     const bridge = EventBridge.getInstance();
     const setGameSpy = vi.spyOn(bridge, 'setGame');
     render(<PhaserGame />);
     expect(setGameSpy).toHaveBeenCalled();
   });
   ```

4. **回調測試**：
   ```typescript
   test('onGameReady 回調被調用', async () => {
     const onGameReady = vi.fn();
     render(<PhaserGame onGameReady={onGameReady} />);
     await vi.waitFor(() => {
       expect(onGameReady).toHaveBeenCalled();
     });
   });
   ```

5. **清理測試**：
   ```typescript
   test('unmount 時銷毀遊戲實例', async () => {
     const Phaser = await import('phaser');
     const { unmount } = render(<PhaserGame />);
     const mockGame = vi.mocked(Phaser.default.Game).mock.results[0].value;
     unmount();
     expect(mockGame.destroy).toHaveBeenCalledWith(true);
   });
   ```

6. **配置測試**：
   ```typescript
   test('傳遞自訂配置', async () => {
     const customConfig = { width: 1024, height: 768 };
     render(<PhaserGame config={customConfig} />);
     const Phaser = await import('phaser');
     const callArgs = mockConstructor.mock.calls[0]?.[0];
     expect(callArgs?.width).toBe(1024);
     expect(callArgs?.height).toBe(768);
   });
   ```

**Mock 設計**：
```typescript
vi.mock('phaser', () => ({
  default: {
    AUTO: 'AUTO',
    Scale: { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' },
    BlendModes: { ADD: 'ADD' },
    Game: vi.fn().mockImplementation(function (this: unknown) {
      return {
        destroy: vi.fn(),
        scene: { add: vi.fn(), start: vi.fn() },
      };
    }),
  },
}));
```

**紅燈確認**：測試失敗（檔案不存在） ✅

---

### 第 2 步：TDD Green Light（實作元件）

**建立元件檔案**：`components/phaser/PhaserGame.tsx`（216 行）

**核心實作**：

1. **稀有度系統常數**：
   ```typescript
   export const RARITY_COLORS = {
     Common: 0x9ca3af,    // 灰色
     Rare: 0x60a5fa,      // 藍色
     Epic: 0xa78bfa,      // 紫色
     Legendary: 0xd4af37, // 金色
   } as const;

   export const RARITY_NAMES = {
     Common: '普通',
     Rare: '稀有',
     Epic: '史詩',
     Legendary: '傳說',
   } as const;
   ```

2. **粒子配置生成器**（來自 Prototype）：
   ```typescript
   export const ParticleConfig = {
     energyGather(color: number) { ... },  // 能量聚集
     auraGlow(color: number) { ... },      // 持續光環
     firework(color: number) { ... },      // 煙火爆炸
     coinBurst() { ... },                  // 金幣飛散
   };
   ```

3. **遊戲配置函數**：
   ```typescript
   export function createGameConfig(
     parent: HTMLElement,
     customConfig?: Partial<Phaser.Types.Core.GameConfig>
   ): Phaser.Types.Core.GameConfig {
     return {
       type: Phaser.AUTO,
       parent,
       width: 800,
       height: 600,
       backgroundColor: '#000000',
       scale: {
         mode: Phaser.Scale.FIT,
         autoCenter: Phaser.Scale.CENTER_BOTH,
       },
       physics: {
         default: 'arcade',
         arcade: {
           gravity: { x: 0, y: 0 },
           debug: false,
         },
       },
       scene: [],
       ...customConfig,
     };
   }
   ```

4. **PhaserGame React 元件**：
   ```typescript
   export default function PhaserGame({
     onGameReady,
     config: customConfig,
     className = '',
   }: PhaserGameProps) {
     const gameRef = useRef<Phaser.Game | null>(null);
     const containerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       if (!containerRef.current) return;
       if (gameRef.current) return; // 防止重複創建

       // 建立遊戲配置
       const config = createGameConfig(containerRef.current, customConfig);

       // 創建 Phaser 遊戲實例
       gameRef.current = new Phaser.Game(config);

       // 設定 EventBridge
       const bridge = EventBridge.getInstance();
       bridge.setGame(gameRef.current as unknown as Parameters<typeof bridge.setGame>[0]);

       if (process.env.NODE_ENV === 'development') {
         console.log('[PhaserGame] 遊戲實例已創建');
       }

       // 觸發回調
       if (onGameReady) {
         onGameReady(gameRef.current);
       }

       // Cleanup：銷毀遊戲實例
       return () => {
         if (gameRef.current) {
           if (process.env.NODE_ENV === 'development') {
             console.log('[PhaserGame] 銷毀遊戲實例');
           }
           gameRef.current.destroy(true); // removeCanvas = true
           gameRef.current = null;
         }
       };
       // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []); // 空依賴，只執行一次

     return (
       <div
         ref={containerRef}
         data-phaser-container
         className={className}
         style={{
           width: '100%',
           maxWidth: '800px',
           margin: '0 auto',
         }}
       />
     );
   }
   ```

**綠燈確認**：所有測試通過（6/6） ✅

---

### 第 3 步：問題修正與品質檢查

**遇到的問題與解決方案**：

1. **問題 1：Mock 建構函數錯誤**
   - **錯誤**：`() => ({...}) is not a constructor`
   - **原因**：箭頭函數不能作為建構函數
   - **解決**：改用 `function` 關鍵字
   ```typescript
   Game: vi.fn().mockImplementation(function (this: unknown) {
     return { destroy: vi.fn(), scene: {...} };
   })
   ```

2. **問題 2：Canvas API 未實作**
   - **錯誤**：`HTMLCanvasElement's getContext() not implemented`
   - **原因**：使用 `require('phaser')` 繞過了 mock
   - **解決**：改用 `await import('phaser')`

3. **問題 3：TypeScript 型別錯誤**
   - **錯誤 A**：`callArgs is possibly 'undefined'`
   - **解決**：使用可選鏈 `callArgs?.width`

   - **錯誤 B**：`gravity: { y: 0 }` 缺少 `x` 屬性
   - **解決**：改為 `gravity: { x: 0, y: 0 }`

4. **問題 4：ESLint 警告**
   - **警告**：`useEffect` 缺少依賴項 `onGameReady` 和 `customConfig`
   - **解決**：添加註解說明這是有意的設計
   ```typescript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // 空依賴，只執行一次（有意忽略 onGameReady 和 customConfig）
   ```

---

## ✅ 品質檢查結果

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| 測試通過 | ✅ | 6/6 測試全部通過 |
| TypeScript 型別 | ✅ | 無型別錯誤 |
| ESLint | ✅ | 無 lint 錯誤（已處理警告）|
| 程式碼覆蓋 | ✅ | 核心邏輯完整覆蓋 |

**測試案例統計**：
- 渲染與容器：1 個測試
- Phaser.Game 創建：1 個測試
- EventBridge 整合：1 個測試
- 回調機制：1 個測試
- 清理機制：1 個測試
- 自訂配置：1 個測試

---

## 🎯 核心概念總結

### 1. React 與遊戲引擎整合模式

**關鍵原則**：
- **單一實例**：使用 `useRef` 確保 Phaser 實例唯一
- **生命週期對齊**：useEffect mount 創建，unmount 銷毀
- **避免重渲染**：空依賴陣列，防止重複創建

### 2. Phaser 3 配置最佳實踐

**響應式設計**：
```typescript
scale: {
  mode: Phaser.Scale.FIT,        // 自適應縮放
  autoCenter: Phaser.Scale.CENTER_BOTH, // 居中對齊
}
```

**物理系統**：
```typescript
physics: {
  default: 'arcade',              // 使用 Arcade 物理引擎
  arcade: {
    gravity: { x: 0, y: 0 },      // 無重力（2D 卡牌遊戲）
    debug: false,                 // 生產環境關閉除錯
  },
}
```

### 3. TypeScript 型別安全

**關鍵技巧**：
- 使用 `as const` 定義常數物件
- 使用 `Partial<T>` 支援部分配置
- 使用 `Parameters<typeof fn>[0]` 提取參數型別
- 使用可選鏈 `?.` 處理可能為 `undefined` 的值

---

## 📦 產出檔案

### 主要檔案

1. **`frontend/components/phaser/PhaserGame.tsx`** (216 行)
   - PhaserGame React 元件
   - 稀有度系統常數（RARITY_COLORS, RARITY_NAMES）
   - 粒子配置生成器（ParticleConfig）
   - 遊戲配置函數（createGameConfig）

2. **`frontend/__tests__/components/phaser/phaser-game.test.tsx`** (96 行)
   - 6 個完整測試案例
   - Phaser 完整 mock 定義
   - EventBridge 整合測試

### 輔助產出

3. **`specs/001-eternal-library-mvp/learning/T024-PhaserGame.md`**
   - 此學習報告檔案

---

## 🔑 關鍵性與影響

**對 Phase 0 的影響**：
- ⭐ **關鍵依賴**：T025 PhaserContainer 的前置任務
- ⭐ **共用基礎**：Developer B 所有遊戲場景的基礎設施
- ⭐ **EventBridge 整合**：完整實現 React ↔ Phaser 通訊

**對整體專案的影響**：
- ✅ 提供型別安全的稀有度系統常數
- ✅ 提供可重用的粒子特效配置
- ✅ 建立 React 與 Phaser 整合的標準模式

---

## 📚 延伸學習資源

1. **Phaser 3 官方文檔**：
   - [Game Configuration](https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.Core.GameConfig)
   - [Scene Manager](https://newdocs.phaser.io/docs/3.55.2/Phaser.Scenes.SceneManager)

2. **React 整合模式**：
   - [useEffect Cleanup Function](https://react.dev/reference/react/useEffect#cleaning-up-a-side-effect)
   - [useRef for Mutable Values](https://react.dev/reference/react/useRef#referencing-a-value-with-a-ref)

3. **測試策略**：
   - [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
   - [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

---

**報告完成時間**：2025-12-16
**下一個任務**：T025 - PhaserContainer 懶載入容器
