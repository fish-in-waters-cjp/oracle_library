# T072 CelebrationScene 慶祝場景 - 學習報告

> 開發者：Developer B
> 日期：2025-12-18
> 任務：T072 - NFT 鑄造成功後的慶祝動畫場景

---

## 1. 任務概述

| 項目 | 說明 |
|------|------|
| **任務編號** | T072 |
| **任務描述** | 實作 CelebrationScene Phaser 慶祝場景 |
| **檔案路徑** | `frontend/components/phaser/scenes/CelebrationScene.ts` |
| **依賴** | EventBridge (T023), PhaserGame (T024), ParticleConfig |
| **狀態** | ✅ 完成 |

---

## 2. 技術實作內容

### 2.1 場景架構

```typescript
export class CelebrationScene extends Phaser.Scene {
  private rarity: RarityKey = 'Common';
  private nftId: string = '';
  private animationDuration: number = 4000;
  private isCompleted: boolean = false;

  constructor() {
    super({ key: 'CelebrationScene' });
  }

  init(data: { rarity?: RarityKey; nftId?: string }): void {
    // 接收從 React 傳來的資料
    this.rarity = data.rarity || 'Common';
    this.nftId = data.nftId || '';
  }

  create(): void {
    // 建立所有慶祝特效
    this.createBackgroundFlash();
    this.createCentralBurst();
    this.createFireworks();
    this.createCoinBurst();
    this.createStarBurst();
    this.createSuccessText();

    // 稀有度專屬特效
    if (this.rarity === 'Legendary') {
      this.createLegendaryEffect();
    } else if (this.rarity === 'Epic') {
      this.createEpicEffect();
    }
  }
}
```

### 2.2 主要特效元件

#### 背景閃光效果

```typescript
private createBackgroundFlash(x: number, y: number, color: number): void {
  const flash = this.add.rectangle(x, y, 800, 600, color, 0);
  flash.setBlendMode(Phaser.BlendModes.ADD);

  this.tweens.add({
    targets: flash,
    alpha: { from: 0, to: 0.4 },
    duration: 150,
    yoyo: true,
    repeat: 2,
    onComplete: () => flash.destroy(),
  });
}
```

**學習重點**：
- 使用 `Phaser.BlendModes.ADD` 實現加法混合，讓光效更自然
- `yoyo: true` 搭配 `repeat` 可以實現來回閃爍效果
- 記得在動畫完成後 `destroy()` 清理物件

#### 煙火系統

```typescript
private createFireworks(color: number): void {
  const positions = [
    { x: 150, y: 150 },
    { x: 650, y: 150 },
    { x: 400, y: 100 },
    // ...更多位置
  ];

  positions.forEach((pos, index) => {
    this.time.delayedCall(index * 300, () => {
      this.launchFirework(pos.x, pos.y, color);
    });
  });
}

private launchFirework(x: number, y: number, color: number): void {
  // 1. 上升軌跡
  const rocket = this.add.circle(x, 550, 4, color, 1);

  // 2. 軌跡粒子（follow 模式）
  const trailEmitter = this.add.particles(x, 550, 'particle', {
    follow: rocket,  // 跟隨目標
    // ...配置
  });

  // 3. 上升動畫
  this.tweens.add({
    targets: rocket,
    y: y,
    duration: 600,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      trailEmitter.stop();
      rocket.destroy();
      this.explodeFirework(x, y, color);
    },
  });
}
```

**學習重點**：
- 粒子 `follow` 屬性可以讓粒子跟隨遊戲物件移動
- 使用 `delayedCall` 實現序列化動畫
- 分層動畫：上升 → 停止 → 爆發

#### 金幣飛散效果

```typescript
private launchCoin(x: number, y: number): void {
  const coin = this.add.text(x, y, '🪙', { fontSize: '32px' });
  coin.setOrigin(0.5);

  // 計算隨機拋物線軌跡
  const angle = Phaser.Math.Between(-120, -60);
  const speed = Phaser.Math.Between(300, 500);
  const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
  const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

  this.tweens.add({
    targets: coin,
    x: x + vx,
    y: y + vy + 400,  // 模擬重力
    rotation: Phaser.Math.Between(-5, 5),
    alpha: { from: 1, to: 0 },
    duration: 1500,
    ease: 'Cubic.easeOut',
    onComplete: () => coin.destroy(),
  });
}
```

**學習重點**：
- 使用 `Phaser.Math.Between()` 生成隨機值
- `Phaser.Math.DegToRad()` 將角度轉換為弧度
- 可以直接使用 emoji 作為遊戲物件（簡單特效）

### 2.3 稀有度專屬特效

#### Legendary 金色光環

```typescript
private createLegendaryEffect(x: number, y: number): void {
  // 旋轉光線
  const rays = this.add.graphics();
  rays.lineStyle(3, 0xd4af37, 0.5);  // 金色

  const rayCount = 16;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 / rayCount) * i;
    const x1 = x + Math.cos(angle) * 50;
    const y1 = y + Math.sin(angle) * 50;
    const x2 = x + Math.cos(angle) * 350;
    const y2 = y + Math.sin(angle) * 350;
    rays.lineBetween(x1, y1, x2, y2);
  }

  rays.setBlendMode(Phaser.BlendModes.ADD);

  // 旋轉動畫
  this.tweens.add({
    targets: rays,
    angle: 360,
    duration: 10000,
    ease: 'Linear',
    repeat: -1,
  });
}
```

#### Epic 能量波

```typescript
private createEpicEffect(x: number, y: number): void {
  for (let i = 0; i < 3; i++) {
    this.time.delayedCall(i * 500, () => {
      const wave = this.add.circle(x, y, 50, 0xa78bfa, 0.5);
      wave.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: wave,
        scale: { from: 0.5, to: 3 },
        alpha: { from: 0.5, to: 0 },
        duration: 1500,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy(),
      });
    });
  }
}
```

### 2.4 EventBridge 整合

```typescript
// 場景完成通知 React
private onCelebrationComplete(): void {
  if (this.isCompleted) return;
  this.isCompleted = true;

  const bridge = EventBridge.getInstance();
  bridge.trigger(EVENTS.CELEBRATION_DONE, {
    rarity: this.rarity,
    nftId: this.nftId,
  });
}

// 監聽停止事件
create(): void {
  // ...其他初始化
  this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
}

shutdown(): void {
  this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
}
```

---

## 3. 動畫時間軸

```
0.0s ────────────────────────────────────────────────── 4.0s
│                                                          │
│ [背景閃光 0.3s × 3]                                      │
│ ├───┤                                                    │
│                                                          │
│ [中央爆發 0.8s]                                          │
│ ├─────────┤                                              │
│                                                          │
│ [煙火序列 0-1.5s]                                        │
│ ├─────────────────────┤                                  │
│   ↑    ↑    ↑    ↑    ↑  (每 0.3s 一發)                 │
│                                                          │
│ [金幣飛散 0-1s]                                          │
│ ├────────────────┤                                       │
│                                                          │
│ [星星灑落 0.5s-3.5s]                                     │
│      ├────────────────────────────────────┤              │
│                                                          │
│ [成功文字 0.3s-持續]                                     │
│    ├─────────────────────────────────────────────────┤   │
│                                                          │
│                        [CELEBRATION_DONE 事件]           │
│                        ↓                                 │
└──────────────────────────────────────────────────────────┘
```

---

## 4. 特效對照表

| 稀有度 | 背景色 | 金幣數量 | 專屬特效 |
|--------|--------|----------|----------|
| Common | 灰色 (0x9ca3af) | 10 | 無 |
| Rare | 藍色 (0x60a5fa) | 10 | 無 |
| Epic | 紫色 (0xa78bfa) | 15 | 紫色能量波 |
| Legendary | 金色 (0xd4af37) | 20 | 金色旋轉光環 + 額外粒子 |

---

## 5. 設計模式學習

### 5.1 狀態防護模式

```typescript
private isCompleted: boolean = false;

private onCelebrationComplete(): void {
  // 防止重複觸發
  if (this.isCompleted) return;
  this.isCompleted = true;

  // 只執行一次
  bridge.trigger(EVENTS.CELEBRATION_DONE, {...});
}
```

**用途**：確保結束事件只觸發一次，避免多次通知 React。

### 5.2 延遲銷毀模式

```typescript
private stopScene(): void {
  // 先淡出
  this.cameras.main.fadeOut(300, 0, 0, 0);

  // 淡出完成後才停止場景
  this.time.delayedCall(300, () => {
    this.scene.stop();
  });
}
```

**用途**：確保視覺過渡平滑，避免突然切換。

### 5.3 參數化粒子配置

```typescript
// 使用預定義配置
const burstEmitter = this.add.particles(x, y, 'particle', {
  ...ParticleConfig.firework(color),
  angle: { min: 0, max: 360 },  // 覆蓋部分配置
});
```

**用途**：重用粒子配置，保持視覺一致性。

---

## 6. 效能優化

### 6.1 粒子數量控制

```typescript
// 根據稀有度調整粒子密度
const coinCount = this.rarity === 'Legendary' ? 20
                : this.rarity === 'Epic' ? 15
                : 10;
```

### 6.2 及時清理資源

```typescript
// 一次性爆發後不需要持續發射
burstEmitter.explode(50);  // 而不是使用 frequency

// 動畫完成後銷毀物件
onComplete: () => {
  wave.destroy();
}
```

### 6.3 避免記憶體洩漏

```typescript
shutdown(): void {
  // 移除事件監聽
  this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
}
```

---

## 7. 常見陷阱

### 7.1 重複觸發完成事件

```typescript
// ❌ 錯誤：可能被多次觸發
this.time.delayedCall(4000, () => {
  bridge.trigger(EVENTS.CELEBRATION_DONE, {...});
});

// ✅ 正確：加入狀態檢查
private onCelebrationComplete(): void {
  if (this.isCompleted) return;
  this.isCompleted = true;
  bridge.trigger(EVENTS.CELEBRATION_DONE, {...});
}
```

### 7.2 忘記重置場景狀態

```typescript
// ❌ 錯誤：isCompleted 在場景重啟時仍為 true
create(): void {
  // isCompleted 沒有重置
}

// ✅ 正確：在 init 中重置
init(data): void {
  this.isCompleted = false;  // 每次進入場景都重置
}
```

### 7.3 Graphics 物件旋轉問題

```typescript
// ❌ 錯誤：Graphics 需要設定旋轉中心
const rays = this.add.graphics();
// rays 預設旋轉中心在 (0, 0)

// ✅ 正確：設定正確的旋轉中心
rays.setPosition(centerX, centerY);  // 或在繪製時以 0,0 為中心
```

---

## 8. 與其他場景的關係

```
┌────────────────┐
│  PreloadScene  │ ← 資源載入
└───────┬────────┘
        ↓
┌────────────────┐
│   DrawScene    │ ← 抽卡動畫
└───────┬────────┘
        ↓
┌────────────────┐
│CardRevealScene │ ← 卡片揭示
└───────┬────────┘
        ↓ (使用者點擊鑄造)
┌────────────────┐
│CelebrationScene│ ← NFT 鑄造成功
└────────────────┘
```

### 場景啟動方式

```typescript
// 從 React 啟動慶祝場景
const game = gameRef.current;
game.scene.start('CelebrationScene', {
  rarity: 'Legendary',
  nftId: '0xnft123...',
});
```

---

## 9. 整合 React 的方式

```tsx
// DrawSection.tsx
useEffect(() => {
  const bridge = EventBridge.getInstance();

  const handleCelebrationDone = (data: unknown) => {
    const { rarity, nftId } = data as { rarity: string; nftId: string };
    console.log('慶祝完成', { rarity, nftId });

    // 停止場景
    bridge.emit(EVENTS.STOP_SCENE);

    // 顯示結果或跳轉
    setShowResult(true);
  };

  bridge.on(EVENTS.CELEBRATION_DONE, handleCelebrationDone);

  return () => {
    bridge.off(EVENTS.CELEBRATION_DONE, handleCelebrationDone);
  };
}, []);
```

---

## 10. 延伸學習資源

### Phaser 粒子系統
- [Phaser 3.60 粒子系統新 API](https://newdocs.phaser.io/docs/3.60.0/focus/Phaser.GameObjects.Particles.ParticleEmitter)
- [粒子系統範例庫](https://labs.phaser.io/index.html?dir=game%20objects/particle%20emitter/)

### 煙火效果參考
- [CSS-Tricks: Fireworks Animation](https://css-tricks.com/fireworks-animation/)
- [Phaser Fireworks Example](https://labs.phaser.io/view.html?src=src/game%20objects/particle%20emitter/fireworks.js)

### Tween 動畫
- [Easing 函數視覺化](https://easings.net/)
- [Phaser Tween 官方文件](https://newdocs.phaser.io/docs/3.60.0/Phaser.Tweens.Tween)

---

## 11. 總結

### 學到的核心概念

1. **分層動畫設計**：將複雜特效拆分為多個獨立元件（背景、爆發、煙火、金幣、文字）
2. **時間軸編排**：使用 `delayedCall` 協調多個動畫的時序
3. **稀有度差異化**：根據 NFT 稀有度調整特效強度和專屬效果
4. **EventBridge 整合**：場景 ↔ React 雙向通訊
5. **資源管理**：及時銷毀物件，避免記憶體洩漏

### 適用場景

- NFT 鑄造成功
- 成就解鎖
- 升級慶祝
- 抽獎結果展示
- 任何需要華麗視覺回饋的場合

---

## 12. 檔案變更清單

| 檔案 | 變更類型 | 說明 |
|------|----------|------|
| `components/phaser/scenes/CelebrationScene.ts` | 新增 | 慶祝場景實作 |
| `components/phaser/scenes/index.ts` | 修改 | 新增 CelebrationScene 導出 |
| `specs/.../tasks.md` | 修改 | T072 標記為完成 |
