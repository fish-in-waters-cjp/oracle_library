# T055 + T063 學習報告：DrawForm 抽卡表單

**任務編號**：T055（測試）+ T063（實作）
**技術等級**：B 級（基礎 UI 元件）
**完成時間**：2025-12-17
**Developer**：B

## 核心功能

1. **成本資訊顯示**：「💎 每次抽取消耗 10 MGC」
2. **抽取按鈕**：整合 Phase 0 的 Button 元件
3. **餘額檢查**：自動判斷餘額是否足夠並禁用按鈕
4. **loading 狀態**：抽取時顯示載入動畫
5. **禁用邏輯**：支援外部禁用控制

## 元件介面

```typescript
export interface DrawFormProps {
  /** 抽取回調函數 */
  onDraw: () => void;
  /** 是否載入中 */
  isLoading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** MGC 餘額（用於判斷是否足夠） */
  balance?: number;
  /** 自訂 className */
  className?: string;
}
```

## 實作重點

**1. 餘額檢查邏輯**：
```typescript
const DRAW_COST = 10;
const hasInsufficientBalance = balance !== undefined && balance < DRAW_COST;
```

**2. 按鈕禁用條件**：
```typescript
const isButtonDisabled = disabled || isLoading || hasInsufficientBalance;
```

**3. 重用 Phase 0 元件**：
- 使用 `Button` 元件（已完成的 Phase 0 元件）
- 利用 `loading` 和 `disabled` props
- 套用 `variant="primary"` 和 `size="lg"`

**4. 條件式提示訊息**：
```typescript
{hasInsufficientBalance && (
  <p className="text-sm text-red-600 mt-1">餘額不足</p>
)}
```

## 使用範例

```typescript
// 基本用法
<DrawForm onDraw={handleDraw} />

// 帶餘額檢查
<DrawForm
  onDraw={handleDraw}
  balance={userBalance}
  isLoading={isDrawing}
/>

// 禁用狀態
<DrawForm
  onDraw={handleDraw}
  disabled={!isConnected}
/>
```

## 測試覆蓋

✅ 9/9 測試通過
- 顯示成本資訊
- 顯示抽取按鈕
- 點擊按鈕時調用 onDraw
- loading 狀態時顯示載入中
- disabled 時禁用按鈕
- 餘額不足時顯示提示
- 餘額充足時不顯示提示
- 餘額充足時按鈕可點擊
- 餘額不足時自動禁用按鈕

## 產出檔案

- `frontend/components/draw-form.tsx` (64 行)
- `frontend/__tests__/components/draw-form.test.tsx` (70 行)

## 設計決策

**為什麼使用固定的 DRAW_COST？**
- 抽卡成本是業務規則，應該集中定義
- 未來如果需要改成可配置，可以輕鬆重構

**為什麼餘額是 optional？**
- 元件可以在沒有餘額資訊時使用（例如展示用途）
- 由外部決定是否需要餘額檢查

**為什麼重用 Button 元件？**
- 保持 UI 一致性
- 減少重複程式碼
- 自動獲得 Button 的所有功能（loading、disabled、variants）

## 關鍵學習

1. **元件組合**：重用現有元件而非重新實作
2. **Props 設計**：optional props 提供彈性
3. **業務邏輯封裝**：在元件內處理餘額檢查邏輯
4. **使用者體驗**：即時回饋（餘額不足提示、禁用狀態）
