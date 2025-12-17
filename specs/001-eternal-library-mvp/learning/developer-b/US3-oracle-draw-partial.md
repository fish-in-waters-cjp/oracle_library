# US3 神諭抽取功能 - 學習報告（部分完成）

> 開發者：Developer B
> 日期：2025-12-17
> User Story：作為使用者，我希望能夠消耗 MGC 抽取神諭解答

---

## 1. 本次完成的任務

| 任務編號 | 說明 | 狀態 |
|---------|------|------|
| T052 | oracle_draw 合約測試 | ✅ 完成 |
| T053 | useOracleDraw Hook 測試 | ✅ 完成 |
| T054 | useAnswers Hook 測試 | ✅ 完成 |
| T056 | random.ts 隨機函數 | ✅ 完成 |
| T057 | oracle_draw.move 合約 | ✅ 完成 |
| T058 | useAnswers Hook | ✅ 完成 |
| T059 | useOracleDraw Hook | ✅ 完成 |
| T060-T067 | Phaser 場景與整合 | ⏳ 待續 |

---

## 2. 學到的技術概念

### 2.1 Move 合約開發

#### Move Object Model

Move 使用 **能力系統 (Abilities)** 來控制物件的行為：

```move
public struct DrawRecord has key, store {
    id: UID,           // 唯一識別碼
    owner: address,    // 擁有者
    answer_id: u8,     // 答案 ID
    question_hash: vector<u8>,  // 問題 hash
    timestamp: u64,    // 時間戳
}
```

| 能力 | 說明 |
|-----|------|
| `key` | 物件可以有 UID，可被全域儲存 |
| `store` | 物件可以被嵌套、轉移 |
| `copy` | 物件可以被複製 |
| `drop` | 物件可以在作用域結束時自動銷毀 |

#### public(package) 函數

限制只有同一 package 內的模組可以呼叫：

```move
/// 只有 oracle_nft 模組可以呼叫
public(package) fun destroy_for_mint(record: DrawRecord): (u8, u64) {
    let DrawRecord { id, owner: _, answer_id, question_hash: _, timestamp } = record;
    object::delete(id);
    (answer_id, timestamp)
}
```

**用途**：封裝內部邏輯，防止外部濫用

#### Coin 操作模式

```move
// 1. 分拆精確金額
let to_burn = coin::split(&mut payment, DRAW_COST, ctx);

// 2. 處理剩餘
if (coin::value(&payment) > 0) {
    transfer::public_transfer(payment, sender);
} else {
    coin::destroy_zero(payment);  // 必須處理空 Coin
};

// 3. 銷毀支付
mgc::burn(mgc_treasury, to_burn);
```

**重點**：
- `Coin` 是線性類型，必須明確處理
- 空的 `Coin` 需要用 `destroy_zero` 銷毀
- 多餘的金額要退還使用者

### 2.2 Move 測試框架

#### test_scenario 模組

```move
use iota::test_scenario::{Self as ts, Scenario};

#[test]
fun test_draw_success() {
    // 1. 開始場景
    let mut scenario = ts::begin(ADMIN);

    // 2. 初始化模組
    mgc::init_for_testing(ts::ctx(&mut scenario));

    // 3. 切換交易
    ts::next_tx(&mut scenario, USER1);
    {
        // 取得共享物件
        let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

        // 執行操作...

        // 歸還共享物件
        ts::return_shared(treasury);
    };

    // 4. 結束場景
    ts::end(scenario);
}
```

#### 測試預期失敗

```move
#[test]
#[expected_failure(abort_code = oracle_draw::E_INVALID_ANSWER_ID)]
fun test_draw_invalid_answer_id() {
    // 測試會因為 E_INVALID_ANSWER_ID 而中止
}
```

### 2.3 前端隨機數處理

#### 為什麼隨機性在前端？

**問題**：鏈上隨機有 MEV (Miner Extractable Value) 風險
**解決**：前端產生隨機數，合約只驗證範圍

```typescript
// 加權隨機：按稀有度機率分布
export function getWeightedRandomAnswerId(): number {
  const roll = Math.random();

  if (roll < 0.6) {  // 60% Common
    return getRandomInt(0, 29);
  } else if (roll < 0.9) {  // 30% Rare
    return getRandomInt(30, 44);
  } else if (roll < 0.98) {  // 8% Epic
    return getRandomInt(45, 48);
  }
  return 49;  // 2% Legendary
}
```

#### 問題隱私保護

```typescript
// FNV-1a hash（非密碼學安全，僅用於隱私）
export function hashQuestion(question: string): Uint8Array {
  if (!question) return new Uint8Array(0);

  const encoder = new TextEncoder();
  const data = encoder.encode(question);

  let hash = 2166136261;
  for (const byte of data) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }

  // 轉換為 4 bytes
  return new Uint8Array([
    (hash >>> 24) & 0xff,
    (hash >>> 16) & 0xff,
    (hash >>> 8) & 0xff,
    hash & 0xff,
  ]);
}
```

### 2.4 React Hooks 設計

#### useAnswers Hook

```typescript
export function useAnswers(): UseAnswersReturn {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入靜態 JSON
  useEffect(() => {
    const loadAnswers = async () => {
      const response = await fetch('/data/answers.json');
      const data = await response.json();
      setAnswers(data);
    };
    loadAnswers();
  }, []);

  // 建立 Map 提供 O(1) 查詢
  const answerMap = useMemo(() => {
    return new Map(answers.map((a) => [a.id, a]));
  }, [answers]);

  return {
    answers,
    isLoading,
    error,
    getAnswerById: (id) => answerMap.get(id),
    getWeightedRandomAnswerId,
    // ...
  };
}
```

#### useOracleDraw Hook

```typescript
export function useOracleDraw(config): UseOracleDrawReturn {
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);

  const draw = useCallback(async ({ question, answerId, mgcCoinId }) => {
    setIsDrawing(true);
    try {
      const questionHash = hashQuestion(question);
      const result = await signAndExecuteTransaction({
        transaction: buildDrawTransaction(answerId, questionHash, mgcCoinId),
      });
      setDrawResult(extractDrawResult(result));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDrawing(false);
    }
  }, [signAndExecuteTransaction]);

  return { isDrawing, error, drawResult, draw, reset };
}
```

---

## 3. 安全性學習

### 3.1 合約安全檢查清單

| 項目 | 狀態 | 說明 |
|------|------|------|
| 輸入驗證 | ✓ | `assert!(answer_id <= MAX_ANSWER_ID)` |
| 金額驗證 | ✓ | `assert!(payment_value >= DRAW_COST)` |
| 權限控制 | ✓ | `public(package)` 限制敏感函數 |
| 所有權檢查 | ✓ | `DrawRecord` 轉移給呼叫者 |
| 整數溢出 | ✓ | Move 自動檢查 |
| 重入攻擊 | ✓ | Move 所有權系統天然防護 |

### 3.2 常見陷阱

1. **忘記處理空 Coin**
   ```move
   // ❌ 錯誤：空 Coin 無法 transfer
   transfer::public_transfer(payment, sender);

   // ✅ 正確：檢查後處理
   if (coin::value(&payment) > 0) {
       transfer::public_transfer(payment, sender);
   } else {
       coin::destroy_zero(payment);
   };
   ```

2. **測試後忘記歸還共享物件**
   ```move
   // ❌ 錯誤：測試會失敗
   let treasury = ts::take_shared<MGCTreasury>(&scenario);
   // ... 測試結束但沒有 return_shared

   // ✅ 正確
   ts::return_shared(treasury);
   ```

3. **隨機數在鏈上計算**
   ```move
   // ❌ 危險：可被 MEV 攻擊
   let answer_id = random::generate() % 50;

   // ✅ 安全：前端產生，鏈上只驗證
   assert!(answer_id <= 49, E_INVALID_ANSWER_ID);
   ```

---

## 4. 檔案結構

```
新增的檔案：
├── contracts/
│   ├── sources/
│   │   └── oracle_draw.move       # 抽取合約
│   └── tests/
│       └── oracle_draw_tests.move # 合約測試 (9 cases)
└── frontend/
    ├── __tests__/hooks/
    │   ├── use-oracle-draw.test.ts
    │   └── use-answers.test.ts
    ├── hooks/
    │   ├── use-oracle-draw.ts
    │   └── use-answers.ts
    └── lib/
        └── random.ts              # 隨機數工具
```

---

## 5. 測試結果

### Move 合約測試
```
Test result: OK. Total tests: 15; passed: 15; failed: 0
```

### 前端測試
```
Test Files: 18 passed (部分與本次無關的失敗)
Tests: 183 passed
```

---

## 6. 待完成任務

| 任務 | 說明 | 難度 |
|------|------|------|
| T060 | DrawScene Phaser 場景 | S |
| T061 | CardRevealScene Phaser 場景 | S |
| T062 | PreloadScene 資源載入 | A |
| T064 | DrawSection 整合元件 | A |
| T065 | DrawResultOverlay | A |
| T066 | 整合至主頁面 | B |
| T067 | Optimistic UI 餘額更新 | A |

---

## 7. 延伸學習資源

### Move 語言
- [IOTA Move 官方文件](https://docs.iota.org/move/)
- [Move Book](https://move-language.github.io/move/)
- [Sui Move Examples](https://examples.sui.io/) (類似語法)

### 安全性
- [Move 安全最佳實踐](https://docs.iota.org/move/security/)
- [常見漏洞模式](https://docs.iota.org/move/security/vulnerabilities/)

### 測試
- [test_scenario 模組文件](https://docs.iota.org/move/testing/)
