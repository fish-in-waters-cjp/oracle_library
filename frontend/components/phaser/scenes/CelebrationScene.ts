import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';
import { getRarityColor, RARITY_COLORS, ParticleConfig } from '../PhaserGame';

type RarityKey = keyof typeof RARITY_COLORS;

/**
 * CelebrationScene - NFT 鑄造慶祝場景
 *
 * 華麗特效：
 * - 煙火爆發效果
 * - 金幣/星星飛散
 * - 光芒閃爍
 * - 稀有度專屬特效
 *
 * 場景在動畫完成後自動觸發 CELEBRATION_DONE 事件
 */
export class CelebrationScene extends Phaser.Scene {
  private rarity: RarityKey = 'Common';
  private nftId: string = '';
  private animationDuration: number = 4000; // 動畫總時長
  private isCompleted: boolean = false;

  constructor() {
    super({ key: 'CelebrationScene' });
  }

  init(data: { rarity?: RarityKey; nftId?: string }): void {
    this.rarity = data.rarity || 'Common';
    this.nftId = data.nftId || '';
    this.isCompleted = false;

    if (process.env.NODE_ENV === 'development') {
      console.log('[CelebrationScene] 初始化，稀有度:', this.rarity);
    }
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const color = getRarityColor(this.rarity);

    // 淡入效果
    this.cameras.main.fadeIn(300);

    // 1. 背景閃光
    this.createBackgroundFlash(centerX, centerY, color);

    // 2. 中央爆發
    this.createCentralBurst(centerX, centerY, color);

    // 3. 煙火效果
    this.createFireworks(color);

    // 4. 金幣飛散
    this.createCoinBurst(centerX, centerY);

    // 5. 星星環繞
    this.createStarBurst(centerX, centerY, color);

    // 6. 成功文字
    this.createSuccessText(centerX, centerY);

    // 7. 稀有度專屬特效
    if (this.rarity === 'Legendary') {
      this.createLegendaryEffect(centerX, centerY);
    } else if (this.rarity === 'Epic') {
      this.createEpicEffect(centerX, centerY);
    }

    // 8. 設定動畫完成計時器
    this.time.delayedCall(this.animationDuration, () => {
      this.onCelebrationComplete();
    });

    // 監聽停止事件
    this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
  }

  /**
   * 背景閃光效果
   */
  private createBackgroundFlash(x: number, y: number, color: number): void {
    const flash = this.add.rectangle(x, y, 800, 600, color, 0);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    // 閃光序列
    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.4 },
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  /**
   * 中央爆發效果
   */
  private createCentralBurst(x: number, y: number, color: number): void {
    // 多層光環爆發
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(x, y, 20, color, 0.8);
      ring.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: ring,
        scale: { from: 0.5, to: 4 + i },
        alpha: { from: 0.8, to: 0 },
        duration: 800 + i * 200,
        ease: 'Cubic.easeOut',
        delay: i * 100,
        onComplete: () => {
          ring.destroy();
        },
      });
    }

    // 中央粒子爆發
    const burstEmitter = this.add.particles(x, y, 'particle', {
      speed: { min: 300, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1200,
      quantity: 30,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
    });

    // 只發射一次
    burstEmitter.explode(50);
  }

  /**
   * 煙火效果
   */
  private createFireworks(color: number): void {
    const fireworkPositions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 400, y: 100 },
      { x: 200, y: 400 },
      { x: 600, y: 400 },
    ];

    fireworkPositions.forEach((pos, index) => {
      this.time.delayedCall(index * 300, () => {
        this.launchFirework(pos.x, pos.y, color);
      });
    });
  }

  /**
   * 發射單個煙火
   */
  private launchFirework(x: number, y: number, color: number): void {
    // 上升軌跡
    const rocket = this.add.circle(x, 550, 4, color, 1);
    rocket.setBlendMode(Phaser.BlendModes.ADD);

    // 上升軌跡粒子
    const trailEmitter = this.add.particles(x, 550, 'particle', {
      speed: 20,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      frequency: 20,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      follow: rocket,
    });

    // 上升動畫
    this.tweens.add({
      targets: rocket,
      y: y,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // 停止軌跡
        trailEmitter.stop();
        rocket.destroy();

        // 爆發
        this.explodeFirework(x, y, color);
      },
    });
  }

  /**
   * 煙火爆發
   */
  private explodeFirework(x: number, y: number, color: number): void {
    // 主要爆發
    const burstEmitter = this.add.particles(x, y, 'particle', {
      ...ParticleConfig.firework(color),
      angle: { min: 0, max: 360 },
      speed: { min: 150, max: 300 },
    });

    burstEmitter.explode(40);

    // 二次爆發（金色）
    this.time.delayedCall(150, () => {
      const secondBurst = this.add.particles(x, y, 'particle', {
        ...ParticleConfig.firework(0xd4af37),
        angle: { min: 0, max: 360 },
        speed: { min: 100, max: 200 },
      });
      secondBurst.explode(20);
    });
  }

  /**
   * 金幣飛散效果
   */
  private createCoinBurst(x: number, y: number): void {
    // 多個金幣發射位置
    const coinCount = this.rarity === 'Legendary' ? 20 : this.rarity === 'Epic' ? 15 : 10;

    for (let i = 0; i < coinCount; i++) {
      this.time.delayedCall(i * 50, () => {
        this.launchCoin(x, y);
      });
    }
  }

  /**
   * 發射單個金幣
   */
  private launchCoin(x: number, y: number): void {
    const coin = this.add.text(x, y, '🪙', {
      fontSize: '32px',
    });
    coin.setOrigin(0.5);

    // 隨機方向和速度
    const angle = Phaser.Math.Between(-120, -60);
    const speed = Phaser.Math.Between(300, 500);
    const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
    const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

    this.tweens.add({
      targets: coin,
      x: x + vx,
      y: y + vy + 400, // 加上重力效果
      rotation: Phaser.Math.Between(-5, 5),
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        coin.destroy();
      },
    });
  }

  /**
   * 星星爆發效果
   */
  private createStarBurst(x: number, y: number, color: number): void {
    const starEmitter = this.add.particles(x, y, 'star', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      tint: [color, 0xd4af37, 0xffffff],
      blendMode: Phaser.BlendModes.ADD,
      rotate: { min: 0, max: 360 },
    });

    // 初始爆發
    starEmitter.explode(30);

    // 持續灑落
    this.time.delayedCall(500, () => {
      const rainEmitter = this.add.particles(400, -20, 'star', {
        speed: { min: 50, max: 100 },
        angle: { min: 80, max: 100 },
        scale: { start: 0.3, end: 0.1 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 3000,
        frequency: 50,
        tint: [color, 0xd4af37],
        blendMode: Phaser.BlendModes.ADD,
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(-400, 0, 800, 10),
        },
      });

      // 3 秒後停止
      this.time.delayedCall(3000, () => {
        rainEmitter.stop();
      });
    });
  }

  /**
   * 成功文字動畫
   */
  private createSuccessText(x: number, y: number): void {
    // 主標題
    const title = this.add.text(x, y - 100, '🎉 鑄造成功！', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    title.setAlpha(0);
    title.setScale(0.5);

    // 標題動畫
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 300,
    });

    // 副標題
    const subtitle = this.add.text(x, y + 50, 'NFT 已永久保存至區塊鏈', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 500,
      delay: 800,
    });

    // 文字浮動效果
    this.tweens.add({
      targets: [title, subtitle],
      y: '-=10',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 1000,
    });
  }

  /**
   * 傳說級專屬特效
   */
  private createLegendaryEffect(x: number, y: number): void {
    // 金色旋轉光環
    const rays = this.add.graphics();
    rays.lineStyle(3, 0xd4af37, 0.5);

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
    rays.setAlpha(0);

    // 光環旋轉
    this.tweens.add({
      targets: rays,
      alpha: { from: 0, to: 0.6 },
      duration: 500,
      delay: 200,
    });

    this.tweens.add({
      targets: rays,
      angle: 360,
      duration: 10000,
      ease: 'Linear',
      repeat: -1,
    });

    // 額外金色粒子
    this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2000,
      frequency: 30,
      tint: 0xd4af37,
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  /**
   * 史詩級專屬特效
   */
  private createEpicEffect(x: number, y: number): void {
    // 紫色能量波
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
          onComplete: () => {
            wave.destroy();
          },
        });
      });
    }

    // 紫色粒子環繞
    this.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1500,
      frequency: 50,
      tint: 0xa78bfa,
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  /**
   * 慶祝動畫完成
   */
  private onCelebrationComplete(): void {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('[CelebrationScene] 慶祝動畫完成');
    }

    // 通知 React
    const bridge = EventBridge.getInstance();
    bridge.trigger(EVENTS.CELEBRATION_DONE, {
      rarity: this.rarity,
      nftId: this.nftId,
    });
  }

  /**
   * 停止場景
   */
  private stopScene(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CelebrationScene] 停止場景');
    }

    // 淡出
    this.cameras.main.fadeOut(300, 0, 0, 0);

    this.time.delayedCall(300, () => {
      this.scene.stop();
    });
  }

  /**
   * 場景關閉時清理
   */
  shutdown(): void {
    this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
  }
}

export default CelebrationScene;
