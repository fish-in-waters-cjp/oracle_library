# T018 學習報告：Modal 元件

**任務編號**：T018  
**技術等級**：B 級（基礎 UI 元件）  
**完成時間**：2025-12-16

## 核心功能

1. **條件渲染**：`open` prop 控制顯示/隱藏
2. **Overlay 點擊關閉**：點擊背景關閉 modal
3. **ESC 鍵關閉**：按 Escape 關閉
4. **阻止 body 滾動**：modal 開啟時禁止背景滾動
5. **事件冒泡控制**：點擊內容不關閉 modal

## 實作重點

**useEffect 副作用管理**：
- ESC 鍵監聽
- Body overflow 控制
- 清理函數確保無記憶體洩漏

**Accessibility**：
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` 連結標題

## 測試覆蓋

✅ 6/6 測試通過
- 條件渲染
- Title 顯示
- 關閉按鈕
- Overlay 點擊
- 內容點擊不關閉

## 產出檔案

- `frontend/components/ui/modal.tsx` (110 行)
- `frontend/__tests__/components/ui/modal.test.tsx` (60 行)
