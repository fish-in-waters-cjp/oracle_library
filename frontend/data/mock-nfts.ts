import type { OracleNFT } from '@/hooks/use-oracle-nfts';

/**
 * Mock NFT 資料（開發測試用）
 * answerId 0-49 對應 answers.json 和圖片 1-50
 */
export const MOCK_NFTS: OracleNFT[] = [
  {
    id: 'mock-1',
    rarity: 'legendary',
    question: '我該如何面對生活的挑戰？',
    answerEn: 'The unexamined life is not worth living.',
    answerZh: '答案會自己顯現',
    answerId: 28, // Legendary: answers.json id=29
    mintedAt: '2025-12-16T14:30:45Z',
  },
  {
    id: 'mock-2',
    rarity: 'epic',
    question: '什麼是真正的智慧？',
    answerEn: 'The mind is everything. What you think you become.',
    answerZh: '讓時間來證明',
    answerId: 25, // Epic: answers.json id=26
    mintedAt: '2025-12-15T10:20:30Z',
  },
  {
    id: 'mock-3',
    rarity: 'rare',
    question: '如何獲得成功？',
    answerEn: 'The only true wisdom is in knowing you know nothing.',
    answerZh: '這不是個好主意',
    answerId: 15, // Rare: answers.json id=16
    mintedAt: '2025-12-14T16:45:10Z',
  },
  {
    id: 'mock-4',
    rarity: 'common',
    question: '如何保持耐心？',
    answerEn: 'Patience is the companion of wisdom.',
    answerZh: '是的',
    answerId: 0, // Common: answers.json id=1
    mintedAt: '2025-12-13T09:15:20Z',
  },
  {
    id: 'mock-5',
    rarity: 'legendary',
    question: '生命的意義是什麼？',
    answerEn:
      'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    answerZh: '你已經知道答案了',
    answerId: 40, // Legendary: answers.json id=41
    mintedAt: '2025-12-12T20:30:00Z',
  },
  {
    id: 'mock-6',
    rarity: 'epic',
    question: '如何面對失敗？',
    answerEn:
      'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    answerZh: '不要急於決定',
    answerId: 26, // Epic: answers.json id=27
    mintedAt: '2025-12-11T11:20:15Z',
  },
  {
    id: 'mock-7',
    rarity: 'rare',
    question: '如何培養創造力？',
    answerEn: 'Creativity is intelligence having fun.',
    answerZh: '再等等看',
    answerId: 20, // Rare: answers.json id=21
    mintedAt: '2025-12-10T15:40:30Z',
  },
  {
    id: 'mock-8',
    rarity: 'common',
    question: '如何保持專注？',
    answerEn: 'The secret of getting ahead is getting started.',
    answerZh: '絕對可以',
    answerId: 1, // Common: answers.json id=2
    mintedAt: '2025-12-09T08:10:45Z',
  },
  {
    id: 'mock-9',
    rarity: 'legendary',
    question: '什麼是幸福？',
    answerEn:
      'Happiness is not something ready made. It comes from your own actions.',
    answerZh: '傾聽內心的聲音',
    answerId: 47, // Legendary: answers.json id=48
    mintedAt: '2025-12-08T19:25:10Z',
  },
  {
    id: 'mock-10',
    rarity: 'epic',
    question: '如何找到平靜？',
    answerEn: 'Peace comes from within. Do not seek it without.',
    answerZh: '做出改變',
    answerId: 34, // Epic: answers.json id=35
    mintedAt: '2025-12-07T14:50:30Z',
  },
  {
    id: 'mock-11',
    rarity: 'rare',
    question: '如何做決定？',
    answerEn: 'In the middle of difficulty lies opportunity.',
    answerZh: '採取行動',
    answerId: 30, // Rare: answers.json id=31
    mintedAt: '2025-12-06T07:35:15Z',
  },
  {
    id: 'mock-12',
    rarity: 'common',
    question: '如何維持關係？',
    answerEn:
      'The best time to plant a tree was 20 years ago. The second best time is now.',
    answerZh: '毫無疑問',
    answerId: 2, // Common: answers.json id=3
    mintedAt: '2025-12-05T12:15:30Z',
  },
];
