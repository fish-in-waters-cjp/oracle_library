/**
 * CardRevealScene - 卡片揭示場景
 * 持續的光效環繞、粒子效果根據稀有度變化
 * 持續時間：直到使用者點擊「鑄造 NFT」
 */

class CardRevealScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CardRevealScene' });
        this.rarity = 'common';
    }

    init(data) {
        this.rarity = data.rarity || 'common';
        console.log('[CardRevealScene] 初始化，稀有度:', this.rarity);
    }

    create() {
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
        if (this.rarity === 'legendary') {
            this.createLegendaryEffect(centerX, centerY);
        } else if (this.rarity === 'epic') {
            this.createEpicEffect(centerX, centerY);
        }

        // 通知 React 卡片已揭示
        this.time.delayedCall(500, () => {
            eventBridge.trigger(EVENTS.CARD_REVEALED, {
                rarity: this.rarity
            });
        });

        // 監聽停止事件
        this.events.on(EVENTS.STOP_SCENE, this.stopScene, this);
    }

    /**
     * 建立揭示卡片
     */
    createRevealCard(x, y, color) {
        const card = this.add.container(x, y);
        card.setScale(0.8);

        // 卡牌背景
        const bg = this.add.rectangle(0, 0, 240, 320, 0x1a1a1a);
        bg.setStrokeStyle(3, color, 1);

        // 內發光
        const innerGlow = this.add.rectangle(0, 0, 236, 316, color, 0.1);

        // 卡牌圖示
        const icon = this.add.text(0, -60, '📖', {
            fontSize: '100px'
        });
        icon.setOrigin(0.5);

        // 稀有度標籤
        const rarityText = this.add.text(0, 80, getRarityName(this.rarity), {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#' + color.toString(16).padStart(6, '0')
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
            repeat: -1
        });

        // 縮放進入
        this.tweens.add({
            targets: card,
            scale: { from: 0.5, to: 1 },
            duration: 800,
            ease: 'Back.easeOut'
        });

        return card;
    }

    /**
     * 持續光環效果
     */
    createAuraEffect(x, y, color) {
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
                delay: i * 300
            });
        }
    }

    /**
     * 環繞粒子
     */
    createOrbitParticles(x, y, color) {
        // 根據稀有度調整粒子密度
        const frequencyMap = {
            common: 150,
            rare: 100,
            epic: 80,
            legendary: 50
        };

        // 環繞軌道粒子 (使用新 API)
        const emitter = this.add.particles(x, y, 'particle', {
            speed: 50,
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 2000,
            frequency: frequencyMap[this.rarity] || 100,
            tint: color,
            blendMode: 'ADD',
            radial: true
        });
    }

    /**
     * 傳說級特殊效果
     */
    createLegendaryEffect(x, y) {
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

        // 旋轉光線
        this.tweens.add({
            targets: rays,
            angle: 360,
            duration: 8000,
            ease: 'Linear',
            repeat: -1
        });

        // 星星粒子環繞 (使用新 API)
        this.add.particles(x, y, 'star', {
            speed: 30,
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 3000,
            frequency: 200,
            tint: 0xd4af37,
            blendMode: 'ADD'
        });
    }

    /**
     * 史詩級特殊效果
     */
    createEpicEffect(x, y) {
        // 紫色能量波
        const wave = this.add.circle(x, y, 100, 0xa78bfa, 0);
        wave.setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
            targets: wave,
            scale: { from: 1, to: 2.5 },
            alpha: { from: 0.3, to: 0 },
            duration: 2000,
            ease: 'Cubic.easeOut',
            repeat: -1
        });
    }

    /**
     * 停止場景
     */
    stopScene() {
        console.log('[CardRevealScene] 停止場景');
        this.scene.stop();
    }

    /**
     * 清理
     */
    shutdown() {
        this.events.off(EVENTS.STOP_SCENE, this.stopScene, this);
    }
}
