# T017 學習報告：Input 元件

**任務編號**：T017
**技術等級**：B 級（基礎 UI 元件）
**完成時間**：2025-12-16
**學習模式**：完整學習模式（`--learn`）

---

## 📚 前置學習內容

### 1. 表單元件設計原則

**受控元件 vs 非受控元件**：

React 中有兩種處理表單輸入的方式：

1. **受控元件（Controlled Component）** - ✅ 推薦

   ```typescript
   // React 完全控制 input 的值
   const [value, setValue] = useState('');

   <input
     value={value}
     onChange={(e) => setValue(e.target.value)}
   />
   ```

   **優點**：
   - React 完全控制輸入值
   - 易於驗證和格式化
   - 可以實時響應變化
   - 單一數據來源（Single Source of Truth）

   **工作流程**：
   ```
   使用者輸入 → onChange 觸發 → 更新 state → 重新渲染 → input 顯示新值
   ```

2. **非受控元件（Uncontrolled Component）** - ❌ 不推薦

   ```typescript
   // DOM 控制 input 的值
   const inputRef = useRef<HTMLInputElement>(null);

   <input ref={inputRef} defaultValue="初始值" />

   // 需要時從 ref 取值
   const getValue = () => inputRef.current?.value;
   ```

   **缺點**：
   - 難以實時驗證
   - React 無法控制狀態
   - 數據來源分散（DOM + React）
   - 不符合 React 的聲明式理念

**我們的選擇**：使用受控元件模式

---

### 2. Input 元件的核心功能

**必備 Props 設計**：

1. **label（標籤）**：

   **用途**：
   - 描述欄位用途
   - 提供上下文資訊
   - 改善使用者體驗

   **無障礙設計**：
   ```typescript
   <label htmlFor="email">電子郵件</label>
   <input id="email" />
   ```
   - `htmlFor` 連結 label 與 input
   - 點擊 label 可聚焦 input
   - 螢幕閱讀器讀出 label 內容

2. **error（錯誤狀態）**：

   **視覺反饋**：
   - 紅色邊框（`border-red-500`）
   - 錯誤訊息文字
   - 改變 focus ring 顏色

   **何時顯示錯誤**：
   - ✅ 表單提交後
   - ✅ 欄位失去焦點後（onBlur）
   - ❌ 不在輸入時立即顯示（會打斷使用者）

3. **disabled（禁用狀態）**：

   **設計要點**：
   - 降低不透明度（`opacity-50`）
   - 顯示 `not-allowed` 游標
   - 背景變灰（`bg-gray-50`）
   - 禁止所有互動

4. **placeholder**：

   **設計原則**：
   - 提供輸入範例或提示
   - 不能替代 label
   - 輸入時自動消失
   - 顏色較淡（`text-gray-400`）

---

### 3. 無障礙設計（Accessibility）

**ARIA 屬性的重要性**：

1. **aria-invalid**：
   ```typescript
   <input aria-invalid={!!error} />
   ```
   - 告知螢幕閱讀器欄位是否有錯
   - 布林值：`"true"` 或 `"false"`

2. **aria-describedby**：
   ```typescript
   <input aria-describedby={error ? "email-error" : undefined} />
   {error && <span id="email-error">{error}</span>}
   ```
   - 連結錯誤訊息與輸入框
   - 螢幕閱讀器會讀出關聯的訊息

3. **aria-label**（可選）：
   ```typescript
   <input aria-label="電子郵件" />
   ```
   - 當沒有可見 label 時使用
   - 提供螢幕閱讀器描述

**為什麼這些很重要？**
- 視障使用者依賴螢幕閱讀器
- WCAG 2.1 無障礙標準要求
- 改善所有使用者的體驗

---

### 4. forwardRef 的使用

**為什麼需要 forwardRef？**

**問題場景**：
```typescript
// ❌ 無法傳遞 ref
const Input = (props) => <input {...props} />;

// 父元件無法存取 input DOM
const Parent = () => {
  const inputRef = useRef();
  return <Input ref={inputRef} />; // ref 無法傳遞
};
```

**解決方案**：
```typescript
// ✅ 使用 forwardRef
const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => <input ref={ref} {...props} />
);

// 父元件可以存取 input DOM
const Parent = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus(); // ✅ 可以呼叫 DOM 方法
  }, []);
  return <Input ref={inputRef} />;
};
```

**使用場景**：
- 自動聚焦（auto-focus）
- 手動驗證
- 取得輸入框位置
- 整合第三方庫

---

### 5. useId Hook

**為什麼需要 useId？**

**問題**：多個相同元件在同一頁面時，ID 會衝突

```typescript
// ❌ 硬編碼 ID - 會衝突
<Input id="email" label="Email" />
<Input id="email" label="Email" /> // ID 重複！
```

**解決**：使用 `useId()` 生成唯一 ID

```typescript
const Input = ({ label, id: providedId }) => {
  const generatedId = useId(); // 自動生成唯一 ID
  const id = providedId || generatedId;

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
};
```

**特性**：
- React 18 新增的 Hook
- 每次調用生成唯一 ID
- SSR 安全（伺服器與客戶端 ID 一致）
- 允許使用者覆蓋（提供 `id` prop）

---

## 🛠️ 實作過程

### 第 1 步：TDD Red Light（測試先行）

**建立測試檔案**：`__tests__/components/ui/input.test.tsx`

**測試案例設計**（11 個測試）：

1. **基本功能測試**：
   ```typescript
   test('渲染基本輸入框', () => {
     render(<Input placeholder="請輸入..." />);
     expect(screen.getByPlaceholderText('請輸入...')).toBeInTheDocument();
   });
   ```

2. **Label 測試**：
   ```typescript
   test('顯示 label', () => {
     render(<Input label="電子郵件" placeholder="請輸入電子郵件" />);
     expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
   });

   test('label 點擊時聚焦 input', async () => {
     const user = userEvent.setup();
     render(<Input label="姓名" placeholder="請輸入姓名" />);

     await user.click(screen.getByText('姓名'));
     expect(screen.getByPlaceholderText('請輸入姓名')).toHaveFocus();
   });
   ```

3. **錯誤狀態測試**：
   ```typescript
   test('顯示錯誤狀態', () => {
     render(<Input placeholder="輸入" error="此欄位為必填" />);

     const input = screen.getByPlaceholderText('輸入');
     expect(input).toHaveClass('border-red-500');
     expect(input).toHaveAttribute('aria-invalid', 'true');
     expect(screen.getByText('此欄位為必填')).toBeInTheDocument();
   });

   test('錯誤訊息與 input 關聯（無障礙）', () => {
     render(<Input placeholder="輸入" error="錯誤訊息" />);

     const input = screen.getByPlaceholderText('輸入');
     const errorId = input.getAttribute('aria-describedby');

     expect(errorId).toBeTruthy();
     expect(screen.getByText('錯誤訊息')).toHaveAttribute('id', errorId!);
   });
   ```

4. **受控元件測試**：
   ```typescript
   test('支援 value 和 onChange (受控元件)', async () => {
     const handleChange = vi.fn();
     const user = userEvent.setup();

     render(<Input value="initial" onChange={handleChange} placeholder="輸入" />);
     const input = screen.getByPlaceholderText('輸入');

     expect(input).toHaveValue('initial');
     await user.type(input, 'x');
     expect(handleChange).toHaveBeenCalled();
   });
   ```

**紅燈確認**：測試失敗（檔案不存在） ✅

---

### 第 2 步：TDD Green Light（實作元件）

**建立元件檔案**：`components/ui/input.tsx`（97 行）

**核心實作**：

1. **型別定義**：
   ```typescript
   export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
     label?: string;
     error?: string;
   }

   const Input = forwardRef<HTMLInputElement, InputProps>(
     ({ label, error, className, id: providedId, ...props }, ref) => {
       // ...
     }
   );
   ```

2. **ID 管理**：
   ```typescript
   const generatedId = useId();
   const id = providedId || generatedId;
   const errorId = error ? `${id}-error` : undefined;
   ```

3. **樣式組合**：
   ```typescript
   const baseStyles = cn(
     // 基礎樣式
     'w-full px-4 py-2 rounded-lg',
     'border-2 border-gray-300',
     'bg-white text-gray-900',
     // Focus 狀態
     'focus:outline-none focus:ring-2 focus:ring-blue-500',
     // 禁用狀態
     props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
     // 錯誤狀態
     error && 'border-red-500 focus:ring-red-500',
     // 自訂 className
     className
   );
   ```

4. **完整元件結構**：
   ```typescript
   return (
     <div className="w-full">
       {/* Label */}
       {label && (
         <label htmlFor={id} className="block mb-2 text-sm font-medium">
           {label}
           {props.required && <span className="text-red-500 ml-1">*</span>}
         </label>
       )}

       {/* Input */}
       <input
         ref={ref}
         id={id}
         className={baseStyles}
         aria-invalid={error ? 'true' : 'false'}
         aria-describedby={errorId}
         {...props}
       />

       {/* Error Message */}
       {error && (
         <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
           {error}
         </p>
       )}
     </div>
   );
   ```

**關鍵設計決策**：

1. **外層 div 包裹**：
   - 將 label、input、error 組合成一個單元
   - 方便佈局管理

2. **Required 標記**：
   - 自動顯示紅色星號（*）
   - 只在有 label 且 required 時顯示

3. **Error role="alert"**：
   - 螢幕閱讀器立即讀出錯誤
   - ARIA Live Region

**綠燈確認**：所有測試通過（11/11） ✅

---

### 第 3 步：問題修正與品質檢查

**遇到的問題與解決方案**：

1. **問題：測試中未使用的變數**
   - **警告**：`rerender` is assigned a value but never used
   - **解決**：移除未使用的解構賦值
   ```typescript
   // ❌ 前
   const { rerender } = render(...);

   // ✅ 後
   render(...);
   ```

---

## ✅ 品質檢查結果

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| 測試通過 | ✅ | 11/11 測試全部通過 |
| TypeScript 型別 | ✅ | 無型別錯誤 |
| ESLint | ✅ | 無 lint 錯誤 |
| 程式碼覆蓋 | ✅ | 核心邏輯完整覆蓋 |

**測試案例統計**：
- 基本渲染：1 個測試
- Label 功能：2 個測試
- 互動事件：1 個測試
- 錯誤狀態：2 個測試
- 狀態管理：3 個測試
- Props 傳遞：2 個測試

---

## 🎯 核心概念總結

### 1. 受控元件模式

**單向資料流**：
```
State (React) → Props → Input 顯示
     ↑                      ↓
     └─── onChange ─────────┘
```

**優勢**：
- React 是唯一的數據來源
- 易於驗證和格式化
- 可以實時響應變化

---

### 2. 無障礙設計模式

**完整的 ARIA 屬性**：
```typescript
<input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}
```

**好處**：
- 螢幕閱讀器可以讀出錯誤
- 符合 WCAG 2.1 標準
- 改善所有使用者體驗

---

### 3. forwardRef 模式

**允許父元件控制 DOM**：
```typescript
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 父元件使用
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} />
inputRef.current?.focus(); // ✅ 可用
```

---

### 4. useId Hook

**生成唯一 ID**：
```typescript
const generatedId = useId(); // :r1:
const id = providedId || generatedId;
```

**避免 ID 衝突**：
- 每次調用生成新 ID
- SSR 安全
- 允許使用者覆蓋

---

## 📦 產出檔案

### 主要檔案

1. **`frontend/components/ui/input.tsx`** (97 行)
   - Input 元件實作
   - 完整 TypeScript 型別
   - forwardRef 支援
   - 無障礙設計

2. **`frontend/__tests__/components/ui/input.test.tsx`** (95 行)
   - 11 個完整測試案例
   - 涵蓋所有功能與邊界情況

### 輔助產出

3. **`specs/001-eternal-library-mvp/learning/T017-Input.md`**
   - 此學習報告檔案

---

## 🔑 關鍵性與影響

**對 Phase 0 的影響**：
- ✅ **表單基礎**：提供整個專案的輸入框標準
- ✅ **無障礙標準**：展示 ARIA 屬性的正確使用
- ✅ **設計一致性**：統一所有輸入框的外觀與行為

**對整體專案的影響**：
- ✅ 建立表單元件的基礎模式
- ✅ 展示 forwardRef 的使用方式
- ✅ 提供無障礙設計的範例

**使用場景**：
- 問題輸入框（首頁）
- 登入/註冊表單
- 搜尋框
- 設定頁面的輸入欄位

---

## 📚 延伸學習資源

1. **React 表單**：
   - [Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
   - [forwardRef](https://react.dev/reference/react/forwardRef)
   - [useId](https://react.dev/reference/react/useId)

2. **無障礙設計**：
   - [WAI-ARIA: Text Input](https://www.w3.org/WAI/ARIA/apg/patterns/input/)
   - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

3. **表單驗證**：
   - [React Hook Form](https://react-hook-form.com/)
   - [Zod Schema Validation](https://zod.dev/)

---

**報告完成時間**：2025-12-16
**下一個任務**：T018 - Modal 元件
