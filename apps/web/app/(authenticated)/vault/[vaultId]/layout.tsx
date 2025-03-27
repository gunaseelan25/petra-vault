'use client';

import { CoinsProvider } from '@/context/CoinsProvider';
import { ActiveVaultProvider } from '@/context/ActiveVaultProvider';
import { parseVaultId } from '@/lib/vaults';
import { useParams } from 'next/navigation';
import BackgroundSyncVault from '@/components/background/BackgroundSyncVault';
import Banner from '@/components/Banner';

export default function VaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { vaultId } = useParams();

  const parsedVaultId = parseVaultId(decodeURIComponent(vaultId as string));

  if (!parsedVaultId) {
    return <div>Invalid vault address</div>;
  }

  return (
    <ActiveVaultProvider
      vaultAddress={parsedVaultId.address.toString()}
      network={parsedVaultId.network}
    >
      <BackgroundSyncVault />
      <CoinsProvider>
        <Banner />
        {children}
      </CoinsProvider>
    </ActiveVaultProvider>
  );
}
