'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount } from '@iota/dapp-kit';
import dynamic from 'next/dynamic';
import { DrawForm } from './draw-form';
import { DrawResultOverlay } from './draw-result-overlay';
import { EventBridge, EVENTS } from './phaser/EventBridge';
import { useOracleDraw, DrawResult } from '@/hooks/use-oracle-draw';
import { useMintNFT } from '@/hooks/use-mint-nft';
import { useMGCBalance } from '@/hooks/use-mgc-balance';
import { useMGCCoins } from '@/hooks/use-mgc-coins';
import { useAnswers } from '@/hooks/use-answers';

// 動態載入 PhaserGame 元件（避免 SSR 問題）
const PhaserGame = dynamic(() => import('./phaser/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-muted)',
    }}>
      載入遊戲引擎中...
    </div>
  ),
});

// Phaser Game 類型（避免 SSR 問題，不直接引用 phaser）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PhaserGameType = any;

/**
 * 抽取流程狀態
 */
type DrawPhase = 'idle' | 'drawing' | 'revealing' | 'result';

/**
 * DrawSection Props
 */
interface DrawSectionProps {
  /** MGC Coin Object ID（用於支付）*/
  mgcCoinId: string;
  /** 抽取開始回調（用於 Optimistic UI）*/
  onDrawStart?: () => void;
  /** 抽取成功回調 */
  onDrawSuccess?: (result: DrawResult) => void;
  /** 鑄造成功回調 */
  onMintSuccess?: () => void;
}

/**
 * DrawSection - 抽取解答區塊
 *
 * 整合 DrawForm、Phaser 動畫場景和抽取流程
 * 狀態流程：idle → drawing → revealing → result
 */
export function DrawSection({ mgcCoinId, onDrawStart, onDrawSuccess, onMintSuccess }: DrawSectionProps) {
  // 帳戶與餘額
  const currentAccount = useCurrentAccount();
  const { balance, displayBalance, refetch: refetchBalance } = useMGCBalance(
    currentAccount?.address ?? null
  );

  // 抽取 Hook
  const { draw, isDrawing, error, lastResult, reset } = useOracleDraw();

  // 鑄造 Hook
  const { mint, isMinting, error: mintError } = useMintNFT();

  // MGC Coins（用於鑄造支付）
  const { getCoinWithBalance } = useMGCCoins(currentAccount?.address ?? null);

  // 答案資料
  const { getAnswerById } = useAnswers();

  // 當前階段
  const [phase, setPhase] = useState<DrawPhase>('idle');

  // 最後抽取的結果資料
  const [resultData, setResultData] = useState<{
    answerId: number;
    rarity: string;
  } | null>(null);

  // Phaser 遊戲實例
  const gameRef = useRef<PhaserGameType | null>(null);
  const eventBridge = useRef<EventBridge>(EventBridge.getInstance());
  // 暫存抽取結果，用於 Phaser 場景啟動
  const pendingDrawResult = useRef<{ answerId: number; rarity: string } | null>(null);

  /**
   * 初始化 Phaser 場景
   */
  const handleGameReady = useCallback(async (game: PhaserGameType) => {
    gameRef.current = game;

    // 動態載入場景模組（避免 SSR 問題）
    const [
      { PreloadScene },
      { DrawScene },
      { CardRevealScene },
    ] = await Promise.all([
      import('./phaser/scenes/PreloadScene'),
      import('./phaser/scenes/DrawScene'),
      import('./phaser/scenes/CardRevealScene'),
    ]);

    // 動態添加場景
    game.scene.add('PreloadScene', PreloadScene, false);
    game.scene.add('DrawScene', DrawScene, false);
    game.scene.add('CardRevealScene', CardRevealScene, false);

    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawSection] Phaser 場景已註冊');
    }

    // 如果有待啟動的抽取結果，立即啟動場景
    if (pendingDrawResult.current) {
      const { answerId, rarity } = pendingDrawResult.current;
      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] 啟動 Phaser 場景', { answerId, rarity });
      }
      game.scene.start('PreloadScene', { answerId, rarity });
      pendingDrawResult.current = null;
    }
  }, []);

  /**
   * 監聽 Phaser 事件
   */
  useEffect(() => {
    const bridge = eventBridge.current;

    // DrawScene 完成 → 開始揭示
    const handleDrawComplete = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] DrawScene 完成，開始揭示');
      }
      setPhase('revealing');
      // CardRevealScene 會自動啟動（由 DrawScene 觸發）
    };

    // CardRevealScene 完成 → 顯示結果
    const handleCardRevealed = (data: unknown) => {
      const { answerId, rarity } = data as { answerId: number; rarity: string };

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] 卡牌揭示完成', { answerId, rarity });
      }

      setPhase('result');
      setResultData({ answerId, rarity });

      // 停止 Phaser 場景
      bridge.emit(EVENTS.STOP_SCENE);

      // 觸發成功回調
      if (onDrawSuccess && lastResult) {
        onDrawSuccess(lastResult);
      }

      // 重新查詢餘額
      refetchBalance();
    };

    // 註冊事件監聽器
    bridge.on(EVENTS.DRAW_COMPLETE, handleDrawComplete);
    bridge.on(EVENTS.CARD_REVEALED, handleCardRevealed);

    // Cleanup
    return () => {
      bridge.off(EVENTS.DRAW_COMPLETE, handleDrawComplete);
      bridge.off(EVENTS.CARD_REVEALED, handleCardRevealed);
    };
  }, [lastResult, onDrawSuccess, refetchBalance]);

  /**
   * 處理抽取
   */
  const handleDraw = async (question: string) => {
    try {
      // 觸發開始回調（Optimistic UI）
      if (onDrawStart) {
        onDrawStart();
      }

      // 執行抽取交易
      const result = await draw(question, mgcCoinId);

      if (!result) {
        console.error('[DrawSection] 抽取失敗');
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] 抽取成功', result);
      }

      // 暫存結果，等 PhaserGame 準備好後啟動場景
      pendingDrawResult.current = {
        answerId: result.answerId,
        rarity: result.rarity,
      };

      // 切換到 drawing 階段（這會觸發 PhaserGame 渲染）
      setPhase('drawing');
    } catch (err) {
      console.error('[DrawSection] 抽取錯誤', err);
      setPhase('idle');
    }
  };

  /**
   * 重新抽取
   */
  const handleReset = () => {
    setPhase('idle');
    setResultData(null);
    reset();

    // 停止所有 Phaser 場景
    if (gameRef.current) {
      gameRef.current.scene.stop('PreloadScene');
      gameRef.current.scene.stop('DrawScene');
      gameRef.current.scene.stop('CardRevealScene');
    }
  };

  // 計算 MGC 餘額（轉換為顯示用的數字）
  const mgcBalance = Number(balance) / 1_000_000_000; // 假設 decimals = 9

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {/* 階段 1: 輸入問題 */}
        {phase === 'idle' && (
          <motion.div
            key="draw-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-background-surface)',
              border: '1px solid var(--color-border-default)',
              padding: 'var(--space-6)',
            }}
          >
            <DrawForm
              isDrawing={isDrawing}
              mgcBalance={mgcBalance}
              onDraw={handleDraw}
              error={error}
            />
          </motion.div>
        )}

        {/* 階段 2-3: 抽取動畫和卡牌揭示（全螢幕覆蓋，完全匹配 prototype） */}
        {(phase === 'drawing' || phase === 'revealing') && (
          <>
            {/* 全螢幕 Phaser 容器樣式（來自 prototype/css/pages.css） */}
            <style>{`
              .phaser-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.98);
                z-index: var(--z-modal);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fade-in 0.3s ease;
              }
              #phaser-game {
                width: 100%;
                max-width: 800px;
                height: 600px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              #phaser-game canvas {
                border-radius: var(--radius-lg);
                margin: 0 auto !important;
              }
              @media (max-width: 768px) {
                #phaser-game {
                  max-width: 100%;
                  height: 400px;
                }
              }
              @media (max-width: 480px) {
                #phaser-game {
                  height: 300px;
                }
              }
              @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
            <div className="phaser-container">
              {/* Phaser 遊戲容器（ID 匹配 prototype） */}
              <div id="phaser-game">
                <PhaserGame
                  onGameReady={handleGameReady}
                  config={{
                    backgroundColor: '#000000',
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* 階段 4: 顯示結果 */}
        {phase === 'result' && resultData && lastResult && (
          <motion.div
            key="draw-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const answer = getAnswerById(resultData.answerId);
              if (!answer) return null;

              // 取得稀有度數字 (0-3)
              const rarityMap: Record<string, number> = {
                Common: 0,
                Rare: 1,
                Epic: 2,
                Legendary: 3,
              };
              const rarityValue = rarityMap[resultData.rarity] ?? 0;

              // 取得可用的 MGC Coin（5 MGC）
              const MINT_COST = BigInt(5_000_000_000); // 5 MGC
              const mintCoinId = getCoinWithBalance(MINT_COST);

              // 計算 MGC 餘額（轉換為顯示用的數字）
              const mgcBalanceNumber = Number(balance) / 1_000_000_000; // 假設 decimals = 9

              return (
                <DrawResultOverlay
                  answer={answer}
                  rarity={resultData.rarity as any}
                  recordId={lastResult.recordId}
                  mgcBalance={mgcBalanceNumber}
                  onDrawAgain={handleReset}
                  onMintNFT={async () => {
                    if (!mintCoinId) {
                      alert('MGC 不足，無法鑄造 NFT');
                      return;
                    }

                    const result = await mint(
                      lastResult.recordId,
                      rarityValue,
                      mintCoinId
                    );

                    if (result) {
                      console.log('NFT 鑄造成功:', result.nftId);
                      // TODO: T075 整合慶祝動畫
                      // 重新查詢餘額
                      refetchBalance();
                      // 觸發鑄造成功回調（顯示 -5 MGC 動畫）
                      if (onMintSuccess) {
                        onMintSuccess();
                      }
                    } else {
                      console.error('NFT 鑄造失敗:', mintError);
                    }
                  }}
                  isMinting={isMinting}
                />
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
