'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Answer, Rarity, RARITY_COLORS } from '@/hooks/use-answers';

/**
 * MintConfirmModal Props
 */
interface MintConfirmModalProps {
  /** 是否顯示對話框 */
  isOpen: boolean;
  /** 答案資料 */
  answer: Answer;
  /** 稀有度 */
  rarity: Rarity;
  /** 鑄造成本（MGC）*/
  mintCost?: number;
  /** 當前 MGC 餘額 */
  mgcBalance?: number;
  /** 確認回調 */
  onConfirm: () => void;
  /** 取消回調 */
  onCancel: () => void;
  /** 是否正在鑄造 */
  isMinting?: boolean;
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
 * MintConfirmModal - 鑄造確認對話框
 *
 * 在用戶點擊鑄造按鈕時顯示，確認是否要花費 MGC 鑄造 NFT
 */
export function MintConfirmModal({
  isOpen,
  answer,
  rarity,
  mintCost = 5,
  mgcBalance = 0,
  onConfirm,
  onCancel,
  isMinting = false,
}: MintConfirmModalProps) {
  const rarityName = RARITY_NAMES[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const hasEnoughMGC = mgcBalance >= mintCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={!isMinting ? onCancel : undefined}
          />

          {/* 對話框 */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* 稀有度裝飾條 */}
              <div
                className="h-2"
                style={{ backgroundColor: rarityColor }}
              />

              {/* 內容 */}
              <div className="p-6 space-y-6">
                {/* 標題 */}
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="text-5xl"
                  >
                    🎨
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    鑄造 NFT 確認
                  </h2>
                  <p className="text-sm text-gray-500">
                    將此解答永久保存至區塊鏈
                  </p>
                </div>

                {/* 答案預覽 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
                  {/* 稀有度標籤 */}
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: rarityColor }}
                    >
                      {rarityName}
                    </span>
                  </div>

                  {/* 答案內容 */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    {answer.text_zh}
                  </p>

                  {/* 答案編號 */}
                  <p className="text-xs text-gray-500 text-center">
                    答案編號 #{answer.id.toString().padStart(2, '0')}
                  </p>
                </div>

                {/* 成本資訊 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">鑄造成本</span>
                    <span className="text-lg font-bold text-blue-600">
                      {mintCost} MGC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">你的餘額</span>
                    <span
                      className={`text-lg font-bold ${
                        hasEnoughMGC ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {mgcBalance} MGC
                    </span>
                  </div>
                  {hasEnoughMGC && (
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                      <span className="text-sm text-gray-600">鑄造後餘額</span>
                      <span className="text-lg font-bold text-gray-800">
                        {mgcBalance - mintCost} MGC
                      </span>
                    </div>
                  )}
                </div>

                {/* MGC 不足警告 */}
                {!hasEnoughMGC && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 text-center"
                  >
                    MGC 不足，請先完成每日簽到獲得 MGC
                  </motion.div>
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-3">
                  {/* 取消按鈕 */}
                  <motion.button
                    onClick={onCancel}
                    disabled={isMinting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition-colors"
                  >
                    取消
                  </motion.button>

                  {/* 確認按鈕 */}
                  <motion.button
                    onClick={onConfirm}
                    disabled={!hasEnoughMGC || isMinting}
                    whileHover={hasEnoughMGC && !isMinting ? { scale: 1.02 } : {}}
                    whileTap={hasEnoughMGC && !isMinting ? { scale: 0.98 } : {}}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg"
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
                      '確認鑄造'
                    )}
                  </motion.button>
                </div>

                {/* 提示文字 */}
                <p className="text-center text-xs text-gray-500">
                  鑄造後，此解答將永久保存至 IOTA 區塊鏈
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
