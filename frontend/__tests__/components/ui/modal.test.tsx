import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/components/ui/modal';

describe('Modal 元件', () => {
  test('open=true 時顯示 modal', () => {
    render(
      <Modal open onClose={() => {}}>
        <div>Modal 內容</div>
      </Modal>
    );
    expect(screen.getByText('Modal 內容')).toBeInTheDocument();
  });

  test('open=false 時不顯示 modal', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <div>Modal 內容</div>
      </Modal>
    );
    expect(screen.queryByText('Modal 內容')).not.toBeInTheDocument();
  });

  test('顯示 title', () => {
    render(
      <Modal open title="標題" onClose={() => {}}>
        <div>內容</div>
      </Modal>
    );
    expect(screen.getByText('標題')).toBeInTheDocument();
  });

  test('點擊關閉按鈕呼叫 onClose', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onClose={handleClose}>
        <div>內容</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /關閉/i });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('點擊 overlay 呼叫 onClose', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onClose={handleClose}>
        <div>內容</div>
      </Modal>
    );

    const overlay = screen.getByTestId('modal-overlay');
    await user.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('點擊內容不觸發 onClose', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open onClose={handleClose}>
        <div>內容</div>
      </Modal>
    );

    await user.click(screen.getByText('內容'));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
