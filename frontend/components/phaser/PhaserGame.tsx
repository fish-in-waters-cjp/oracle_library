'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBridge } from './EventBridge';

// Phaser 類型（用於類型標註，不會觸發 SSR 問題）
type PhaserType = typeof import('phaser');
let Phaser: PhaserType | null = null;

/**
 * 稀有度顏色映射（來自 Prototype）
 */
export const RARITY_COLORS = {
  Common: 0x9ca3af, // 灰色
  Rare: 0x60a5fa, // 藍色
  Epic: 0xa78bfa, // 紫色
  Legendary: 0xd4af37, // 金色
} as const;

/**
 * 稀有度名稱（中文）
 */
export const RARITY_NAMES = {
  Common: '普通',
  Rare: '稀有',
  Epic: '史詩',
  Legendary: '傳說',
} as const;

/**
 * 取得稀有度顏色
 */
export function getRarityColor(rarity: keyof typeof RARITY_COLORS): number {
  return RARITY_COLORS[rarity] || RARITY_COLORS.Common;
}

/**
 * 取得稀有度名稱
 */
export function getRarityName(rarity: keyof typeof RARITY_NAMES): string {
  return RARITY_NAMES[rarity] || '未知';
}

/**
 * 粒子配置生成器（來自 Prototype）
 * 注意：BlendMode 使用數值 1 (ADD) 來避免 SSR 問題
 */
export const ParticleConfig = {
  /**
   * 能量聚集粒子
   */
  energyGather(color: number) {
    return {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 50,
      tint: color,
      blendMode: 1, // Phaser.BlendModes.ADD
    };
  },

  /**
   * 持續光環粒子
   */
  auraGlow(color: number) {
    return {
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      frequency: 100,
      tint: color,
      blendMode: 1, // Phaser.BlendModes.ADD
    };
  },

  /**
   * 煙火粒子
   */
  firework(color: number) {
    return {
      speed: { min: 200, max: 400 },
      angle: { min: -90, max: 90 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 200,
      tint: color,
      blendMode: 1, // Phaser.BlendModes.ADD
      gravityY: 200,
    };
  },

  /**
   * 金幣飛散粒子
   */
  coinBurst() {
    return {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0.2 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      frequency: 100,
      tint: 0xd4af37,
      blendMode: 1, // Phaser.BlendModes.ADD
      gravityY: 400,
      rotate: { min: 0, max: 360 },
    };
  },
};

/**
 * 預設遊戲配置
 * 注意：需要傳入 Phaser 實例，因為使用動態載入
 */
export function createGameConfig(
  PhaserLib: PhaserType,
  parent: HTMLElement,
  customConfig?: Partial<import('phaser').Types.Core.GameConfig>
): import('phaser').Types.Core.GameConfig {
  return {
    type: PhaserLib.AUTO,
    parent,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    transparent: false,
    scale: {
      mode: PhaserLib.Scale.FIT,
      autoCenter: PhaserLib.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [], // 場景將動態加入
    ...customConfig,
  };
}

/**
 * PhaserGame 元件 Props
 */
interface PhaserGameProps {
  /** 遊戲準備完成回調 */
  onGameReady?: (game: import('phaser').Game) => void;
  /** 自訂遊戲配置 */
  config?: Partial<import('phaser').Types.Core.GameConfig>;
  /** 容器類別名稱 */
  className?: string;
}

/**
 * PhaserGame 元件
 * 管理 Phaser.Game 實例的生命週期，整合 EventBridge
 * 使用動態載入來避免 SSR 問題
 */
export default function PhaserGame({
  onGameReady,
  config: customConfig,
  className = '',
}: PhaserGameProps) {
  const gameRef = useRef<import('phaser').Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 確保容器元素已就緒
    if (!containerRef.current) return;

    // 防止重複創建
    if (gameRef.current) return;

    // 動態載入 Phaser
    const initPhaser = async () => {
      try {
        // 動態 import Phaser
        const PhaserLib = await import('phaser');
        Phaser = PhaserLib;

        if (!containerRef.current) return;

        // 建立遊戲配置
        const config = createGameConfig(PhaserLib, containerRef.current, customConfig);

        // 創建 Phaser 遊戲實例
        gameRef.current = new PhaserLib.Game(config);

        // 設定 EventBridge
        const bridge = EventBridge.getInstance();
        bridge.setGame(gameRef.current as unknown as Parameters<typeof bridge.setGame>[0]);

        if (process.env.NODE_ENV === 'development') {
          console.log('[PhaserGame] Phaser 動態載入完成，遊戲實例已創建');
        }

        setIsLoading(false);

        // 觸發回調
        if (onGameReady) {
          onGameReady(gameRef.current);
        }
      } catch (err) {
        console.error('[PhaserGame] Phaser 載入失敗:', err);
        setError('遊戲引擎載入失敗');
        setIsLoading(false);
      }
    };

    initPhaser();

    // Cleanup：銷毀遊戲實例
    return () => {
      if (gameRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PhaserGame] 銷毀遊戲實例');
        }
        gameRef.current.destroy(true); // removeCanvas = true
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依賴，只執行一次

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-error)',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <>
      {/* CSS to center and round the Phaser canvas */}
      <style>{`
        [data-phaser-container] {
          position: relative;
        }
        [data-phaser-container] canvas {
          display: block !important;
          border-radius: var(--radius-lg);
          margin: 0 auto !important;
        }
      `}</style>
      <div
        ref={containerRef}
        data-phaser-container
        className={className}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--color-text-muted)',
          }}>
            載入遊戲引擎中...
          </div>
        )}
      </div>
    </>
  );
}
