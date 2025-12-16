import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EventBridge, EVENTS } from '@/components/phaser/EventBridge';

describe('EventBridge', () => {
  let bridge: EventBridge;

  beforeEach(() => {
    bridge = EventBridge.getInstance();
    bridge.clear();
  });

  describe('單例模式', () => {
    test('getInstance 返回同一個實例', () => {
      const instance1 = EventBridge.getInstance();
      const instance2 = EventBridge.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('React → Phaser 事件流', () => {
    test('emit 在未設定 game 時不報錯', () => {
      expect(() => {
        bridge.emit(EVENTS.START_DRAW, { question: 'test' });
      }).not.toThrow();
    });

    test('emit 發送事件到 Phaser game', () => {
      const mockScene = {
        scene: { isActive: () => true },
        events: { emit: vi.fn() }
      };
      const mockGame = {
        scene: { scenes: [mockScene] }
      };

      bridge.setGame(mockGame as unknown as Parameters<typeof bridge.setGame>[0]);
      bridge.emit(EVENTS.START_DRAW, { question: 'test' });

      expect(mockScene.events.emit).toHaveBeenCalledWith(
        EVENTS.START_DRAW,
        { question: 'test' }
      );
    });

    test('emit 不發送到非活躍場景', () => {
      const mockActiveScene = {
        scene: { isActive: () => true },
        events: { emit: vi.fn() }
      };
      const mockInactiveScene = {
        scene: { isActive: () => false },
        events: { emit: vi.fn() }
      };
      const mockGame = {
        scene: { scenes: [mockActiveScene, mockInactiveScene] }
      };

      bridge.setGame(mockGame as unknown as Parameters<typeof bridge.setGame>[0]);
      bridge.emit(EVENTS.START_DRAW, {});

      expect(mockActiveScene.events.emit).toHaveBeenCalled();
      expect(mockInactiveScene.events.emit).not.toHaveBeenCalled();
    });
  });

  describe('Phaser → React 事件流', () => {
    test('on 註冊監聽器', () => {
      const callback = vi.fn();
      bridge.on(EVENTS.DRAW_COMPLETE, callback);

      bridge.trigger(EVENTS.DRAW_COMPLETE, { result: 'success' });

      expect(callback).toHaveBeenCalledWith({ result: 'success' });
    });

    test('off 移除監聽器', () => {
      const callback = vi.fn();
      bridge.on(EVENTS.DRAW_COMPLETE, callback);
      bridge.off(EVENTS.DRAW_COMPLETE, callback);

      bridge.trigger(EVENTS.DRAW_COMPLETE, {});

      expect(callback).not.toHaveBeenCalled();
    });

    test('trigger 觸發多個監聽器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      bridge.on(EVENTS.DRAW_COMPLETE, callback1);
      bridge.on(EVENTS.DRAW_COMPLETE, callback2);

      bridge.trigger(EVENTS.DRAW_COMPLETE, { result: 'success' });

      expect(callback1).toHaveBeenCalledWith({ result: 'success' });
      expect(callback2).toHaveBeenCalledWith({ result: 'success' });
    });

    test('trigger 在無監聽器時不報錯', () => {
      expect(() => {
        bridge.trigger(EVENTS.DRAW_COMPLETE, {});
      }).not.toThrow();
    });
  });

  describe('記憶體管理', () => {
    test('clear 清空所有監聽器', () => {
      const callback = vi.fn();
      bridge.on(EVENTS.DRAW_COMPLETE, callback);
      bridge.clear();

      bridge.trigger(EVENTS.DRAW_COMPLETE, {});

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('事件日誌', () => {
    test('記錄 emit 事件', () => {
      bridge.emit(EVENTS.START_DRAW, { question: 'test' });
      const log = bridge.getEventLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log[log.length - 1]).toMatchObject({
        direction: 'OUT',
        eventName: EVENTS.START_DRAW,
        data: { question: 'test' }
      });
    });

    test('記錄 trigger 事件', () => {
      bridge.trigger(EVENTS.DRAW_COMPLETE, { result: 'success' });
      const log = bridge.getEventLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log[log.length - 1]).toMatchObject({
        direction: 'IN',
        eventName: EVENTS.DRAW_COMPLETE,
        data: { result: 'success' }
      });
    });

    test('clearLog 清除事件日誌', () => {
      bridge.emit(EVENTS.START_DRAW, {});
      bridge.clearLog();

      expect(bridge.getEventLog()).toHaveLength(0);
    });

    test('事件日誌最多保留 50 條', () => {
      for (let i = 0; i < 60; i++) {
        bridge.emit(EVENTS.START_DRAW, { index: i });
      }

      const log = bridge.getEventLog();
      expect(log.length).toBeLessThanOrEqual(50);
    });
  });

  describe('EVENTS 常數', () => {
    test('定義所有必要的事件', () => {
      expect(EVENTS).toHaveProperty('START_DRAW');
      expect(EVENTS).toHaveProperty('REVEAL_CARD');
      expect(EVENTS).toHaveProperty('START_CELEBRATION');
      expect(EVENTS).toHaveProperty('STOP_SCENE');
      expect(EVENTS).toHaveProperty('DRAW_COMPLETE');
      expect(EVENTS).toHaveProperty('CARD_REVEALED');
      expect(EVENTS).toHaveProperty('CELEBRATION_DONE');
      expect(EVENTS).toHaveProperty('SCENE_READY');
    });
  });
});
