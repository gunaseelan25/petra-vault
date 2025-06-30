'use client';

import { LoadingSpinner } from '@/components/LoaderSpinner';
import {
  PetraVaultApprovalModal,
  PetraVaultApprovalModalRef
} from '@/components/modals/PetraVaultApprovalModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UnknownDappWarning } from '@/components/ui/UnknownDappWarning';
import { useActiveVault } from '@/context/ActiveVaultProvider';
import { isKnownEcosystemApp } from '@/lib/ecosystem';
import { PetraVaultApprovalClient } from '@/wallet/PetraVaultApprovalClient';
import { PetraVaultRequestHandler } from '@/wallet/PetraVaultRequestHandler';
import { useAptosCore } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { ArrowLeftIcon, GlobeIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function VaultExploreSearchPage() {
  const approvalModalRef = useRef<PetraVaultApprovalModalRef>(null);
  const { id, vaultAddress, network } = useActiveVault();

  const core = useAptosCore();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');

  const reset = () => {
    setInputUrl('');
    setUrl('');
    setShowWarning(false);
    setIsReady(false);
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

        // Check if it's a known app and show warning if not
        const isKnown = isKnownEcosystemApp(formattedUrl);

        if (!isKnown) {
          setShowWarning(true);
          setIsReady(false);
        } else {
          setShowWarning(false);
          setIsReady(true);
        }
      } catch (error) {
        console.warn('Invalid URL provided:', error);
        // Don't set URL if invalid
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

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
    [core.client, network, url, vaultAddress]
  );

  useEffect(() => {
    window.addEventListener('message', handleRequest);

    return () => {
      window.removeEventListener('message', handleRequest);
    };
  }, [handleRequest]);

  return (
    <div className="flex flex-col h-full gap-4">
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
              placeholder="Enter a URL (e.g., https://example.com)"
            />
            <Button type="submit" disabled={!inputUrl.trim()}>
              Go
            </Button>
            {url && (
              <Button type="button" variant="outline" onClick={reset}>
                Reset
              </Button>
            )}
          </form>
        </div>
      </div>

      <div className="relative flex-1">
        {!url ? (
          <div className="w-full h-full rounded-md border flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <GlobeIcon className="size-12 opacity-50" />
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium mb-2">
                Enter a URL to get started
              </h3>
              <p className="text-sm">
                Type a website URL in the input field above to browse and
                interact with web applications using your vault.
              </p>
            </div>
          </div>
        ) : isReady ? (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full rounded-md border"
          />
        ) : showWarning ? (
          <div className="w-full h-full rounded-md border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Please review the warning overlay before continuing.</p>
            </div>
          </div>
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
              reset();
            }}
          />
        )}
      </div>

      <PetraVaultApprovalModal ref={approvalModalRef} />
    </div>
  );
}
