import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWalletConnection } from '@/hooks/use-wallet-connection';

// Mock @iota/dapp-kit
vi.mock('@iota/dapp-kit', () => ({
  useCurrentAccount: vi.fn(),
  useCurrentWallet: vi.fn(),
  useDisconnectWallet: vi.fn(),
}));

import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
} from '@iota/dapp-kit';

describe('useWalletConnection', () => {
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDisconnectWallet).mockReturnValue({
      mutate: mockDisconnect,
      isPending: false,
    } as any);
  });

  it('應該在未連接錢包時返回預設狀態', () => {
    vi.mocked(useCurrentAccount).mockReturnValue(null);
    vi.mocked(useCurrentWallet).mockReturnValue(null);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.truncatedAddress).toBeNull();
    expect(result.current.walletIcon).toBeNull();
  });

  it('應該在連接錢包時返回正確的狀態', () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: mockAddress,
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue({
      icon: 'https://example.com/wallet-icon.png',
    } as any);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe(mockAddress);
    expect(result.current.truncatedAddress).toBe('0x1234...5678');
    expect(result.current.walletIcon).toBe(
      'https://example.com/wallet-icon.png'
    );
  });

  it('應該正確截斷地址（前6後4）', () => {
    const mockAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: mockAddress,
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue(null);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.truncatedAddress).toBe('0xabcd...abcd');
  });

  it('應該處理短地址（不需截斷）', () => {
    const shortAddress = '0x123456';
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: shortAddress,
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue(null);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.truncatedAddress).toBe(shortAddress);
  });

  it('應該提供 disconnect 功能', () => {
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue(null);

    const { result } = renderHook(() => useWalletConnection());

    result.current.disconnect();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('應該反映斷線中的狀態', () => {
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue(null);
    vi.mocked(useDisconnectWallet).mockReturnValue({
      mutate: mockDisconnect,
      isPending: true,
    } as any);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.isDisconnecting).toBe(true);
  });

  it('應該在沒有錢包圖示時返回 null', () => {
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue({
      icon: undefined,
    } as any);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.walletIcon).toBeNull();
  });

  it('應該在帳戶存在但沒有地址時返回未連接狀態', () => {
    vi.mocked(useCurrentAccount).mockReturnValue({
      address: undefined,
    } as any);
    vi.mocked(useCurrentWallet).mockReturnValue(null);

    const { result } = renderHook(() => useWalletConnection());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
  });
});
