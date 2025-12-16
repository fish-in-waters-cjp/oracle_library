import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import PhaserGame from '@/components/phaser/PhaserGame';
import { EventBridge } from '@/components/phaser/EventBridge';

// Mock Phaser
vi.mock('phaser', () => ({
  default: {
    AUTO: 'AUTO',
    Scale: {
      FIT: 'FIT',
      CENTER_BOTH: 'CENTER_BOTH',
    },
    BlendModes: {
      ADD: 'ADD',
    },
    Game: vi.fn().mockImplementation(function (this: unknown) {
      return {
        destroy: vi.fn(),
        scene: {
          add: vi.fn(),
          start: vi.fn(),
        },
      };
    }),
  },
}));

describe('PhaserGame 元件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('渲染時創建容器元素', () => {
    const { container } = render(<PhaserGame />);
    const gameContainer = container.querySelector('[data-phaser-container]');
    expect(gameContainer).toBeInTheDocument();
  });

  test('創建 Phaser.Game 實例', async () => {
    const Phaser = await import('phaser');
    render(<PhaserGame />);
    expect(Phaser.default.Game).toHaveBeenCalled();
  });

  test('設定 EventBridge 的 game 實例', async () => {
    const bridge = EventBridge.getInstance();
    const setGameSpy = vi.spyOn(bridge, 'setGame');

    render(<PhaserGame />);

    expect(setGameSpy).toHaveBeenCalled();
  });

  test('onGameReady 回調被調用', async () => {
    const onGameReady = vi.fn();
    render(<PhaserGame onGameReady={onGameReady} />);

    // 等待 game 創建
    await vi.waitFor(() => {
      expect(onGameReady).toHaveBeenCalled();
    });
  });

  test('unmount 時銷毀遊戲實例', async () => {
    const Phaser = await import('phaser');
    const { unmount } = render(<PhaserGame />);

    const mockGame = vi.mocked(Phaser.default.Game).mock.results[0].value;

    unmount();

    expect(mockGame.destroy).toHaveBeenCalledWith(true);
  });

  test('傳遞自訂配置', async () => {
    const customConfig = {
      width: 1024,
      height: 768,
    };

    render(<PhaserGame config={customConfig} />);

    // 驗證配置被使用
    const Phaser = await import('phaser');
    const mockConstructor = vi.mocked(Phaser.default.Game);
    const callArgs = mockConstructor.mock.calls[0]?.[0];

    expect(callArgs?.width).toBe(1024);
    expect(callArgs?.height).toBe(768);
  });
});
