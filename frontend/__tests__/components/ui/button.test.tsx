import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/button';

describe('Button 元件', () => {
  test('渲染基本按鈕', () => {
    render(<Button>點擊我</Button>);
    expect(screen.getByRole('button', { name: '點擊我' })).toBeInTheDocument();
  });

  test('primary variant 樣式', () => {
    render(<Button variant="primary">主要按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });

  test('secondary variant 樣式', () => {
    render(<Button variant="secondary">次要按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');
  });

  test('outline variant 樣式', () => {
    render(<Button variant="outline">輪廓按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-gray-300');
  });

  test('small size 樣式', () => {
    render(<Button size="sm">小按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm');
  });

  test('large size 樣式', () => {
    render(<Button size="lg">大按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg');
  });

  test('處理 onClick 事件', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>點擊</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled 狀態禁用點擊', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick} disabled>禁用按鈕</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('loading 狀態顯示轉圈並禁用', () => {
    render(<Button loading>載入中</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
    // 檢查是否有轉圈動畫元素
    expect(button.querySelector('[role="status"]')).toBeInTheDocument();
  });

  test('loading 狀態時不顯示文字', () => {
    render(<Button loading>提交</Button>);
    const button = screen.getByRole('button');

    // 文字應該被隱藏（opacity-0）
    const textSpan = button.querySelector('span.inline-flex');
    expect(textSpan).toHaveClass('opacity-0');
  });

  test('傳遞自訂 className', () => {
    render(<Button className="custom-class">按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('預設 type 為 button', () => {
    render(<Button>按鈕</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  test('可以設定 type 為 submit', () => {
    render(<Button type="submit">提交</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
