/**
 * Phaser 遊戲配置
 */

/**
 * 建立 Phaser 遊戲配置
 * @param {string} containerId - 容器 DOM ID
 * @returns {Object} Phaser.Types.Core.GameConfig
 */
function createGameConfig(containerId = 'phaser-game') {
    return {
        type: Phaser.AUTO,
        parent: containerId,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        transparent: false,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [] // 場景將動態加入
    };
}

/**
 * 稀有度顏色映射
 */
const RARITY_COLORS = {
    common: 0x9ca3af,
    rare: 0x60a5fa,
    epic: 0xa78bfa,
    legendary: 0xd4af37
};

/**
 * 稀有度名稱（中文）
 */
const RARITY_NAMES = {
    common: '普通',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說'
};

/**
 * 取得稀有度顏色
 * @param {string} rarity - 稀有度
 * @returns {number}
 */
function getRarityColor(rarity) {
    return RARITY_COLORS[rarity] || RARITY_COLORS.common;
}

/**
 * 取得稀有度名稱
 * @param {string} rarity - 稀有度
 * @returns {string}
 */
function getRarityName(rarity) {
    return RARITY_NAMES[rarity] || '未知';
}

/**
 * 粒子配置生成器
 */
const ParticleConfig = {
    /**
     * 能量聚集粒子
     * @param {number} color - 顏色
     */
    energyGather(color) {
        return {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            frequency: 50,
            tint: color,
            blendMode: 'ADD'
        };
    },

    /**
     * 持續光環粒子
     * @param {number} color - 顏色
     */
    auraGlow(color) {
        return {
            speed: { min: 20, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 2000,
            frequency: 100,
            tint: color,
            blendMode: 'ADD'
        };
    },

    /**
     * 煙火粒子
     * @param {number} color - 顏色
     */
    firework(color) {
        return {
            speed: { min: 200, max: 400 },
            angle: { min: -90, max: 90 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 2000,
            frequency: 200,
            tint: color,
            blendMode: 'ADD',
            gravityY: 200
        };
    },

    /**
     * 金幣飛散粒子
     */
    coinBurst() {
        return {
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0.2 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            frequency: 100,
            tint: 0xd4af37,
            blendMode: 'ADD',
            gravityY: 400,
            rotate: { min: 0, max: 360 }
        };
    }
};
