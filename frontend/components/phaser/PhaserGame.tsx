'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBridge } from './EventBridge';

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
      blendMode: Phaser.BlendModes.ADD,
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
      blendMode: Phaser.BlendModes.ADD,
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
      blendMode: Phaser.BlendModes.ADD,
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
      blendMode: Phaser.BlendModes.ADD,
      gravityY: 400,
      rotate: { min: 0, max: 360 },
    };
  },
};

/**
 * 預設遊戲配置
 */
export function createGameConfig(
  parent: HTMLElement,
  customConfig?: Partial<Phaser.Types.Core.GameConfig>
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    transparent: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
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
  onGameReady?: (game: Phaser.Game) => void;
  /** 自訂遊戲配置 */
  config?: Partial<Phaser.Types.Core.GameConfig>;
  /** 容器類別名稱 */
  className?: string;
}

/**
 * PhaserGame 元件
 * 管理 Phaser.Game 實例的生命週期，整合 EventBridge
 */
export default function PhaserGame({
  onGameReady,
  config: customConfig,
  className = '',
}: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 確保容器元素已就緒
    if (!containerRef.current) return;

    // 防止重複創建
    if (gameRef.current) return;

    // 建立遊戲配置
    const config = createGameConfig(containerRef.current, customConfig);

    // 創建 Phaser 遊戲實例
    gameRef.current = new Phaser.Game(config);

    // 設定 EventBridge
    const bridge = EventBridge.getInstance();
    bridge.setGame(gameRef.current as unknown as Parameters<typeof bridge.setGame>[0]);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PhaserGame] 遊戲實例已創建');
    }

    // 觸發回調
    if (onGameReady) {
      onGameReady(gameRef.current);
    }

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
  }, []); // 空依賴，只執行一次（有意忽略 onGameReady 和 customConfig，避免重複創建遊戲實例）

  return (
    <div
      ref={containerRef}
      data-phaser-container
      className={className}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    />
  );
}
