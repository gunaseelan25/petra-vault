'use client';

import { LoadingSpinner } from '@/components/LoaderSpinner';
import {
  PetraVaultApprovalModal,
  PetraVaultApprovalModalRef
} from '@/components/modals/PetraVaultApprovalModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { PetraVaultApprovalClient } from '@/wallet/PetraVaultApprovalClient';
import { PetraVaultRequestHandler } from '@/wallet/PetraVaultRequestHandler';
import { useAptosCore } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_URL = 'https://www.google.com/webhp?igu=1';

export default function VaultExploreSearchPage() {
  const approvalModalRef = useRef<PetraVaultApprovalModalRef>(null);
  const { id, vaultAddress, network } = useActiveVault();

  const core = useAptosCore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [url, setUrl] = useState<string>(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState<string>('');

  const reset = () => {
    setInputUrl('');
    setUrl(DEFAULT_URL);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      const formattedUrl = inputUrl.startsWith('http')
        ? inputUrl
        : `https://${inputUrl}`;

      try {
        new URL(formattedUrl);
        setUrl(formattedUrl);
      } catch (error) {
        console.warn('Invalid URL provided, using as search query:', error);
        const searchUrl = DEFAULT_URL;
        setUrl(searchUrl);
        setInputUrl('');
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

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
    };
  }, [handleRequest]);

  return (
    <div className="relative flex flex-col h-full gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/vault/${id}/explore`}>
            <Button variant="secondary" className="w-fit z-30">
              <ArrowLeftIcon className="size-4" />
              Go Back
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <form onSubmit={handleUrlSubmit} className="flex w-full gap-2">
            <Input
              value={inputUrl}
              onChange={handleUrlChange}
              className="flex-1"
              placeholder={url}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!inputUrl.trim()}
              onClick={reset}
            >
              Reset
            </Button>
          </form>
        </div>
      </div>

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
