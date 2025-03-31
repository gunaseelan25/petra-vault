'use client';

import { PropsWithChildren } from 'react';
import PageVaultHeader from '@/components/PageVaultHeader';

export default function VaultExploreLayout({ children }: PropsWithChildren) {
  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <PageVaultHeader title="Explore" />

      <br />

      {children}
    </div>
  );
}
