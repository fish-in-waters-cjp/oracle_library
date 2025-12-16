# 前端 API 規格

**功能分支**：`001-eternal-library-mvp`
**建立日期**：2025-12-15
**狀態**：完成

## 概述

本文件定義永恆圖書館 MVP 前端的 Hooks 和 API 規格。由於架構為純前端 + 智能合約（無後端），所有資料來源為 IOTA 鏈上查詢。

---

## Hooks 規格

### useWalletConnection

**用途**：管理錢包連接狀態

```typescript
interface UseWalletConnectionReturn {
  // 狀態
  isConnected: boolean;
  address: string | null;
  truncatedAddress: string | null;
  walletIcon: string | null;

  // 操作
  disconnect: () => void;
  isDisconnecting: boolean;
}

function useWalletConnection(): UseWalletConnectionReturn
```

**內部使用**：
- `useCurrentAccount()`
- `useCurrentWallet()`
- `useDisconnectWallet()`

---

### useMGCBalance

**用途**：取得使用者 MGC 餘額

```typescript
interface UseMGCBalanceReturn {
  balance: bigint;
  displayBalance: string;
  isLoading: boolean;
  refetch: () => void;
}

function useMGCBalance(address: string | null): UseMGCBalanceReturn
```

**實作模式**：
```typescript
const { data } = useIotaClientQuery(
  "getBalance",
  { owner: address, coinType: MGC_COIN_TYPE },
  { enabled: !!address, refetchInterval: 10000 }
);
```

---

### useCheckInState

**用途**：取得使用者簽到狀態

```typescript
interface UseCheckInStateReturn {
  // 狀態
  hasRecord: boolean;
  recordObjectId: string | null;
  lastCheckInDay: number | null;
  totalCheckIns: number;
  consecutiveDays: number;
  canCheckIn: boolean;
  nextCheckInTime: Date | null;

  // 載入狀態
  isLoading: boolean;
  refetch: () => void;
}

function useCheckInState(address: string | null): UseCheckInStateReturn
```

**實作邏輯**：
1. 查詢使用者的 `UserCheckInRecord` 物件
2. 查詢 `CheckInEvent` 計算連續天數
3. 比對今日 UTC+8 日期判斷是否可簽到

---

### useCheckIn

**用途**：執行簽到操作

```typescript
interface UseCheckInReturn {
  // 首次簽到
  firstCheckIn: () => Promise<void>;
  // 每日簽到
  checkIn: (recordId: string) => Promise<void>;
  // 狀態
  isPending: boolean;
  error: Error | null;
}

function useCheckIn(): UseCheckInReturn
```

---

### useOracleDraw

**用途**：執行抽取操作

```typescript
interface DrawResult {
  drawRecordId: string;
  answerId: number;
  answer: Answer;
}

interface UseOracleDrawReturn {
  draw: (question: string) => Promise<DrawResult>;
  isPending: boolean;
  error: Error | null;
}

function useOracleDraw(): UseOracleDrawReturn
```

**實作邏輯**：
1. 前端隨機選擇 answer_id (0-49)
2. 計算問題 hash
3. 執行鏈上交易
4. 從 answers.json 取得答案內容

---

### useMintNFT

**用途**：將 DrawRecord 鑄造成 NFT

```typescript
interface MintResult {
  nftId: string;
  explorerUrl: string;
}

interface UseMintNFTReturn {
  mint: (drawRecordId: string, rarity: number) => Promise<MintResult>;
  isPending: boolean;
  error: Error | null;
}

function useMintNFT(): UseMintNFTReturn
```

---

### useDrawRecords

**用途**：取得使用者的抽取記錄（未鑄造）

```typescript
interface UseDrawRecordsReturn {
  records: DrawRecord[];
  isLoading: boolean;
  refetch: () => void;
}

function useDrawRecords(address: string | null): UseDrawRecordsReturn
```

**實作模式**：
```typescript
const { data } = useIotaClientInfiniteQuery(
  "getOwnedObjects",
  {
    owner: address,
    filter: { StructType: DRAW_RECORD_TYPE },
    options: { showContent: true },
  },
  { enabled: !!address }
);
```

---

### useOracleNFTs

**用途**：取得使用者的 NFT 收藏

```typescript
interface UseOracleNFTsReturn {
  nfts: OracleNFT[];
  stats: CollectionStats;
  isLoading: boolean;
  refetch: () => void;
}

function useOracleNFTs(address: string | null): UseOracleNFTsReturn
```

---

### useNFTMetadata

**用途**：從 IPFS 取得 NFT metadata

```typescript
interface UseNFTMetadataReturn {
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: Error | null;
}

function useNFTMetadata(metadataUrl: string | null): UseNFTMetadataReturn
```

**實作模式**：
```typescript
const gatewayUrl = metadataUrl?.replace('ipfs://', 'https://ipfs.io/ipfs/');
const { data } = useQuery({
  queryKey: ['nft-metadata', metadataUrl],
  queryFn: () => fetch(gatewayUrl).then(r => r.json()),
  enabled: !!metadataUrl,
  staleTime: Infinity, // metadata 不會改變
});
```

---

### useAnswers

**用途**：載入答案資料

```typescript
interface UseAnswersReturn {
  answers: Answer[];
  getAnswer: (id: number) => Answer | undefined;
  getRarityById: (id: number) => Rarity;
  isLoading: boolean;
}

function useAnswers(): UseAnswersReturn
```

**資料來源**：`/public/data/answers.json`

---

## 頁面資料流

### 首頁（Home）

```
┌─────────────────────────────────────────────────────────────────┐
│  useWalletConnection()                                          │
│    └─> 顯示連接狀態                                              │
│                                                                 │
│  useMGCBalance(address)                                         │
│    └─> 顯示 MGC 餘額                                            │
│                                                                 │
│  useCheckInState(address)                                       │
│    └─> 顯示簽到按鈕狀態、連續天數、倒計時                         │
│                                                                 │
│  useCheckIn()                                                   │
│    └─> 簽到按鈕 onClick                                         │
│                                                                 │
│  useOracleDraw()                                                │
│    └─> 抽取表單 onSubmit                                        │
│                                                                 │
│  useMintNFT()                                                   │
│    └─> 結果頁鑄造按鈕                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 收藏頁（Collection）

```
┌─────────────────────────────────────────────────────────────────┐
│  useWalletConnection()                                          │
│    └─> 確認已連接                                               │
│                                                                 │
│  useOracleNFTs(address)                                         │
│    └─> 顯示 NFT 網格、統計卡片                                  │
│                                                                 │
│  useNFTMetadata(selectedNft.metadataUrl)                        │
│    └─> 詳情彈窗內容                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 工具函數

### 時間計算

```typescript
// 取得 UTC+8 日期編號
function getUTC8DayNumber(timestamp: number = Date.now()): number {
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  return Math.floor((timestamp + UTC8_OFFSET) / (24 * 60 * 60 * 1000));
}

// 計算下次可簽到時間（UTC+8 午夜）
function getNextCheckInTime(): Date {
  const now = new Date();
  const utc8Offset = 8 * 60; // minutes
  const localOffset = now.getTimezoneOffset();
  const diffMinutes = utc8Offset + localOffset;

  const utc8Now = new Date(now.getTime() + diffMinutes * 60 * 1000);
  const utc8Tomorrow = new Date(utc8Now);
  utc8Tomorrow.setHours(24, 0, 0, 0);

  return new Date(utc8Tomorrow.getTime() - diffMinutes * 60 * 1000);
}

// 計算連續簽到天數
function calculateConsecutiveDays(events: CheckInEvent[]): number {
  if (events.length === 0) return 0;

  const today = getUTC8DayNumber();
  let consecutive = 0;
  let expectedDay = today;

  // events 已按時間降序排列
  for (const event of events) {
    if (event.dayNumber === expectedDay) {
      consecutive++;
      expectedDay--;
    } else if (event.dayNumber < expectedDay) {
      break;
    }
  }

  return consecutive;
}
```

### 隨機抽取

```typescript
// 隨機選擇答案 ID (0-49)
function randomAnswerId(): number {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return array[0] % 50;
}

// 計算問題 hash
async function hashQuestion(question: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(question);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}
```

### 地址格式化

```typescript
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

### IPFS URL 轉換

```typescript
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

function ipfsToGateway(ipfsUrl: string, gatewayIndex = 0): string {
  if (!ipfsUrl.startsWith('ipfs://')) return ipfsUrl;
  const cid = ipfsUrl.replace('ipfs://', '');
  return `${IPFS_GATEWAYS[gatewayIndex]}${cid}`;
}
```

---

## 錯誤處理

### 錯誤類型

```typescript
enum OracleErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_MGC = 'INSUFFICIENT_MGC',
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

class OracleError extends Error {
  constructor(
    public code: OracleErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'OracleError';
  }
}
```

### 使用者友善訊息

```typescript
const ERROR_MESSAGES: Record<OracleErrorCode, string> = {
  WALLET_NOT_CONNECTED: '請先連接錢包',
  INSUFFICIENT_MGC: '智慧碎片不足',
  INSUFFICIENT_GAS: 'Gas 費用不足，請先取得一些 IOTA',
  ALREADY_CHECKED_IN: '今天已經簽到過了',
  TRANSACTION_REJECTED: '交易已取消',
  TRANSACTION_FAILED: '交易失敗，請稍後再試',
  NETWORK_ERROR: '網路錯誤，請稍後再試',
};
```

---

## 環境變數

```env
# .env.local
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_MGC_TREASURY_ID=0x...
NEXT_PUBLIC_NFT_CONFIG_ID=0x...
NEXT_PUBLIC_NETWORK=testnet
```

---

## 靜態檔案

### /public/data/answers.json

50 個答案的 JSON 陣列，格式參見 data-model.md。

### /public/images/

- `logo.svg` - 應用 Logo
- `empty-collection.svg` - 收藏空狀態插圖
- `rarity/` - 稀有度背景圖

### IPFS 資源

- `ipfs://Qm.../images/` - NFT 圖片 (0.png ~ 49.png)
- `ipfs://Qm.../metadata/` - NFT metadata (0.json ~ 49.json)

---

## EventBridge API（React ↔ Phaser 通訊）

### 概述

EventBridge 提供 React 與 Phaser 遊戲場景之間的雙向通訊機制。使用 EventEmitter 模式實現鬆耦合。

### 事件定義

```typescript
// frontend/components/phaser/EventBridge.ts
import { EventEmitter } from 'events';

export const GameEvents = new EventEmitter();

// 設定最大監聽器數量，避免記憶體洩漏警告
GameEvents.setMaxListeners(20);
```

### React → Phaser 事件

| 事件名稱 | Payload | 說明 |
|----------|---------|------|
| `START_DRAW` | `StartDrawPayload` | 開始抽取動畫 |
| `REVEAL_CARD` | `RevealCardPayload` | 揭示卡片（交易確認後）|
| `START_CELEBRATION` | `CelebrationPayload` | 開始慶祝動畫（鑄造成功）|
| `STOP_SCENE` | `{ sceneKey: string }` | 停止指定場景 |

```typescript
// Payload 型別定義
interface StartDrawPayload {
  questionHash: string;  // 用於視覺效果種子
}

interface RevealCardPayload {
  answerId: number;      // 0-49
  rarity: Rarity;        // 0-3
  answerEn: string;      // 英文答案（顯示用）
  answerZh: string;      // 中文答案（顯示用）
}

interface CelebrationPayload {
  rarity: Rarity;        // 影響慶祝效果強度
  nftId: string;         // NFT Object ID
}

// 常數定義
export const GAME_EVENTS = {
  START_DRAW: 'game:start-draw',
  REVEAL_CARD: 'game:reveal-card',
  START_CELEBRATION: 'game:start-celebration',
  STOP_SCENE: 'game:stop-scene',
} as const;
```

### Phaser → React 事件

| 事件名稱 | Payload | 說明 |
|----------|---------|------|
| `DRAW_ANIMATION_READY` | `void` | 抽取動畫就緒，可發送交易 |
| `DRAW_COMPLETE` | `void` | 抽取動畫完成 |
| `CARD_REVEALED` | `void` | 卡片揭示完成 |
| `CELEBRATION_DONE` | `void` | 慶祝動畫完成 |
| `SCENE_ERROR` | `SceneErrorPayload` | 場景發生錯誤 |

```typescript
interface SceneErrorPayload {
  sceneKey: string;
  error: string;
  recoverable: boolean;
}

export const UI_EVENTS = {
  DRAW_ANIMATION_READY: 'ui:draw-animation-ready',
  DRAW_COMPLETE: 'ui:draw-complete',
  CARD_REVEALED: 'ui:card-revealed',
  CELEBRATION_DONE: 'ui:celebration-done',
  SCENE_ERROR: 'ui:scene-error',
} as const;
```

### 使用範例

```typescript
// React 端發送事件
import { GameEvents, GAME_EVENTS } from '@/components/phaser/EventBridge';

function handleDraw() {
  GameEvents.emit(GAME_EVENTS.START_DRAW, {
    questionHash: '0x1234...',
  });
}

// React 端監聽事件
useEffect(() => {
  const handleComplete = () => {
    setDrawState('complete');
  };

  GameEvents.on(UI_EVENTS.DRAW_COMPLETE, handleComplete);

  return () => {
    GameEvents.off(UI_EVENTS.DRAW_COMPLETE, handleComplete);
  };
}, []);
```

```typescript
// Phaser 端（場景內）
import { GameEvents, GAME_EVENTS, UI_EVENTS } from '../EventBridge';

export class DrawScene extends Phaser.Scene {
  create() {
    GameEvents.on(GAME_EVENTS.START_DRAW, this.handleStartDraw, this);
  }

  handleStartDraw(payload: StartDrawPayload) {
    // 播放動畫...
    this.playDrawAnimation();
  }

  onAnimationComplete() {
    GameEvents.emit(UI_EVENTS.DRAW_COMPLETE);
  }

  shutdown() {
    // 清理監聽器，避免記憶體洩漏
    GameEvents.off(GAME_EVENTS.START_DRAW, this.handleStartDraw, this);
  }
}
```

### 錯誤處理

```typescript
// 超時處理
const ANIMATION_TIMEOUT = 10000; // 10 秒

function waitForEvent(eventName: string, timeout = ANIMATION_TIMEOUT): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      GameEvents.off(eventName, handler);
      reject(new OracleError(
        OracleErrorCode.ANIMATION_TIMEOUT,
        '動畫載入超時，請重新整理頁面'
      ));
    }, timeout);

    const handler = () => {
      clearTimeout(timer);
      resolve();
    };

    GameEvents.once(eventName, handler);
  });
}

// 場景錯誤處理
GameEvents.on(UI_EVENTS.SCENE_ERROR, (payload: SceneErrorPayload) => {
  console.error(`Scene error in ${payload.sceneKey}:`, payload.error);

  if (payload.recoverable) {
    // 嘗試重新載入場景
    GameEvents.emit(GAME_EVENTS.STOP_SCENE, { sceneKey: payload.sceneKey });
  } else {
    // 顯示錯誤訊息給使用者
    toast.error('遊戲載入失敗，請重新整理頁面');
  }
});
```

### 生命週期管理

```typescript
// PhaserContainer.tsx 中的清理邏輯
useEffect(() => {
  return () => {
    // 組件卸載時清理所有事件
    GameEvents.removeAllListeners();
  };
}, []);
```

### 錯誤碼擴展

```typescript
// 新增動畫相關錯誤碼
enum OracleErrorCode {
  // ... 現有錯誤碼
  ANIMATION_TIMEOUT = 'ANIMATION_TIMEOUT',
  SCENE_LOAD_FAILED = 'SCENE_LOAD_FAILED',
  ASSET_LOAD_FAILED = 'ASSET_LOAD_FAILED',
}

const ERROR_MESSAGES: Record<OracleErrorCode, string> = {
  // ... 現有訊息
  ANIMATION_TIMEOUT: '動畫載入超時，請重新整理頁面',
  SCENE_LOAD_FAILED: '遊戲場景載入失敗',
  ASSET_LOAD_FAILED: '遊戲資源載入失敗',
};
```
