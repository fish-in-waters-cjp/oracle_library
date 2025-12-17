'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount } from '@iota/dapp-kit';
import * as Phaser from 'phaser';
import { DrawForm } from './draw-form';
import { DrawResultOverlay } from './draw-result-overlay';
import PhaserGame from './phaser/PhaserGame';
import { EventBridge, EVENTS } from './phaser/EventBridge';
import { PreloadScene } from './phaser/scenes/PreloadScene';
import { DrawScene } from './phaser/scenes/DrawScene';
import { CardRevealScene } from './phaser/scenes/CardRevealScene';
import { useOracleDraw, DrawResult } from '@/hooks/use-oracle-draw';
import { useMintNFT } from '@/hooks/use-mint-nft';
import { useMGCBalance } from '@/hooks/use-mgc-balance';
import { useMGCCoins } from '@/hooks/use-mgc-coins';
import { useAnswers } from '@/hooks/use-answers';

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
  const gameRef = useRef<Phaser.Game | null>(null);
  const eventBridge = useRef<EventBridge>(EventBridge.getInstance());

  /**
   * 初始化 Phaser 場景
   */
  const handleGameReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;

    // 動態添加場景
    game.scene.add('PreloadScene', PreloadScene, false);
    game.scene.add('DrawScene', DrawScene, false);
    game.scene.add('CardRevealScene', CardRevealScene, false);

    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawSection] Phaser 場景已註冊');
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

      // 切換到 drawing 階段
      setPhase('drawing');

      // 啟動 Phaser 場景
      if (gameRef.current) {
        // 啟動 PreloadScene，它會自動加載資源並啟動 DrawScene
        // DrawScene 會自動開始抽取動畫
        gameRef.current.scene.start('PreloadScene', { answerId: result.answerId });
      }
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

        {/* 階段 2-3: 抽取動畫和卡牌揭示 */}
        {(phase === 'drawing' || phase === 'revealing') && (
          <motion.div
            key="phaser-animation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'relative' }}
          >
            {/* Phaser 遊戲容器 */}
            <div
              style={{
                position: 'relative',
                background: 'var(--color-background-surface)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <PhaserGame
                onGameReady={handleGameReady}
                config={{
                  backgroundColor: '#0f0f1e',
                }}
              />

              {/* 狀態提示 */}
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '9999px',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {phase === 'drawing' ? '🎴 抽取中...' : '✨ 揭示答案...'}
                </motion.div>
              </div>
            </div>
          </motion.div>
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
