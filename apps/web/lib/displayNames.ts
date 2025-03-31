import { getFunctionParts, truncateAddress } from '@aptos-labs/ts-sdk';

export const EntryFunctionDisplayNames = {
  '0x1::multisig_account::add_owners_and_update_signatures_required':
    'Add Owners and Update Signatures Required',
  '0x1::multisig_account::execute_rejected_transaction': 'Rejected Transaction',
  '0x1::multisig_account::remove_owner': 'Remove Owner',
  '0x1::aptos_account::transfer_coins': 'Transfer Coins',
  '0x1::aptos_account::transfer': 'Transfer APT',
  '0x1::primary_fungible_store::transfer': 'Transfer Fungible Asset'
} as const;

export const getEntryFunctionDisplayName = (
  value: string,
  options: { shortenEntryFunctionName?: boolean } = {
    shortenEntryFunctionName: true
  }
) => {
  const displayName =
    EntryFunctionDisplayNames[value as keyof typeof EntryFunctionDisplayNames];

  if (displayName) return displayName;

  if (options?.shortenEntryFunctionName) {
    const { functionName, moduleAddress, moduleName } = getFunctionParts(
      value as `${string}::${string}::${string}`
    );
    return `${moduleAddress.length > 4 ? truncateAddress(moduleAddress) : moduleAddress}::${moduleName}::${functionName}`;
  }

  return value;
};
