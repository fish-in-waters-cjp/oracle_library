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
  private confirmButton: Phaser.GameObjects.Container | null = null;

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

    // 5. 建立確認按鈕（延遲顯示，讓使用者先看卡片）
    this.time.delayedCall(1000, () => {
      this.confirmButton = this.createConfirmButton(centerX, centerY + 280, color);
    });

    // 監聯停止事件
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

    // 卡片尺寸（放大版）
    const cardWidth = 320;
    const cardHeight = 428;

    // 卡牌背景
    const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x1a1a1a);
    bg.setStrokeStyle(3, color, 1);

    // 內發光
    const innerGlow = this.add.rectangle(0, 0, cardWidth - 4, cardHeight - 4, color, 0.1);

    // 嘗試載入卡片圖片
    const textureKey = `card-${this.answerId}`;
    let cardContent: Phaser.GameObjects.Image | Phaser.GameObjects.Text;

    if (this.textures.exists(textureKey)) {
      // 使用真實卡片圖片
      cardContent = this.add.image(0, 0, textureKey);
      // 調整圖片大小以適應卡片框
      const texture = this.textures.get(textureKey);
      const frame = texture.getSourceImage();
      const scale = Math.min(
        (cardWidth - 16) / frame.width,
        (cardHeight - 16) / frame.height
      );
      cardContent.setScale(scale);

      if (process.env.NODE_ENV === 'development') {
        console.log('[CardRevealScene] 使用真實卡片圖片:', textureKey);
      }
    } else {
      // 回退到 emoji 圖示
      cardContent = this.add.text(0, -30, '📖', {
        fontSize: '80px',
      });
      cardContent.setOrigin(0.5);

      if (process.env.NODE_ENV === 'development') {
        console.log('[CardRevealScene] 卡片圖片未載入，使用 emoji fallback');
      }
    }

    // 稀有度標籤（只在沒有圖片時顯示）
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const rarityText = this.add.text(0, cardHeight / 2 + 20, getRarityName(this.rarity), {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: colorHex,
      stroke: '#000000',
      strokeThickness: 2,
    });
    rarityText.setOrigin(0.5);

    card.add([innerGlow, bg, cardContent, rarityText]);
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
   * 建立確認按鈕
   * 讓使用者確認後才進入結果頁面
   */
  private createConfirmButton(
    x: number,
    y: number,
    color: number
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    button.setAlpha(0);

    // 按鈕背景
    const buttonWidth = 180;
    const buttonHeight = 50;
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x1a1a1a, 0.9);
    bg.setStrokeStyle(2, color, 1);

    // 內發光效果
    const innerGlow = this.add.rectangle(0, 0, buttonWidth - 4, buttonHeight - 4, color, 0.1);

    // 按鈕文字
    const text = this.add.text(0, 0, '確認', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    button.add([bg, innerGlow, text]);

    // 設定互動
    bg.setInteractive({ useHandCursor: true });

    // hover 效果
    bg.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.05,
        duration: 150,
        ease: 'Sine.easeOut',
      });
      innerGlow.setFillStyle(color, 0.2);
    });

    bg.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Sine.easeOut',
      });
      innerGlow.setFillStyle(color, 0.1);
    });

    // 點擊事件 - 觸發 CARD_REVEALED 進入結果頁面
    bg.on('pointerdown', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CardRevealScene] 使用者確認，進入結果頁面');
      }

      // 點擊縮放動畫
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // 通知 React 卡片已確認揭示
          const bridge = EventBridge.getInstance();
          bridge.trigger(EVENTS.CARD_REVEALED, {
            rarity: this.rarity,
            answerId: this.answerId,
          });
        },
      });
    });

    // 淡入動畫
    this.tweens.add({
      targets: button,
      alpha: 1,
      y: y - 10,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // 呼吸動畫（輕微縮放）
    this.tweens.add({
      targets: button,
      scale: { from: 1, to: 1.03 },
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 500,
    });

    return button;
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
