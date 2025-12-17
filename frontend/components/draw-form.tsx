'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DrawFormProps {
  /** 是否正在抽取 */
  isDrawing: boolean;
  /** MGC 餘額 */
  mgcBalance: number;
  /** 抽取回調 */
  onDraw: (question: string) => void;
  /** 錯誤訊息 */
  error?: string | null;
}

/**
 * DrawForm - 問題輸入表單
 *
 * 使用者輸入問題並點擊抽取按鈕
 */
export function DrawForm({ isDrawing, mgcBalance, onDraw, error }: DrawFormProps) {
  const [question, setQuestion] = useState('');

  const DRAW_COST = 10;
  const canDraw = question.trim().length > 0 && mgcBalance >= DRAW_COST && !isDrawing;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canDraw) {
      onDraw(question);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 問題輸入框 */}
      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
          向神諭提問
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="輸入你的問題..."
          disabled={isDrawing}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{question.length}/200 字</span>
          {question.trim().length === 0 && (
            <span className="text-amber-600">* 請輸入問題</span>
          )}
        </div>
      </div>

      {/* MGC 成本提示 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">抽取成本</span>
          <span className="text-lg font-bold text-blue-600">{DRAW_COST} MGC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">你的餘額</span>
          <span className={`text-lg font-bold ${mgcBalance >= DRAW_COST ? 'text-green-600' : 'text-red-600'}`}>
            {mgcBalance} MGC
          </span>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* MGC 不足警告 */}
      {mgcBalance < DRAW_COST && !isDrawing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700"
        >
          MGC 不足，請先完成每日簽到獲得 MGC
        </motion.div>
      )}

      {/* 抽取按鈕 */}
      <motion.button
        type="submit"
        disabled={!canDraw}
        whileHover={canDraw ? { scale: 1.02 } : {}}
        whileTap={canDraw ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          canDraw
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isDrawing ? (
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
            抽取中...
          </span>
        ) : (
          '✨ 抽取解答之書'
        )}
      </motion.button>

      {/* 提示文字 */}
      {!isDrawing && canDraw && (
        <p className="text-center text-xs text-gray-500">
          點擊按鈕後將消耗 {DRAW_COST} MGC 進行抽取
        </p>
      )}
    </form>
  );
}
