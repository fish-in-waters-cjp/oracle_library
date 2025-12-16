# FadeIn 動畫元件開發學習報告

**開發者**: Developer B
**任務編號**: Phase0-FadeIn
**任務等級**: A 級
**完成日期**: 2025-12-17
**Commit Hash**: 0999044
**測試通過**: ✅ 8/8 (100%)

---

## 任務背景

此任務為 **Phase 0 補充任務**，在執行 Developer B 的 US5 任務前需要完整的動畫元件支援：

- **US5 NFTDetailModal (T084)** 需要 FadeIn 動畫顯示模態框
- **US3 DrawResultOverlay (T065)** 需要 FadeIn 動畫顯示抽卡結果
- **通用需求**: 所有頁面載入、內容展示場景都需要淡入動畫

原 tasks.md 中 Phase 0 缺少 FadeIn 動畫元件，因此建立此補充任務。

---

## 技術要點

### 1. Framer Motion 基礎

FadeIn 元件使用 Framer Motion 實現動畫效果：

```typescript
import { motion, Variants } from 'framer-motion';

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={variants}
>
  {children}
</motion.div>
```

**學習重點**:
- `motion.div`: Framer Motion 提供的可動畫 div 元素
- `variants`: 定義動畫狀態的物件
- `initial/animate`: 控制初始和目標狀態
- `transition`: 設定動畫參數（duration, ease, delay）

### 2. 方向性位移動畫

實現 4 個方向 + 無位移的淡入效果：

```typescript
const getInitialPosition = () => {
  switch (direction) {
    case 'up':
      return { y: distance, opacity: 0 };  // 從下方淡入
    case 'down':
      return { y: -distance, opacity: 0 }; // 從上方淡入
    case 'left':
      return { x: distance, opacity: 0 };  // 從右方淡入
    case 'right':
      return { x: -distance, opacity: 0 }; // 從左方淡入
    case 'none':
    default:
      return { opacity: 0 };               // 無位移淡入
  }
};
```

**關鍵理解**:
- `y: distance` 表示元素初始位置在目標位置**下方** distance 像素
- 動畫會從下方移動到目標位置 (y: 0)，形成「向上淡入」效果
- X 軸同理：`x: distance` 表示從右方淡入

### 3. TypeScript 型別定義

```typescript
export type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: FadeInDirection;
  distance?: number;
  className?: string;
  disabled?: boolean;
}
```

**型別安全**:
- Union type 限制方向只能是 5 個預定義值
- Optional 參數都有合理的預設值
- `disabled` flag 用於可及性支援（減弱動效）

### 4. 交錯動畫 (Staggered Animation)

在 demo 頁面中展示如何用 `delay` 實現交錯效果：

```tsx
<FadeIn direction="up" delay={0}>
  <Card>卡片 1</Card>
</FadeIn>
<FadeIn direction="up" delay={0.1}>
  <Card>卡片 2</Card>
</FadeIn>
<FadeIn direction="up" delay={0.2}>
  <Card>卡片 3</Card>
</FadeIn>
<FadeIn direction="up" delay={0.3}>
  <Card>卡片 4</Card>
</FadeIn>
```

**效果**: 4 張卡片依序從下方淡入，間隔 0.1 秒

---

## 實作過程

### 1. TDD 開發流程

遵循 Test-Driven Development：

#### Red (寫測試 - 失敗)
```bash
bunx vitest run __tests__/components/animation/fade-in.test.tsx
# ❌ 8 tests failed - Component not found
```

#### Green (寫實作 - 通過)
實作 `components/animation/fade-in.tsx` 後：
```bash
bunx vitest run __tests__/components/animation/fade-in.test.tsx
# ✅ 8 tests passed (100%)
```

#### Refactor (重構 - 已最佳化)
初始實作已經簡潔，無需重構。

### 2. 測試覆蓋率

8 個測試案例涵蓋所有功能：

| 測試案例 | 目的 |
|---------|------|
| 渲染子元素內容 | 驗證基本渲染功能 |
| 預設延遲為 0 | 驗證預設參數 |
| 接受自訂延遲時間 | 驗證 delay prop |
| 接受自訂持續時間 | 驗證 duration prop |
| 接受自訂 className | 驗證樣式擴充性 |
| 支援 Y 軸位移淡入 | 驗證上下方向動畫 |
| 支援 X 軸位移淡入 | 驗證左右方向動畫 |
| 可以禁用動畫 | 驗證可及性支援 |

**覆蓋率**: 100% (所有程式碼路徑都有測試)

### 3. Design System 整合

在 `app/design-system/page.tsx` 新增「淡入動畫」section，展示：

1. **基本淡入（無位移）**
   - 展示最簡單的 opacity 動畫

2. **從下向上淡入（4 張卡片）**
   - 展示交錯動畫效果
   - 使用不同稀有度的卡片增加視覺豐富度

3. **從左向右淡入（3 個 Alert）**
   - 展示 X 軸方向動畫
   - 使用不同類型的 Alert (info, success, warning)

4. **從右向左淡入（4 個 Badge）**
   - 展示反向 X 軸動畫
   - 使用稀有度 Badge 展示實際應用場景

---

## 遇到的問題與解決

### 問題 1: 測試環境 document is not defined

**錯誤訊息**:
```bash
ReferenceError: document is not defined
```

**原因**: 使用 `bun test` 執行測試時，jsdom 環境未正確初始化

**解決方案**: 改用 `bunx vitest` 執行測試
```bash
# ❌ 會失敗
bun test __tests__/components/animation/fade-in.test.tsx

# ✅ 正確方式
bunx vitest run __tests__/components/animation/fade-in.test.tsx
```

**學習**:
- `bun test` 和 `bunx vitest` 使用不同的測試環境初始化機制
- Vitest 的 jsdom 環境需要透過 `bunx vitest` 才能正確載入
- 已在 Badge 元件開發時遇過同樣問題，這次直接使用正確指令

### 問題 2: 方向參數的直覺性

**疑問**: 為什麼 `direction="up"` 要設定 `y: distance` (正值)？

**答案**:
- `y: distance` 表示元素初始位置在目標位置**下方**
- 動畫會從下方移動到 `y: 0` (目標位置)
- 視覺效果就是「向上移動」= 「從下向上淡入」

**座標系統理解**:
```
        up (y: -distance)
             ↑
left        元素        right
(x: -distance) → (0,0) ← (x: distance)
             ↓
       down (y: distance)
```

---

## 實際應用場景

### 1. 頁面載入動畫
```tsx
<FadeIn direction="up" delay={0}>
  <Header />
</FadeIn>
<FadeIn direction="up" delay={0.1}>
  <MainContent />
</FadeIn>
```

### 2. 模態框顯示
```tsx
<FadeIn duration={0.3}>
  <Modal>
    <h2>NFT Details</h2>
    {/* modal content */}
  </Modal>
</FadeIn>
```

### 3. 列表項目交錯動畫
```tsx
{items.map((item, index) => (
  <FadeIn key={item.id} direction="up" delay={index * 0.05}>
    <ListItem>{item.name}</ListItem>
  </FadeIn>
))}
```

### 4. 可及性支援
```tsx
// 使用者偏好設定：減少動效
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<FadeIn disabled={prefersReducedMotion}>
  <Content />
</FadeIn>
```

---

## 與其他元件的整合

### 與 Badge 組合
```tsx
<FadeIn direction="right" delay={0.2}>
  <Badge variant="legendary">Legendary</Badge>
</FadeIn>
```

### 與 Card 組合
```tsx
<FadeIn direction="up" delay={0.1}>
  <Card title="NFT #001" rarity="epic">
    <Badge variant="epic">Epic</Badge>
    <p>Content here</p>
  </Card>
</FadeIn>
```

### 與 Alert 組合
```tsx
<FadeIn direction="left" delay={0}>
  <Alert type="success">操作成功！</Alert>
</FadeIn>
```

---

## 效能考量

### 1. Framer Motion 最佳化

Framer Motion 已內建多項效能最佳化：
- 使用 CSS transforms (GPU 加速)
- 自動批次更新 (batch updates)
- 只重繪需要動畫的元素

### 2. 避免過度使用

**不建議**:
```tsx
// ❌ 過多動畫影響效能
{items.map((item, index) => (
  <FadeIn direction="up" delay={index * 0.1}>  // 100 個項目 = 10 秒動畫
    <Item>{item}</Item>
  </FadeIn>
))}
```

**建議**:
```tsx
// ✅ 限制交錯動畫數量
{items.slice(0, 10).map((item, index) => (
  <FadeIn direction="up" delay={index * 0.05}>
    <Item>{item}</Item>
  </FadeIn>
))}
{items.slice(10).map((item) => (
  <Item>{item}</Item>  // 剩餘項目無動畫
))}
```

### 3. 可及性支援

尊重使用者的動效偏好：
```tsx
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<FadeIn disabled={prefersReducedMotion}>
  <Content />
</FadeIn>
```

---

## 學習收穫

### 1. Framer Motion 核心概念

- **Variants**: 定義動畫狀態的優雅方式
- **Orchestration**: 使用 delay 實現複雜的編排動畫
- **Transitions**: 控制動畫時間和緩動函數

### 2. 動畫設計原則

- **Duration**: 通常 0.3-0.6 秒為最佳體驗
- **Easing**: `easeOut` 適合入場動畫（快速開始，緩慢結束）
- **Stagger delay**: 0.05-0.1 秒為最佳間隔

### 3. 可組合性 (Composability)

FadeIn 是一個**包裝元件** (Wrapper Component)：
- 不限制子元素類型
- 可以包裝任何 React 元件
- 通過 `className` 提供樣式擴充

### 4. 可及性 (Accessibility)

- 提供 `disabled` prop 讓動畫可關閉
- 可搭配 `prefers-reduced-motion` 媒體查詢
- 動畫不應妨礙內容可讀性

---

## 後續任務依賴

FadeIn 元件將用於以下任務：

### US3: 神諭抽取功能
- **T065 DrawResultOverlay**: 抽卡結果彈窗的淡入動畫

### US5: NFT 收藏管理
- **T084 NFTDetailModal**: NFT 詳情模態框的淡入動畫
- **T083 NFTCard**: NFT 卡片的 hover 放大可結合淡入效果

### 通用場景
- 頁面載入動畫
- 內容區塊依序顯示
- 模態框、彈窗顯示

---

## 與 Badge 元件的對比

| 項目 | Badge 元件 (B 級) | FadeIn 元件 (A 級) |
|------|------------------|-------------------|
| **複雜度** | 簡單 (純樣式元件) | 中等 (動畫邏輯) |
| **外部依賴** | 無 | Framer Motion |
| **測試難度** | 低 (樣式驗證) | 中 (動畫行為驗證) |
| **用途** | 標籤顯示 | 動畫包裝 |
| **Props 數量** | 3 (variant, children, className) | 7 (多種動畫參數) |
| **重用性** | 高 (特定場景) | 極高 (通用場景) |

---

## 總結

FadeIn 動畫元件成功實現了：

✅ **完整功能**: 5 個方向、可配置延遲和持續時間
✅ **100% 測試覆蓋**: 8/8 測試通過
✅ **Design System 整合**: 4 種展示場景
✅ **可及性支援**: disabled prop 讓動畫可關閉
✅ **Type-safe**: 完整的 TypeScript 型別定義
✅ **可組合性**: 可包裝任何 React 元件

此元件為 Phase 0 補充任務，成功填補了動畫基礎設施的缺口，為後續 US3、US5 任務提供了必要的動畫支援。

**下一步**: 繼續實作 ScaleSpring 和 CountUp 動畫元件，完成 Phase 0 動畫元件的全面覆蓋。
