import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/badge';

describe('Badge 元件', () => {
  test('渲染基本 Badge', () => {
    render(<Badge>測試標籤</Badge>);
    expect(screen.getByText('測試標籤')).toBeInTheDocument();
  });

  test('legendary 變體樣式（Style 10）', () => {
    render(<Badge variant="legendary">Legendary</Badge>);
    const badge = screen.getByText('Legendary');

    // Style 10: 使用 CSS variables
    const style = badge.getAttribute('style');
    expect(style).toContain('border-color: var(--color-rarity-legendary)');
    expect(style).toContain('color: var(--color-rarity-legendary)');
  });

  test('epic 變體樣式（Style 10）', () => {
    render(<Badge variant="epic">Epic</Badge>);
    const badge = screen.getByText('Epic');

    // Style 10: 使用 CSS variables
    const style = badge.getAttribute('style');
    expect(style).toContain('border-color: var(--color-rarity-epic)');
    expect(style).toContain('color: var(--color-rarity-epic)');
  });

  test('rare 變體樣式（Style 10）', () => {
    render(<Badge variant="rare">Rare</Badge>);
    const badge = screen.getByText('Rare');

    // Style 10: 使用 CSS variables
    const style = badge.getAttribute('style');
    expect(style).toContain('border-color: var(--color-rarity-rare)');
    expect(style).toContain('color: var(--color-rarity-rare)');
  });

  test('common 變體樣式（Style 10）', () => {
    render(<Badge variant="common">Common</Badge>);
    const badge = screen.getByText('Common');

    // Style 10: 使用 CSS variables
    const style = badge.getAttribute('style');
    expect(style).toContain('border-color: var(--color-rarity-common)');
    expect(style).toContain('color: var(--color-rarity-common)');
  });

  test('預設變體為 common', () => {
    render(<Badge>預設標籤</Badge>);
    const badge = screen.getByText('預設標籤');

    const style = badge.getAttribute('style');
    expect(style).toContain('border-color: var(--color-rarity-common)');
  });

  test('支援自訂 className', () => {
    render(<Badge className="custom-class">自訂樣式</Badge>);
    const badge = screen.getByText('自訂樣式');

    expect(badge).toHaveClass('custom-class');
  });

  test('Style 10 基礎樣式', () => {
    render(<Badge>樣式測試</Badge>);
    const badge = screen.getByText('樣式測試');

    // Style 10: 小字號、細邊框、極簡圓角
    const style = badge.getAttribute('style');
    expect(style).toContain('display: inline-block');
    expect(style).toContain('padding: var(--space-2) var(--space-4)');
    expect(style).toContain('border-radius: var(--radius-sm)');
    expect(style).toContain('font-size: var(--text-xs)');
    expect(style).toContain('font-weight: var(--font-weight-normal)');
    expect(style).toContain('border-width: 1px');
    expect(style).toContain('border-style: solid');
  });
});
