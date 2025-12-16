'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Alert from '@/components/ui/alert';
import Spinner from '@/components/ui/spinner';
import Badge from '@/components/ui/badge';

const styles = {
  section: {
    background: 'var(--color-background-surface)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-10)',
    marginBottom: 'var(--space-10)'
  } as React.CSSProperties,

  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-primary)',
    marginBottom: 'var(--space-8)',
    paddingBottom: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-default)',
    fontWeight: 'var(--font-weight-normal)'
  } as React.CSSProperties,

  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 'var(--space-5)',
    alignItems: 'center',
    marginBottom: 'var(--space-10)'
  } as React.CSSProperties,

  label: {
    width: '100%',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-3)'
  } as React.CSSProperties
};

export default function DesignSystemPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background-main)',
      padding: 'var(--space-12)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* 頁面標題 */}
        <header style={{ marginBottom: 'var(--space-12)' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-6)',
            fontWeight: 'var(--font-weight-normal)',
            letterSpacing: '0.02em'
          }}>
            永恆圖書館設計系統
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)'
          }}>
            Style 10 - 高端奢華設計系統
          </p>
        </header>

        {/* 按鈕元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>按鈕元件</h2>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>Primary - 主要動作</span>
            <Button variant="primary">主要按鈕</Button>
            <Button variant="primary">鑄造 NFT</Button>
            <Button variant="primary">簽到</Button>
          </div>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>Secondary - 次要動作</span>
            <Button variant="secondary">次要按鈕</Button>
            <Button variant="secondary">查看收藏</Button>
          </div>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>Ghost - 輕量動作</span>
            <Button variant="ghost">幽靈按鈕</Button>
            <Button variant="ghost">取消</Button>
          </div>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>尺寸變化</span>
            <Button variant="primary" size="sm">小按鈕</Button>
            <Button variant="primary" size="md">中按鈕</Button>
            <Button variant="primary" size="lg">大按鈕</Button>
          </div>

          <div style={styles.buttonGroup}>
            <span style={styles.label}>正常與禁用狀態</span>
            <Button variant="primary">正常狀態</Button>
            <Button variant="primary" disabled>禁用狀態</Button>
            <Button
              variant="primary"
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
              }}
            >
              {isLoading ? '載入中...' : '點擊測試 Loading'}
            </Button>
          </div>
        </section>

        {/* 輸入框元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>輸入框元件</h2>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input
              label="文字輸入"
              placeholder="請輸入文字..."
              helpText="這是輔助說明文字"
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input
              label="電子郵件"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input
              label="錯誤狀態"
              error="此欄位為必填"
            />
          </div>
        </section>

        {/* 卡片元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>卡片元件</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)'
          }}>
            <Card title="基礎卡片">
              這是一個基礎卡片，包含標題和內容區域。
            </Card>
            <Card title="資訊卡片">
              可用於顯示各種資訊內容，支援懸停效果。
            </Card>
          </div>

          <div style={styles.label}>稀有度卡片</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            <Card title="傳說級卡片" rarity="legendary" showRarityBadge>
              最稀有的卡片，帶有金色光暈效果。
            </Card>
            <Card title="史詩級卡片" rarity="epic" showRarityBadge>
              史詩級稀有度。
            </Card>
            <Card title="稀有卡片" rarity="rare" showRarityBadge>
              稀有級別。
            </Card>
            <Card title="普通卡片" rarity="common" showRarityBadge>
              普通級別。
            </Card>
          </div>
        </section>

        {/* 警告訊息元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>警告訊息</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Alert type="success">操作成功！NFT 已成功鑄造。</Alert>
            <Alert type="warning">注意：您的 MGC 餘額不足。</Alert>
            <Alert type="error">錯誤：交易失敗，請重試。</Alert>
            <Alert type="info">提示：每日簽到可獲得 100 MGC。</Alert>
          </div>
        </section>

        {/* 載入動畫元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>載入動畫</h2>

          <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
            <Spinner size={30} />
            <Spinner size={40} />
            <Spinner size={60} />
          </div>
        </section>

        {/* 標籤元件 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>稀有度標籤</h2>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={styles.label}>稀有度標籤</div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' as const }}>
              <Badge variant="legendary">Legendary</Badge>
              <Badge variant="epic">Epic</Badge>
              <Badge variant="rare">Rare</Badge>
              <Badge variant="common">Common</Badge>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={styles.label}>中文標籤</div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' as const }}>
              <Badge variant="legendary">傳說</Badge>
              <Badge variant="epic">史詩</Badge>
              <Badge variant="rare">稀有</Badge>
              <Badge variant="common">普通</Badge>
            </div>
          </div>

          <div>
            <div style={styles.label}>與 Card 組合使用</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Card title="神諭 NFT #001" rarity="legendary">
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <Badge variant="legendary">Legendary</Badge>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  最稀有的 NFT
                </p>
              </Card>
              <Card title="神諭 NFT #042" rarity="epic">
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <Badge variant="epic">Epic</Badge>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  史詩級稀有度
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 色彩系統 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>色彩系統</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
            <div>
              <div style={styles.label}>主要顏色</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)',
                  background: 'var(--color-primary)'
                }} />
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Primary</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#d4af37</p>
                </div>
              </div>
            </div>

            <div>
              <div style={styles.label}>次要顏色</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)',
                  background: 'var(--color-secondary)'
                }} />
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Secondary</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#c0c0c0</p>
                </div>
              </div>
            </div>

            <div>
              <div style={styles.label}>背景顏色</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)',
                  background: 'var(--color-background-main)'
                }} />
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Main</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>#000000</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
