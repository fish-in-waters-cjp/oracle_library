# US3 Phaser 場景開發 - 學習報告

> 開發者：Developer B
> 日期：2025-12-17
> User Story：作為使用者，我希望能夠消耗 MGC 抽取神諭解答（Phaser 動畫部分）

---

## 1. 本次完成的任務

| 任務編號 | 說明 | 狀態 |
|---------|------|------|
| T062 | PreloadScene 資源載入 | ✅ 完成 |
| T060 | DrawScene Phaser 場景 | ✅ 完成 |
| T061 | CardRevealScene Phaser 場景 | ✅ 完成 |
| T064 | DrawSection 整合元件 | ✅ 完成 |
| T065 | DrawResultOverlay | ✅ 完成 |

---

## 2. 學到的技術概念

### 2.1 Phaser 3 場景生命週期

Phaser 場景有四個主要生命週期方法：

```typescript
class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyScene' });
  }

  init(data: object): void {
    // 1. 初始化：接收從上一場景傳來的資料
    this.rarity = data.rarity;
  }

  preload(): void {
    // 2. 預載入：載入圖片、音效等資源
    this.load.image('card', 'assets/card.png');
  }

  create(): void {
    // 3. 建立：資源載入完成後，建立遊戲物件
    this.card = this.add.image(400, 300, 'card');
  }

  update(time: number, delta: number): void {
    // 4. 更新：每幀執行（60fps = 每秒 60 次）
    this.card.rotation += 0.01;
  }

  shutdown(): void {
    // 5. 關閉：場景停止時清理
    this.events.off('someEvent');
  }
}
```

### 2.2 動態生成材質（Texture）

不需要外部圖片，使用 Graphics 繪製：

```typescript
// 圓形粒子
const graphics = this.add.graphics();
graphics.fillStyle(0xffffff, 1);
graphics.fillCircle(16, 16, 16);
graphics.generateTexture('particle', 32, 32);
graphics.destroy();  // 生成後銷毀 Graphics

// 五角星
const star = this.add.graphics();
star.fillStyle(0xffffff, 1);
star.beginPath();
for (let i = 0; i < 10; i++) {
  const radius = i % 2 === 0 ? 14 : 6;
  const angle = (Math.PI / 5) * i - Math.PI / 2;
  const x = 16 + Math.cos(angle) * radius;
  const y = 16 + Math.sin(angle) * radius;
  if (i === 0) star.moveTo(x, y);
  else star.lineTo(x, y);
}
star.closePath();
star.fillPath();
star.generateTexture('star', 32, 32);
star.destroy();
```

**優點**：
- 無外部依賴，減少載入時間
- 可動態調整大小、顏色
- 適合簡單形狀的粒子效果

### 2.3 Phaser 3.60+ 粒子系統

新版 API（不再需要 ParticleEmitterManager）：

```typescript
// 舊版 API (< 3.60)
const particles = this.add.particles('particle');
const emitter = particles.createEmitter({ ... });

// 新版 API (>= 3.60)
const emitter = this.add.particles(x, y, 'particle', {
  speed: { min: 100, max: 200 },
  angle: { min: 0, max: 360 },
  scale: { start: 0.5, end: 0 },
  alpha: { start: 1, end: 0 },
  lifespan: 1500,
  frequency: 30,
  tint: 0x60a5fa,
  blendMode: Phaser.BlendModes.ADD,
});

// 爆發效果
emitter.explode();  // 一次性發射 quantity 個粒子

// 停止發射
emitter.stop();

// 銷毀
emitter.destroy();
```

#### 粒子移動到目標

```typescript
// 能量聚集效果：粒子從邊緣移動到中心
const emitter = this.add.particles(centerX, centerY, 'particle', {
  emitZone: {
    type: 'edge',
    source: new Phaser.Geom.Rectangle(0, 0, width, height),
    quantity: 2,
  },
  moveToX: centerX,
  moveToY: centerY,
});
```

### 2.4 Tween 動畫系統

Phaser 的 Tween 是用於數值補間動畫的強大工具：

```typescript
// 基礎 Tween
this.tweens.add({
  targets: card,
  y: 300,              // 移動到 y=300
  duration: 1000,      // 1 秒
  ease: 'Back.easeOut',
  onComplete: () => {
    console.log('動畫完成');
  },
});

// 同時改變多個屬性
this.tweens.add({
  targets: glow,
  alpha: { from: 0, to: 0.3 },
  scale: { from: 0.5, to: 1.5 },
  duration: 2000,
  yoyo: true,     // 來回播放
  repeat: -1,     // 無限循環
});

// 3D 翻轉效果（使用 scaleX）
this.tweens.add({
  targets: card,
  scaleX: { from: 1, to: 0 },
  duration: 400,
  ease: 'Sine.easeInOut',
  onComplete: () => {
    // 翻轉回來
    this.tweens.add({
      targets: card,
      scaleX: { from: 0, to: 1 },
      duration: 400,
    });
  },
});
```

#### 常用 Easing 函數

| Easing | 效果 |
|--------|------|
| `Linear` | 等速 |
| `Sine.easeInOut` | 平滑開始和結束 |
| `Back.easeOut` | 彈性過衝（適合彈入效果）|
| `Cubic.easeOut` | 快速減速（適合爆發效果）|
| `Bounce.easeOut` | 彈跳效果 |

### 2.5 相機效果

```typescript
// 震動
this.cameras.main.shake(duration, intensity);
// 例: this.cameras.main.shake(200, 0.005);

// 閃光
this.cameras.main.flash(duration, r, g, b);
// 例: this.cameras.main.flash(500, 255, 255, 255);

// 淡入
this.cameras.main.fadeIn(duration);

// 淡出 + 監聽完成
this.cameras.main.fadeOut(500);
this.cameras.main.once('camerafadeoutcomplete', () => {
  this.scene.start('NextScene', data);
});
```

### 2.6 場景切換

```typescript
// 啟動場景（可傳遞資料）
this.scene.start('CardRevealScene', {
  rarity: 'Legendary',
  answerId: 49,
});

// 停止當前場景
this.scene.stop();

// 暫停/恢復
this.scene.pause();
this.scene.resume();

// 並行執行多場景
this.scene.launch('UIScene');  // 不會停止當前場景
```

### 2.7 React ↔ Phaser 通訊（EventBridge 模式）

```typescript
// EventBridge 單例
export class EventBridge {
  private static instance: EventBridge;
  private listeners: Record<string, Array<(data: unknown) => void>>;
  private game: Phaser.Game | null;

  static getInstance(): EventBridge {
    if (!EventBridge.instance) {
      EventBridge.instance = new EventBridge();
    }
    return EventBridge.instance;
  }

  // React → Phaser
  emit(eventName: string, data: unknown): void {
    this.game?.scene.scenes.forEach((scene) => {
      if (scene.scene.isActive()) {
        scene.events.emit(eventName, data);
      }
    });
  }

  // Phaser → React
  on(eventName: string, callback: (data: unknown) => void): void {
    this.listeners[eventName].push(callback);
  }

  // Phaser 場景觸發 React 監聽器
  trigger(eventName: string, data: unknown): void {
    this.listeners[eventName]?.forEach((cb) => cb(data));
  }
}
```

**使用方式**：

```tsx
// React 端
const bridge = EventBridge.getInstance();

// 發送事件給 Phaser
bridge.emit(EVENTS.START_DRAW, { rarity: 'Legendary' });

// 監聽 Phaser 事件
bridge.on(EVENTS.CARD_REVEALED, (data) => {
  console.log('卡片揭示完成', data);
});

// Phaser 場景端
const bridge = EventBridge.getInstance();
bridge.trigger(EVENTS.CARD_REVEALED, { rarity: this.rarity });
```

---

## 3. 設計模式學習

### 3.1 Container 模式

將相關的遊戲物件組合成一個容器：

```typescript
// 建立卡片容器
const card = this.add.container(x, y);

const bg = this.add.rectangle(0, 0, 200, 280, 0x1a1a1a);
const icon = this.add.text(0, 0, '📖', { fontSize: '80px' });
icon.setOrigin(0.5);

card.add([bg, icon]);

// 移動整個容器
card.y = 300;

// 儲存子物件參考
card.setData('icon', icon);
const iconRef = card.getData('icon');
```

### 3.2 延遲執行（Timeline 模式）

```typescript
create() {
  // 0s: 卡片飛入
  this.animateCardEntry();

  // 1.2s: 翻轉
  this.time.delayedCall(1200, () => {
    this.animateCardFlip();
  });

  // 2s: 爆發
  this.time.delayedCall(2000, () => {
    this.createRarityBurst();
  });

  // 3.5s: 切換場景
  this.time.delayedCall(3500, () => {
    this.completeAnimation();
  });
}
```

### 3.3 稀有度差異化效果

```typescript
// 根據稀有度調整粒子密度
const frequencyMap: Record<RarityKey, number> = {
  Common: 150,    // 較少粒子
  Rare: 100,
  Epic: 80,
  Legendary: 50,  // 最多粒子
};

// 傳說級特殊效果
if (this.rarity === 'Legendary') {
  this.createLegendaryEffect(centerX, centerY);
}
```

---

## 4. 檔案結構

```
新增的檔案：
└── frontend/
    └── components/
        ├── phaser/
        │   └── scenes/
        │       ├── index.ts           # 場景索引
        │       ├── PreloadScene.ts    # 資源預載入
        │       ├── DrawScene.ts       # 抽取動畫
        │       └── CardRevealScene.ts # 卡片揭示
        └── draw/
            ├── index.ts               # 模組索引
            ├── DrawSection.tsx        # 整合元件
            └── DrawResultOverlay.tsx  # 結果 Overlay
```

---

## 5. 動畫時間軸

### DrawScene（約 3.5 秒）

```
0.0s ─────────────────────────────────────────────── 3.5s
│                                                      │
│ [卡片飛入 1s]                                        │
│ ├─────────────┤                                      │
│                                                      │
│ [粒子聚集 1.5s]                                      │
│ ├──────────────────────┤                             │
│                                                      │
│              [翻轉 0.8s]                             │
│              ├─────────┤                             │
│                                                      │
│                   [爆發 1s]                          │
│                   ├──────────┤                       │
│                                                      │
│                             [淡出 0.5s]              │
│                             ├─────────┤              │
└──────────────────────────────────────────────────────┘
```

### CardRevealScene（持續）

- 卡片浮動動畫（無限循環）
- 光環呼吸效果（無限循環）
- 環繞粒子（持續發射）
- 等待使用者操作後關閉

---

## 6. 效能考量

### 6.1 粒子數量控制

```typescript
// 設定最大粒子數
const emitter = this.add.particles(x, y, 'particle', {
  frequency: 50,       // 發射頻率（ms）
  maxParticles: 100,   // 最大粒子數
  lifespan: 1500,      // 生命週期
});
```

### 6.2 及時銷毀

```typescript
// 完成後銷毀 emitter
this.time.delayedCall(3000, () => {
  emitter.destroy();
});

// 場景關閉時清理
shutdown() {
  this.events.off(EVENTS.STOP_SCENE);
}
```

### 6.3 動態載入

```tsx
// Next.js 動態載入 Phaser（只在需要時載入 ~1.5MB）
const PhaserGameDynamic = dynamic(() => import('./PhaserGame'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
```

---

## 7. 常見陷阱

### 7.1 忘記銷毀粒子

```typescript
// ❌ 錯誤：粒子會一直存在
const emitter = this.add.particles(x, y, 'particle', { ... });

// ✅ 正確：設定時間後銷毀
this.time.delayedCall(3000, () => {
  emitter.destroy();
});
```

### 7.2 場景切換資料遺失

```typescript
// ❌ 錯誤：直接在 constructor 設定
constructor() {
  this.rarity = 'Common';  // 不會在 restart 時更新
}

// ✅ 正確：在 init 中接收資料
init(data) {
  this.rarity = data.rarity || 'Common';
}
```

### 7.3 事件監聽未移除

```typescript
// ❌ 錯誤：事件監聽器累積
create() {
  bridge.on(EVENTS.STOP_SCENE, this.stopScene, this);
}

// ✅ 正確：在 shutdown 移除
shutdown() {
  bridge.off(EVENTS.STOP_SCENE, this.stopScene, this);
}
```

---

## 8. 延伸學習資源

### Phaser 3
- [Phaser 3 官方文件](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 範例庫](https://labs.phaser.io/)
- [粒子系統文件](https://newdocs.phaser.io/docs/3.60.0/focus/Phaser.GameObjects.Particles.ParticleEmitter)

### Tween 動畫
- [Easing 函數視覺化](https://easings.net/)
- [Phaser Tween 文件](https://newdocs.phaser.io/docs/3.60.0/Phaser.Tweens.Tween)

### React + Phaser 整合
- [React-Phaser 專案模板](https://github.com/photonstorm/phaser3-project-template)
- [EventBridge 設計模式](https://docs.iota.org/)

---

## 9. 待完成任務（需要 Developer A）

| 任務 | 說明 | 依賴 |
|------|------|------|
| T066 | 整合至主頁面 | 需要 A 完成 HeroSection |
| T067 | Optimistic UI 餘額更新 | 需要 A 完成 WalletCard |
| T072 | CelebrationScene | 需要 A 完成 US4 鑄造 |
