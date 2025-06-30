'use client';

import { LoadingSpinner } from '@/components/LoaderSpinner';
import {
  PetraVaultApprovalModal,
  PetraVaultApprovalModalRef
} from '@/components/modals/PetraVaultApprovalModal';
import { Button } from '@/components/ui/button';
import { UnknownDappWarning } from '@/components/ui/UnknownDappWarning';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { isKnownEcosystemApp } from '@/lib/ecosystem';
import { PetraVaultApprovalClient } from '@/wallet/PetraVaultApprovalClient';
import { PetraVaultRequestHandler } from '@/wallet/PetraVaultRequestHandler';
import { useAptosCore } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function VaultExploreEmbeddedPage() {
  const approvalModalRef = useRef<PetraVaultApprovalModalRef>(null);
  const { id, vaultAddress, network } = useActiveVault();
  const searchParams = useSearchParams();
  const router = useRouter();
  const core = useAptosCore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const url = searchParams.get('url');

  const handleRequest = useCallback(
    async (e: MessageEvent) => {
      if (!url) return;

      const { aptos } = core.client.getClients({ network: { network } });

      const handler = new PetraVaultRequestHandler({
        aptos,
        vaultAddress: AccountAddress.from(vaultAddress),
        approvalClient: new PetraVaultApprovalClient(approvalModalRef),
        allowedOrigins: [new URL(url).origin]
      });

      const response = await handler.handleRequest(e);
      if (response) e.source?.postMessage(response, { targetOrigin: e.origin });
    },
    [core.client, network, vaultAddress, url]
  );

  useEffect(() => {
    window.addEventListener('message', handleRequest);

    const isKnownApp = url ? isKnownEcosystemApp(url) : false;

    // Show warning for unknown apps, but only if URL exists and is not known
    if (url && !isKnownApp) {
      setShowWarning(true);
    } else {
      setIsReady(true);
    }

    return () => {
      window.removeEventListener('message', handleRequest);
    };
  }, [handleRequest, url]);

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
      <div className="relative flex-1">
        {isReady ? (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full rounded-md border"
          />
        ) : (
          <div className="w-full h-full rounded-md border flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {showWarning && url && (
          <UnknownDappWarning
            url={url}
            onContinue={() => {
              setShowWarning(false);
              setIsReady(true);
            }}
            onGoBack={() => {
              router.push(`/vault/${id}/explore`);
            }}
          />
        )}
      </div>

      <PetraVaultApprovalModal ref={approvalModalRef} />
    </div>
  );
}
