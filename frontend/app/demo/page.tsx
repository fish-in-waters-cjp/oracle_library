'use client';

import { useState } from 'react';
import DrawForm from '@/components/draw-form';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';

/**
 * DrawForm Demo 頁面 (Style 10 - 高端奢華)
 *
 * 展示 DrawForm 元件的各種狀態與用法
 */
export default function DemoPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [balance, setBalance] = useState(20);

  const handleDraw = () => {
    console.log('🎲 開始抽卡...');
    setIsDrawing(true);

    // 模擬抽卡延遲
    setTimeout(() => {
      setBalance((prev) => Math.max(0, prev - 10));
      setIsDrawing(false);
      console.log('✅ 抽卡完成！');
    }, 2000);
  };

  // Style 10 樣式定義
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'var(--color-background-main)',
      padding: 'var(--space-12)',
    } as React.CSSProperties,

    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    } as React.CSSProperties,

    title: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-4xl)',
      color: 'var(--color-primary)',
      marginBottom: 'var(--space-8)',
      fontWeight: 'var(--font-weight-normal)',
      letterSpacing: '0.02em',
    } as React.CSSProperties,

    balanceCard: {
      marginBottom: 'var(--space-8)',
      padding: 'var(--space-6)',
      background: 'var(--color-background-surface)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
    } as React.CSSProperties,

    balanceText: {
      fontSize: 'var(--text-lg)',
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-body)',
    } as React.CSSProperties,

    balanceAmount: {
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-primary)',
    } as React.CSSProperties,

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 'var(--space-6)',
      marginBottom: 'var(--space-10)',
    } as React.CSSProperties,

    instructionCard: {
      marginTop: 'var(--space-8)',
      padding: 'var(--space-8)',
      background: 'var(--color-background-surface)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
    } as React.CSSProperties,

    instructionTitle: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-2xl)',
      color: 'var(--color-primary)',
      marginBottom: 'var(--space-6)',
      fontWeight: 'var(--font-weight-normal)',
    } as React.CSSProperties,

    instructionContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-secondary)',
    } as React.CSSProperties,

    code: {
      background: 'var(--color-background-elevated)',
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-primary)',
    } as React.CSSProperties,

    successText: {
      color: 'var(--color-success)',
      fontWeight: 'var(--font-weight-semibold)',
    } as React.CSSProperties,

    featureList: {
      marginLeft: 'var(--space-6)',
      color: 'var(--color-text-secondary)',
    } as React.CSSProperties,

    featureItem: {
      marginBottom: 'var(--space-2)',
    } as React.CSSProperties,

    descriptionText: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-secondary)',
      marginBottom: 'var(--space-4)',
      lineHeight: '1.6',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>DrawForm 元件展示</h1>

        {/* 當前餘額顯示 */}
        <div style={styles.balanceCard}>
          <p style={styles.balanceText}>
            💰 當前 MGC 餘額：<span style={styles.balanceAmount}>{balance}</span>
          </p>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Button
              onClick={() => setBalance(20)}
              variant="link"
              size="sm"
            >
              重置餘額為 20
            </Button>
          </div>
        </div>

        <div style={styles.grid}>
          {/* 基本狀態 */}
          <Card title="1. 基本狀態（餘額充足）">
            <DrawForm onDraw={handleDraw} balance={balance} isLoading={isDrawing} />
          </Card>

          {/* Loading 狀態 */}
          <Card title="2. Loading 狀態">
            <DrawForm onDraw={() => {}} isLoading={true} />
          </Card>

          {/* 餘額不足 */}
          <Card title="3. 餘額不足">
            <DrawForm onDraw={() => {}} balance={5} />
          </Card>

          {/* 禁用狀態 */}
          <Card title="4. 禁用狀態">
            <DrawForm onDraw={() => {}} disabled={true} />
          </Card>

          {/* 無餘額資訊 */}
          <Card title="5. 無餘額資訊">
            <DrawForm onDraw={() => console.log('無餘額檢查的抽卡')} />
          </Card>

          {/* 互動式測試 */}
          <Card title="6. 互動式測試（會扣除餘額）">
            <div>
              <p style={styles.descriptionText}>
                點擊按鈕後會：
                <br />• 顯示 2 秒 loading
                <br />• 扣除 10 MGC
                <br />• 餘額不足時自動禁用
              </p>
              <DrawForm
                onDraw={handleDraw}
                balance={balance}
                isLoading={isDrawing}
              />
            </div>
          </Card>
        </div>

        {/* 使用說明 */}
        <div style={styles.instructionCard}>
          <h2 style={styles.instructionTitle}>使用說明</h2>
          <div style={styles.instructionContent}>
            <p>
              <strong>元件路徑：</strong>{' '}
              <code style={styles.code}>frontend/components/draw-form.tsx</code>
            </p>
            <p>
              <strong>測試檔案：</strong>{' '}
              <code style={styles.code}>frontend/__tests__/components/draw-form.test.tsx</code>
            </p>
            <p>
              <strong>測試結果：</strong>{' '}
              <span style={styles.successText}>✅ 9/9 通過</span>
            </p>
            <p style={{ marginTop: 'var(--space-4)' }}>
              <strong>功能特點：</strong>
            </p>
            <ul style={styles.featureList}>
              <li style={styles.featureItem}>自動檢查餘額是否足夠（10 MGC）</li>
              <li style={styles.featureItem}>餘額不足時顯示提示並禁用按鈕</li>
              <li style={styles.featureItem}>支援 loading 狀態顯示</li>
              <li style={styles.featureItem}>重用 Phase 0 的 Button 元件</li>
              <li style={styles.featureItem}>完全響應式設計</li>
              <li style={styles.featureItem}>使用 Style 10 奢華設計系統</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
