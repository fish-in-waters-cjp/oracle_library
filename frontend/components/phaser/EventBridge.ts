/**
 * React ↔ Phaser 事件橋接
 * 處理雙向通訊，解耦 React 與 Phaser 框架
 */

// React → Phaser 和 Phaser → React 事件常數
export const EVENTS = {
  // React → Phaser
  START_DRAW: 'START_DRAW',
  REVEAL_CARD: 'REVEAL_CARD',
  START_CELEBRATION: 'START_CELEBRATION',
  STOP_SCENE: 'STOP_SCENE',

  // Phaser → React
  DRAW_COMPLETE: 'DRAW_COMPLETE',
  CARD_REVEALED: 'CARD_REVEALED',
  CELEBRATION_DONE: 'CELEBRATION_DONE',
  SCENE_READY: 'SCENE_READY',
} as const;

// 事件日誌項目型別
interface EventLogEntry {
  timestamp: string;
  direction: 'IN' | 'OUT';
  eventName: string;
  data: unknown;
}

// Phaser Game 介面（簡化型別定義）
interface PhaserGame {
  scene: {
    scenes: Array<{
      scene: { isActive: () => boolean };
      events: { emit: (eventName: string, data: unknown) => void };
    }>;
  };
}

/**
 * EventBridge 類別
 * 使用單例模式確保全域唯一實例
 */
export class EventBridge {
  private static instance: EventBridge;
  private listeners: Record<string, Array<(data: unknown) => void>>;
  private game: PhaserGame | null;
  private eventLog: EventLogEntry[];

  private constructor() {
    this.listeners = {};
    this.game = null;
    this.eventLog = [];
  }

  /**
   * 取得單例實例
   */
  static getInstance(): EventBridge {
    if (!EventBridge.instance) {
      EventBridge.instance = new EventBridge();
    }
    return EventBridge.instance;
  }

  /**
   * 設定 Phaser 遊戲實例
   * @param game - Phaser.Game 實例
   */
  setGame(game: PhaserGame): void {
    this.game = game;
    if (process.env.NODE_ENV === 'development') {
      console.log('[EventBridge] 遊戲實例已設定');
    }
  }

  /**
   * React → Phaser: 發送事件到 Phaser
   * @param eventName - 事件名稱
   * @param data - 事件資料
   */
  emit(eventName: string, data: unknown = {}): void {
    this.log('OUT', eventName, data);

    if (!this.game) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[EventBridge] 遊戲實例未設定，無法發送事件');
      }
      return;
    }

    // 發送到所有活躍場景
    this.game.scene.scenes.forEach((scene) => {
      if (scene.scene.isActive()) {
        scene.events.emit(eventName, data);
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBridge] 發送事件: ${eventName}`, data);
    }
  }

  /**
   * Phaser → React: 監聽來自 Phaser 的事件
   * @param eventName - 事件名稱
   * @param callback - 回調函數
   */
  on(eventName: string, callback: (data: unknown) => void): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(callback);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBridge] 註冊監聽器: ${eventName}`);
    }
  }

  /**
   * 移除事件監聽器
   * @param eventName - 事件名稱
   * @param callback - 回調函數
   */
  off(eventName: string, callback: (data: unknown) => void): void {
    if (!this.listeners[eventName]) return;

    this.listeners[eventName] = this.listeners[eventName].filter(
      (cb) => cb !== callback
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBridge] 移除監聽器: ${eventName}`);
    }
  }

  /**
   * 觸發 React 端的監聽器（由 Phaser 場景調用）
   * @param eventName - 事件名稱
   * @param data - 事件資料
   */
  trigger(eventName: string, data: unknown = {}): void {
    this.log('IN', eventName, data);

    if (!this.listeners[eventName] || this.listeners[eventName].length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[EventBridge] 無監聽器: ${eventName}`);
      }
      return;
    }

    this.listeners[eventName].forEach((callback) => {
      callback(data);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBridge] 觸發監聽器: ${eventName}`, data);
    }
  }

  /**
   * 清除所有監聽器
   */
  clear(): void {
    this.listeners = {};
    if (process.env.NODE_ENV === 'development') {
      console.log('[EventBridge] 已清除所有監聽器');
    }
  }

  /**
   * 記錄事件日誌
   * @param direction - 方向 (IN/OUT)
   * @param eventName - 事件名稱
   * @param data - 事件資料
   */
  private log(direction: 'IN' | 'OUT', eventName: string, data: unknown): void {
    const timestamp = new Date().toLocaleTimeString('zh-TW');
    const logEntry: EventLogEntry = {
      timestamp,
      direction,
      eventName,
      data,
    };

    this.eventLog.push(logEntry);

    // 只保留最近 50 條
    if (this.eventLog.length > 50) {
      this.eventLog.shift();
    }
  }

  /**
   * 取得事件日誌
   */
  getEventLog(): EventLogEntry[] {
    return this.eventLog;
  }

  /**
   * 清除事件日誌
   */
  clearLog(): void {
    this.eventLog = [];
  }
}
