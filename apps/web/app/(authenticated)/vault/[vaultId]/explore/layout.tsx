'use client';

import { PropsWithChildren } from 'react';
import PageVaultHeader from '@/components/PageVaultHeader';

export default function VaultExploreLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-full p-8 flex flex-col">
      <PageVaultHeader title="Explore" />

      <br />

      {children}
    </div>
  );
}
