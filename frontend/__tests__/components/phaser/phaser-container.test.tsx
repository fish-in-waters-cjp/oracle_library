import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import PhaserContainer from '@/components/phaser/PhaserContainer';

// Mock next/dynamic - 立即返回 mock 元件，不延遲
vi.mock('next/dynamic', () => ({
  default: (_importFn: () => Promise<unknown>) => {
    // 返回一個元件，而不是 Promise
    return ({ onGameReady, config, className }: {
      onGameReady?: (game: unknown) => void;
      config?: unknown;
      className?: string;
    }) => {
      // 模擬 onGameReady 調用
      if (onGameReady) {
        setTimeout(() => {
          onGameReady({ destroy: vi.fn() });
        }, 0);
      }

      return (
        <div
          data-testid="phaser-game-mock"
          className={className}
          data-config={config ? JSON.stringify(config) : undefined}
        >
          Mocked PhaserGame (via dynamic)
        </div>
      );
    };
  },
}));

describe('PhaserContainer 元件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('渲染並載入 PhaserGame', () => {
    const { container } = render(<PhaserContainer />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('傳遞 className 給 PhaserGame', () => {
    const { getByTestId } = render(<PhaserContainer className="custom-class" />);
    const phaserGame = getByTestId('phaser-game-mock');
    expect(phaserGame).toHaveClass('custom-class');
  });

  test('傳遞 onGameReady 回調給 PhaserGame', async () => {
    const onGameReady = vi.fn();
    render(<PhaserContainer onGameReady={onGameReady} />);

    // 等待 setTimeout 完成
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onGameReady).toHaveBeenCalled();
  });

  test('傳遞自訂配置給 PhaserGame', () => {
    const customConfig = { width: 1024, height: 768 };
    const { getByTestId } = render(<PhaserContainer config={customConfig} />);
    const phaserGame = getByTestId('phaser-game-mock');
    const configAttr = phaserGame.getAttribute('data-config');
    expect(configAttr).toBe(JSON.stringify(customConfig));
  });
});
