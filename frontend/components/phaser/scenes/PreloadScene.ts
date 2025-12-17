import * as Phaser from 'phaser';

/**
 * PreloadScene - 資源預載場景
 * 載入所有遊戲需要的圖片、音效等資源
 */
export class PreloadScene extends Phaser.Scene {
  private answerId = 0;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: { answerId?: number }) {
    this.answerId = data.answerId ?? 0;
  }

  preload() {
    // 建立載入進度條
    this.createLoadingBar();

    // 載入卡牌相關素材
    this.loadCardAssets();

    // 載入粒子特效素材
    this.loadParticleAssets();

    // 載入音效（可選）
    // this.loadAudioAssets();
  }

  /**
   * 建立載入進度條
   */
  private createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 進度條背景
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // 載入文字
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // 百分比文字
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    // 更新進度條
    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // 載入完成
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  /**
   * 載入卡牌相關素材
   */
  private loadCardAssets() {
    // 卡牌背面
    this.load.image('card-back', '/game/cards/card-back.png');

    // 卡牌框架（不同稀有度）
    this.load.image('card-frame-common', '/game/cards/frame-common.png');
    this.load.image('card-frame-rare', '/game/cards/frame-rare.png');
    this.load.image('card-frame-epic', '/game/cards/frame-epic.png');
    this.load.image('card-frame-legendary', '/game/cards/frame-legendary.png');

    // 稀有度光效
    this.load.image('glow-common', '/game/effects/glow-common.png');
    this.load.image('glow-rare', '/game/effects/glow-rare.png');
    this.load.image('glow-epic', '/game/effects/glow-epic.png');
    this.load.image('glow-legendary', '/game/effects/glow-legendary.png');
  }

  /**
   * 載入粒子特效素材
   */
  private loadParticleAssets() {
    // 基礎粒子
    this.load.image('particle-star', '/game/particles/star.png');
    this.load.image('particle-sparkle', '/game/particles/sparkle.png');
    this.load.image('particle-glow', '/game/particles/glow.png');

    // 能量粒子
    this.load.image('particle-energy', '/game/particles/energy.png');
    this.load.image('particle-magic', '/game/particles/magic.png');

    // 慶祝粒子
    this.load.image('particle-coin', '/game/particles/coin.png');
    this.load.image('particle-firework', '/game/particles/firework.png');
  }

  /**
   * 載入音效（可選）
   */
  private loadAudioAssets() {
    this.load.audio('draw-sound', '/game/audio/draw.mp3');
    this.load.audio('reveal-sound', '/game/audio/reveal.mp3');
    this.load.audio('celebration-sound', '/game/audio/celebration.mp3');
  }

  create() {
    // 資源載入完成，啟動 DrawScene 並傳遞 answerId
    this.scene.start('DrawScene', { answerId: this.answerId });
  }
}
