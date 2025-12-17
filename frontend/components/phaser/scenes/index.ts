/**
 * Phaser 場景模組索引
 *
 * 提供所有遊戲場景的統一導出
 */

export { PreloadScene } from './PreloadScene';
export { DrawScene } from './DrawScene';
export { CardRevealScene } from './CardRevealScene';
export { CelebrationScene } from './CelebrationScene';

// 場景列表（用於遊戲初始化）
export const GAME_SCENES = [
  'PreloadScene',
  'DrawScene',
  'CardRevealScene',
  'CelebrationScene',
] as const;

export type GameSceneKey = (typeof GAME_SCENES)[number];
