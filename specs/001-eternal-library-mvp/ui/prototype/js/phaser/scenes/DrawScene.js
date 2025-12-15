/**
 * DrawScene - 抽取動畫場景
 * 卡牌飛入、能量粒子聚集、3D 翻轉、稀有度爆發
 * 持續時間：3-5 秒
 */

class DrawScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DrawScene' });
        this.rarity = 'common';
    }

    init(data) {
        this.rarity = data.rarity || 'common';
        console.log('[DrawScene] 初始化，稀有度:', this.rarity);
    }

    preload() {
        // 建立粒子圖形（使用 Canvas 生成）
        this.createParticleTextures();
    }

    create() {
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

        // 5. 3D 翻轉效果
        this.time.delayedCall(1200, () => {
            this.animateCardFlip(this.card);
        });

        // 6. 稀有度爆發
        this.time.delayedCall(2000, () => {
            this.createRarityBurst(centerX, centerY, color);
        });

        // 7. 完成事件
        this.time.delayedCall(3500, () => {
            this.completeAnimation();
        });

        // 監聽停止事件
        this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
    }

    /**
     * 建立粒子材質
     */
    createParticleTextures() {
        // 基礎粒子（圓形）
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('particle', 32, 32);
        graphics.destroy();

        // 星星粒子（手動繪製）
        const star = this.add.graphics();
        star.fillStyle(0xffffff, 1);

        // 繪製五角星
        const cx = 16, cy = 16;
        const spikes = 5;
        const outerRadius = 14;
        const innerRadius = 6;

        star.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) {
                star.moveTo(x, y);
            } else {
                star.lineTo(x, y);
            }
        }
        star.closePath();
        star.fillPath();

        star.generateTexture('star', 32, 32);
        star.destroy();
    }

    /**
     * 建立背景光暈
     */
    createBackgroundGlow(x, y) {
        const glow = this.add.circle(x, y, 200, 0x000000, 0);

        this.tweens.add({
            targets: glow,
            alpha: { from: 0, to: 0.3 },
            scale: { from: 0.5, to: 1.5 },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 建立卡牌
     */
    createCard(x, y, color) {
        const card = this.add.container(x, -200);

        // 卡牌背景
        const bg = this.add.rectangle(0, 0, 200, 280, 0x1a1a1a);
        bg.setStrokeStyle(2, color, 0.8);

        // 卡牌邊框發光
        const glow = this.add.rectangle(0, 0, 200, 280, color, 0);

        // 卡牌圖示（書本）
        const icon = this.add.text(0, 0, '📖', {
            fontSize: '80px'
        });
        icon.setOrigin(0.5);

        card.add([glow, bg, icon]);
        card.setData('glow', glow);
        card.setData('bg', bg);
        card.setData('icon', icon);

        return card;
    }

    /**
     * 卡牌飛入動畫
     */
    animateCardEntry(card, targetX, targetY) {
        this.tweens.add({
            targets: card,
            y: targetY,
            duration: 1000,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 落地後輕微震動
                this.cameras.main.shake(200, 0.005);
            }
        });

        // 邊框發光動畫
        const glow = card.getData('glow');
        this.tweens.add({
            targets: glow,
            alpha: { from: 0, to: 0.2 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 能量粒子聚集
     */
    createEnergyParticles(x, y, color) {
        // 使用新的 Phaser 3.60+ API
        const emitter = this.add.particles(x, y, 'particle', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1500,
            frequency: 30,
            tint: color,
            blendMode: 'ADD',
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(0, 0, this.cameras.main.width, this.cameras.main.height),
                quantity: 2
            },
            moveToX: x,
            moveToY: y
        });

        // 1.5 秒後停止
        this.time.delayedCall(1500, () => {
            emitter.stop();
        });

        // 3 秒後銷毀
        this.time.delayedCall(3000, () => {
            emitter.destroy();
        });
    }

    /**
     * 3D 翻轉效果
     */
    animateCardFlip(card) {
        const icon = card.getData('icon');

        // 模擬 3D 翻轉（scaleX 動畫）
        this.tweens.add({
            targets: card,
            scaleX: { from: 1, to: 0 },
            duration: 400,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // 翻轉到背面後再翻回來
                this.tweens.add({
                    targets: card,
                    scaleX: { from: 0, to: 1 },
                    duration: 400,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // 圖示同步翻轉
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
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // 播放音效（模擬）
        console.log('[DrawScene] 🔊 翻轉音效');
    }

    /**
     * 稀有度爆發效果
     */
    createRarityBurst(x, y, color) {
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
            }
        });

        // 星星粒子爆發 (使用新 API)
        const emitter = this.add.particles(x, y, 'star', {
            speed: { min: 150, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            quantity: 30,
            tint: color,
            blendMode: 'ADD'
        });

        emitter.explode();

        this.time.delayedCall(2000, () => {
            emitter.destroy();
        });

        // 相機閃光
        this.cameras.main.flash(500, 255, 255, 255, false, (camera, progress) => {
            if (progress === 1) {
                console.log('[DrawScene] 爆發完成');
            }
        });

        // 播放音效（模擬）
        console.log(`[DrawScene] 🔊 ${getRarityName(this.rarity)} 爆發音效`);
    }

    /**
     * 完成動畫
     */
    completeAnimation() {
        console.log('[DrawScene] 動畫完成');

        // 通知 React
        eventBridge.trigger(EVENTS.DRAW_COMPLETE, {
            rarity: this.rarity
        });

        // 淡出並切換到 CardRevealScene
        this.cameras.main.fadeOut(500);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('CardRevealScene', { rarity: this.rarity });
        });
    }

    /**
     * 停止場景
     */
    stopScene() {
        console.log('[DrawScene] 強制停止');
        this.scene.stop();
    }

    /**
     * 清理
     */
    shutdown() {
        this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
    }
}
