# T022 學習報告：PageTransition 元件

**任務編號**：T022
**技術等級**：A 級（Framer Motion 動畫元件）
**完成時間**：2025-12-16

## 核心功能

1. **2 種動畫變體**：fade（淡入淡出）、slide（滑動）
2. **2 種滑動方向**：from-left、from-right
3. **Framer Motion Variants**：使用 variants 模式管理動畫狀態
4. **自訂樣式**：支援 className 自訂

## 技術架構

**Variants 模式**：
```tsx
const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideVariants: Variants = {
  initial: { opacity: 0, x: direction === 'from-left' ? -50 : 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction === 'from-left' ? 50 : -50 },
};
```

**條件式動畫**：根據 variant 和 direction 決定動畫效果

## 實作重點

1. **Variants 定義**：initial、animate、exit 三態
2. **方向控制**：根據 `direction` prop 動態調整 x 軸偏移
3. **預設值設計**：預設使用 fade 效果，滑動預設從左進入
4. **transition 設定**：0.3 秒 easeInOut 緩動

## 使用場景

- Next.js 頁面路由切換
- 模態框內容切換
- 標籤頁內容切換

**範例**：
```tsx
// 淡入淡出
<PageTransition>
  <YourPage />
</PageTransition>

// 從右滑入
<PageTransition variant="slide" direction="from-right">
  <YourPage />
</PageTransition>
```

## 測試覆蓋

✅ 6/6 測試通過
- 渲染子元素
- 支援淡入淡出效果（預設）
- 支援滑動效果
- 支援自訂 className
- 支援滑動方向（from-right）
- 支援滑動方向（from-left）

## 產出檔案

- `frontend/components/animated/page-transition.tsx` (64 行)
- `frontend/__tests__/components/animated/page-transition.test.tsx` (64 行)

## 關鍵學習

1. **Framer Motion Variants**：更優雅的動畫狀態管理
2. **條件式動畫**：根據 props 動態生成動畫參數
3. **頁面轉場模式**：initial-animate-exit 生命週期
