"use client";

import { Suspense } from 'react';
import { ChannelsSection } from '../../../../views/settings';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading channels...</div>}>
      <ChannelsSection />
    </Suspense>
  );
}