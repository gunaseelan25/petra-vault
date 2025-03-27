export const EntryFunctionDisplayNames = {
  '0x1::multisig_account::add_owners_and_update_signatures_required':
    'Add Owners and Update Signatures Required',
  '0x1::multisig_account::execute_rejected_transaction': 'Rejected Transaction',
  '0x1::multisig_account::remove_owner': 'Remove Owner',
  '0x1::aptos_account::transfer_coins': 'Transfer Coins',
  '0x1::aptos_account::transfer': 'Transfer APT',
  '0x1::primary_fungible_store::transfer': 'Transfer Fungible Asset'
} as const;

export const getEntryFunctionDisplayName = (functionName: string) =>
  EntryFunctionDisplayNames[
    functionName as keyof typeof EntryFunctionDisplayNames
  ] ?? functionName;
