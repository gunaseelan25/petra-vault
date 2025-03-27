import { NetworkInfo } from '@aptos-labs/js-pro';
import { useAptosCore } from '@aptos-labs/react';
import {
  AccountAddress,
  Network,
  TransactionResponseType,
  UserTransactionResponse
} from '@aptos-labs/ts-sdk';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export interface ExecutionEvent {
  type: 'success' | 'failed' | 'rejected';
  version: string;
  payload?: string;
  approvals?: number;
  rejections?: number;
  executor: AccountAddress;
  sequenceNumber: number;
  transaction: UserTransactionResponse;
}

interface UseMultisigExecutionEventsParameters
  extends Omit<UseQueryOptions<ExecutionEvent[]>, 'queryFn' | 'queryKey'> {
  address: string;
  network?: NetworkInfo;
}

export default function useMultisigExecutionEvents({
  address,
  network,
  ...options
}: UseMultisigExecutionEventsParameters) {
  const core = useAptosCore();

  const activeNetwork = network ?? core.network;

  const query = useQuery<ExecutionEvent[]>({
    ...options,
    queryKey: ['multisig-execution-events', address, activeNetwork],
    queryFn: async () => {
      const { aptos } = core.client.getClients({ network });

      // TODO: Add pagination
      const events = await aptos.getEvents({
        options: {
          orderBy: [{ transaction_version: 'desc' }],
          where:
            activeNetwork.network === Network.DEVNET
              ? {
                  indexed_type: {
                    _in: [
                      '0x1::multisig_account::TransactionExecutionSucceeded',
                      '0x1::multisig_account::TransactionExecutionFailed',
                      '0x1::multisig_account::ExecuteRejectedTransaction'
                    ]
                  },
                  data: {
                    _contains: { multisig_account: address }
                  }
                }
              : {
                  indexed_type: {
                    _in: [
                      '0x1::multisig_account::TransactionExecutionSucceededEvent',
                      '0x1::multisig_account::TransactionExecutionFailedEvent',
                      '0x1::multisig_account::ExecuteRejectedTransactionEvent'
                    ]
                  },
                  account_address: { _eq: address }
                }
        }
      });

      // TODO: Optimize this
      const transactions = await Promise.all(
        events.map((event) =>
          core.client.fetchTransaction({
            ledgerVersion: event.transaction_version,
            network
          })
        )
      );

      return events.reduce((acc, event) => {
        const transaction = transactions.find(
          (t) =>
            t.type === TransactionResponseType.User &&
            t.version === event.transaction_version.toString()
        );

        if (!transaction || transaction.type !== TransactionResponseType.User) {
          return acc;
        }

        // Normalize the sender address to fix zero prefixed addresses
        transaction.sender = AccountAddress.from(transaction.sender).toString();

        if (
          event.indexed_type ===
            '0x1::multisig_account::TransactionExecutionSucceeded' ||
          event.indexed_type ===
            '0x1::multisig_account::TransactionExecutionSucceededEvent'
        ) {
          acc.push({
            type: 'success',
            version: event.transaction_version,
            payload: event.data.transaction_payload,
            approvals: Number(event.data.num_approvals),
            executor: AccountAddress.from(event.data.executor),
            sequenceNumber: Number(event.data.sequence_number),
            transaction
          });
        }

        if (
          event.indexed_type ===
            '0x1::multisig_account::TransactionExecutionFailed' ||
          event.indexed_type ===
            '0x1::multisig_account::TransactionExecutionFailedEvent'
        ) {
          acc.push({
            type: 'failed',
            version: event.transaction_version,
            payload: event.data.transaction_payload,
            approvals: Number(event.data.num_approvals),
            executor: AccountAddress.from(event.data.executor),
            sequenceNumber: Number(event.data.sequence_number),
            transaction
          });
        }

        if (
          event.indexed_type ===
            '0x1::multisig_account::ExecuteRejectedTransaction' ||
          event.indexed_type ===
            '0x1::multisig_account::ExecuteRejectedTransactionEvent'
        ) {
          acc.push({
            type: 'rejected',
            version: event.transaction_version,
            payload: event.data.transaction_payload,
            rejections: Number(event.data.num_rejections),
            executor: AccountAddress.from(event.data.executor),
            sequenceNumber: Number(event.data.sequence_number),
            transaction
          });
        }

        return acc;
      }, [] as ExecutionEvent[]);
    }
  });

  return query;
}
