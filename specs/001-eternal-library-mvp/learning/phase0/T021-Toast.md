# T021 學習報告：Toast 通知元件

**任務編號**：T021
**技術等級**：A 級（Framer Motion 動畫元件）
**完成時間**：2025-12-16

## 核心功能

1. **3 種通知類型**：success、error、info
2. **Framer Motion 動畫**：進入/離開動畫效果
3. **自動消失**：預設 3 秒後自動移除
4. **堆疊顯示**：支援同時顯示多個通知

## 技術架構

**Context + Hook 模式**：
```tsx
ToastProvider (Context Provider)
  ↓
useToast() Hook → showToast(message, type)
  ↓
ToastContainer → ToastItem (動畫元件)
```

**Framer Motion 動畫**：
```tsx
<motion.div
  initial={{ opacity: 0, y: -20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
```

## 實作重點

1. **狀態管理**：使用 Context 管理全域 toast 列表
2. **ID 生成**：使用 `Math.random().toString(36)` 生成唯一 ID
3. **自動移除**：`setTimeout` 3 秒後從列表中過濾移除
4. **AnimatePresence**：處理元件離場動畫

## 測試難點與解決

**問題**：Framer Motion 與 fake timers 衝突導致測試超時

**解決方案**：
- 移除 `vi.useFakeTimers()`
- 使用真實時間等待（`waitFor` with timeout: 4000ms）
- 透過 `onMount` callback 觸發 toast，避免 userEvent 與 timers 衝突

## 測試覆蓋

✅ 6/6 測試通過
- 顯示 success toast
- 顯示 error toast
- 顯示 info toast
- toast 自動消失（3 秒）
- 支援堆疊顯示多個 toasts
- 不同類型有對應的樣式

## 產出檔案

- `frontend/components/animated/toast.tsx` (113 行)
- `frontend/__tests__/components/animated/toast.test.tsx` (111 行)

## 關鍵學習

1. **Framer Motion 整合**：在 React 中實作進入/離開動畫
2. **Context API 設計**：全域狀態管理與 Hook 封裝
3. **測試環境配置**：處理動畫庫在測試環境中的特殊需求
