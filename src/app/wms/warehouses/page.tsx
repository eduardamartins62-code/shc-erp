"use client";

import { Suspense } from 'react';
import StockByWarehouse from '../../../views/StockByWarehouse';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>}>
      <StockByWarehouse />
    </Suspense>
  );
}