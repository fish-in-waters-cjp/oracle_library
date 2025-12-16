# T016 學習報告：Button 元件

**任務編號**：T016
**技術等級**：B 級（基礎 UI 元件）
**完成時間**：2025-12-16
**學習模式**：完整學習模式（`--learn`）

---

## 📚 前置學習內容

### 1. React 元件設計原則

**SOLID 原則在 React 中的應用**：

1. **單一職責原則（Single Responsibility Principle）**：
   - 一個元件只負責一件事
   - Button 元件只負責按鈕的外觀與互動
   - 不包含業務邏輯（如 API 呼叫、狀態管理）

   **範例**：
   ```typescript
   // ✅ 好的設計：Button 只負責 UI
   <Button onClick={handleSubmit}>提交</Button>

   // ❌ 壞的設計：Button 包含業務邏輯
   <Button onClickDoesEverything={async () => {
     const data = await fetchAPI();
     updateState(data);
     showNotification();
   }}>
     提交
   </Button>
   ```

2. **開放封閉原則（Open/Closed Principle）**：
   - 對擴展開放：透過 props 支援多種變體
   - 對修改封閉：不需修改元件程式碼即可自訂樣式

   **範例**：
   ```typescript
   // ✅ 透過 props 擴展功能
   <Button variant="primary" size="lg" className="my-custom-class">
     自訂按鈕
   </Button>

   // ❌ 為每個變體創建新元件
   <PrimaryButton />
   <SecondaryButton />
   <OutlineButton />
   ```

3. **組合優於繼承（Composition over Inheritance）**：
   ```typescript
   // ✅ 組合：靈活且可重用
   <Button variant="primary">
     <Icon name="check" />
     確認
   </Button>

   // ❌ 繼承：僵化且難以擴展
   class SubmitButton extends Button {
     render() { return <button>提交</button>; }
   }
   ```

---

### 2. Tailwind CSS 設計系統

**原子化 CSS（Utility-First CSS）哲學**：

**傳統 CSS 方式**：
```css
/* styles.css */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
```

```tsx
<button className="btn btn-primary">按鈕</button>
```

**Tailwind CSS 方式**：
```tsx
<button className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">
  按鈕
</button>
```

**優勢**：

1. **無需命名**：不用為每個樣式想名字
2. **可見性**：樣式就在 HTML 中，一目瞭然
3. **無副作用**：修改不影響其他元件
4. **Tree-shaking**：未使用的樣式自動移除

**條件樣式組合**：

```typescript
import { cn } from '@/lib/utils';

const buttonClass = cn(
  'px-4 py-2 rounded-lg',              // 基礎樣式
  variant === 'primary' && 'bg-blue-600',  // 條件樣式
  disabled && 'opacity-50 cursor-not-allowed'  // 狀態樣式
);
```

---

### 3. clsx 與 twMerge 工具函數

**clsx 的作用**：

```typescript
import { clsx } from 'clsx';

// 基本用法
clsx('foo', 'bar');  // → 'foo bar'

// 條件式
clsx('foo', isActive && 'active');  // → 'foo active' (if isActive is true)

// 物件形式
clsx({ foo: true, bar: false });  // → 'foo'

// 陣列形式
clsx(['foo', 'bar']);  // → 'foo bar'

// 混合使用
clsx('btn', { primary: isPrimary }, ['rounded', 'shadow']);
```

**twMerge 的必要性**：

**問題**：Tailwind class 會衝突

```typescript
// 只用 clsx
clsx('p-4', 'p-2')  // → 'p-4 p-2'
// 兩個 padding 都存在，p-2 覆蓋 p-4，但 HTML 中兩者都在
```

**解決**：使用 twMerge

```typescript
import { twMerge } from 'tailwind-merge';

twMerge('p-4', 'p-2')  // → 'p-2'
// 自動解決衝突，只保留最後一個
```

**cn 輔助函數**（來自 shadcn/ui）：

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**實際應用**：

```typescript
// 使用者可以覆蓋預設樣式
<Button className="p-6">大 padding 按鈕</Button>

// cn 確保使用者的 className 優先
cn('p-4', className)  // 如果 className='p-6'，結果是 'p-6'
```

---

### 4. Button 元件的核心功能

**必備 Props 設計**：

1. **variant（變體）**：

   | Variant | 用途 | 範例 |
   |---------|------|------|
   | `primary` | 主要動作 | 「確認」、「提交」、「保存」 |
   | `secondary` | 次要動作 | 「取消」、「返回」 |
   | `outline` | 較不突出的動作 | 「了解更多」、「查看詳情」 |

   **設計原則**：
   - 每個頁面只有一個 primary 按鈕
   - Primary 按鈕顏色最突出（高對比度）
   - Secondary 按鈕較低調

2. **size（尺寸）**：

   | Size | Padding | 字體 | 用途 |
   |------|---------|------|------|
   | `sm` | px-3 py-1.5 | text-sm | 次要操作、表格內按鈕 |
   | `md` | px-4 py-2 | text-base | 一般按鈕（預設） |
   | `lg` | px-6 py-3 | text-lg | 重要 CTA（Call to Action） |

3. **loading（載入狀態）**：

   **設計要求**：
   - 顯示轉圈動畫（提供視覺反饋）
   - 禁用點擊（防止重複提交）
   - **保持按鈕寬度**（避免佈局跳動）

   **實作技巧**：
   ```typescript
   // ❌ 壞的做法：直接替換內容
   {loading ? <Spinner /> : children}
   // 問題：按鈕寬度會變化，導致佈局跳動

   // ✅ 好的做法：使用 absolute positioning 疊加
   <>
     {loading && <Spinner className="absolute" />}
     <span className={loading && 'opacity-0'}>{children}</span>
   </>
   // 優勢：文字仍佔位，按鈕寬度不變
   ```

4. **disabled（禁用狀態）**：

   **設計要點**：
   - 降低不透明度（`opacity-50`）
   - 顯示 `not-allowed` 游標
   - 禁用所有互動事件（React 的 `disabled` prop）

---

### 5. TypeScript 型別設計

**繼承 ButtonHTMLAttributes 的好處**：

```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}
```

**好處**：

1. **自動獲得原生屬性**：
   ```typescript
   <Button
     onClick={handleClick}      // ✅ 有型別提示
     onMouseEnter={handleHover} // ✅ 有型別提示
     aria-label="提交"          // ✅ 有型別提示
     data-testid="submit-btn"   // ✅ 有型別提示
   />
   ```

2. **型別安全**：
   ```typescript
   <Button onClick={123} />  // ❌ TypeScript 錯誤
   <Button href="/" />       // ❌ TypeScript 錯誤（不是 button 屬性）
   ```

3. **支援 ref**：
   ```typescript
   const buttonRef = useRef<HTMLButtonElement>(null);
   <Button ref={buttonRef} />  // ✅ 型別正確
   ```

---

## 🛠️ 實作過程

### 第 1 步：TDD Red Light（測試先行）

**建立測試檔案**：`__tests__/components/ui/button.test.tsx`

**測試案例設計**（13 個測試）：

1. **基本功能測試**：
   ```typescript
   test('渲染基本按鈕', () => {
     render(<Button>點擊我</Button>);
     expect(screen.getByRole('button', { name: '點擊我' })).toBeInTheDocument();
   });
   ```

2. **變體樣式測試**：
   ```typescript
   test('primary variant 樣式', () => {
     render(<Button variant="primary">主要按鈕</Button>);
     const button = screen.getByRole('button');
     expect(button).toHaveClass('bg-blue-600');
   });
   ```

3. **尺寸樣式測試**：
   ```typescript
   test('small size 樣式', () => {
     render(<Button size="sm">小按鈕</Button>);
     const button = screen.getByRole('button');
     expect(button).toHaveClass('text-sm');
   });
   ```

4. **互動測試**：
   ```typescript
   test('處理 onClick 事件', async () => {
     const handleClick = vi.fn();
     const user = userEvent.setup();
     render(<Button onClick={handleClick}>點擊</Button>);
     await user.click(screen.getByRole('button'));
     expect(handleClick).toHaveBeenCalledTimes(1);
   });
   ```

5. **狀態測試**：
   ```typescript
   test('disabled 狀態禁用點擊', async () => {
     const handleClick = vi.fn();
     const user = userEvent.setup();
     render(<Button onClick={handleClick} disabled>禁用按鈕</Button>);
     await user.click(screen.getByRole('button'));
     expect(handleClick).not.toHaveBeenCalled();
   });
   ```

6. **載入狀態測試**：
   ```typescript
   test('loading 狀態顯示轉圈並禁用', () => {
     render(<Button loading>載入中</Button>);
     const button = screen.getByRole('button');
     expect(button).toBeDisabled();
     expect(button.querySelector('[role="status"]')).toBeInTheDocument();
   });
   ```

**紅燈確認**：測試失敗（檔案不存在） ✅

---

### 第 2 步：TDD Green Light（實作元件）

**建立元件檔案**：`components/ui/button.tsx`（119 行）

**核心實作**：

1. **型別定義**：
   ```typescript
   export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'outline';
     size?: 'sm' | 'md' | 'lg';
     loading?: boolean;
     children: ReactNode;
   }
   ```

2. **樣式組合策略**：
   ```typescript
   // 基礎樣式
   const baseStyles = cn(
     'relative inline-flex items-center justify-center',
     'rounded-lg font-medium',
     'transition-all duration-200',
     'focus-visible:outline-none focus-visible:ring-2',
     (disabled || loading) && 'opacity-50 cursor-not-allowed'
   );

   // 變體樣式（物件映射）
   const variantStyles = {
     primary: 'bg-blue-600 text-white hover:bg-blue-700',
     secondary: 'bg-gray-600 text-white hover:bg-gray-700',
     outline: 'bg-transparent border-2 border-gray-300 text-gray-700',
   };

   // 尺寸樣式（物件映射）
   const sizeStyles = {
     sm: 'px-3 py-1.5 text-sm',
     md: 'px-4 py-2 text-base',
     lg: 'px-6 py-3 text-lg',
   };
   ```

3. **載入動畫實作**：
   ```typescript
   {loading && (
     <div className="absolute inset-0 flex items-center justify-center" role="status">
       <div className="animate-spin rounded-full border-2 border-current border-r-transparent" />
     </div>
   )}

   <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
     {children}
   </span>
   ```

   **關鍵設計**：
   - 使用 `absolute` positioning 讓動畫疊加在文字上方
   - 文字設定 `opacity-0` 隱藏，但仍佔位
   - 按鈕寬度保持不變，避免佈局跳動

4. **完整元件**：
   ```typescript
   export default function Button({
     variant = 'primary',
     size = 'md',
     loading = false,
     disabled = false,
     className,
     children,
     type = 'button',
     ...props
   }: ButtonProps) {
     return (
       <button
         type={type}
         disabled={disabled || loading}
         className={cn(
           baseStyles,
           variantStyles[variant],
           sizeStyles[size],
           className
         )}
         {...props}
       >
         {/* Loading 動畫 */}
         {loading && <LoadingSpinner />}

         {/* 按鈕內容 */}
         <span className={cn('inline-flex gap-2', loading && 'opacity-0')}>
           {children}
         </span>
       </button>
     );
   }
   ```

**綠燈確認**：所有測試通過（13/13） ✅

---

### 第 3 步：問題修正與品質檢查

**遇到的問題與解決方案**：

1. **問題：Loading 動畫沒有正確定位**
   - **原因**：按鈕元素缺少 `position: relative`
   - **解決**：在 baseStyles 中添加 `relative` class
   ```typescript
   const baseStyles = cn(
     'relative inline-flex ...',  // ← 添加 relative
   );
   ```

2. **問題：測試選擇器找錯元素**
   - **錯誤**：選擇器 `span:not([role="status"])` 找到 `sr-only` 的 span
   - **解決**：改用更精確的選擇器 `span.inline-flex`
   ```typescript
   const textSpan = button.querySelector('span.inline-flex');
   ```

---

## ✅ 品質檢查結果

| 檢查項目 | 狀態 | 說明 |
|----------|------|------|
| 測試通過 | ✅ | 13/13 測試全部通過 |
| TypeScript 型別 | ✅ | 無型別錯誤 |
| ESLint | ✅ | 無 lint 錯誤 |
| 程式碼覆蓋 | ✅ | 核心邏輯完整覆蓋 |

**測試案例統計**：
- 基本渲染：1 個測試
- 變體樣式：3 個測試（primary, secondary, outline）
- 尺寸樣式：2 個測試（sm, lg）
- 互動事件：1 個測試
- 狀態測試：4 個測試（disabled, loading）
- Props 傳遞：2 個測試（className, type）

---

## 🎯 核心概念總結

### 1. 元件設計模式

**可組合設計**：
```typescript
// ✅ 靈活組合
<Button variant="primary" size="lg" className="w-full">
  <Icon name="check" />
  確認訂單
</Button>

// ✅ 支援原生 props
<Button type="submit" form="checkout-form">
  提交
</Button>
```

**單一職責**：
- Button 只負責 UI 呈現
- 不包含業務邏輯
- 易於測試與維護

---

### 2. Tailwind CSS 最佳實踐

**條件樣式組合**：
```typescript
cn(
  'base-styles',
  condition && 'conditional-styles',
  variantStyles[variant],
  className  // 使用者可覆蓋
)
```

**響應式設計**（未來擴展）：
```typescript
<Button className="w-full md:w-auto">
  響應式按鈕
</Button>
```

---

### 3. 載入狀態設計模式

**關鍵技巧**：

```typescript
// ❌ 錯誤：按鈕寬度會跳動
{loading ? <Spinner /> : children}

// ✅ 正確：保持寬度
<>
  {loading && <Spinner className="absolute" />}
  <span className={loading && 'opacity-0'}>{children}</span>
</>
```

**為什麼這樣設計？**
- 文字隱藏但仍佔位
- 按鈕寬度保持不變
- 避免佈局跳動（CLS - Cumulative Layout Shift）

---

### 4. TypeScript 型別安全

**繼承模式的威力**：

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // 自訂 props
  variant?: 'primary' | 'secondary' | 'outline';
  // 自動獲得：onClick, disabled, type, aria-*, data-*, 等等
}
```

**好處**：
- 完整的型別提示
- 編譯時錯誤檢查
- 支援所有原生 button 屬性

---

## 📦 產出檔案

### 主要檔案

1. **`frontend/components/ui/button.tsx`** (119 行)
   - Button 元件實作
   - 完整 TypeScript 型別
   - 3 種變體 × 3 種尺寸
   - 載入與禁用狀態

2. **`frontend/__tests__/components/ui/button.test.tsx`** (95 行)
   - 13 個完整測試案例
   - 涵蓋所有功能與邊界情況

### 輔助產出

3. **`specs/001-eternal-library-mvp/learning/T016-Button.md`**
   - 此學習報告檔案

---

## 🔑 關鍵性與影響

**對 Phase 0 的影響**：
- ✅ **基礎 UI**：提供整個專案的按鈕標準
- ✅ **設計一致性**：所有按鈕樣式統一
- ✅ **開發效率**：其他開發者可直接使用

**對整體專案的影響**：
- ✅ 建立 UI 元件庫的基礎
- ✅ 展示 Tailwind CSS 使用模式
- ✅ 提供可重用的設計模式範例

**使用場景**：
- 表單提交按鈕
- 對話框動作按鈕
- 導航按鈕
- CTA（Call to Action）按鈕

---

## 📚 延伸學習資源

1. **Tailwind CSS**：
   - [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first)
   - [Responsive Design](https://tailwindcss.com/docs/responsive-design)

2. **React 設計模式**：
   - [Composition vs Inheritance](https://react.dev/learn/thinking-in-react)
   - [Render Props vs HOC](https://react.dev/reference/react/Component#alternatives)

3. **無障礙設計**：
   - [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
   - [Keyboard Navigation](https://webaim.org/techniques/keyboard/)

4. **Design Systems**：
   - [Material Design: Buttons](https://m3.material.io/components/buttons/overview)
   - [shadcn/ui: Button](https://ui.shadcn.com/docs/components/button)

---

**報告完成時間**：2025-12-16
**下一個任務**：T017 - Input 元件
