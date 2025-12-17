'use client';

import { useState } from 'react';
import FadeIn from '@/components/animation/fade-in';
import NFTGrid from '@/components/nft-grid';
import NFTDetailModal from '@/components/nft-detail-modal';
import CollectionStats from '@/components/animated/collection-stats';
import type { OracleNFT, NFTStats } from '@/hooks/use-oracle-nfts';

// Mock NFT 資料（開發測試用）
// answerId 0-49 對應 answers.json 和圖片 1-50
const mockNFTs: OracleNFT[] = [
  {
    id: '1',
    rarity: 'legendary',
    question: '我該如何面對生活的挑戰？',
    answerEn: 'The unexamined life is not worth living.',
    answerZh: '答案會自己顯現',
    answerId: 28, // Legendary: answers.json id=29
    mintedAt: '2025-12-16T14:30:45Z',
  },
  {
    id: '2',
    rarity: 'epic',
    question: '什麼是真正的智慧？',
    answerEn: 'The mind is everything. What you think you become.',
    answerZh: '讓時間來證明',
    answerId: 25, // Epic: answers.json id=26
    mintedAt: '2025-12-15T10:20:30Z',
  },
  {
    id: '3',
    rarity: 'rare',
    question: '如何獲得成功？',
    answerEn: 'The only true wisdom is in knowing you know nothing.',
    answerZh: '這不是個好主意',
    answerId: 15, // Rare: answers.json id=16
    mintedAt: '2025-12-14T16:45:10Z',
  },
  {
    id: '4',
    rarity: 'common',
    question: '如何保持耐心？',
    answerEn: 'Patience is the companion of wisdom.',
    answerZh: '是的',
    answerId: 0, // Common: answers.json id=1
    mintedAt: '2025-12-13T09:15:20Z',
  },
  {
    id: '5',
    rarity: 'legendary',
    question: '生命的意義是什麼？',
    answerEn:
      'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    answerZh: '你已經知道答案了',
    answerId: 40, // Legendary: answers.json id=41
    mintedAt: '2025-12-12T20:30:00Z',
  },
  {
    id: '6',
    rarity: 'epic',
    question: '如何面對失敗？',
    answerEn:
      'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    answerZh: '不要急於決定',
    answerId: 26, // Epic: answers.json id=27
    mintedAt: '2025-12-11T11:20:15Z',
  },
  {
    id: '7',
    rarity: 'rare',
    question: '如何培養創造力？',
    answerEn: 'Creativity is intelligence having fun.',
    answerZh: '再等等看',
    answerId: 20, // Rare: answers.json id=21
    mintedAt: '2025-12-10T15:40:30Z',
  },
  {
    id: '8',
    rarity: 'common',
    question: '如何保持專注？',
    answerEn: 'The secret of getting ahead is getting started.',
    answerZh: '絕對可以',
    answerId: 1, // Common: answers.json id=2
    mintedAt: '2025-12-09T08:10:45Z',
  },
  {
    id: '9',
    rarity: 'legendary',
    question: '什麼是幸福？',
    answerEn:
      'Happiness is not something ready made. It comes from your own actions.',
    answerZh: '傾聽內心的聲音',
    answerId: 47, // Legendary: answers.json id=48
    mintedAt: '2025-12-08T19:25:10Z',
  },
  {
    id: '10',
    rarity: 'epic',
    question: '如何找到平靜？',
    answerEn: 'Peace comes from within. Do not seek it without.',
    answerZh: '做出改變',
    answerId: 34, // Epic: answers.json id=35
    mintedAt: '2025-12-07T14:50:30Z',
  },
  {
    id: '11',
    rarity: 'rare',
    question: '如何做決定？',
    answerEn: 'In the middle of difficulty lies opportunity.',
    answerZh: '採取行動',
    answerId: 30, // Rare: answers.json id=31
    mintedAt: '2025-12-06T07:35:15Z',
  },
  {
    id: '12',
    rarity: 'common',
    question: '如何維持關係？',
    answerEn:
      'The best time to plant a tree was 20 years ago. The second best time is now.',
    answerZh: '毫無疑問',
    answerId: 2, // Common: answers.json id=3
    mintedAt: '2025-12-05T12:15:30Z',
  },
];

// 計算統計資料
const mockStats: NFTStats = {
  total: mockNFTs.length,
  legendary: mockNFTs.filter((n) => n.rarity === 'legendary').length,
  epic: mockNFTs.filter((n) => n.rarity === 'epic').length,
  rare: mockNFTs.filter((n) => n.rarity === 'rare').length,
  common: mockNFTs.filter((n) => n.rarity === 'common').length,
};

export default function CollectionPage() {
  const [selectedNFT, setSelectedNFT] = useState<OracleNFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNFTClick = (nft: OracleNFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 延遲清除 selectedNFT，讓關閉動畫完成
    setTimeout(() => setSelectedNFT(null), 200);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-base)' }}>
      <main
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-8)',
        }}
      >
        {/* 頁面標題 */}
        <FadeIn direction="up">
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-12)',
              textAlign: 'center',
              fontWeight: 'var(--font-weight-normal)',
              letterSpacing: '0.02em',
            }}
          >
            我的收藏
          </h1>
        </FadeIn>

        {/* 統計卡片 */}
        <CollectionStats stats={mockStats} style={{ marginBottom: 'var(--space-12)' }} />

        {/* NFT 網格 */}
        <NFTGrid nfts={mockNFTs} onNFTClick={handleNFTClick} />

        {/* NFT 詳情 Modal */}
        <NFTDetailModal
          open={isModalOpen}
          nft={selectedNFT}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
}
