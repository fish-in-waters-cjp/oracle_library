import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NFTCard from '@/components/nft-card';

const mockNFT = {
  id: '1',
  rarity: 'legendary' as const,
  question: '我該如何面對生活的挑戰？',
  answerZh: '未經審視的人生不值得活。',
  mintedAt: '2025-12-16T14:30:45Z',
};

describe('NFTCard', () => {
  test('渲染 NFT 資訊', () => {
    render(<NFTCard {...mockNFT} />);

    expect(screen.getByText('未經審視的人生不值得活。')).toBeInTheDocument();
    expect(screen.getByText('我該如何面對生活的挑戰？')).toBeInTheDocument();
    expect(screen.getByText('傳說')).toBeInTheDocument();
  });

  test('顯示格式化的日期', () => {
    render(<NFTCard {...mockNFT} />);

    // 驗證日期格式化 (2025/12/16 或 2025-12-16)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  test('點擊卡片時觸發 onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<NFTCard {...mockNFT} onClick={handleClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('按下 Enter 鍵時觸發 onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<NFTCard {...mockNFT} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('顯示不同稀有度的 Badge', () => {
    const { rerender } = render(<NFTCard {...mockNFT} rarity="epic" />);
    expect(screen.getByText('史詩')).toBeInTheDocument();

    rerender(<NFTCard {...mockNFT} rarity="rare" />);
    expect(screen.getByText('稀有')).toBeInTheDocument();

    rerender(<NFTCard {...mockNFT} rarity="common" />);
    expect(screen.getByText('普通')).toBeInTheDocument();
  });

  test('使用 ScaleSpring 動畫包裝', () => {
    const { container } = render(<NFTCard {...mockNFT} />);

    // 驗證有 cursor-pointer class (來自 ScaleSpring wrapper)
    const wrapper = container.querySelector('.cursor-pointer');
    expect(wrapper).toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    const { container } = render(
      <NFTCard {...mockNFT} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  test('顯示稀有度光暈效果', () => {
    const { container } = render(<NFTCard {...mockNFT} rarity="legendary" />);

    // 驗證有光暈效果的 div
    const glow = container.querySelector('[aria-hidden="true"]');
    expect(glow).toBeInTheDocument();
  });
});
