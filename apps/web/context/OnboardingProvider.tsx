'use client';

import { VaultSigner } from '@/lib/types/signers';
import {
  useNetwork,
  useSignAndSubmitTransaction,
  useWaitForTransaction
} from '@aptos-labs/react';
import constate from 'constate';
import { useEffect, useState } from 'react';
import { useVaults } from './useVaults';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AccountAddress,
  UserTransactionResponse,
  WriteSetChangeWriteResource
} from '@aptos-labs/ts-sdk';
import { Vault } from '@/lib/types/vaults';
import { createVaultId } from '@/lib/vaults';
import useAnalytics from '@/hooks/useAnalytics';

export const [OnboardingProvider, useOnboarding] = constate(() => {
  const trackEvent = useAnalytics();

  const { createVault } = useVaults();
  const network = useNetwork();
  const router = useRouter();

  const [page, setPage] = useState<
    'add-or-import' | 'set-name' | 'set-config' | 'review' | 'not-found'
  >('add-or-import');

  const [vaultName, setVaultName] = useState('');
  const [vaultSigners, setVaultSigners] = useState<VaultSigner[]>([]);
  const [vaultSignaturesRequired, setVaultSignaturesRequired] = useState(1);
  const [importVaultAddress, setImportVaultAddress] = useState<string>('');

  const onImportVault = (vault: Vault) => {
    createVault(vault);
    router.push(`/vault/${createVaultId(vault)}`);
  };

  const {
    hash,
    signAndSubmitTransaction,
    isPending: isSigningAndSubmittingCreation
  } = useSignAndSubmitTransaction({
    onSuccess: (data) => {
      trackEvent('create_new_vault', {
        hash: data.hash,
        signatures_required: vaultSignaturesRequired,
        owners: vaultSigners.length
      });
    }
  });
  const {
    data: transaction,
    isSuccess,
    isLoading: isWaitingForCreationTransaction
  } = useWaitForTransaction({ hash });

  const onCreateVault = () => {
    signAndSubmitTransaction({
      data: {
        function: '0x1::multisig_account::create_with_owners',
        functionArguments: [
          vaultSigners.slice(1).map((signer) => signer.address),
          vaultSignaturesRequired,
          [],
          []
        ]
      }
    });
  };

  useEffect(() => {
    if (transaction && isSuccess) {
      toast.success('Vault created successfully');

      const writeMultisigAccountResource = (
        transaction as UserTransactionResponse
      ).changes.find(
        (e) =>
          e.type === 'write_resource' &&
          (e as WriteSetChangeWriteResource).data.type ===
            '0x1::multisig_account::MultisigAccount'
      ) as WriteSetChangeWriteResource | undefined;

      if (!writeMultisigAccountResource) {
        toast.error(
          'Vault created successfully, but events cannot be parsed. Please try again.'
        );
        return;
      }

      onImportVault({
        type: 'framework',
        name: vaultName,
        signers: vaultSigners,
        signaturesRequired: vaultSignaturesRequired,
        address: AccountAddress.from(writeMultisigAccountResource.address),
        network: network.network
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, isSuccess]);

  return {
    page: { current: page, set: setPage },
    vaultName: { current: vaultName, set: setVaultName },
    vaultSigners: { current: vaultSigners, set: setVaultSigners },
    vaultSignaturesRequired: {
      current: vaultSignaturesRequired,
      set: setVaultSignaturesRequired
    },
    createVault: onCreateVault,
    importVault: onImportVault,
    importVaultAddress: {
      current: importVaultAddress,
      set: setImportVaultAddress
    },
    isSigningAndSubmittingCreation,
    isWaitingForCreationTransaction
  };
});
