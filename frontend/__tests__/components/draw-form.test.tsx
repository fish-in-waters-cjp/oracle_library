import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DrawForm from '@/components/draw-form';

describe('DrawForm 元件', () => {
  test('顯示成本資訊', () => {
    render(<DrawForm onDraw={vi.fn()} />);

    expect(screen.getByText(/每次抽取消耗 10 MGC/i)).toBeInTheDocument();
  });

  test('顯示抽取按鈕', () => {
    render(<DrawForm onDraw={vi.fn()} />);

    const button = screen.getByRole('button', { name: /抽取解答/i });
    expect(button).toBeInTheDocument();
  });

  test('點擊按鈕時調用 onDraw', async () => {
    const user = userEvent.setup();
    const onDraw = vi.fn();

    render(<DrawForm onDraw={onDraw} />);

    const button = screen.getByRole('button', { name: /抽取解答/i });
    await user.click(button);

    expect(onDraw).toHaveBeenCalledTimes(1);
  });

  test('loading 狀態時顯示載入中', () => {
    render(<DrawForm onDraw={vi.fn()} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-loading');
  });

  test('disabled 時禁用按鈕', () => {
    render(<DrawForm onDraw={vi.fn()} disabled={true} />);

    const button = screen.getByRole('button', { name: /抽取解答/i });
    expect(button).toBeDisabled();
  });

  test('餘額不足時顯示提示', () => {
    render(<DrawForm onDraw={vi.fn()} balance={5} />);

    expect(screen.getByText(/餘額不足/i)).toBeInTheDocument();
  });

  test('餘額充足時不顯示提示', () => {
    render(<DrawForm onDraw={vi.fn()} balance={20} />);

    expect(screen.queryByText(/餘額不足/i)).not.toBeInTheDocument();
  });

  test('餘額充足時按鈕可點擊', () => {
    render(<DrawForm onDraw={vi.fn()} balance={20} />);

    const button = screen.getByRole('button', { name: /抽取解答/i });
    expect(button).not.toBeDisabled();
  });

  test('餘額不足時自動禁用按鈕', () => {
    render(<DrawForm onDraw={vi.fn()} balance={5} />);

    const button = screen.getByRole('button', { name: /抽取解答/i });
    expect(button).toBeDisabled();
  });
});
