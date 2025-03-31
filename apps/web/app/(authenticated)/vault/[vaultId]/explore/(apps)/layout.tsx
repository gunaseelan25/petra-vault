'use client';

import { PropsWithChildren } from 'react';
import LayoutTabs from '@/components/LayoutTabs';

const tabs = [
  {
    id: 'apps',
    label: 'Apps',
    href: '/vault/[vaultId]/explore'
  }
];

export default function VaultExploreLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-full flex flex-col">
      <LayoutTabs layoutId="explore" tabs={tabs} />

      {children}
    </div>
  );
}
