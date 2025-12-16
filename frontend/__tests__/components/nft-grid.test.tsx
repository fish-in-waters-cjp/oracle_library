import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NFTGrid from '@/components/nft-grid';

const mockNFTs = [
  {
    id: '1',
    rarity: 'legendary' as const,
    question: '我該如何面對生活的挑戰？',
    answerEn: 'The unexamined life is not worth living.',
    answerZh: '未經審視的人生不值得活。',
    mintedAt: '2025-12-16T14:30:45Z',
  },
  {
    id: '2',
    rarity: 'epic' as const,
    question: '什麼是真正的智慧？',
    answerEn: 'Know thyself.',
    answerZh: '認識你自己。',
    mintedAt: '2025-12-15T10:20:30Z',
  },
  {
    id: '3',
    rarity: 'rare' as const,
    question: '如何找到人生的意義？',
    answerEn: 'The journey is the destination.',
    answerZh: '旅程即目的地。',
    mintedAt: '2025-12-14T08:15:00Z',
  },
];

describe('NFTGrid', () => {
  test('渲染 NFT 列表', () => {
    render(<NFTGrid nfts={mockNFTs} />);

    // 驗證所有 NFT 都被渲染
    expect(screen.getByText('我該如何面對生活的挑戰？')).toBeInTheDocument();
    expect(screen.getByText('什麼是真正的智慧？')).toBeInTheDocument();
    expect(screen.getByText('如何找到人生的意義？')).toBeInTheDocument();
  });

  test('空列表顯示空狀態訊息', () => {
    render(<NFTGrid nfts={[]} />);

    expect(screen.getByText(/尚無收藏/i)).toBeInTheDocument();
  });

  test('使用網格佈局', () => {
    const { container } = render(<NFTGrid nfts={mockNFTs} />);

    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    const { container } = render(
      <NFTGrid nfts={mockNFTs} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('點擊 NFT 卡片時觸發 onNFTClick', () => {
    const handleClick = vi.fn();
    render(<NFTGrid nfts={mockNFTs} onNFTClick={handleClick} />);

    const firstCard = screen.getByText('我該如何面對生活的挑戰？').closest('[role="button"]');
    firstCard?.click();

    expect(handleClick).toHaveBeenCalledWith(mockNFTs[0]);
  });

  test('響應式網格佈局 (inline style)', () => {
    const { container } = render(<NFTGrid nfts={mockNFTs} />);

    const grid = container.querySelector('[class*="grid"]');
    const style = grid?.getAttribute('style') || '';

    // 驗證使用 auto-fill 響應式佈局
    expect(style).toContain('grid-template-columns');
    expect(style).toContain('auto-fill');
    expect(style).toContain('minmax(280px, 1fr)');
  });

  test('載入狀態顯示骨架屏', () => {
    render(<NFTGrid nfts={[]} isLoading />);

    // 驗證骨架屏元素存在
    const skeletons = screen.getAllByTestId('nft-skeleton');
    expect(skeletons).toHaveLength(8); // 預設顯示 8 個骨架屏
  });

  test('顯示正確數量的 NFT', () => {
    render(<NFTGrid nfts={mockNFTs} />);

    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);
  });
});
