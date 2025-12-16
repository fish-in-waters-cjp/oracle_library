'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface CountUpProps {
  /** 起始數值 */
  start?: number;
  /** 結束數值 */
  end: number;
  /** 動畫持續時間（秒） */
  duration?: number;
  /** 延遲時間（秒） */
  delay?: number;
  /** 小數位數 */
  decimals?: number;
  /** 千分位分隔符 */
  separator?: string;
  /** 前綴符號 */
  prefix?: string;
  /** 後綴符號 */
  suffix?: string;
  /** 自訂 className */
  className?: string;
  /** 緩動函數 */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

/**
 * CountUp 動畫元件
 *
 * 數字從起始值平滑計數到目標值的動畫效果。
 * 適用於餘額顯示、統計數據、計數器等場景。
 *
 * @example
 * ```tsx
 * // 基本計數
 * <CountUp end={100} />
 *
 * // 貨幣格式
 * <CountUp end={1234.56} decimals={2} prefix="$" separator="," />
 * // 顯示: $1,234.56
 *
 * // 百分比
 * <CountUp end={85} suffix="%" />
 * // 顯示: 85%
 *
 * // 自訂動畫
 * <CountUp start={0} end={1000} duration={2} delay={0.5} />
 * ```
 */
export default function CountUp({
  start = 0,
  end,
  duration = 2,
  delay = 0,
  decimals = 0,
  separator = '',
  prefix = '',
  suffix = '',
  className,
  easing = 'easeOut',
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const startAnimation = () => {
      startTimeRef.current = undefined;

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const elapsed = (currentTime - startTimeRef.current) / 1000; // 轉換為秒
        const progress = Math.min(elapsed / duration, 1);

        // 緩動函數
        let easedProgress = progress;
        switch (easing) {
          case 'easeOut':
            easedProgress = 1 - Math.pow(1 - progress, 3);
            break;
          case 'easeInOut':
            easedProgress =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            break;
          case 'linear':
          default:
            easedProgress = progress;
        }

        const currentCount = start + (end - start) * easedProgress;
        setCount(currentCount);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    };

    // 延遲啟動
    const timeoutId = setTimeout(startAnimation, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, delay, easing]);

  // 格式化數字
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [integer, decimal] = fixed.split('.');

    // 加入千分位分隔符
    let formattedInteger = integer;
    if (separator) {
      formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }

    const formattedNumber = decimal
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;

    return `${prefix}${formattedNumber}${suffix}`;
  };

  return (
    <span className={cn('tabular-nums', className)}>
      {formatNumber(count)}
    </span>
  );
}
