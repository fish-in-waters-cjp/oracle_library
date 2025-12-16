import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/button';

describe('Button 元件', () => {
  test('渲染基本按鈕', () => {
    render(<Button>點擊我</Button>);
    expect(screen.getByRole('button', { name: '點擊我' })).toBeInTheDocument();
  });

  test('primary variant 樣式（Style 10）', () => {
    render(<Button variant="primary">主要按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 透明背景 + 金色邊框（使用 inline styles）
    expect(button).toHaveStyle({ background: 'transparent' });
    expect(button).toHaveStyle({ border: '1px solid var(--color-primary)' });
    expect(button).toHaveStyle({ color: 'var(--color-primary)' });
  });

  test('secondary variant 樣式（Style 10）', () => {
    render(<Button variant="secondary">次要按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 透明背景 + 銀色邊框（使用 inline styles）
    expect(button).toHaveStyle({ background: 'transparent' });
    expect(button).toHaveStyle({ border: '1px solid var(--color-secondary)' });
    expect(button).toHaveStyle({ color: 'var(--color-secondary)' });
  });

  test('ghost variant 樣式（Style 10）', () => {
    render(<Button variant="ghost">幽靈按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 透明背景 + 預設邊框（使用 inline styles）
    expect(button).toHaveStyle({ background: 'transparent' });
    expect(button).toHaveStyle({ border: '1px solid var(--color-border-default)' });
    expect(button).toHaveStyle({ color: 'var(--color-text-secondary)' });
  });

  test('link variant 樣式（Style 10）', () => {
    render(<Button variant="link">連結按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 無邊框 + 金色文字 + 底線（使用 inline styles）
    expect(button).toHaveStyle({ background: 'transparent' });
    expect(button).toHaveStyle({ border: 'none' });
    expect(button).toHaveStyle({ textDecoration: 'underline' });
    expect(button).toHaveStyle({ color: 'var(--color-primary)' });
  });

  test('small size 樣式（Style 10）', () => {
    render(<Button size="sm">小按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 使用 CSS variables（inline styles）
    expect(button).toHaveStyle({ fontSize: 'var(--text-sm)' });
    expect(button).toHaveStyle({ padding: 'var(--space-2) var(--space-5)' });
    expect(button).toHaveStyle({ borderRadius: 'var(--radius-sm)' });
  });

  test('large size 樣式（Style 10）', () => {
    render(<Button size="lg">大按鈕</Button>);
    const button = screen.getByRole('button');
    // Style 10: 使用 CSS variables（inline styles）
    expect(button).toHaveStyle({ fontSize: 'var(--text-lg)' });
    expect(button).toHaveStyle({ padding: 'var(--space-5) var(--space-10)' });
    expect(button).toHaveStyle({ borderRadius: 'var(--radius-sm)' });
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

  test('loading 狀態顯示轉圈並禁用（Style 10）', () => {
    render(<Button loading>載入中</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
    // Style 10: 40% 透明度（inline style）
    expect(button).toHaveStyle({ opacity: 0.4 });
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
