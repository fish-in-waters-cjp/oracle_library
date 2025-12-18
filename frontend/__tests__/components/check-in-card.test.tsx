import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckInCard } from '@/components/check-in-card';

// Mock hooks
vi.mock('@/hooks/use-check-in-state', () => ({
  useCheckInState: vi.fn(),
}));

vi.mock('@/hooks/use-check-in', () => ({
  useCheckIn: vi.fn(),
}));

vi.mock('@/hooks/use-wallet-connection', () => ({
  useWalletConnection: vi.fn(),
}));

import { useCheckInState } from '@/hooks/use-check-in-state';
import { useCheckIn } from '@/hooks/use-check-in';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

describe('CheckInCard', () => {
  const mockFirstCheckIn = vi.fn();
  const mockCheckIn = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // 預設 mock 錢包已連接
    vi.mocked(useWalletConnection).mockReturnValue({
      isConnected: true,
      address: '0x123',
      truncatedAddress: '0x123...456',
      walletIcon: null,
      disconnect: vi.fn(),
      isDisconnecting: false,
    });

    // 預設 mock 簽到功能
    vi.mocked(useCheckIn).mockReturnValue({
      firstCheckIn: mockFirstCheckIn,
      checkIn: mockCheckIn,
      isPending: false,
      error: null,
    });
  });

  describe('首次簽到場景', () => {
    beforeEach(() => {
      // Mock 使用者沒有簽到記錄
      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: false,
        recordObjectId: null,
        lastCheckInDay: null,
        totalCheckIns: 0,
        consecutiveDays: 0,
        canCheckIn: false,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });
    });

    it('應該顯示首次簽到按鈕', () => {
      render(<CheckInCard />);

      expect(screen.getByText(/開始簽到之旅/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /首次簽到/i })).toBeInTheDocument();
    });

    it('應該在點擊時調用 firstCheckIn', async () => {
      mockFirstCheckIn.mockResolvedValueOnce(undefined);

      render(<CheckInCard />);

      const button = screen.getByRole('button', { name: /首次簽到/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFirstCheckIn).toHaveBeenCalledTimes(1);
      });
    });

    it('應該在簽到中顯示載入狀態', () => {
      vi.mocked(useCheckIn).mockReturnValue({
        firstCheckIn: mockFirstCheckIn,
        checkIn: mockCheckIn,
        isPending: true,
        error: null,
      });

      render(<CheckInCard />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText(/簽到中/i)).toBeInTheDocument();
    });
  });

  describe('可以簽到場景', () => {
    beforeEach(() => {
      const yesterday = Math.floor(
        (Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000)
      ) - 1;

      // Mock 使用者昨天簽到，今天可以簽
      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: true,
        recordObjectId: '0xrecord123',
        lastCheckInDay: yesterday,
        totalCheckIns: 5,
        consecutiveDays: 5,
        canCheckIn: true,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });
    });

    it('應該顯示簽到按鈕和統計資訊', () => {
      render(<CheckInCard />);

      expect(screen.getByRole('button', { name: /簽到/i })).toBeInTheDocument();
      expect(screen.getByText(/累積簽到/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // total check-ins
      expect(screen.getByText(/連續/i)).toBeInTheDocument();
    });

    it('應該在點擊時調用 checkIn', async () => {
      mockCheckIn.mockResolvedValueOnce(undefined);

      render(<CheckInCard />);

      const button = screen.getByRole('button', { name: /簽到/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCheckIn).toHaveBeenCalledTimes(1);
        expect(mockCheckIn).toHaveBeenCalledWith('0xrecord123');
      });
    });

    it('應該顯示獎勵資訊', () => {
      render(<CheckInCard />);

      expect(screen.getByText(/\+20 MGC/i)).toBeInTheDocument();
    });
  });

  describe('已簽到場景', () => {
    beforeEach(() => {
      const today = Math.floor(
        (Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000)
      );
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);

      // Mock 使用者今天已簽到
      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: true,
        recordObjectId: '0xrecord123',
        lastCheckInDay: today,
        totalCheckIns: 10,
        consecutiveDays: 7,
        canCheckIn: false,
        nextCheckInTime: tomorrow,
        isLoading: false,
        refetch: mockRefetch,
      });
    });

    it('應該顯示已簽到狀態', () => {
      render(<CheckInCard />);

      expect(screen.getByText(/今日已簽到/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('應該顯示倒計時', () => {
      render(<CheckInCard />);

      // 應該顯示小時、分鐘或秒數的倒計時
      expect(screen.getByText(/小時|分鐘|秒/)).toBeInTheDocument();
    });

    it('應該禁用簽到按鈕', () => {
      render(<CheckInCard />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('載入狀態', () => {
    it('應該在載入時顯示骨架屏', () => {
      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: false,
        recordObjectId: null,
        lastCheckInDay: null,
        totalCheckIns: 0,
        consecutiveDays: 0,
        canCheckIn: false,
        nextCheckInTime: null,
        isLoading: true,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      // 檢查是否有載入指示器或骨架屏
      expect(screen.getByTestId('skeleton') || screen.getByText(/載入中/i)).toBeInTheDocument();
    });
  });

  describe('錯誤處理', () => {
    it('應該顯示簽到錯誤訊息', async () => {
      const error = new Error('Already checked in today');
      vi.mocked(useCheckIn).mockReturnValue({
        firstCheckIn: mockFirstCheckIn,
        checkIn: mockCheckIn,
        isPending: false,
        error: error,
      });

      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: true,
        recordObjectId: '0xrecord123',
        lastCheckInDay: 100,
        totalCheckIns: 5,
        consecutiveDays: 5,
        canCheckIn: true,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      // 錯誤訊息應該顯示
      expect(screen.getByText(/錯誤|失敗/i)).toBeInTheDocument();
    });

    it('應該處理網路錯誤', async () => {
      const error = new Error('Network error');
      mockFirstCheckIn.mockRejectedValueOnce(error);

      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: false,
        recordObjectId: null,
        lastCheckInDay: null,
        totalCheckIns: 0,
        consecutiveDays: 0,
        canCheckIn: false,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      const button = screen.getByRole('button', { name: /首次簽到/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFirstCheckIn).toHaveBeenCalled();
      });
    });
  });

  describe('未連接錢包', () => {
    it('應該在未連接錢包時顯示提示', () => {
      vi.mocked(useWalletConnection).mockReturnValue({
        isConnected: false,
        address: null,
        truncatedAddress: null,
        walletIcon: null,
        disconnect: vi.fn(),
        isDisconnecting: false,
      });

      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: false,
        recordObjectId: null,
        lastCheckInDay: null,
        totalCheckIns: 0,
        consecutiveDays: 0,
        canCheckIn: false,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      expect(screen.getByText(/連接錢包/i)).toBeInTheDocument();
    });
  });

  describe('可訪問性', () => {
    it('應該有適當的 aria-label', () => {
      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: true,
        recordObjectId: '0xrecord123',
        lastCheckInDay: 100,
        totalCheckIns: 5,
        consecutiveDays: 5,
        canCheckIn: true,
        nextCheckInTime: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('應該在禁用時有適當的狀態', () => {
      const today = Math.floor(
        (Date.now() + 8 * 3600 * 1000) / (24 * 3600 * 1000)
      );

      vi.mocked(useCheckInState).mockReturnValue({
        hasRecord: true,
        recordObjectId: '0xrecord123',
        lastCheckInDay: today,
        totalCheckIns: 10,
        consecutiveDays: 7,
        canCheckIn: false,
        nextCheckInTime: new Date(),
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<CheckInCard />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
