# T023 學習報告：EventBridge 通訊模組

**任務編號**：T023
**技術等級**：S 級（Phaser 3 核心）
**完成時間**：2025-12-16

## 核心功能

1. **單例模式**：確保全域唯一實例
2. **雙向通訊**：React → Phaser 和 Phaser → React
3. **事件日誌**：記錄最近 50 條事件，便於除錯
4. **記憶體管理**：clear() 清空所有監聽器

## 技術架構

**單例模式實作**：
```typescript
class EventBridge {
  private static instance: EventBridge;

  static getInstance(): EventBridge {
    if (!EventBridge.instance) {
      EventBridge.instance = new EventBridge();
    }
    return EventBridge.instance;
  }
}
```

**事件流向**：
```
React Component
    ↓ emit(event, data)
EventBridge
    ↓ game.scene.active.events.emit()
Phaser Scene
    ↓ EventBridge.trigger(event, data)
React Component (via on/off listeners)
```

## 實作重點

1. **emit 方法**：React 發送事件到 Phaser
   - 檢查 game 實例是否存在
   - 只發送到活躍場景（scene.isActive()）
   - 記錄到事件日誌

2. **on/off/trigger 方法**：Phaser 發送事件到 React
   - on: 註冊監聽器
   - off: 移除監聽器
   - trigger: 觸發所有監聽器

3. **事件常數**：EVENTS 物件定義所有事件類型
   ```typescript
   EVENTS = {
     DRAW_CARD: 'draw-card',
     CARD_SELECTED: 'card-selected',
     // ...
   }
   ```

## 使用範例

**React 發送到 Phaser**：
```typescript
const bridge = EventBridge.getInstance();
bridge.emit(EVENTS.DRAW_CARD, { count: 1 });
```

**Phaser 發送到 React**：
```typescript
// 在 Phaser Scene 中
EventBridge.getInstance().trigger(EVENTS.CARD_SELECTED, { id: 42 });

// 在 React 中監聽
useEffect(() => {
  const bridge = EventBridge.getInstance();
  const handler = (data) => console.log(data);
  bridge.on(EVENTS.CARD_SELECTED, handler);
  return () => bridge.off(EVENTS.CARD_SELECTED, handler);
}, []);
```

## 測試覆蓋

✅ 21/21 測試通過
- 單例模式驗證
- emit 發送事件到 Phaser
- on/off/trigger 監聽器管理
- 事件日誌記錄與上限
- clear 清空功能
- EVENTS 常數定義

## 產出檔案

- `frontend/components/phaser/EventBridge.ts` (212 行)
- `frontend/__tests__/components/phaser/event-bridge.test.ts` (測試檔)

## 關鍵學習

1. **單例模式**：確保全域唯一通訊橋接
2. **事件驅動架構**：解耦 React 與 Phaser
3. **類型安全**：TypeScript 泛型定義事件數據
4. **除錯支援**：事件日誌追蹤通訊歷史
