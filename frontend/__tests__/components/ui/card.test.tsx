import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '@/components/ui/card';

describe('Card 元件', () => {
  test('渲染基本 card', () => {
    render(<Card>內容</Card>);
    expect(screen.getByText('內容')).toBeInTheDocument();
  });

  test('顯示 title', () => {
    render(<Card title="卡片標題">內容</Card>);
    expect(screen.getByText('卡片標題')).toBeInTheDocument();
  });

  test('包含基礎樣式', () => {
    render(<Card>內容</Card>);
    const card = screen.getByText('內容').parentElement;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
  });

  test('支援自訂 className', () => {
    render(<Card className="custom-class">內容</Card>);
    const card = screen.getByText('內容').parentElement;
    expect(card).toHaveClass('custom-class');
  });
});
