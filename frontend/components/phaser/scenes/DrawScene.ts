import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';

/**
 * DrawScene - 抽取動畫場景
 * 顯示卡牌飛入、能量粒子聚集等抽取動畫
 */
export class DrawScene extends Phaser.Scene {
  private eventBridge: EventBridge;
  private cards: Phaser.GameObjects.Image[] = [];
  private energyParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private isAnimating = false;
  private answerId = 0;

  constructor() {
    super({ key: 'DrawScene' });
    this.eventBridge = EventBridge.getInstance();
  }

  init(data: { answerId?: number }) {
    this.answerId = data.answerId ?? 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 設定背景
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 建立卡牌堆疊
    this.createCardDeck(width, height);

    // 建立能量粒子系統
    this.createEnergyParticles(width, height);

    // 監聽 React 事件
    this.setupEventListeners();

    // 通知 React 場景已準備好
    this.eventBridge.emit(EVENTS.SCENE_READY, { scene: 'DrawScene' });

    // 自動開始抽取動畫
    this.startDrawAnimation({ answerId: this.answerId });
  }

  /**
   * 建立卡牌堆疊
   */
  private createCardDeck(width: number, height: number) {
    const cardCount = 50;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < cardCount; i++) {
      const card = this.add.image(centerX, centerY + 200, 'card-back');
      card.setScale(0.5);
      card.setAlpha(0.8);
      card.setDepth(i);

      // 隨機散開效果
      const offsetX = Phaser.Math.Between(-20, 20);
      const offsetY = Phaser.Math.Between(-10, 10);
      card.x += offsetX;
      card.y += offsetY;

      this.cards.push(card);
    }
  }

  /**
   * 建立能量粒子系統
   */
  private createEnergyParticles(width: number, height: number) {
    // 使用粒子發射器
    this.energyParticles = this.add.particles(0, 0, 'particle-energy', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2000,
      blendMode: 'ADD',
      frequency: 50,
      emitting: false,
    });
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners() {
    // 監聽開始抽取事件
    this.eventBridge.on(EVENTS.START_DRAW, (data) => {
      this.startDrawAnimation(data as { answerId: number });
    });

    // 監聽停止場景事件
    this.eventBridge.on(EVENTS.STOP_SCENE, () => {
      this.stopAnimation();
    });
  }

  /**
   * 開始抽取動畫
   */
  private startDrawAnimation(data: { answerId: number }) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. 卡牌飛入動畫
    this.playCardFlyInAnimation(centerX, centerY);

    // 2. 能量粒子聚集
    this.playEnergyGatherAnimation(centerX, centerY);

    // 3. 等待 2 秒後完成
    this.time.delayedCall(2000, () => {
      this.completeDrawAnimation(data.answerId);
    });
  }

  /**
   * 卡牌飛入動畫
   */
  private playCardFlyInAnimation(centerX: number, centerY: number) {
    this.cards.forEach((card, index) => {
      // 計算目標位置（螺旋排列）
      const angle = (index / this.cards.length) * Math.PI * 4;
      const radius = 100 + (index % 5) * 20;
      const targetX = centerX + Math.cos(angle) * radius;
      const targetY = centerY + Math.sin(angle) * radius;

      // 飛入動畫
      this.tweens.add({
        targets: card,
        x: targetX,
        y: targetY,
        scale: 0.3,
        alpha: 0.6,
        rotation: angle,
        duration: 1000,
        delay: index * 20,
        ease: 'Cubic.easeOut',
      });
    });
  }

  /**
   * 能量粒子聚集動畫
   */
  private playEnergyGatherAnimation(centerX: number, centerY: number) {
    if (!this.energyParticles) return;

    // 開始發射粒子
    this.energyParticles.start();

    // 粒子向中心移動
    this.energyParticles.setGravity(0, 0);
    this.energyParticles.setEmitterOp('gravityX', (particle: any) => {
      return (centerX - particle.x) * 2;
    });
    this.energyParticles.setEmitterOp('gravityY', (particle: any) => {
      return (centerY - particle.y) * 2;
    });

    // 1.5 秒後停止發射
    this.time.delayedCall(1500, () => {
      this.energyParticles?.stop();
    });
  }

  /**
   * 完成抽取動畫
   */
  private completeDrawAnimation(answerId: number) {
    // 卡牌消失動畫
    this.cards.forEach((card, index) => {
      this.tweens.add({
        targets: card,
        alpha: 0,
        scale: 0,
        duration: 500,
        delay: index * 10,
        ease: 'Back.easeIn',
      });
    });

    // 發送完成事件給 React
    this.time.delayedCall(800, () => {
      this.eventBridge.emit(EVENTS.DRAW_COMPLETE, { answerId });
      this.isAnimating = false;

      // 啟動揭示場景
      this.scene.start('CardRevealScene', { answerId });
    });
  }

  /**
   * 停止動畫
   */
  private stopAnimation() {
    this.isAnimating = false;
    this.tweens.killAll();
    this.energyParticles?.stop();

    // 重置卡牌
    this.cards.forEach((card) => {
      card.destroy();
    });
    this.cards = [];
  }

  /**
   * 場景銷毀時清理
   */
  shutdown() {
    this.eventBridge.off(EVENTS.START_DRAW);
    this.eventBridge.off(EVENTS.STOP_SCENE);
  }
}
