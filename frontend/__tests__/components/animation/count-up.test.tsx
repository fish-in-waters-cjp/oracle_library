import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountUp from '@/components/animation/count-up';

describe('CountUp 動畫元件', () => {
  test('渲染起始數值', () => {
    render(<CountUp start={0} end={100} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('顯示起始值', () => {
    render(<CountUp start={50} end={100} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('支援小數位數格式化', () => {
    render(<CountUp start={99.99} end={99.99} decimals={2} />);
    expect(screen.getByText('99.99')).toBeInTheDocument();
  });

  test('支援千分位分隔符', () => {
    render(<CountUp start={1000} end={1000} separator="," />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  test('支援前綴符號', () => {
    render(<CountUp start={100} end={100} prefix="$" />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  test('支援後綴符號', () => {
    render(<CountUp start={50} end={50} suffix="%" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('組合格式化選項', () => {
    render(
      <CountUp
        start={1234.56}
        end={1234.56}
        decimals={2}
        separator=","
        prefix="$"
      />
    );
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  test('接受自訂 className', () => {
    render(<CountUp end={100} className="custom-count" />);
    const element = screen.getByText('0');
    expect(element).toHaveClass('custom-count');
    expect(element).toHaveClass('tabular-nums');
  });

  test('使用 tabular-nums 字體特性', () => {
    render(<CountUp end={100} />);
    const element = screen.getByText('0');
    expect(element).toHaveClass('tabular-nums');
  });
});
