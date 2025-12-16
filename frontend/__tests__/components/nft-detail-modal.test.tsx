import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NFTDetailModal from '@/components/nft-detail-modal';

const mockNFT = {
  id: '1',
  rarity: 'legendary' as const,
  question: '我該如何面對生活的挑戰？',
  answerEn: 'The unexamined life is not worth living.',
  answerZh: '未經審視的人生不值得活。',
  mintedAt: '2025-12-16T14:30:45Z',
};

describe('NFTDetailModal', () => {
  test('當 open 為 false 時不渲染', () => {
    render(<NFTDetailModal open={false} nft={mockNFT} onClose={vi.fn()} />);

    expect(screen.queryByText('NFT 詳情')).not.toBeInTheDocument();
  });

  test('當 open 為 true 時渲染模態框', () => {
    render(<NFTDetailModal open={true} nft={mockNFT} onClose={vi.fn()} />);

    expect(screen.getByText('NFT 詳情')).toBeInTheDocument();
  });

  test('顯示 NFT 資訊', () => {
    render(<NFTDetailModal open={true} nft={mockNFT} onClose={vi.fn()} />);

    expect(screen.getByText('我該如何面對生活的挑戰？')).toBeInTheDocument();
    expect(
      screen.getByText('The unexamined life is not worth living.')
    ).toBeInTheDocument();
    expect(screen.getByText('未經審視的人生不值得活。')).toBeInTheDocument();
  });

  test('顯示稀有度 Badge', () => {
    render(<NFTDetailModal open={true} nft={mockNFT} onClose={vi.fn()} />);

    expect(screen.getByText('傳說')).toBeInTheDocument();
  });

  test('顯示鑄造時間', () => {
    render(<NFTDetailModal open={true} nft={mockNFT} onClose={vi.fn()} />);

    // 驗證時間格式化顯示 (可能是 2025/12/16 或 2025-12-16 格式)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  test('點擊關閉按鈕時觸發 onClose', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<NFTDetailModal open={true} nft={mockNFT} onClose={handleClose} />);

    // 使用 aria-label 找到 header 中的 X 按鈕
    const closeButton = screen.getByLabelText('關閉');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('點擊背景覆蓋層時觸發 onClose', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<NFTDetailModal open={true} nft={mockNFT} onClose={handleClose} />);

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('點擊模態框內容時不觸發 onClose', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<NFTDetailModal open={true} nft={mockNFT} onClose={handleClose} />);

    const modalContent = screen.getByTestId('modal-content');
    await user.click(modalContent);

    expect(handleClose).not.toHaveBeenCalled();
  });

  test('按下 ESC 鍵時觸發 onClose', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<NFTDetailModal open={true} nft={mockNFT} onClose={handleClose} />);

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('顯示不同稀有度的 NFT', () => {
    const epicNFT = { ...mockNFT, rarity: 'epic' as const };

    render(<NFTDetailModal open={true} nft={epicNFT} onClose={vi.fn()} />);

    expect(screen.getByText('史詩')).toBeInTheDocument();
  });

  test('使用 FadeIn 動畫顯示', () => {
    const { container } = render(
      <NFTDetailModal open={true} nft={mockNFT} onClose={vi.fn()} />
    );

    // 驗證使用了 FadeIn 動畫 (檢查 Framer Motion 的 motion.div)
    const motionElement = container.querySelector('[style*="opacity"]');
    expect(motionElement).toBeInTheDocument();
  });

  test('當 nft 為 null 時不渲染內容', () => {
    render(<NFTDetailModal open={true} nft={null} onClose={vi.fn()} />);

    expect(screen.queryByText('我該如何面對生活的挑戰？')).not.toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    const { container } = render(
      <NFTDetailModal
        open={true}
        nft={mockNFT}
        onClose={vi.fn()}
        className="custom-modal"
      />
    );

    expect(container.querySelector('.custom-modal')).toBeInTheDocument();
  });
});
