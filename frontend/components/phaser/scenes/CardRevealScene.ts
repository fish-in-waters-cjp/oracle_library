import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { Rarity, RARITY_COLORS } from '@/hooks/use-answers';

/**
 * CardRevealScene - 卡片揭示場景
 * 顯示 3D 卡牌翻轉、稀有度爆發特效等動畫
 */
export class CardRevealScene extends Phaser.Scene {
  private eventBridge: EventBridge;
  private card?: Phaser.GameObjects.Image;
  private glow?: Phaser.GameObjects.Image;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private answerId = 0;
  private rarity: Rarity = 'Common';

  constructor() {
    super({ key: 'CardRevealScene' });
    this.eventBridge = EventBridge.getInstance();
  }

  init(data: { answerId: number }) {
    this.answerId = data.answerId;
    // 根據 answerId 計算稀有度（簡化版，實際應從 answers.json 讀取）
    this.rarity = this.calculateRarity(data.answerId);
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 設定背景
    this.cameras.main.setBackgroundColor('#0f0f1e');

    // 建立卡牌
    this.createCard(centerX, centerY);

    // 建立光效
    this.createGlow(centerX, centerY);

    // 建立粒子特效
    this.createParticleEffect(centerX, centerY);

    // 開始揭示動畫
    this.startRevealAnimation();

    // 監聽事件
    this.setupEventListeners();
  }

  /**
   * 計算稀有度（簡化版）
   */
  private calculateRarity(answerId: number): Rarity {
    // 簡化的稀有度計算（實際應從 answers.json 讀取）
    const rarityIndex = answerId % 50;

    if (rarityIndex < 35) return 'Common';   // 0-34: Common (70%)
    if (rarityIndex < 45) return 'Rare';     // 35-44: Rare (20%)
    if (rarityIndex < 49) return 'Epic';     // 45-48: Epic (8%)
    return 'Legendary';                       // 49: Legendary (2%)
  }

  /**
   * 建立卡牌
   */
  private createCard(x: number, y: number) {
    // 卡牌背面
    this.card = this.add.image(x, y, 'card-back');
    this.card.setScale(1.5);
    this.card.setAlpha(0);
  }

  /**
   * 建立光效
   */
  private createGlow(x: number, y: number) {
    const glowKey = `glow-${this.rarity.toLowerCase()}`;
    this.glow = this.add.image(x, y, glowKey);
    this.glow.setScale(2);
    this.glow.setAlpha(0);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
  }

  /**
   * 建立粒子特效
   */
  private createParticleEffect(x: number, y: number) {
    const color = this.getRarityParticleColor();

    this.particles = this.add.particles(x, y, 'particle-sparkle', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      blendMode: 'ADD',
      frequency: 30,
      tint: color,
      emitting: false,
    });
  }

  /**
   * 取得稀有度粒子顏色
   */
  private getRarityParticleColor(): number {
    const colorHex = RARITY_COLORS[this.rarity].replace('#', '');
    return parseInt(colorHex, 16);
  }

  /**
   * 開始揭示動畫
   */
  private startRevealAnimation() {
    if (!this.card || !this.glow || !this.particles) return;

    // 1. 卡牌淡入
    this.tweens.add({
      targets: this.card,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    // 2. 3D 翻轉效果（0.5 秒後開始）
    this.time.delayedCall(500, () => {
      this.playCardFlipAnimation();
    });

    // 3. 稀有度爆發（1 秒後）
    this.time.delayedCall(1000, () => {
      this.playRarityBurstAnimation();
    });

    // 4. 持續光效和粒子（1.5 秒後）
    this.time.delayedCall(1500, () => {
      this.playIdleAnimation();
    });

    // 5. 通知 React 揭示完成（2 秒後）
    this.time.delayedCall(2000, () => {
      this.eventBridge.emit(EVENTS.CARD_REVEALED, {
        answerId: this.answerId,
        rarity: this.rarity,
      });
    });
  }

  /**
   * 卡牌翻轉動畫
   */
  private playCardFlipAnimation() {
    if (!this.card) return;

    // 3D 翻轉效果（使用 scaleX 模擬）
    this.tweens.add({
      targets: this.card,
      scaleX: 0,
      duration: 200,
      ease: 'Power2',
      yoyo: true,
      onYoyo: () => {
        // 翻轉到一半時切換到正面
        const frameKey = `card-frame-${this.rarity.toLowerCase()}`;
        this.card?.setTexture(frameKey);
      },
      onComplete: () => {
        this.card?.setScaleX(1.5);
      },
    });

    // 翻轉時的高度變化
    this.tweens.add({
      targets: this.card,
      y: '-=20',
      duration: 200,
      ease: 'Sine.easeOut',
      yoyo: true,
    });
  }

  /**
   * 稀有度爆發動畫
   */
  private playRarityBurstAnimation() {
    if (!this.glow || !this.particles) return;

    // 光效爆發
    this.tweens.add({
      targets: this.glow,
      alpha: 1,
      scale: 3,
      duration: 300,
      ease: 'Power2',
    });

    // 粒子爆發
    this.particles.start();
    this.particles.explode(20);

    // 0.5 秒後減弱
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: this.glow,
        alpha: 0.3,
        scale: 2,
        duration: 500,
        ease: 'Sine.easeOut',
      });
    });
  }

  /**
   * 持續待機動畫
   */
  private playIdleAnimation() {
    if (!this.glow || !this.particles || !this.card) return;

    // 光效脈動
    this.tweens.add({
      targets: this.glow,
      alpha: 0.5,
      scale: 2.2,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // 粒子持續發射
    this.particles.setFrequency(100);

    // 卡牌輕微浮動
    this.tweens.add({
      targets: this.card,
      y: '-=10',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners() {
    this.eventBridge.on(EVENTS.STOP_SCENE, () => {
      this.stopAnimation();
    });
  }

  /**
   * 停止動畫
   */
  private stopAnimation() {
    this.tweens.killAll();
    this.particles?.stop();
    this.scene.stop();
  }

  /**
   * 場景銷毀時清理
   */
  shutdown() {
    this.eventBridge.off(EVENTS.STOP_SCENE);
  }
}
