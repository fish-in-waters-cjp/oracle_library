import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConnectWallet } from '@/components/connect-wallet';

// Mock @iota/dapp-kit
vi.mock('@iota/dapp-kit', () => ({
  ConnectModal: vi.fn(({ trigger, open, onOpenChange }) => {
    return (
      <div data-testid="mock-connect-modal">
        {open && <div data-testid="modal-content">Modal Content</div>}
        <div onClick={() => trigger?.props?.onClick?.()}>
          {trigger}
        </div>
      </div>
    );
  }),
}));

// Mock useWalletConnection hook
vi.mock('@/hooks/use-wallet-connection', () => ({
  useWalletConnection: vi.fn(),
}));

import { useWalletConnection } from '@/hooks/use-wallet-connection';

describe('ConnectWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('未連接狀態', () => {
    beforeEach(() => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: false,
        address: null,
        truncatedAddress: null,
        walletIcon: null,
        disconnect: vi.fn(),
        isDisconnecting: false,
      });
    });

    it('應該顯示「連接錢包」按鈕', () => {
      render(<ConnectWallet />);

      expect(screen.getByRole('button')).toHaveTextContent('連接錢包');
    });

    it('應該在點擊時觸發連接模態框', async () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button', { name: /連接錢包/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('mock-connect-modal')).toBeInTheDocument();
      });
    });

    it('應該使用 primary variant 的按鈕樣式', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      // 檢查按鈕是否有 primary 相關的 class
      expect(button.className).toMatch(/primary|bg-blue|bg-indigo/i);
    });
  });

  describe('已連接狀態', () => {
    const mockDisconnect = vi.fn();

    beforeEach(() => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        truncatedAddress: '0x1234...5678',
        walletIcon: 'https://example.com/wallet-icon.png',
        disconnect: mockDisconnect,
        isDisconnecting: false,
      });
    });

    it('應該顯示截斷的錢包地址', () => {
      render(<ConnectWallet />);

      expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    });

    it('應該顯示錢包圖示', () => {
      render(<ConnectWallet />);

      const icon = screen.getByAltText('Wallet Icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', 'https://example.com/wallet-icon.png');
    });

    it('應該在沒有錢包圖示時不顯示圖片', () => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        truncatedAddress: '0x1234...5678',
        walletIcon: null,
        disconnect: mockDisconnect,
        isDisconnecting: false,
      });

      render(<ConnectWallet />);

      expect(screen.queryByAltText('Wallet Icon')).not.toBeInTheDocument();
    });

    it('應該提供斷開連接的按鈕', () => {
      render(<ConnectWallet />);

      const disconnectButton = screen.getByRole('button', { name: /斷開/i });
      expect(disconnectButton).toBeInTheDocument();
    });

    it('應該在點擊斷開按鈕時調用 disconnect', () => {
      render(<ConnectWallet />);

      const disconnectButton = screen.getByRole('button', { name: /斷開/i });
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('應該使用 secondary variant 的按鈕樣式', () => {
      render(<ConnectWallet />);

      const button = screen.getByText('0x1234...5678').closest('button');
      // 檢查按鈕是否有 secondary/outline 相關的 class
      expect(button?.className).toMatch(/secondary|outline|border/i);
    });
  });

  describe('斷線中狀態', () => {
    beforeEach(() => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        truncatedAddress: '0x1234...5678',
        walletIcon: null,
        disconnect: vi.fn(),
        isDisconnecting: true,
      });
    });

    it('應該顯示載入狀態', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveTextContent(/斷開中|loading/i);
    });

    it('應該禁用斷開按鈕', () => {
      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('可訪問性', () => {
    it('應該在未連接時有適當的 aria-label', () => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: false,
        address: null,
        truncatedAddress: null,
        walletIcon: null,
        disconnect: vi.fn(),
        isDisconnecting: false,
      });

      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName(/連接錢包/i);
    });

    it('應該在已連接時有適當的 aria-label', () => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        truncatedAddress: '0x1234...5678',
        walletIcon: null,
        disconnect: vi.fn(),
        isDisconnecting: false,
      });

      render(<ConnectWallet />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName(/錢包|0x1234...5678/i);
    });
  });
});
