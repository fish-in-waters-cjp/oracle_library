# T019 學習報告：Skeleton 元件

**任務編號**：T019  
**技術等級**：B 級（基礎 UI 元件）  
**完成時間**：2025-12-16

## 核心功能

1. **2 種變體**：circle（圓形）、rectangle（矩形）
2. **動畫效果**：`animate-pulse` 閃爍動畫
3. **完全自訂**：透過 className 控制尺寸

## 實作重點

**極簡設計**：
- 只有 30 行程式碼
- 專注於單一職責
- 高度可組合

**使用範例**：
```tsx
// 圓形頭像骨架
<Skeleton variant="circle" className="w-12 h-12" />

// 文字行骨架
<Skeleton className="h-4 w-full" />
```

## 測試覆蓋

✅ 5/5 測試通過

## 產出檔案

- `frontend/components/ui/skeleton.tsx` (30 行)
- `frontend/__tests__/components/ui/skeleton.test.tsx` (30 行)
