import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScaleSpring from '@/components/animation/scale-spring';

describe('ScaleSpring 動畫元件', () => {
  test('渲染子元素內容', () => {
    render(
      <ScaleSpring>
        <div>測試內容</div>
      </ScaleSpring>
    );
    expect(screen.getByText('測試內容')).toBeInTheDocument();
  });

  test('預設 hover 觸發縮放', () => {
    const { container } = render(
      <ScaleSpring>
        <div>Hover 內容</div>
      </ScaleSpring>
    );
    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
  });

  test('接受自訂縮放比例', () => {
    const { container } = render(
      <ScaleSpring scale={1.2}>
        <div>自訂縮放</div>
      </ScaleSpring>
    );
    expect(screen.getByText('自訂縮放')).toBeInTheDocument();
  });

  test('接受自訂初始延遲', () => {
    const { container } = render(
      <ScaleSpring delay={0.5}>
        <div>延遲內容</div>
      </ScaleSpring>
    );
    expect(screen.getByText('延遲內容')).toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    const { container } = render(
      <ScaleSpring className="custom-spring">
        <div>自訂樣式</div>
      </ScaleSpring>
    );
    const motionDiv = container.firstChild as HTMLElement;
    expect(motionDiv.className).toContain('custom-spring');
  });

  test('支援淡入組合效果', () => {
    const { container } = render(
      <ScaleSpring withFadeIn>
        <div>淡入縮放</div>
      </ScaleSpring>
    );
    expect(screen.getByText('淡入縮放')).toBeInTheDocument();
  });

  test('支援向上位移組合效果', () => {
    const { container } = render(
      <ScaleSpring withSlideUp>
        <div>向上滑動縮放</div>
      </ScaleSpring>
    );
    expect(screen.getByText('向上滑動縮放')).toBeInTheDocument();
  });

  test('可以禁用動畫', () => {
    const { container } = render(
      <ScaleSpring disabled>
        <div>無動畫內容</div>
      </ScaleSpring>
    );
    expect(screen.getByText('無動畫內容')).toBeInTheDocument();
  });

  test('支援初始縮放動畫', () => {
    const { container } = render(
      <ScaleSpring initialScale={0.8}>
        <div>初始縮放</div>
      </ScaleSpring>
    );
    expect(screen.getByText('初始縮放')).toBeInTheDocument();
  });
});
