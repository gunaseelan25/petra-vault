'use client';

import { PropsWithChildren } from 'react';
import PageVaultHeader from '@/components/PageVaultHeader';
import LayoutTabs from '@/components/LayoutTabs';

const tabs = [
  {
    id: 'setup',
    label: 'Setup',
    href: '/vault/[vaultId]/settings'
  },
  {
    id: 'export',
    label: 'Export',
    href: '/vault/[vaultId]/settings/export'
  },
  {
    id: 'apps',
    label: 'Apps',
    href: '/vault/[vaultId]/settings/apps'
  }
];

export default function VaultSettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <PageVaultHeader title="Settings" />

      <br />

      <LayoutTabs layoutId="settings" tabs={tabs} />

      {children}
    </div>
  );
}
