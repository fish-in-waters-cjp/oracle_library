import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageTransition from '@/components/animated/page-transition';

describe('PageTransition 元件', () => {
  test('渲染子元素', () => {
    render(
      <PageTransition>
        <div>測試內容</div>
      </PageTransition>
    );

    expect(screen.getByText('測試內容')).toBeInTheDocument();
  });

  test('支援淡入淡出效果（預設）', () => {
    const { container } = render(
      <PageTransition>
        <div>淡入淡出</div>
      </PageTransition>
    );

    // 檢查是否有 motion.div 元件
    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
  });

  test('支援滑動效果', () => {
    const { container } = render(
      <PageTransition variant="slide">
        <div>滑動效果</div>
      </PageTransition>
    );

    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
    expect(screen.getByText('滑動效果')).toBeInTheDocument();
  });

  test('支援自訂 className', () => {
    const { container } = render(
      <PageTransition className="custom-class">
        <div>自訂樣式</div>
      </PageTransition>
    );

    const motionDiv = container.firstChild as HTMLElement;
    expect(motionDiv).toHaveClass('custom-class');
  });

  test('支援滑動方向（from-right）', () => {
    render(
      <PageTransition variant="slide" direction="from-right">
        <div>從右滑入</div>
      </PageTransition>
    );

    expect(screen.getByText('從右滑入')).toBeInTheDocument();
  });

  test('支援滑動方向（from-left）', () => {
    render(
      <PageTransition variant="slide" direction="from-left">
        <div>從左滑入</div>
      </PageTransition>
    );

    expect(screen.getByText('從左滑入')).toBeInTheDocument();
  });
});
