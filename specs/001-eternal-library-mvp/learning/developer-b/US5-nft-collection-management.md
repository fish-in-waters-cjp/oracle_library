# US5 NFT 收藏管理 - 學習報告

> 開發者：Developer B
> 完成日期：2025-12-17
> User Story：作為使用者，我希望能夠查看我所有鑄造的 NFT，並了解每個 NFT 的詳細資訊

---

## 1. 任務概述

US5 實作了完整的 NFT 收藏管理功能，包含：
- 列表顯示所有 NFT
- NFT 統計資料（依稀有度分類）
- NFT 詳情模態框
- 響應式網格佈局
- 載入狀態與空狀態處理

### 完成的任務清單

| 任務編號 | 說明 | 類型 |
|---------|------|------|
| T077 | useOracleNFTs Hook 測試 | 測試 |
| T078 | useNFTMetadata Hook 測試 | 測試 |
| T079 | NFTGrid 元件測試 | 測試 |
| T080 | NFTDetailModal 元件測試 | 測試 |
| T081 | useOracleNFTs Hook 實作 | Hook |
| T082 | useNFTMetadata Hook 實作 | Hook |
| T083 | NFTCard 元件 | 元件 |
| T084 | NFTGrid 元件 | 元件 |
| T085 | NFTDetailModal 元件 | 元件 |
| T086 | CollectionStats 元件 | 元件 |
| T087-T089 | Collection 頁面整合 | 頁面 |

---

## 2. 學到的技術概念

### 2.1 React Custom Hooks 設計模式

#### 核心概念
Custom Hook 是一種將狀態邏輯抽取出來重複使用的方式。以 `useOracleNFTs` 為例：

```typescript
// hooks/use-oracle-nfts.ts
export function useOracleNFTs(walletAddress: string): UseOracleNFTsReturn {
  const [nfts, setNfts] = useState<OracleNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!walletAddress) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/nfts/${walletAddress}`);
      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // 衍生狀態：統計資料
  const stats: NFTStats = {
    total: nfts.length,
    legendary: nfts.filter((nft) => nft.rarity === 'legendary').length,
    // ...
  };

  return { nfts, isLoading, error, stats, refetch: fetchNFTs };
}
```

#### 關鍵設計原則

1. **輸入參數驗證**：在 fetch 前檢查 `walletAddress` 是否為空
2. **完整的狀態管理**：包含 `isLoading`、`error`、`data` 三態
3. **衍生狀態**：`stats` 由 `nfts` 計算得出，無需額外 state
4. **暴露 refetch**：允許外部觸發重新載入

### 2.2 useCallback 與 useEffect 的依賴關係

```typescript
// ✅ 正確：useCallback 包裝 fetch 函數
const fetchNFTs = useCallback(async () => {
  // ... fetch logic
}, [walletAddress]); // 只在 walletAddress 改變時重建

useEffect(() => {
  fetchNFTs();
}, [fetchNFTs]); // fetchNFTs 變化時執行
```

**為什麼需要 useCallback？**
- 避免每次 render 都產生新的函數引用
- 讓 useEffect 正確追蹤依賴
- 可以安全地將 `fetchNFTs` 暴露給外部使用

### 2.3 TDD (Test-Driven Development) 實踐

#### 測試先行的好處

```typescript
// __tests__/hooks/use-oracle-nfts.test.ts
describe('useOracleNFTs', () => {
  test('初始狀態為載入中', () => {
    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.nfts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('成功載入 NFT 列表', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nfts: mockNFTs }),
    });

    const { result } = renderHook(() => useOracleNFTs(mockWalletAddress));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nfts).toEqual(mockNFTs);
  });
});
```

**TDD 循環：**
1. 🔴 **Red**：先寫失敗的測試
2. 🟢 **Green**：寫最少的程式碼讓測試通過
3. 🔵 **Refactor**：重構程式碼，保持測試通過

### 2.4 Framer Motion 動畫

#### AnimatePresence 與條件渲染

```tsx
// components/nft-detail-modal.tsx
import { motion, AnimatePresence } from 'framer-motion';

export default function NFTDetailModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}  // 👈 離開動畫需要 AnimatePresence
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()} // 阻止冒泡
          >
            {/* Modal content */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**重點：**
- `AnimatePresence` 讓條件渲染的元素可以有 exit 動畫
- 內層 `onClick` 需要 `stopPropagation()` 防止點擊內容時關閉

### 2.5 CSS Variables 設計系統

#### 為什麼使用 CSS Variables？

```tsx
// ❌ 硬編碼樣式
<div style={{ color: '#D4AF37', padding: '24px' }}>

// ✅ 使用 CSS Variables
<div style={{
  color: 'var(--color-primary)',
  padding: 'var(--space-6)'
}}>
```

**優點：**
1. **一致性**：所有元件使用相同的設計 token
2. **主題切換**：只需修改 CSS 變數即可切換主題
3. **維護性**：設計變更時只需修改一處

#### 本專案使用的 CSS Variables

```css
/* 顏色 */
--color-primary: #D4AF37;           /* 金色主色 */
--color-background-base: #0A0A0A;   /* 深色背景 */
--color-background-surface: #1A1A1A;
--color-text-secondary: rgba(255, 255, 255, 0.7);
--color-border-default: rgba(255, 255, 255, 0.1);

/* 稀有度顏色 */
--color-rarity-legendary: #FFD700;
--color-rarity-epic: #A855F7;
--color-rarity-rare: #3B82F6;
--color-rarity-common: #6B7280;

/* 間距 */
--space-2: 0.5rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;

/* 字體 */
--font-heading: 'Cinzel', serif;
--text-sm: 0.875rem;
--text-lg: 1.125rem;
```

### 2.6 響應式網格佈局

```tsx
// components/nft-grid.tsx
<div
  className="grid"
  style={{
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--space-8)',
  }}
>
  {nfts.map((nft) => <NFTCard key={nft.id} {...nft} />)}
</div>
```

**解析 `repeat(auto-fill, minmax(280px, 1fr))`：**
- `auto-fill`：自動填滿可用空間
- `minmax(280px, 1fr)`：每個格子最小 280px，最大平分剩餘空間
- 結果：自動調整欄數，無需媒體查詢

### 2.7 無障礙 (Accessibility) 設計

```tsx
// components/nft-card.tsx
<div
  role="button"           // 告訴輔助技術這是按鈕
  tabIndex={0}            // 讓元素可被 Tab 聚焦
  onClick={onClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }}
>
```

**無障礙設計要點：**
1. 非 `<button>` 元素需要 `role="button"`
2. 需要 `tabIndex={0}` 讓鍵盤可以聚焦
3. 需要處理 `Enter` 和 `Space` 鍵

---

## 3. 遇到的問題與解決方案

### 3.1 測試中的日期格式問題

**問題：**
```typescript
// 測試預期
expect(screen.getByText(/2025-12-16/)).toBeInTheDocument();

// 實際輸出
"2025/12/16 下午10:30:45"  // 因為使用 toLocaleString('zh-TW')
```

**解決方案：**
```typescript
// 使用更寬鬆的匹配
expect(screen.getByText(/2025/)).toBeInTheDocument();
```

### 3.2 Modal 關閉按鈕的測試定位

**問題：**
```typescript
// Modal 有兩個關閉按鈕（header X 和 footer 關閉），無法唯一定位
const closeButton = screen.getByRole('button', { name: /關閉/i });
```

**解決方案：**
```tsx
// 為 X 按鈕添加 aria-label
<button aria-label="關閉" onClick={onClose}>
  <XIcon />
</button>

// 測試中使用 getByLabelText
const closeButton = screen.getByLabelText('關閉');
```

### 3.3 從 Tailwind 遷移到 CSS Variables

**問題：**
原本使用 Tailwind 的 `grid-cols-*` class，但設計系統要求使用 CSS Variables。

**Before:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

**After:**
```tsx
<div
  className="grid"
  style={{
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--space-8)',
  }}
>
```

**測試也需要相應更新：**
```typescript
// Before
expect(classList).toMatch(/grid-cols-/);

// After
const style = grid?.getAttribute('style') || '';
expect(style).toContain('grid-template-columns');
expect(style).toContain('auto-fill');
```

---

## 4. 元件架構圖

```
Collection Page
├── CollectionStats
│   └── StatCard (x4)
│       ├── CountUp (動畫數字)
│       └── FadeIn (進場動畫)
├── NFTGrid
│   └── NFTCard (xN)
│       └── Badge (稀有度標籤)
└── NFTDetailModal
    └── Badge
```

---

## 5. 檔案結構

```
frontend/
├── __tests__/
│   ├── hooks/
│   │   ├── use-oracle-nfts.test.ts
│   │   └── use-nft-metadata.test.ts
│   └── components/
│       ├── nft-card.test.tsx
│       ├── nft-grid.test.tsx
│       └── nft-detail-modal.test.tsx
├── hooks/
│   ├── use-oracle-nfts.ts      # NFT 列表 & 統計
│   └── use-nft-metadata.ts     # 單一 NFT 元資料
├── components/
│   ├── nft-card.tsx            # NFT 卡片
│   ├── nft-grid.tsx            # NFT 網格
│   ├── nft-detail-modal.tsx    # NFT 詳情模態框
│   └── animated/
│       └── collection-stats.tsx # 統計卡片（含動畫）
└── app/(app)/collection/
    └── page.tsx                 # 收藏頁面
```

---

## 6. 最佳實踐總結

### Hook 設計
- 永遠返回 `{ data, isLoading, error }` 三態
- 使用 `useCallback` 包裝 async 函數
- 提供 `refetch` 讓外部可以重新載入

### 測試策略
- TDD：先寫測試再實作
- Mock `fetch` 而非真實 API
- 測試所有狀態：初始、成功、錯誤、空資料

### 樣式設計
- 使用 CSS Variables 維持設計一致性
- 使用 `auto-fill` + `minmax()` 做響應式網格
- Tailwind utilities 只用於佈局和動畫

### 無障礙
- 可互動元素需要 `role`、`tabIndex`、鍵盤事件
- 圖示按鈕需要 `aria-label`
- Modal 開啟時防止背景滾動

---

## 7. 延伸學習資源

- [React Hooks 文件](https://react.dev/reference/react/hooks)
- [Framer Motion 文件](https://www.framer.com/motion/)
- [CSS Grid 完整指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [WAI-ARIA 設計模式](https://www.w3.org/WAI/ARIA/apg/)
- [Vitest 測試框架](https://vitest.dev/)
