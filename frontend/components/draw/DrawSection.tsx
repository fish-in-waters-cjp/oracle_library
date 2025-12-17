'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { EventBridge, EVENTS } from '@/components/phaser/EventBridge';
import { PreloadScene, DrawScene, CardRevealScene } from '@/components/phaser/scenes';
import { createGameConfig } from '@/components/phaser/PhaserGame';
import Button from '@/components/ui/button';
import { useOracleDraw, type DrawResult } from '@/hooks/use-oracle-draw';
import { useAnswers, type Answer } from '@/hooks/use-answers';
import { getRarityLabelFromAnswerId, type RarityLevel } from '@/lib/random';

/**
 * DrawSection Props
 */
export interface DrawSectionProps {
  /** 錢包地址 */
  walletAddress?: string;
  /** 簽名並執行交易函數 */
  signAndExecuteTransaction?: (params: { transaction: unknown }) => Promise<{
    digest: string;
    objectChanges?: Array<{
      type: string;
      objectType?: string;
      objectId?: string;
    }>;
  }>;
  /** MGC 餘額 */
  mgcBalance?: number;
  /** 選擇的 MGC Coin ID */
  mgcCoinId?: string;
  /** 抽取完成回調 */
  onDrawComplete?: (result: DrawResult, answer: Answer) => void;
  /** 自訂 className */
  className?: string;
}

const DRAW_COST = 10;

/**
 * DrawSection - 神諭抽取整合元件
 *
 * 整合：
 * - Phaser 遊戲場景（DrawScene, CardRevealScene）
 * - useOracleDraw Hook（區塊鏈交易）
 * - useAnswers Hook（答案資料）
 * - DrawForm（輸入問題和按鈕）
 *
 * 流程：
 * 1. 使用者輸入問題
 * 2. 點擊抽取 → 執行區塊鏈交易
 * 3. 交易成功 → 啟動 Phaser 動畫
 * 4. 動畫完成 → 顯示結果 Overlay
 */
export default function DrawSection({
  walletAddress,
  signAndExecuteTransaction,
  mgcBalance,
  mgcCoinId,
  onDrawComplete,
  className,
}: DrawSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const [question, setQuestion] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hooks
  const { getAnswerById, getWeightedRandomAnswerId, isLoading: answersLoading } = useAnswers();

  // Oracle draw hook - 只在有錢包連接時使用
  const oracleDrawConfig = walletAddress && signAndExecuteTransaction
    ? { walletAddress, signAndExecuteTransaction }
    : null;

  const {
    isDrawing,
    error: drawError,
    drawResult,
    draw,
    reset: resetDraw,
  } = useOracleDraw(
    oracleDrawConfig || { walletAddress: '', signAndExecuteTransaction: async () => ({ digest: '' }) }
  );

  // 初始化 Phaser 遊戲
  const initGame = useCallback(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig(containerRef.current, {
      scene: [PreloadScene, DrawScene, CardRevealScene],
    });

    gameRef.current = new Phaser.Game(config);

    // 設定 EventBridge
    const bridge = EventBridge.getInstance();
    bridge.setGame(gameRef.current as unknown as Parameters<typeof bridge.setGame>[0]);

    if (process.env.NODE_ENV === 'development') {
      console.log('[DrawSection] Phaser 遊戲已初始化');
    }
  }, []);

  // 銷毀 Phaser 遊戲
  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] Phaser 遊戲已銷毀');
      }
    }
  }, []);

  // 監聽 Phaser 事件
  useEffect(() => {
    const bridge = EventBridge.getInstance();

    // 卡片揭示完成
    const handleCardRevealed = (data: unknown) => {
      const eventData = data as { rarity: string; answerId: number };

      if (process.env.NODE_ENV === 'development') {
        console.log('[DrawSection] 卡片揭示完成', eventData);
      }

      setIsAnimating(false);

      // 觸發回調
      if (currentAnswer && drawResult && onDrawComplete) {
        onDrawComplete(drawResult, currentAnswer);
      }
    };

    bridge.on(EVENTS.CARD_REVEALED, handleCardRevealed);

    return () => {
      bridge.off(EVENTS.CARD_REVEALED, handleCardRevealed);
    };
  }, [currentAnswer, drawResult, onDrawComplete]);

  // 顯示遊戲時初始化
  useEffect(() => {
    if (showGame) {
      initGame();
    } else {
      destroyGame();
    }

    return () => {
      destroyGame();
    };
  }, [showGame, initGame, destroyGame]);

  /**
   * 執行抽取
   */
  const handleDraw = useCallback(async () => {
    if (!walletAddress || !signAndExecuteTransaction || !mgcCoinId) {
      console.warn('[DrawSection] 缺少必要參數');
      return;
    }

    // 取得隨機答案 ID
    const answerId = getWeightedRandomAnswerId();
    const answer = getAnswerById(answerId);

    if (!answer) {
      console.error('[DrawSection] 找不到答案:', answerId);
      return;
    }

    setCurrentAnswer(answer);

    try {
      // 執行區塊鏈交易
      await draw({
        question,
        answerId,
        mgcCoinId,
      });

      // 交易成功，啟動動畫
      setShowGame(true);
      setIsAnimating(true);

      // 延遲啟動 DrawScene（等待遊戲初始化）
      setTimeout(() => {
        const rarityLabel = getRarityLabelFromAnswerId(answerId);
        const rarityKey = rarityLabel.charAt(0).toUpperCase() + rarityLabel.slice(1);

        const bridge = EventBridge.getInstance();
        bridge.emit(EVENTS.START_DRAW, {
          rarity: rarityKey,
          answerId,
        });
      }, 500);
    } catch (err) {
      console.error('[DrawSection] 抽取失敗:', err);
      setCurrentAnswer(null);
    }
  }, [
    walletAddress,
    signAndExecuteTransaction,
    mgcCoinId,
    question,
    draw,
    getWeightedRandomAnswerId,
    getAnswerById,
  ]);

  /**
   * 重置狀態
   */
  const handleReset = useCallback(() => {
    setShowGame(false);
    setCurrentAnswer(null);
    setQuestion('');
    setIsAnimating(false);
    resetDraw();
    destroyGame();
  }, [resetDraw, destroyGame]);

  // 檢查是否可以抽取
  const canDraw =
    walletAddress &&
    signAndExecuteTransaction &&
    mgcCoinId &&
    mgcBalance !== undefined &&
    mgcBalance >= DRAW_COST &&
    !isDrawing &&
    !isAnimating &&
    !answersLoading;

  return (
    <div className={className}>
      {/* 問題輸入和抽取按鈕 */}
      {!showGame && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* 問題輸入 */}
          <div>
            <label
              htmlFor="question-input"
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              你的問題（選填）
            </label>
            <input
              id="question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="在這裡輸入你的問題..."
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-background-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>

          {/* 成本資訊 */}
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              💎 每次抽取消耗 {DRAW_COST} MGC
            </p>
            {mgcBalance !== undefined && mgcBalance < DRAW_COST && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-error)',
                  marginTop: 'var(--space-1)',
                }}
              >
                餘額不足
              </p>
            )}
            {drawError && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-error)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {drawError}
              </p>
            )}
          </div>

          {/* 抽取按鈕 */}
          <Button
            onClick={handleDraw}
            disabled={!canDraw}
            loading={isDrawing}
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
          >
            抽取解答
          </Button>
        </div>
      )}

      {/* Phaser 遊戲容器 */}
      {showGame && (
        <div style={{ position: 'relative' }}>
          <div
            ref={containerRef}
            style={{
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
              aspectRatio: '4/3',
              background: '#000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          />

          {/* 關閉按鈕（動畫完成後顯示） */}
          {!isAnimating && currentAnswer && (
            <div
              style={{
                position: 'absolute',
                bottom: 'var(--space-4)',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 'var(--space-3)',
              }}
            >
              <Button variant="secondary" onClick={handleReset}>
                關閉
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
