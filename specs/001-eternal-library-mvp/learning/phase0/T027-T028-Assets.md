# T027-T028 學習報告：遊戲素材準備

**任務編號**：T027、T028
**技術等級**：Phase 0 素材準備
**完成時間**：2025-12-16

## T027 - 粒子特效素材

**路徑**：`frontend/public/game/particles/`

**素材清單**：
1. `coin.svg` - 金幣粒子（32x32）
2. `star.svg` - 星星粒子（32x32）
3. `glow.svg` - 光芒效果（64x64）
4. `firework.svg` - 煙火效果（64x64）

**技術特點**：
- SVG 格式，可無限縮放
- 使用漸層和透明度
- 適合 Phaser Particle System

## T028 - 卡牌圖片素材

**路徑**：`frontend/public/game/cards/`

**素材清單**：
1. `card-back.svg` - 卡牌背面（300x420）
2. `card-frame.svg` - 卡牌框架（300x420）
3. `rarity-common.svg` - 普通稀有度特效
4. `rarity-rare.svg` - 稀有稀有度特效（含動畫）
5. `rarity-epic.svg` - 史詩稀有度特效（含動畫）
6. `rarity-legendary.svg` - 傳說稀有度特效（含動畫）

**技術特點**：
- 高解析度 SVG（300x420 標準卡牌比例）
- 使用 SVG `<animate>` 實作動畫效果
- 稀有度對應顏色：
  - Common: 灰色 (#808080)
  - Rare: 藍色 (#4169E1)
  - Epic: 紫色 (#9370DB)
  - Legendary: 金色 (#FFD700)

## 實作重點

1. **SVG 動畫**：使用原生 SVG `<animate>` 標籤
2. **漸層效果**：`linearGradient` 和 `radialGradient`
3. **透明度控制**：適合疊加效果
4. **尺寸標準化**：符合 Phaser 使用規範

## 使用場景

**粒子系統**（Developer B - DrawScene）：
```typescript
this.add.particles(x, y, 'coin', {
  speed: 100,
  scale: { start: 1, end: 0 },
  blendMode: 'ADD'
});
```

**卡牌顯示**（Developer A & B）：
```typescript
// 卡牌背面
this.add.image(x, y, 'card-back');

// 稀有度特效
this.add.image(x, y, 'rarity-legendary');
```

## 產出檔案

### T027 粒子素材（4 個）
- `coin.svg`
- `star.svg`
- `glow.svg`
- `firework.svg`

### T028 卡牌素材（6 個）
- `card-back.svg`
- `card-frame.svg`
- `rarity-common.svg`
- `rarity-rare.svg`
- `rarity-epic.svg`
- `rarity-legendary.svg`

**總計**：10 個 SVG 佔位素材

## 關鍵學習

1. **SVG 基礎**：向量圖形適合遊戲素材
2. **SVG 動畫**：原生動畫無需 JavaScript
3. **素材組織**：依用途分類存放
4. **Phaser 整合**：SVG 可直接載入使用
