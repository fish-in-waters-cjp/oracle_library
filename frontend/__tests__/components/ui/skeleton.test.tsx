import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from '@/components/ui/skeleton';

describe('Skeleton 元件', () => {
  test('渲染基本 skeleton', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  test('circle 變體顯示圓形', () => {
    render(<Skeleton variant="circle" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  test('rectangle 變體顯示矩形', () => {
    render(<Skeleton variant="rectangle" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded');
  });

  test('包含動畫 class', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  test('支援自訂 className', () => {
    render(<Skeleton className="w-20 h-20" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-20', 'h-20');
  });
});
