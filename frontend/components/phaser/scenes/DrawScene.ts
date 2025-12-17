import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { getRarityColor, getRarityName, RARITY_COLORS } from '../PhaserGame';

type RarityKey = keyof typeof RARITY_COLORS;

/**
 * DrawScene - 抽取動畫場景
 *
 * 動畫流程：
 * 1. 卡牌從上方飛入 (1s)
 * 2. 能量粒子從四周聚集 (1.5s)
 * 3. 3D 翻轉效果 (0.8s)
 * 4. 稀有度爆發光效 (1s)
 * 5. 淡出切換到 CardRevealScene
 *
 * 總持續時間：約 3.5 秒
 */
export class DrawScene extends Phaser.Scene {
  private rarity: RarityKey = 'Common';
  private answerId: number = 0;
  private card: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'DrawScene' });
  }

  init(data: { rarity?: RarityKey; answerId?: number }): void {
    this.rarity = data.rarity || 'Common';
    this.answerId = data.answerId || 0;

    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawScene] 初始化，稀有度:', this.rarity, '答案ID:', this.answerId);
    }
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const color = getRarityColor(this.rarity);

    // 1. 建立背景光暈
    this.createBackgroundGlow(centerX, centerY);

    // 2. 建立卡牌
    this.card = this.createCard(centerX, centerY, color);

    // 3. 卡牌飛入動畫
    this.animateCardEntry(this.card, centerX, centerY);

    // 4. 能量粒子聚集
    this.createEnergyParticles(centerX, centerY, color);

    // 5. 3D 翻轉效果 (延遲 1.2 秒)
    this.time.delayedCall(1200, () => {
      this.animateCardFlip();
    });

    // 6. 稀有度爆發 (延遲 2 秒)
    this.time.delayedCall(2000, () => {
      this.createRarityBurst(centerX, centerY, color);
    });

    // 7. 完成動畫 (延遲 3.5 秒)
    this.time.delayedCall(3500, () => {
      this.completeAnimation();
    });

    // 監聽停止事件
    this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
  }

  /**
   * 建立背景光暈
   */
  private createBackgroundGlow(x: number, y: number): void {
    const glow = this.add.circle(x, y, 200, 0x000000, 0);

    this.tweens.add({
      targets: glow,
      alpha: { from: 0, to: 0.3 },
      scale: { from: 0.5, to: 1.5 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * 建立卡牌容器
   */
  private createCard(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const card = this.add.container(x, -300);

    // 卡牌尺寸（放大版）
    const cardWidth = 280;
    const cardHeight = 392;

    // 卡牌邊框發光（底層）
    const glow = this.add.rectangle(0, 0, cardWidth, cardHeight, color, 0);

    // 卡牌圖片或 fallback 背景
    let cardImage: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    let icon: Phaser.GameObjects.Text | null = null;

    if (this.textures.exists('card-back')) {
      // 使用卡片背面圖片
      cardImage = this.add.image(0, 0, 'card-back');
      // 縮放圖片以適應卡片尺寸
      const texture = this.textures.get('card-back');
      const frame = texture.getSourceImage();
      const scale = Math.min(cardWidth / frame.width, cardHeight / frame.height);
      cardImage.setScale(scale);
      // 添加稀有度邊框
      const border = this.add.rectangle(0, 0, cardWidth, cardHeight);
      border.setStrokeStyle(4, color, 0.9);
      border.setFillStyle(0x000000, 0);
      card.add([glow, cardImage, border]);

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawScene] 使用卡片背面圖片');
      }
    } else {
      // Fallback: 使用矩形背景 + emoji
      const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x1a1a1a);
      bg.setStrokeStyle(3, color, 0.8);
      cardImage = bg;

      icon = this.add.text(0, 0, '📖', {
        fontSize: '100px',
      });
      icon.setOrigin(0.5);
      card.add([glow, bg, icon]);

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawScene] 卡片背面圖片未載入，使用 fallback');
      }
    }

    card.setData('glow', glow);
    card.setData('cardImage', cardImage);
    if (icon) {
      card.setData('icon', icon);
    }

    return card;
  }

  /**
   * 卡牌飛入動畫
   */
  private animateCardEntry(
    card: Phaser.GameObjects.Container,
    targetX: number,
    targetY: number
  ): void {
    this.tweens.add({
      targets: card,
      y: targetY,
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 落地後輕微震動
        this.cameras.main.shake(200, 0.005);
      },
    });

    // 邊框發光動畫
    const glow = card.getData('glow') as Phaser.GameObjects.Rectangle;
    this.tweens.add({
      targets: glow,
      alpha: { from: 0, to: 0.2 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * 能量粒子聚集效果
   */
  private createEnergyParticles(x: number, y: number, color: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 使用 Phaser 3.60+ 粒子 API
    const emitter = this.add.particles(x, y, 'particle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1500,
      frequency: 30,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(0, 0, width, height),
        quantity: 2,
      },
      moveToX: x,
      moveToY: y,
    });

    // 1.5 秒後停止發射
    this.time.delayedCall(1500, () => {
      emitter.stop();
    });

    // 3 秒後銷毀
    this.time.delayedCall(3000, () => {
      emitter.destroy();
    });
  }

  /**
   * 3D 翻轉效果（使用 scaleX 模擬）
   */
  private animateCardFlip(): void {
    if (!this.card) return;

    // 卡片翻轉
    this.tweens.add({
      targets: this.card,
      scaleX: { from: 1, to: 0 },
      duration: 400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 翻轉回來
        this.tweens.add({
          targets: this.card,
          scaleX: { from: 0, to: 1 },
          duration: 400,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // 如果有 emoji icon（fallback 模式），同步翻轉
    const icon = this.card.getData('icon') as Phaser.GameObjects.Text | undefined;
    if (icon) {
      this.tweens.add({
        targets: icon,
        scaleX: { from: 1, to: 0 },
        duration: 400,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.tweens.add({
            targets: icon,
            scaleX: { from: 0, to: 1 },
            duration: 400,
            ease: 'Sine.easeInOut',
          });
        },
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawScene] 翻轉動畫');
    }
  }

  /**
   * 稀有度爆發效果
   */
  private createRarityBurst(x: number, y: number, color: number): void {
    // 光芒爆發
    const flash = this.add.circle(x, y, 50, color, 0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0.8, to: 0 },
      scale: { from: 0, to: 8 },
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        flash.destroy();
      },
    });

    // 星星粒子爆發
    const emitter = this.add.particles(x, y, 'star', {
      speed: { min: 150, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      quantity: 30,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
    });

    emitter.explode();

    this.time.delayedCall(2000, () => {
      emitter.destroy();
    });

    // 相機閃光
    this.cameras.main.flash(500, 255, 255, 255);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DrawScene] ${getRarityName(this.rarity)} 爆發效果`);
    }
  }

  /**
   * 完成動畫，切換場景
   */
  private completeAnimation(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawScene] 動畫完成');
    }

    // 通知 React
    const bridge = EventBridge.getInstance();
    bridge.trigger(EVENTS.DRAW_COMPLETE, {
      rarity: this.rarity,
      answerId: this.answerId,
    });

    // 淡出並切換到 CardRevealScene
    this.cameras.main.fadeOut(500);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CardRevealScene', {
        rarity: this.rarity,
        answerId: this.answerId,
      });
    });
  }

  /**
   * 停止場景
   */
  private stopScene(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawScene] 強制停止');
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

export default DrawScene;
