import { ModuleViewReturnType } from "@/lib/types/modules";
import {
  getUseViewModuleQueryKey,
  useViewModule,
  UseViewModuleParameters,
} from "@aptos-labs/react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import { PendingMultisigTransaction } from "./useMultisigPendingTransactions";

export const getUseMultisigTransactionQueryKey = (params: {
  network: string;
  address: string;
  sequenceNumber: number;
}) =>
  getUseViewModuleQueryKey({
    network: params.network,
    payload: {
      function: "0x1::multisig_account::get_transaction",
      functionArguments: [params.address, params.sequenceNumber],
    },
  });

export interface UseMultisigTransactionOptions
  extends Omit<
    UseViewModuleParameters<
      ModuleViewReturnType<"0x1::multisig_account::get_transaction">
    >,
    "payload"
  > {
  address: string;
  sequenceNumber: number;
}

export default function useMultisigTransaction({
  address,
  sequenceNumber,
  ...options
}: UseMultisigTransactionOptions) {
  const { data, ...query } = useViewModule<
    ModuleViewReturnType<"0x1::multisig_account::get_transaction">
  >({
    payload: {
      function: "0x1::multisig_account::get_transaction",
      functionArguments: [address, sequenceNumber],
    },
    ...options,
  });

  const txn = data?.at(0);

  return {
    data: txn
      ? ({
          creator: AccountAddress.from(txn.creator),
          multisigAddress: AccountAddress.from(address),
          payload: txn.payload.vec.at(0),
          payloadHash: txn.payload_hash.vec.at(0),
          votes: txn.votes.data.reduce(
            (acc, v) => {
              if (v.value) {
                acc.approvals.push(AccountAddress.from(v.key));
              } else {
                acc.rejections.push(AccountAddress.from(v.key));
              }
              return acc;
            },
            { approvals: [], rejections: [] } as {
              approvals: AccountAddress[];
              rejections: AccountAddress[];
            }
          ),
          creation: new Date(Number(txn.creation_time_secs) * 1000),
        } satisfies PendingMultisigTransaction)
      : undefined,
    ...query,
  };
}
