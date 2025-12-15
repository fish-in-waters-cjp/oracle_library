/**
 * React ↔ Phaser 事件橋接
 * 處理雙向通訊
 */

class EventBridge {
    constructor() {
        this.listeners = {};
        this.game = null;
        this.eventLog = [];
    }

    /**
     * 設定 Phaser 遊戲實例
     * @param {Phaser.Game} game
     */
    setGame(game) {
        this.game = game;
        console.log('[EventBridge] 遊戲實例已設定');
    }

    /**
     * React → Phaser: 發送事件到 Phaser
     * @param {string} eventName - 事件名稱
     * @param {Object} data - 事件資料
     */
    emit(eventName, data = {}) {
        this.log('OUT', eventName, data);

        if (!this.game) {
            console.error('[EventBridge] 遊戲實例未設定，無法發送事件');
            return;
        }

        // 發送到所有場景
        this.game.scene.scenes.forEach(scene => {
            if (scene.scene.isActive()) {
                scene.events.emit(eventName, data);
            }
        });

        console.log(`[EventBridge] 發送事件: ${eventName}`, data);
    }

    /**
     * Phaser → React: 監聽來自 Phaser 的事件
     * @param {string} eventName - 事件名稱
     * @param {Function} callback - 回調函數
     */
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(callback);
        console.log(`[EventBridge] 註冊監聽器: ${eventName}`);
    }

    /**
     * 移除事件監聽器
     * @param {string} eventName - 事件名稱
     * @param {Function} callback - 回調函數
     */
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;

        this.listeners[eventName] = this.listeners[eventName].filter(
            cb => cb !== callback
        );

        console.log(`[EventBridge] 移除監聽器: ${eventName}`);
    }

    /**
     * 觸發 React 端的監聽器
     * @param {string} eventName - 事件名稱
     * @param {Object} data - 事件資料
     */
    trigger(eventName, data = {}) {
        this.log('IN', eventName, data);

        if (!this.listeners[eventName]) {
            console.warn(`[EventBridge] 無監聽器: ${eventName}`);
            return;
        }

        this.listeners[eventName].forEach(callback => {
            callback(data);
        });

        console.log(`[EventBridge] 觸發監聽器: ${eventName}`, data);
    }

    /**
     * 清除所有監聽器
     */
    clear() {
        this.listeners = {};
        console.log('[EventBridge] 已清除所有監聽器');
    }

    /**
     * 記錄事件日誌
     * @param {string} direction - 方向 (IN/OUT)
     * @param {string} eventName - 事件名稱
     * @param {Object} data - 事件資料
     */
    log(direction, eventName, data) {
        const timestamp = new Date().toLocaleTimeString('zh-TW');
        const logEntry = {
            timestamp,
            direction,
            eventName,
            data
        };

        this.eventLog.push(logEntry);

        // 只保留最近 50 條
        if (this.eventLog.length > 50) {
            this.eventLog.shift();
        }
    }

    /**
     * 取得事件日誌
     * @returns {Array}
     */
    getEventLog() {
        return this.eventLog;
    }

    /**
     * 清除事件日誌
     */
    clearLog() {
        this.eventLog = [];
    }
}

// 全域單例
const eventBridge = new EventBridge();

// React → Phaser 事件常數
const EVENTS = {
    // React → Phaser
    START_DRAW: 'START_DRAW',
    REVEAL_CARD: 'REVEAL_CARD',
    START_CELEBRATION: 'START_CELEBRATION',
    STOP_SCENE: 'STOP_SCENE',

    // Phaser → React
    DRAW_COMPLETE: 'DRAW_COMPLETE',
    CARD_REVEALED: 'CARD_REVEALED',
    CELEBRATION_DONE: 'CELEBRATION_DONE',
    SCENE_READY: 'SCENE_READY'
};
