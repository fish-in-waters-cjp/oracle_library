import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FadeIn from '@/components/animation/fade-in';

describe('FadeIn 動畫元件', () => {
  test('渲染子元素內容', () => {
    render(
      <FadeIn>
        <div>測試內容</div>
      </FadeIn>
    );
    expect(screen.getByText('測試內容')).toBeInTheDocument();
  });

  test('預設延遲為 0', () => {
    const { container } = render(
      <FadeIn>
        <div>內容</div>
      </FadeIn>
    );
    const motionDiv = container.firstChild;
    expect(motionDiv).toBeInTheDocument();
  });

  test('接受自訂延遲時間', () => {
    const { container } = render(
      <FadeIn delay={0.5}>
        <div>延遲內容</div>
      </FadeIn>
    );
    expect(screen.getByText('延遲內容')).toBeInTheDocument();
  });

  test('接受自訂持續時間', () => {
    const { container } = render(
      <FadeIn duration={1.5}>
        <div>慢速淡入</div>
      </FadeIn>
    );
    expect(screen.getByText('慢速淡入')).toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    const { container } = render(
      <FadeIn className="custom-fade">
        <div>自訂樣式</div>
      </FadeIn>
    );
    const motionDiv = container.firstChild as HTMLElement;
    expect(motionDiv.className).toContain('custom-fade');
  });

  test('支援 Y 軸位移淡入', () => {
    const { container } = render(
      <FadeIn direction="up" distance={20}>
        <div>向上淡入</div>
      </FadeIn>
    );
    expect(screen.getByText('向上淡入')).toBeInTheDocument();
  });

  test('支援 X 軸位移淡入', () => {
    const { container } = render(
      <FadeIn direction="left" distance={30}>
        <div>從左淡入</div>
      </FadeIn>
    );
    expect(screen.getByText('從左淡入')).toBeInTheDocument();
  });

  test('可以禁用動畫', () => {
    const { container } = render(
      <FadeIn disabled>
        <div>無動畫內容</div>
      </FadeIn>
    );
    expect(screen.getByText('無動畫內容')).toBeInTheDocument();
  });
});
