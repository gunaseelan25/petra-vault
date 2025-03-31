'use client';

import { LoadingSpinner } from '@/components/LoaderSpinner';
import {
  PetraVaultApprovalModal,
  PetraVaultApprovalModalRef
} from '@/components/modals/PetraVaultApprovalModal';
import { Button } from '@/components/ui/button';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { PetraVaultApprovalClient } from '@/wallet/PetraVaultApprovalClient';
import { PetraVaultRequestHandler } from '@/wallet/PetraVaultRequestHandler';
import { useAptosCore } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function VaultExploreEmbeddedPage() {
  const approvalModalRef = useRef<PetraVaultApprovalModalRef>(null);
  const { id, vaultAddress, network } = useActiveVault();
  const searchParams = useSearchParams();
  const core = useAptosCore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isReady, setIsReady] = useState(false);

  const url = searchParams.get('url');

  const handleRequest = useCallback(
    async (e: MessageEvent) => {
      const { aptos } = core.client.getClients({ network: { network } });

      const handler = new PetraVaultRequestHandler({
        aptos,
        vaultAddress: AccountAddress.from(vaultAddress),
        approvalClient: new PetraVaultApprovalClient(approvalModalRef)
      });

      const response = await handler.handleRequest(e);
      if (response) e.source?.postMessage(response, { targetOrigin: e.origin });
    },
    [core.client, network, vaultAddress]
  );

  useEffect(() => {
    window.addEventListener('message', handleRequest);

    setIsReady(true);

    return () => {
      window.removeEventListener('message', handleRequest);
      console.log('removing handler');
    };
  }, [handleRequest]);

  if (!url) {
    return <div>No URL provided</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <Link href={`/vault/${id}/explore`}>
        <Button variant="secondary" className="w-fit">
          <ArrowLeftIcon className="size-4" />
          Go Back
        </Button>
      </Link>
      {isReady ? (
        <iframe
          ref={iframeRef}
          src={url}
          className="flex-1 rounded-md border"
        />
      ) : (
        <div className="flex-1 rounded-md border flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      <PetraVaultApprovalModal ref={approvalModalRef} />
    </div>
  );
}
