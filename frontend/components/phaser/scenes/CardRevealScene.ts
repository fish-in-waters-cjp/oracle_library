import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { getRarityColor, getRarityName, RARITY_COLORS } from '../PhaserGame';

type RarityKey = keyof typeof RARITY_COLORS;

/**
 * CardRevealScene - 卡片揭示場景
 *
 * 持續的視覺效果：
 * - 發光卡片浮動
 * - 多層光環動畫
 * - 環繞粒子效果
 * - 稀有度特殊效果（傳說/史詩）
 *
 * 場景持續直到使用者點擊「鑄造 NFT」或關閉
 */
export class CardRevealScene extends Phaser.Scene {
  private rarity: RarityKey = 'Common';
  private answerId: number = 0;
  private card: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'CardRevealScene' });
  }

  init(data: { rarity?: RarityKey; answerId?: number }): void {
    this.rarity = data.rarity || 'Common';
    this.answerId = data.answerId || 0;

    if (process.env.NODE_ENV === 'development') {
      console.log('[CardRevealScene] 初始化，稀有度:', this.rarity);
    }
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const color = getRarityColor(this.rarity);

    // 淡入效果
    this.cameras.main.fadeIn(500);

    // 1. 建立發光卡片
    this.card = this.createRevealCard(centerX, centerY, color);

    // 2. 持續光環動畫
    this.createAuraEffect(centerX, centerY, color);

    // 3. 環繞粒子
    this.createOrbitParticles(centerX, centerY, color);

    // 4. 稀有度特殊效果
    if (this.rarity === 'Legendary') {
      this.createLegendaryEffect(centerX, centerY);
    } else if (this.rarity === 'Epic') {
      this.createEpicEffect(centerX, centerY);
    }

    // 通知 React 卡片已揭示
    this.time.delayedCall(500, () => {
      const bridge = EventBridge.getInstance();
      bridge.trigger(EVENTS.CARD_REVEALED, {
        rarity: this.rarity,
        answerId: this.answerId,
      });
    });

    // 監聽停止事件
    this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
  }

  /**
   * 建立揭示卡片
   */
  private createRevealCard(
    x: number,
    y: number,
    color: number
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);
    card.setScale(0.8);

    // 卡牌背景
    const bg = this.add.rectangle(0, 0, 240, 320, 0x1a1a1a);
    bg.setStrokeStyle(3, color, 1);

    // 內發光
    const innerGlow = this.add.rectangle(0, 0, 236, 316, color, 0.1);

    // 卡牌圖示
    const icon = this.add.text(0, -60, '📖', {
      fontSize: '100px',
    });
    icon.setOrigin(0.5);

    // 稀有度標籤
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const rarityText = this.add.text(0, 80, getRarityName(this.rarity), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: colorHex,
    });
    rarityText.setOrigin(0.5);

    card.add([innerGlow, bg, icon, rarityText]);
    card.setData('innerGlow', innerGlow);

    // 卡片輕微浮動
    this.tweens.add({
      targets: card,
      y: y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // 縮放進入動畫
    this.tweens.add({
      targets: card,
      scale: { from: 0.5, to: 1 },
      duration: 800,
      ease: 'Back.easeOut',
    });

    return card;
  }

  /**
   * 持續光環效果
   */
  private createAuraEffect(x: number, y: number, color: number): void {
    // 多層光環
    for (let i = 0; i < 3; i++) {
      const radius = 150 + i * 30;
      const glow = this.add.circle(x, y, radius, color, 0.1);
      glow.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.1, to: 0.3 },
        scale: { from: 1, to: 1.1 },
        duration: 2000 + i * 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 300,
      });
    }
  }

  /**
   * 環繞粒子效果
   */
  private createOrbitParticles(x: number, y: number, color: number): void {
    // 根據稀有度調整粒子密度
    const frequencyMap: Record<RarityKey, number> = {
      Common: 150,
      Rare: 100,
      Epic: 80,
      Legendary: 50,
    };

    // 環繞軌道粒子
    this.add.particles(x, y, 'particle', {
      speed: 50,
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      frequency: frequencyMap[this.rarity] || 100,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      radial: true,
    });
  }

  /**
   * 傳說級特殊效果
   */
  private createLegendaryEffect(x: number, y: number): void {
    // 旋轉光線
    const rays = this.add.graphics();
    rays.lineStyle(2, 0xd4af37, 0.3);

    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 / rayCount) * i;
      const x1 = x + Math.cos(angle) * 100;
      const y1 = y + Math.sin(angle) * 100;
      const x2 = x + Math.cos(angle) * 300;
      const y2 = y + Math.sin(angle) * 300;

      rays.lineBetween(x1, y1, x2, y2);
    }

    rays.setBlendMode(Phaser.BlendModes.ADD);

    // 旋轉動畫
    this.tweens.add({
      targets: rays,
      angle: 360,
      duration: 8000,
      ease: 'Linear',
      repeat: -1,
    });

    // 星星粒子環繞
    this.add.particles(x, y, 'star', {
      speed: 30,
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      frequency: 200,
      tint: 0xd4af37,
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  /**
   * 史詩級特殊效果
   */
  private createEpicEffect(x: number, y: number): void {
    // 紫色能量波
    const wave = this.add.circle(x, y, 100, 0xa78bfa, 0);
    wave.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: wave,
      scale: { from: 1, to: 2.5 },
      alpha: { from: 0.3, to: 0 },
      duration: 2000,
      ease: 'Cubic.easeOut',
      repeat: -1,
    });
  }

  /**
   * 停止場景
   */
  private stopScene(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CardRevealScene] 停止場景');
    }
    this.scene.stop();
  }

  /**
   * 場景關閉時清理
   */
  shutdown(): void {
    this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
  }
}

export default CardRevealScene;
