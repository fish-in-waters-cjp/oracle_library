/**
 * CelebrationScene - 慶祝場景
 * 煙火、金幣飛散、光芒爆發
 * 持續時間：2-3 秒
 */

class CelebrationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CelebrationScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        console.log('[CelebrationScene] 開始慶祝動畫');

        // 淡入效果
        this.cameras.main.fadeIn(300);

        // 1. 光芒爆發
        this.createFlashBurst(centerX, centerY);

        // 2. 煙火效果
        this.time.delayedCall(300, () => {
            this.createFireworks();
        });

        // 3. 金幣飛散
        this.time.delayedCall(500, () => {
            this.createCoinBurst(centerX, centerY);
        });

        // 4. 成功文字
        this.time.delayedCall(800, () => {
            this.createSuccessText(centerX, centerY);
        });

        // 5. 完成事件
        this.time.delayedCall(2800, () => {
            this.completeAnimation();
        });
    }

    /**
     * 光芒爆發
     */
    createFlashBurst(x, y) {
        // 中心光芒
        const flash = this.add.circle(x, y, 50, 0xd4af37, 0);

        this.tweens.add({
            targets: flash,
            alpha: { from: 1, to: 0 },
            scale: { from: 0, to: 10 },
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                flash.destroy();
            }
        });

        // 相機閃白
        this.cameras.main.flash(400, 255, 215, 55);

        // 震動
        this.cameras.main.shake(300, 0.01);
    }

    /**
     * 煙火效果
     */
    createFireworks() {
        const colors = [0xd4af37, 0xe8c96f, 0xc0c0c0];

        // 隨機位置發射煙火
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 300, () => {
                const x = Phaser.Math.Between(200, this.cameras.main.width - 200);
                const y = Phaser.Math.Between(100, this.cameras.main.height - 200);
                const color = Phaser.Utils.Array.GetRandom(colors);

                this.launchFirework(x, y, color);
            });
        }
    }

    /**
     * 發射單個煙火
     */
    launchFirework(x, y, color) {
        // 使用新 API 創建煙火粒子
        const emitter = this.add.particles(x, y, 'star', {
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 2000,
            quantity: 30,
            tint: color,
            blendMode: 'ADD',
            gravityY: 200
        });

        emitter.explode();

        // 播放音效（模擬）
        console.log('[CelebrationScene] 🔊 煙火音效');

        this.time.delayedCall(2500, () => {
            emitter.destroy();
        });
    }

    /**
     * 金幣飛散
     */
    createCoinBurst(x, y) {
        // 使用新 API 創建金幣粒子
        const emitter = this.add.particles(x, y - 100, 'particle', {
            speed: { min: 200, max: 400 },
            angle: { min: -120, max: -60 },
            scale: { start: 0.5, end: 0.2 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            frequency: 30,
            tint: 0xd4af37,
            blendMode: 'ADD',
            gravityY: 400,
            rotate: { start: 0, end: 360 },
            maxParticles: 50
        });

        // 播放音效（模擬）
        console.log('[CelebrationScene] 🔊 金幣音效');

        this.time.delayedCall(1000, () => {
            emitter.stop();
        });

        this.time.delayedCall(2500, () => {
            emitter.destroy();
        });
    }

    /**
     * 成功文字
     */
    createSuccessText(x, y) {
        const text = this.add.text(x, y, '鑄造成功！', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        text.setOrigin(0.5);
        text.setAlpha(0);
        text.setScale(0.5);

        // 彈出動畫
        this.tweens.add({
            targets: text,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1.2 },
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 輕微跳動
                this.tweens.add({
                    targets: text,
                    scale: { from: 1.2, to: 1.1 },
                    duration: 200,
                    yoyo: true,
                    repeat: 2
                });
            }
        });

        // 淡出
        this.tweens.add({
            targets: text,
            alpha: { from: 1, to: 0 },
            delay: 1500,
            duration: 500
        });
    }

    /**
     * 完成動畫
     */
    completeAnimation() {
        console.log('[CelebrationScene] 慶祝完成');

        // 通知 React
        eventBridge.trigger(EVENTS.CELEBRATION_DONE, {
            success: true
        });

        // 淡出
        this.cameras.main.fadeOut(500);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
        });
    }
}
