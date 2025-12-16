'use client';

import dynamic from 'next/dynamic';
import type Phaser from 'phaser';

/**
 * PhaserGame 元件的 Props 型別
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
 * 載入中元件
 */
function LoadingGame() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: '100%',
        maxWidth: '800px',
        height: '600px',
        margin: '0 auto',
        backgroundColor: '#000000',
        borderRadius: '8px',
      }}
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          style={{
            width: '3rem',
            height: '3rem',
            color: '#60a5fa',
          }}
          role="status"
        >
          <span className="sr-only">載入中...</span>
        </div>
        <p
          className="mt-4 text-sm"
          style={{ color: '#9ca3af' }}
        >
          正在載入遊戲引擎...
        </p>
      </div>
    </div>
  );
}

/**
 * PhaserGame 動態載入
 *
 * 使用 Next.js dynamic import 實現懶載入：
 * 1. 減少首頁 bundle size (~1.5MB)
 * 2. 只在需要時載入 Phaser 3 引擎
 * 3. 禁用 SSR（Phaser 依賴瀏覽器 API）
 */
const PhaserGameDynamic = dynamic<PhaserGameProps>(
  () => import('./PhaserGame'),
  {
    ssr: false, // 禁用 SSR，Phaser 需要瀏覽器環境
    loading: LoadingGame, // 載入中狀態
  }
);

/**
 * PhaserContainer 元件
 *
 * 負責 PhaserGame 的懶載入封裝，提供：
 * - 動態載入（減少 bundle size）
 * - 載入狀態顯示
 * - Props 透傳
 *
 * @example
 * ```tsx
 * <PhaserContainer
 *   onGameReady={(game) => console.log('Game ready!')}
 *   config={{ width: 1024, height: 768 }}
 *   className="my-game"
 * />
 * ```
 */
export default function PhaserContainer({
  onGameReady,
  config,
  className,
}: PhaserGameProps) {
  return (
    <PhaserGameDynamic
      onGameReady={onGameReady}
      config={config}
      className={className}
    />
  );
}
