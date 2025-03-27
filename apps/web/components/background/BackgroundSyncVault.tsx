import { useActiveVault } from '@/context/ActiveVaultProvider';
import { useVaults } from '@/context/useVaults';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { useEffect } from 'react';

export default function BackgroundSyncVault() {
  const { vault, owners, signaturesRequired } = useActiveVault();
  const { updateVault } = useVaults();

  useEffect(() => {
    if (vault && owners.data && signaturesRequired.data) {
      if (
        owners.data.length !== vault.signers.length ||
        owners.data.some(
          (owner) =>
            !vault.signers.some((signer) => signer.address.toString() === owner)
        ) ||
        signaturesRequired.data !== vault.signaturesRequired
      ) {
        updateVault({
          ...vault,
          signers: owners.data.map((owner, index) => ({
            address: AccountAddress.from(owner),
            name:
              vault.signers.find((signer) =>
                signer.address.equals(AccountAddress.from(owner))
              )?.name || `Owner ${index + 1}`
          })),
          signaturesRequired: signaturesRequired.data
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owners.data, signaturesRequired.data]);

  return null;
}
