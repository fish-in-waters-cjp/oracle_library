'use client';

import { cn } from '@/lib/utils';
import CountUp from '../animation/count-up';
import FadeIn from '../animation/fade-in';
import type { NFTStats } from '@/hooks/use-oracle-nfts';

export interface CollectionStatsProps {
  stats: NFTStats;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface StatCardProps {
  value: number;
  label: string;
  delay: number;
  colorStyle?: React.CSSProperties;
}

function StatCard({ value, label, delay, colorStyle }: StatCardProps) {
  return (
    <FadeIn direction="up" delay={delay}>
      <div
        className="text-center"
        style={{
          background: 'var(--color-background-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-2)',
            ...colorStyle,
          }}
        >
          <CountUp end={value} duration={1.5} delay={delay} />
        </div>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {label}
        </div>
      </div>
    </FadeIn>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          height: '2.5rem',
          background: 'var(--color-border-default)',
          borderRadius: 'var(--radius-sm)',
          width: '4rem',
          margin: '0 auto var(--space-2)',
        }}
      />
      <div
        style={{
          height: '1rem',
          background: 'var(--color-border-default)',
          borderRadius: 'var(--radius-sm)',
          width: '5rem',
          margin: '0 auto',
        }}
      />
    </div>
  );
}

export default function CollectionStats({
  stats,
  isLoading = false,
  className,
  style,
}: CollectionStatsProps) {
  if (isLoading) {
    return (
      <div
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-6)',
          ...style,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-6)',
        ...style,
      }}
    >
      <StatCard value={stats.total} label="總收藏數" delay={0} />
      <StatCard
        value={stats.legendary}
        label="傳說級"
        delay={0.1}
        colorStyle={{ color: 'var(--color-rarity-legendary)' }}
      />
      <StatCard
        value={stats.epic}
        label="史詩級"
        delay={0.2}
        colorStyle={{ color: 'var(--color-rarity-epic)' }}
      />
      <StatCard
        value={stats.rare}
        label="稀有級"
        delay={0.3}
        colorStyle={{ color: 'var(--color-rarity-rare)' }}
      />
    </div>
  );
}
