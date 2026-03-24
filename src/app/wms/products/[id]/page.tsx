"use client";

import { Suspense } from 'react';
import ProductDetail from '../../../../views/ProductDetail';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</div>}>
      <ProductDetail />
    </Suspense>
  );
}