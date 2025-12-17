'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * FlyingNumber Props
 */
interface FlyingNumberProps {
  /** 數字（正數或負數）*/
  value: number;
  /** 顯示位置 X 座標 */
  x?: number;
  /** 顯示位置 Y 座標 */
  y?: number;
  /** 持續時間（毫秒）*/
  duration?: number;
  /** 完成回調 */
  onComplete?: () => void;
  /** 顏色（可選）*/
  color?: string;
}

/**
 * FlyingNumber - 飛行數字動畫
 *
 * 顯示一個從指定位置向上飛行並淡出的數字
 * 常用於顯示金幣增減、分數變化等
 */
export function FlyingNumber({
  value,
  x = 0,
  y = 0,
  duration = 1500,
  onComplete,
  color,
}: FlyingNumberProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  const isPositive = value > 0;
  const sign = isPositive ? '+' : '';
  const defaultColor = isPositive ? '#10b981' : '#ef4444'; // green-500 : red-500
  const finalColor = color || defaultColor;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: -80,
        scale: 1.2,
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeOut',
      }}
      className="fixed pointer-events-none z-50 font-bold text-2xl"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        color: finalColor,
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {sign}{value}
    </motion.div>
  );
}

/**
 * useFlyingNumbers Hook
 *
 * 管理多個飛行數字的顯示
 *
 * @example
 * ```tsx
 * const { showFlyingNumber, flyingNumbers } = useFlyingNumbers();
 *
 * const handleClick = (e) => {
 *   showFlyingNumber(-5, e.clientX, e.clientY);
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleClick}>-5 MGC</button>
 *     {flyingNumbers}
 *   </>
 * );
 * ```
 */
export function useFlyingNumbers() {
  const [numbers, setNumbers] = useState<Array<{
    id: number;
    value: number;
    x: number;
    y: number;
  }>>([]);

  const showFlyingNumber = (value: number, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setNumbers(prev => [...prev, { id, value, x, y }]);
  };

  const handleComplete = (id: number) => {
    setNumbers(prev => prev.filter(n => n.id !== id));
  };

  const flyingNumbers = (
    <>
      {numbers.map(({ id, value, x, y }) => (
        <FlyingNumber
          key={id}
          value={value}
          x={x}
          y={y}
          onComplete={() => handleComplete(id)}
        />
      ))}
    </>
  );

  return {
    showFlyingNumber,
    flyingNumbers,
  };
}
