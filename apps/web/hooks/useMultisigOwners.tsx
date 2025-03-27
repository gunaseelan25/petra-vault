import { ModuleViewReturnType } from '@/lib/types/modules';
import { useViewModule, UseViewModuleParameters } from '@aptos-labs/react';
import { AccountAddress } from '@aptos-labs/ts-sdk';

export interface UseMultisigOwnersOptions
  extends Omit<
    UseViewModuleParameters<
      ModuleViewReturnType<'0x1::multisig_account::owners'>
    >,
    'payload'
  > {
  address: string;
}

export default function useMultisigPendingTransactions({
  address,
  ...options
}: UseMultisigOwnersOptions) {
  const { data, ...query } = useViewModule<
    ModuleViewReturnType<'0x1::multisig_account::owners'>
  >({
    payload: {
      function: '0x1::multisig_account::owners',
      functionArguments: [address]
    },
    ...options
  });
  return {
    data: data?.at(0)?.map((e) => AccountAddress.from(e).toString()),
    ...query
  };
}
