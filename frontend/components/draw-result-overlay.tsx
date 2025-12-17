'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Answer, Rarity, RARITY_COLORS } from '@/hooks/use-answers';
import { MintConfirmModal } from './mint-confirm-modal';

/**
 * DrawResultOverlay Props
 */
interface DrawResultOverlayProps {
  /** 答案資料 */
  answer: Answer;
  /** 稀有度 */
  rarity: Rarity;
  /** DrawRecord Object ID */
  recordId: string;
  /** 再抽一次回調 */
  onDrawAgain: () => void;
  /** 鑄造 NFT 回調 */
  onMintNFT: () => void;
  /** 是否正在鑄造 */
  isMinting?: boolean;
  /** MGC 餘額（用於確認對話框）*/
  mgcBalance?: number;
}

/**
 * 稀有度顯示名稱（中文）
 */
const RARITY_NAMES: Record<Rarity, string> = {
  Common: '普通',
  Rare: '稀有',
  Epic: '史詩',
  Legendary: '傳說',
};

/**
 * 稀有度背景漸層
 */
const RARITY_GRADIENTS: Record<Rarity, string> = {
  Common: 'from-gray-100 to-gray-200',
  Rare: 'from-blue-100 to-blue-200',
  Epic: 'from-purple-100 to-purple-200',
  Legendary: 'from-yellow-100 to-yellow-200',
};

/**
 * 稀有度文字顏色
 */
const RARITY_TEXT_COLORS: Record<Rarity, string> = {
  Common: 'text-gray-600',
  Rare: 'text-blue-600',
  Epic: 'text-purple-600',
  Legendary: 'text-yellow-600',
};

/**
 * DrawResultOverlay - 抽取結果顯示
 *
 * 美化的結果顯示元件，顯示答案內容、稀有度和操作按鈕
 */
export function DrawResultOverlay({
  answer,
  rarity,
  recordId,
  onDrawAgain,
  onMintNFT,
  isMinting = false,
  mgcBalance = 0,
}: DrawResultOverlayProps) {
  const [showMintModal, setShowMintModal] = useState(false);

  const rarityName = RARITY_NAMES[rarity];
  const rarityGradient = RARITY_GRADIENTS[rarity];
  const rarityTextColor = RARITY_TEXT_COLORS[rarity];
  const rarityColor = RARITY_COLORS[rarity];

  const MINT_COST = 5;

  /**
   * 處理鑄造按鈕點擊
   */
  const handleMintClick = () => {
    setShowMintModal(true);
  };

  /**
   * 處理確認鑄造
   */
  const handleConfirmMint = () => {
    setShowMintModal(false);
    onMintNFT();
  };

  /**
   * 處理取消鑄造
   */
  const handleCancelMint = () => {
    setShowMintModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative max-w-2xl mx-auto"
    >
      {/* 主卡片容器 */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 稀有度裝飾條 */}
        <div
          className={`h-2 bg-gradient-to-r ${rarityGradient}`}
          style={{
            backgroundImage: `linear-gradient(to right, ${rarityColor}, ${rarityColor})`,
          }}
        />

        {/* 內容區域 */}
        <div className="p-8 space-y-6">
          {/* 標題與稀有度 */}
          <div className="text-center space-y-2">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-gray-800"
            >
              解答之書
            </motion.h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full"
            >
              <span className={`text-sm font-semibold ${rarityTextColor}`}>
                {rarityName}
              </span>
              <span className="text-xs text-gray-500">稀有度</span>
            </motion.div>
          </div>

          {/* 答案內容卡片 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`relative bg-gradient-to-br ${rarityGradient} rounded-xl p-8 shadow-inner`}
          >
            {/* 裝飾性引號 */}
            <div className="absolute top-4 left-4 text-4xl opacity-20">
              「
            </div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-20">
              」
            </div>

            {/* 答案文字 */}
            <p className="relative text-xl text-gray-800 text-center leading-relaxed font-medium px-8">
              {answer.text_zh}
            </p>
          </motion.div>

          {/* 答案編號 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <span className="text-sm text-gray-500">
              答案編號 #{answer.id.toString().padStart(2, '0')}
            </span>
          </motion.div>

          {/* 操作按鈕 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 pt-4"
          >
            {/* 再抽一次按鈕 */}
            <motion.button
              onClick={onDrawAgain}
              disabled={isMinting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition-colors"
            >
              再抽一次
            </motion.button>

            {/* 鑄造 NFT 按鈕 */}
            <motion.button
              onClick={handleMintClick}
              disabled={isMinting}
              whileHover={!isMinting ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isMinting ? { scale: 0.95 } : {}}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {isMinting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  鑄造中...
                </span>
              ) : (
                '🎨 鑄造 NFT (5 MGC)'
              )}
            </motion.button>
          </motion.div>

          {/* 提示文字 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-1"
          >
            <p className="text-center text-xs text-gray-500">
              鑄造 NFT 後，此解答將永久保存至區塊鏈
            </p>
            <p className="text-center text-xs text-gray-400 font-mono">
              DrawRecord ID: {recordId.substring(0, 12)}...
            </p>
          </motion.div>
        </div>

        {/* 稀有度光效（僅 Epic 和 Legendary）*/}
        {(rarity === 'Epic' || rarity === 'Legendary') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${rarityColor}20, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* 外部裝飾粒子（僅 Legendary）*/}
      {rarity === 'Legendary' && (
        <>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -top-4 -left-4 w-8 h-8 opacity-50"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -top-4 -right-4 w-8 h-8 opacity-50"
          >
            ⭐
          </motion.div>
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -bottom-4 -left-4 w-8 h-8 opacity-50"
          >
            💫
          </motion.div>
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 22, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -bottom-4 -right-4 w-8 h-8 opacity-50"
          >
            🌟
          </motion.div>
        </>
      )}

      {/* 鑄造確認對話框 */}
      <MintConfirmModal
        isOpen={showMintModal}
        answer={answer}
        rarity={rarity}
        mintCost={MINT_COST}
        mgcBalance={mgcBalance}
        onConfirm={handleConfirmMint}
        onCancel={handleCancelMint}
        isMinting={isMinting}
      />
    </motion.div>
  );
}
