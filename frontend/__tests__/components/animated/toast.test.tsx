import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/animated/toast';
import { useEffect, useRef } from 'react';

// 測試用的元件，用來觸發 toast
function TestComponent({
  onMount,
}: {
  onMount?: (showToast: ReturnType<typeof useToast>['showToast']) => void;
}) {
  const { showToast } = useToast();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current && onMount) {
      mountedRef.current = true;
      onMount(showToast);
    }
  }, [onMount, showToast]);

  return <div data-testid="test-container" />;
}

describe('Toast 元件', () => {

  test('顯示 success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent onMount={(showToast) => showToast('成功訊息', 'success')} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('成功訊息')).toBeInTheDocument();
    });
  });

  test('顯示 error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent onMount={(showToast) => showToast('錯誤訊息', 'error')} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('錯誤訊息')).toBeInTheDocument();
    });
  });

  test('顯示 info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent onMount={(showToast) => showToast('資訊訊息', 'info')} />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('資訊訊息')).toBeInTheDocument();
    });
  });

  test('toast 自動消失', async () => {
    render(
      <ToastProvider>
        <TestComponent onMount={(showToast) => showToast('成功訊息', 'success')} />
      </ToastProvider>
    );

    // Toast 應該顯示
    await waitFor(() => {
      expect(screen.getByText('成功訊息')).toBeInTheDocument();
    });

    // 等待 3.5 秒後應該消失
    await waitFor(
      () => {
        expect(screen.queryByText('成功訊息')).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  test('支援堆疊顯示多個 toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent
          onMount={(showToast) => {
            showToast('成功訊息', 'success');
            showToast('錯誤訊息', 'error');
          }}
        />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('成功訊息')).toBeInTheDocument();
      expect(screen.getByText('錯誤訊息')).toBeInTheDocument();
    });
  });

  test('不同類型有對應的樣式', async () => {
    render(
      <ToastProvider>
        <TestComponent onMount={(showToast) => showToast('成功訊息', 'success')} />
      </ToastProvider>
    );

    await waitFor(() => {
      const toast = screen.getByText('成功訊息').parentElement;
      expect(toast).toHaveClass('bg-green-50');
    });
  });
});
