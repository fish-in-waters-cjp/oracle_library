import * as Phaser from 'phaser';
import { EventBridge, EVENTS } from '../EventBridge';

/**
 * PreloadScene - 資源預載入場景
 *
 * 負責載入所有 Phaser 場景所需的資源：
 * - 粒子材質（圓形、星形）
 * - 卡片圖片（根據 answerId 載入對應圖片）
 * - 音效（未來擴展）
 * - 其他圖形資源
 *
 * 載入完成後自動通知 React 端，並進入待命狀態
 */
export class PreloadScene extends Phaser.Scene {
  private loadingBar: Phaser.GameObjects.Graphics | null = null;
  private progressBox: Phaser.GameObjects.Graphics | null = null;
  private loadingText: Phaser.GameObjects.Text | null = null;
  private initData: { answerId?: number; rarity?: string } = {};

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: { answerId?: number; rarity?: string }): void {
    this.initData = data || {};
    if (process.env.NODE_ENV === 'development') {
      console.log('[PreloadScene] 初始化，資料:', this.initData);
    }
  }

  preload(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 建立載入進度 UI
    this.createLoadingUI(centerX, centerY);

    // 監聽載入進度
    this.load.on('progress', this.updateProgress, this);
    this.load.on('complete', this.loadComplete, this);

    // 生成粒子材質（使用 Canvas 繪製）
    this.createParticleTextures();

    // 載入卡片圖片（根據 answerId）
    this.loadCardImage();
  }

  /**
   * 載入卡片圖片
   * 根據 answerId 載入對應的卡片圖片
   * 注意：answerId 是 0-49，圖片檔名是 1-50，所以需要 +1
   */
  private loadCardImage(): void {
    const answerId = this.initData.answerId;
    if (answerId !== undefined && answerId >= 0 && answerId <= 49) {
      // answerId 0-49 對應圖片 1.png - 50.png
      const imageId = answerId + 1;
      const imageUrl = `/game/cards/faces/${imageId}.png`;
      const textureKey = `card-${answerId}`;

      // 避免重複載入
      if (!this.textures.exists(textureKey)) {
        this.load.image(textureKey, imageUrl);
        if (process.env.NODE_ENV === 'development') {
          console.log('[PreloadScene] 載入卡片圖片:', textureKey, imageUrl);
        }
      }
    }
  }

  create(): void {
    // 清理載入 UI
    this.cleanupLoadingUI();

    // 通知 React 場景已準備就緒
    const bridge = EventBridge.getInstance();
    bridge.trigger(EVENTS.SCENE_READY, { scene: 'PreloadScene' });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PreloadScene] 資源載入完成，場景就緒');
    }

    // 如果有初始資料（answerId 和 rarity），直接啟動 DrawScene
    if (this.initData.answerId !== undefined && this.initData.rarity) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PreloadScene] 自動啟動 DrawScene', this.initData);
      }
      this.scene.start('DrawScene', this.initData);
      return;
    }

    // 否則監聽 React 事件（向下相容）
    this.setupEventListeners();
  }

  /**
   * 建立載入進度 UI
   */
  private createLoadingUI(centerX: number, centerY: number): void {
    // 進度條背景
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(centerX - 160, centerY - 25, 320, 50);

    // 進度條
    this.loadingBar = this.add.graphics();

    // 載入文字
    this.loadingText = this.add.text(centerX, centerY - 50, '載入資源中...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    this.loadingText.setOrigin(0.5);
  }

  /**
   * 更新載入進度
   */
  private updateProgress(value: number): void {
    if (!this.loadingBar) return;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.loadingBar.clear();
    this.loadingBar.fillStyle(0x60a5fa, 1);
    this.loadingBar.fillRect(centerX - 150, centerY - 15, 300 * value, 30);

    if (this.loadingText) {
      this.loadingText.setText(`載入資源中... ${Math.floor(value * 100)}%`);
    }
  }

  /**
   * 載入完成回調
   */
  private loadComplete(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PreloadScene] 所有資源載入完成');
    }
  }

  /**
   * 清理載入 UI
   */
  private cleanupLoadingUI(): void {
    this.loadingBar?.destroy();
    this.progressBox?.destroy();
    this.loadingText?.destroy();

    this.loadingBar = null;
    this.progressBox = null;
    this.loadingText = null;
  }

  /**
   * 建立粒子材質
   * 使用 Graphics 繪製，避免外部資源依賴
   */
  private createParticleTextures(): void {
    // 1. 基礎圓形粒子
    this.createCircleParticle();

    // 2. 星形粒子
    this.createStarParticle();

    // 3. 光暈粒子
    this.createGlowParticle();
  }

  /**
   * 建立圓形粒子材質
   */
  private createCircleParticle(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('particle', 32, 32);
    graphics.destroy();
  }

  /**
   * 建立星形粒子材質
   */
  private createStarParticle(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);

    // 繪製五角星
    const cx = 16;
    const cy = 16;
    const spikes = 5;
    const outerRadius = 14;
    const innerRadius = 6;

    graphics.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();

    graphics.generateTexture('star', 32, 32);
    graphics.destroy();
  }

  /**
   * 建立光暈粒子材質
   */
  private createGlowParticle(): void {
    const graphics = this.add.graphics();

    // 漸層光暈效果
    const cx = 32;
    const cy = 32;

    for (let i = 32; i > 0; i--) {
      const alpha = 1 - i / 32;
      graphics.fillStyle(0xffffff, alpha * 0.3);
      graphics.fillCircle(cx, cy, i);
    }

    graphics.generateTexture('glow', 64, 64);
    graphics.destroy();
  }

  /**
   * 設定事件監聽器
   */
  private setupEventListeners(): void {
    const bridge = EventBridge.getInstance();

    // 監聽開始抽取事件
    bridge.on(EVENTS.START_DRAW, (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PreloadScene] 收到 START_DRAW 事件', data);
      }
      this.scene.start('DrawScene', data as object);
    });
  }

  /**
   * 場景關閉時清理
   */
  shutdown(): void {
    const bridge = EventBridge.getInstance();
    bridge.off(EVENTS.START_DRAW, () => {});
  }
}

export default PreloadScene;
