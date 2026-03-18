"use client";

import { Suspense } from 'react';
import StockByWarehouse from '../../views/StockByWarehouse';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StockByWarehouse />
    </Suspense>
  );
}