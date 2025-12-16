# T026 學習報告：answers.json 資料檔案

**任務編號**：T026
**技術等級**：資料準備
**完成時間**：2025-12-16

## 核心功能

1. **50 個神諭訊息**：符合產品規格
2. **稀有度分布**：Common(18), Rare(15), Epic(10), Legendary(7)
3. **雙語支援**：中文（zh-tw）和英文（en）
4. **結構化資料**：JSON 格式，易於程式讀取

## 資料結構

```typescript
interface Answer {
  id: number;              // 1-50 連續 ID
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  message: {
    'zh-tw': string;       // 繁體中文訊息
    en: string;            // 英文訊息
  };
}
```

## 稀有度設計

| 稀有度 | 數量 | 主題 |
|--------|------|------|
| Common | 18 | 基礎智慧、日常指引 |
| Rare | 15 | 深度洞察、人生建議 |
| Epic | 10 | 轉折預示、重要決策 |
| Legendary | 7 | 命運轉折、重大啟示 |

## 訊息範例

**Common 範例**：
```json
{
  "id": 1,
  "rarity": "common",
  "message": {
    "zh-tw": "耐心是通往成功的道路",
    "en": "Patience is the path to success"
  }
}
```

**Legendary 範例**：
```json
{
  "id": 50,
  "rarity": "legendary",
  "message": {
    "zh-tw": "此刻的選擇，將改變你的命運軌跡",
    "en": "The choice you make now will change your destiny"
  }
}
```

## 驗證規則

測試確保資料品質：
1. ✅ 恰好 50 個答案
2. ✅ ID 連續且無重複 (1-50)
3. ✅ 每個答案有必要欄位 (id, rarity, message)
4. ✅ 稀有度分布正確 (18/15/10/7)
5. ✅ 中英文內容非空
6. ✅ 稀有度值在允許範圍內
7. ✅ ID 為正整數

## 使用場景

**在 React 中載入**：
```typescript
import answers from '@/public/data/answers.json';

// 隨機抽取
const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

// 按稀有度過濾
const legendaryAnswers = answers.filter(a => a.rarity === 'legendary');
```

**在 Phaser 中使用**：
```typescript
// 預載入
this.load.json('answers', '/data/answers.json');

// 使用
const answers = this.cache.json.get('answers');
```

## 測試覆蓋

✅ 7/7 測試通過
- 數量驗證（50 個）
- 結構驗證（必要欄位）
- ID 驗證（連續無重複）
- 稀有度分布驗證
- 內容驗證（非空）
- 類型驗證

## 產出檔案

- `frontend/public/data/answers.json` (50 個答案)
- `frontend/__tests__/data/answers.test.ts` (驗證測試)

## 關鍵學習

1. **結構化資料設計**：清晰的型別定義
2. **資料驗證**：自動化測試確保品質
3. **國際化考量**：雙語訊息結構
4. **稀有度系統**：符合遊戲經濟設計
